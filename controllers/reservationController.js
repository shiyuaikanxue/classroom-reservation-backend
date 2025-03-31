const Reservation = require('../models/reservationModel');
const db = require('../config/db');
exports.getAllReservations = async (req, res, next) => {
  try {
    const {
      limit = 10,
      skip = 0,
      student_id,
      classroom_id,
      teacher_id,
      activity_name,
      date_from,
      date_to,
      time_slot,
      status
    } = req.query;

    // 参数验证
    const parsedLimit = parseInt(limit, 10);
    const parsedSkip = parseInt(skip, 10);
    if (isNaN(parsedLimit) || isNaN(parsedSkip)) {
      return res.status(400).json({ message: 'Invalid limit or skip value' });
    }

    // 构建基础查询
    let baseQuery = `
    SELECT 
      r.*,
      s.name AS student_name,
      c.code AS classroom_code,
      c.location AS classroom_location,
      t.name AS teacher_name
    FROM reservation r
    LEFT JOIN student s ON r.student_id = s.student_id
    LEFT JOIN classroom c ON r.classroom_id = c.classroom_id
    LEFT JOIN teachers t ON r.teacher_id = t.teacher_id
  `;

    // 构建筛选条件
    const whereClauses = [];
    const params = [];

    if (student_id) {
      whereClauses.push('r.student_id = ?');
      params.push(student_id);
    }

    if (classroom_id) {
      whereClauses.push('r.classroom_id = ?');
      params.push(classroom_id);
    }

    if (teacher_id) {
      whereClauses.push('r.teacher_id = ?');
      params.push(teacher_id);
    }

    if (activity_name) {
      whereClauses.push('r.activity_name LIKE ?');
      params.push(`%${activity_name}%`);
    }

    if (date_from) {
      whereClauses.push('r.date >= ?');
      params.push(date_from);
    }

    if (date_to) {
      whereClauses.push('r.date <= ?');
      params.push(date_to);
    }

    if (time_slot) {
      whereClauses.push('r.time_slot = ?');
      params.push(time_slot);
    }

    if (status) {
      whereClauses.push('r.status = ?');
      params.push(status);
    }

    // 组合WHERE条件
    if (whereClauses.length > 0) {
      baseQuery += ' WHERE ' + whereClauses.join(' AND ');
    }

    // 默认按预约日期降序排列
    baseQuery += ' ORDER BY r.date DESC, r.time_slot ASC';

    // 获取总数
    const countQuery = `SELECT COUNT(*) AS total FROM (${baseQuery}) AS count_query`;
    const [totalResult] = await db.query(countQuery, params);
    const total = totalResult[0].total;

    // 获取分页数据
    const paginatedQuery = `${baseQuery} LIMIT ? OFFSET ?`;
    const [reservations] = await db.query(paginatedQuery, [...params, parsedLimit, parsedSkip]);

    // 计算分页信息
    const totalPages = Math.ceil(total / parsedLimit);
    const currentPage = Math.floor(parsedSkip / parsedLimit) + 1;

    res.status(200).json({
      totalPages,
      currentPage,
      data: {
        reservations,
        total,
        filters: {
          student_id,
          classroom_id,
          teacher_id,
          activity_name,
          date_from,
          date_to,
          time_slot,
          status
        }
      }
    });
  } catch (err) {
    console.error('Error fetching reservations:', err);
    next(err);
  }
};

exports.getReservationById = async (req, res, next) => {
  try {
    const reservationId = req.params.id;
    const query = `
      SELECT 
        r.*,
        s.name AS student_name,
        s.student_number,
        s.email AS student_email,
        s.phone AS student_phone,
        c.code AS classroom_code,
        c.location AS classroom_location,
        c.capacity AS classroom_capacity,
        t.name AS teacher_name,
        t.email AS teacher_email,
        t.phone AS teacher_phone
      FROM reservation r
      LEFT JOIN student s ON r.student_id = s.student_id
      LEFT JOIN classroom c ON r.classroom_id = c.classroom_id
      LEFT JOIN teachers t ON r.teacher_id = t.teacher_id
      WHERE r.reservation_id = ?
    `;

    const [reservation] = await db.query(query, [reservationId]);

    if (!reservation || reservation.length === 0) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    res.status(200).json(reservation[0]);
  } catch (err) {
    console.error('Error fetching reservation by ID:', err);
    next(err);
  }
};

