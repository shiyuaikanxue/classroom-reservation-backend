const Classroom = require("../models/classroomModel");
const db = require('../config/db');
const decodeQueryParam = (param) => {
  if (typeof param === 'string') {
    try {
      return decodeURIComponent(param)
    } catch (e) {
      return param
    }
  }
  return param
}

exports.getAllClassrooms = async (req, res, next) => {
  try {
    const {
      limit = 20,
      skip = 0,
      code,
      capacity,
      min_capacity,
      max_capacity,
      air_conditioner_count,
      min_air_conditioner,
      status,
      multimedia_equipment,
      equipment,
      date,
      timeSlot,
      college_id
    } = req.query;

    // 参数验证
    const parsedLimit = parseInt(limit, 10);
    const parsedSkip = parseInt(skip, 10);
    if (isNaN(parsedLimit) || isNaN(parsedSkip)) {
      return res.status(400).json({
        code: 400,
        message: 'Invalid limit or skip value'
      });
    }

    // 解码timeSlot参数
    const decodedTimeSlot = timeSlot ? decodeQueryParam(timeSlot) : null;

    // 处理设备参数
    let equipmentArray = [];
    if (equipment) {
      try {
        let decodedEquipment = decodeQueryParam(equipment);

        if (typeof decodedEquipment === 'string' && decodedEquipment.startsWith('[') && decodedEquipment.endsWith(']')) {
          equipmentArray = JSON.parse(decodedEquipment);
        } else if (typeof decodedEquipment === 'string' && decodedEquipment.includes(',')) {
          equipmentArray = decodedEquipment.split(',').map(item => item.trim());
        } else {
          equipmentArray = [decodedEquipment];
        }
      } catch (e) {
        console.error('Error processing equipment parameter:', e);
        return res.status(400).json({
          code: 400,
          message: 'Invalid equipment format'
        });
      }
    }

    // 构建基础查询
    let baseQuery = `
      SELECT 
        c.*, 
        cl.name AS college_name,
        (SELECT COUNT(*) FROM favorite 
         WHERE classroom_id = c.classroom_id) AS favorite_count
      FROM classroom c
      JOIN college cl ON c.college_id = cl.college_id
    `;

    // 构建筛选条件
    const whereClauses = [];
    const params = [];

    // 空闲教室判断（关键修复：增加schedule表检查）
    if (date && decodedTimeSlot) {
      whereClauses.push(`
        NOT EXISTS (
          SELECT 1 FROM reservation 
          WHERE classroom_id = c.classroom_id
          AND date = ? 
          AND time_slot = ? 
          AND status != 'cancelled'
        )
        AND NOT EXISTS (
          SELECT 1 FROM usage_record 
          WHERE classroom_id = c.classroom_id
          AND date = ? 
          AND time_slot = ? 
          AND status != 'cancelled'
        )
        AND NOT EXISTS (
          SELECT 1 FROM schedule 
          WHERE classroom_id = c.classroom_id
          AND DATE(start_time) = ?
          AND time_slot = ?
          AND status = 'active'
        )
      `);
      params.push(
        date, decodedTimeSlot,  // reservation
        date, decodedTimeSlot,  // usage_record
        date, decodedTimeSlot   // schedule
      );
    }

    // 教室号筛选
    if (code) {
      whereClauses.push('c.code LIKE ?');
      params.push(`%${code}%`);
    }

    // 学院ID筛选
    if (college_id) {
      whereClauses.push('c.college_id = ?');
      params.push(college_id);
    }

    // 教室容量筛选
    if (capacity) {
      whereClauses.push('c.capacity = ?');
      params.push(capacity);
    }
    if (min_capacity) {
      whereClauses.push('c.capacity >= ?');
      params.push(min_capacity);
    }
    if (max_capacity) {
      whereClauses.push('c.capacity <= ?');
      params.push(max_capacity);
    }

    // 空调数量筛选
    if (air_conditioner_count) {
      whereClauses.push('c.air_conditioner_count = ?');
      params.push(air_conditioner_count);
    }
    if (min_air_conditioner) {
      whereClauses.push('c.air_conditioner_count >= ?');
      params.push(min_air_conditioner);
    }

    // 状态筛选
    if (status) {
      whereClauses.push('c.status = ?');
      params.push(status);
    }

    // 多媒体设备筛选
    if (multimedia_equipment !== undefined) {
      whereClauses.push('c.multimedia_equipment = ?');
      params.push(String(multimedia_equipment));
    }

    // 设备精确筛选（必须包含所有指定设备）
    if (equipmentArray.length > 0) {
      equipmentArray.forEach(equip => {
        whereClauses.push(`FIND_IN_SET(?, c.equipment)`);
        params.push(equip);
      });
    }

    // 组合WHERE条件
    if (whereClauses.length > 0) {
      baseQuery += ' WHERE ' + whereClauses.join(' AND ');
    }

    // 默认按教室号排序
    baseQuery += ' ORDER BY c.code ASC';

    // 获取总数
    const countQuery = `SELECT COUNT(*) AS total FROM (${baseQuery}) AS count_query`;
    const [totalResult] = await db.query(countQuery, params);
    const total = totalResult[0]?.total || 0;

    // 获取分页数据
    const paginatedQuery = `${baseQuery} LIMIT ? OFFSET ?`;
    const [classrooms] = await db.query(paginatedQuery, [...params, parsedLimit, parsedSkip]);

    // 计算分页信息
    const totalPages = Math.ceil(total / parsedLimit);
    const currentPage = Math.floor(parsedSkip / parsedLimit) + 1;

    // 返回结果
    res.status(200).json({
      code: 200,
      message: 'Success',
      data: {
        totalPages,
        currentPage,
        total,
        classrooms: classrooms.map(room => ({
          ...room,
          equipment: room.equipment
        })),
        filters: {
          code,
          capacity,
          min_capacity,
          max_capacity,
          air_conditioner_count,
          min_air_conditioner,
          status,
          multimedia_equipment,
          equipment: equipmentArray,
          date,
          time_slot: decodedTimeSlot,
          college_id
        }
      }
    });

  } catch (err) {
    console.error('Error fetching classrooms:', err);
    res.status(500).json({
      code: 500,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
exports.getClassroomById = async (req, res, next) => {
  try {
    const classroomId = req.params.id;
    if (!classroomId) {
      return res.status(400).json({
        code: 400,
        message: '教室ID不能为空'
      });
    }

    // 1. 获取教室基础信息
    const [classroom] = await db.query(`
      SELECT 
        c.*, 
        cl.name AS college_name
      FROM classroom c
      JOIN college cl ON c.college_id = cl.college_id
      WHERE c.classroom_id = ?
    `, [classroomId]);

    if (!classroom.length) {
      return res.status(404).json({
        code: 404,
        message: '教室不存在'
      });
    }

    // 2. 获取预约统计
    const [reservationCount] = await db.query(
      'SELECT COUNT(*) AS count FROM reservation WHERE classroom_id = ?',
      [classroomId]
    );

    // 3. 获取最近预约（移除所有注释）
    const [upcomingReservations] = await db.query(
      `SELECT 
         reservation_id,
         date,
         time_slot,
         activity_name
       FROM reservation 
       WHERE classroom_id = ? 
         AND date >= CURDATE()
       ORDER BY date ASC
       LIMIT 5`,
      [classroomId]
    );

    res.status(200).json({
      code: 200,
      data: {
        ...classroom[0],
        reservation_count: reservationCount[0].count,
        upcoming_reservations: upcomingReservations.map(r => ({
          id: r.reservation_id,
          date: r.date,
          time_slot: r.time_slot,
          activity: r.activity_name
        }))
      }
    });
  } catch (err) {
    console.error(`获取教室[${req.params.id}]信息失败:`, err);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      error: process.env.NODE_ENV === 'development' ? {
        message: err.message,
        sql: err.sql
      } : undefined
    });
  }
};
exports.createClassroom = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    const {
      college_id,
      code,
      capacity,
      location,
      equipment = [],  // 默认为空数组
      status = 'available',
      desk_capacity,
      air_conditioner_count = 0,
      multimedia_equipment = false,
      photo_url = null
    } = req.body;

    // 必填参数验证
    if (!college_id || !code || !capacity || !location) {
      return res.status(400).json({
        message: 'college_id, code, capacity and location are required'
      });
    }

    await connection.beginTransaction();

    // 检查学院是否存在
    const [college] = await connection.query(
      'SELECT 1 FROM college WHERE college_id = ? LIMIT 1',
      [college_id]
    );
    if (!college.length) {
      return res.status(404).json({ message: 'College not found' });
    }

    // 检查教室代码是否已存在
    const [existing] = await connection.query(
      'SELECT 1 FROM classroom WHERE code = ? LIMIT 1',
      [code]
    );
    if (existing.length) {
      return res.status(409).json({ message: 'Classroom code already exists' });
    }

    // 将设备数组转换为字符串（逗号分隔）
    const equipmentString = Array.isArray(equipment)
      ? equipment.join(',')
      : equipment;

    // 创建教室
    const [result] = await connection.query(
      `INSERT INTO classroom (
        college_id, code, capacity, location, equipment, status,
        desk_capacity, air_conditioner_count, multimedia_equipment, photo_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        college_id,
        code,
        capacity,
        location,
        equipmentString, // 使用转换后的字符串
        status,
        desk_capacity,
        air_conditioner_count,
        multimedia_equipment,
        photo_url
      ]
    );

    await connection.commit();

    // 获取创建的教室信息
    const [newClassroom] = await db.query(
      'SELECT * FROM classroom WHERE classroom_id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'Classroom created successfully',
      data: newClassroom[0]
    });
  } catch (err) {
    await connection.rollback();
    console.error('Error creating classroom:', err);
    next(err);
  } finally {
    connection.release();
  }
};
exports.updateClassroom = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    const classroomId = req.params.id;
    const updateData = req.body;

    // 基本参数验证
    if (!classroomId) {
      return res.status(400).json({ message: 'Classroom ID is required' });
    }

    await connection.beginTransaction();

    // 检查教室是否存在
    const [classroom] = await connection.query(
      'SELECT 1 FROM classroom WHERE classroom_id = ?',
      [classroomId]
    );
    if (!classroom.length) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    // 构建更新语句（直接更新所有传入字段）
    const setClauses = [];
    const params = [];

    // 定义允许更新的字段
    const allowedFields = [
      'code', 'capacity', 'location', 'equipment', 'status',
      'desk_capacity', 'air_conditioner_count', 'multimedia_equipment', 'photo_url'
    ];

    allowedFields.forEach(field => {
      if (field in updateData) {
        setClauses.push(`${field} = ?`);
        // 处理equipment数组转字符串
        params.push(
          field === 'equipment' && Array.isArray(updateData[field])
            ? updateData[field].join(',')
            : updateData[field]
        );
      }
    });

    // 如果没有可更新字段
    if (setClauses.length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    params.push(classroomId);

    // 执行更新
    await connection.query(
      `UPDATE classroom SET ${setClauses.join(', ')} WHERE classroom_id = ?`,
      params
    );

    await connection.commit();

    // 获取更新后的数据
    const [updatedClassroom] = await connection.query(
      'SELECT * FROM classroom WHERE classroom_id = ?',
      [classroomId]
    );

    res.status(200).json({
      message: 'Classroom updated successfully',
      data: updatedClassroom[0]
    });
  } catch (err) {
    await connection.rollback();
    console.error(`Error updating classroom ${classroomId}:`, err);
    next(err);
  } finally {
    connection.release();
  }
};
exports.deleteClassroom = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    const classroomId = req.params.id;
    if (!classroomId) {
      return res.status(400).json({ message: 'Classroom ID is required' });
    }

    await connection.beginTransaction();

    // 1. 检查教室是否存在
    const [classroom] = await connection.query(
      'SELECT * FROM classroom WHERE classroom_id = ?',
      [classroomId]
    );
    if (!classroom.length) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    // 2. 检查是否有关联预约记录（使用实际存在的列名）
    const [reservations] = await connection.query(
      'SELECT COUNT(*) AS count FROM reservation WHERE classroom_id = ?',
      [classroomId]
    );

    // 3. 如果有预约记录，不允许删除
    if (reservations[0].count > 0) {
      return res.status(400).json({
        message: 'Cannot delete classroom with existing reservations',
        reservation_count: reservations[0].count
      });
    }

    // 4. 执行删除
    await connection.query(
      'DELETE FROM classroom WHERE classroom_id = ?',
      [classroomId]
    );

    await connection.commit();

    res.status(200).json({
      message: 'Classroom deleted successfully',
      deleted_classroom: classroom[0]
    });
  } catch (err) {
    await connection.rollback();
    console.error(`Error deleting classroom ${classroomId}:`, err);
    next(err);
  } finally {
    connection.release();
  }
};