exports.createReservation = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const {
      student_id,
      classroom_id,
      activity_name,
      description,
      date,
      time_slot,
      status = 'pending',
      teacher_id,
      participants = 1
    } = req.body;

    // 参数验证
    if (!student_id || !classroom_id || !activity_name || !date || !time_slot) {
      await connection.rollback();
      return res.status(400).json({ message: 'Required fields: student_id, classroom_id, activity_name, date, time_slot' });
    }

    // 检查学生是否存在
    const [student] = await connection.query('SELECT 1 FROM student WHERE student_id = ?', [student_id]);
    if (!student || student.length === 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'Student not found' });
    }

    // 检查教室是否存在
    const [classroom] = await connection.query('SELECT 1 FROM classroom WHERE classroom_id = ?', [classroom_id]);
    if (!classroom || classroom.length === 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'Classroom not found' });
    }

    // 检查教师是否存在（如果提供了teacher_id）
    if (teacher_id) {
      const [teacher] = await connection.query('SELECT 1 FROM teachers WHERE teacher_id = ?', [teacher_id]);
      if (!teacher || teacher.length === 0) {
        await connection.rollback();
        return res.status(400).json({ message: 'Teacher not found' });
      }
    }

    // 检查时间冲突
    const [conflict] = await connection.query(`
      SELECT 1 FROM reservation 
      WHERE classroom_id = ? 
        AND date = ? 
        AND time_slot = ? 
        AND status NOT IN ('cancelled', 'rejected')
      LIMIT 1
    `, [classroom_id, date, time_slot]);

    if (conflict && conflict.length > 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'Time slot already reserved for this classroom' });
    }

    // 创建预约
    const [result] = await connection.query(`
      INSERT INTO reservation (
        student_id, classroom_id, activity_name, 
        description, date, time_slot, 
        status, teacher_id, participants
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      student_id, classroom_id, activity_name,
      description, date, time_slot,
      status, teacher_id, participants
    ]);

    await connection.commit();

    res.status(201).json({
      reservation_id: result.insertId,
      message: 'Reservation created successfully'
    });
  } catch (err) {
    await connection.rollback();
    console.error('Error creating reservation:', err);
    next(err);
  } finally {
    connection.release();
  }
};

exports.updateReservation = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const reservationId = req.params.id;
    const {
      student_id,
      classroom_id,
      activity_name,
      description,
      date,
      time_slot,
      status,
      teacher_id,
      participants
    } = req.body;

    // 检查预约是否存在
    const [existingReservation] = await connection.query(
      'SELECT * FROM reservation WHERE reservation_id = ? FOR UPDATE',
      [reservationId]
    );

    if (!existingReservation || existingReservation.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // 检查学生是否存在（如果提供了student_id）
    if (student_id) {
      const [student] = await connection.query('SELECT 1 FROM student WHERE student_id = ?', [student_id]);
      if (!student || student.length === 0) {
        await connection.rollback();
        return res.status(400).json({ message: 'Student not found' });
      }
    }

    // 检查教室是否存在（如果提供了classroom_id）
    if (classroom_id) {
      const [classroom] = await connection.query('SELECT 1 FROM classroom WHERE classroom_id = ?', [classroom_id]);
      if (!classroom || classroom.length === 0) {
        await connection.rollback();
        return res.status(400).json({ message: 'Classroom not found' });
      }
    }

    // 检查教师是否存在（如果提供了teacher_id）
    if (teacher_id) {
      const [teacher] = await connection.query('SELECT 1 FROM teachers WHERE teacher_id = ?', [teacher_id]);
      if (!teacher || teacher.length === 0) {
        await connection.rollback();
        return res.status(400).json({ message: 'Teacher not found' });
      }
    }

    // 检查时间冲突（排除当前预约）
    if (date || time_slot || classroom_id) {
      const checkDate = date || existingReservation[0].date;
      const checkTimeSlot = time_slot || existingReservation[0].time_slot;
      const checkClassroomId = classroom_id || existingReservation[0].classroom_id;

      const [conflict] = await connection.query(`
        SELECT 1 FROM reservation 
        WHERE classroom_id = ? 
          AND date = ? 
          AND time_slot = ? 
          AND reservation_id != ?
          AND status NOT IN ('cancelled', 'rejected')
        LIMIT 1
      `, [checkClassroomId, checkDate, checkTimeSlot, reservationId]);

      if (conflict && conflict.length > 0) {
        await connection.rollback();
        return res.status(400).json({ message: 'Time slot already reserved for this classroom' });
      }
    }

    // 更新预约
    await connection.query(`
      UPDATE reservation SET
        student_id = COALESCE(?, student_id),
        classroom_id = COALESCE(?, classroom_id),
        activity_name = COALESCE(?, activity_name),
        description = COALESCE(?, description),
        date = COALESCE(?, date),
        time_slot = COALESCE(?, time_slot),
        status = COALESCE(?, status),
        teacher_id = COALESCE(?, teacher_id),
        participants = COALESCE(?, participants)
      WHERE reservation_id = ?
    `, [
      student_id,
      classroom_id,
      activity_name,
      description,
      date,
      time_slot,
      status,
      teacher_id,
      participants,
      reservationId
    ]);

    await connection.commit();

    res.status(200).json({
      message: 'Reservation updated successfully',
      reservation_id: reservationId
    });
  } catch (err) {
    await connection.rollback();
    console.error('Error updating reservation:', err);
    next(err);
  } finally {
    connection.release();
  }
};

exports.deleteReservation = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const reservationId = req.params.id;

    // 检查预约是否存在
    const [reservation] = await connection.query(
      'SELECT 1 FROM reservation WHERE reservation_id = ? FOR UPDATE',
      [reservationId]
    );

    if (!reservation || reservation.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // 删除预约
    await connection.query(
      'DELETE FROM reservation WHERE reservation_id = ?',
      [reservationId]
    );

    await connection.commit();

    res.status(200).json({
      message: 'Reservation deleted successfully',
      reservation_id: reservationId
    });
  } catch (err) {
    await connection.rollback();
    console.error('Error deleting reservation:', err);
    next(err);
  } finally {
    connection.release();
  }
};