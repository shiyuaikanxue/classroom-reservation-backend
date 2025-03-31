const Activity = require("../models/activityModel");
const db = require('../config/db');
const { ClassDivided } = require("../constants/reservations"); // 导入时间节点枚举

exports.getAllActivities = async (req, res, next) => {
  try {
    const {
      limit = 10,
      skip = 0,
      name,
      description,
      date_from,
      date_to,
      time_slot,
      teacher_id,
      min_participants,
      max_participants
    } = req.query;

    // 参数验证
    const parsedLimit = parseInt(limit, 10);
    const parsedSkip = parseInt(skip, 10);
    if (isNaN(parsedLimit) || isNaN(parsedSkip)) {
      return res.status(400).json({ message: 'Invalid limit or skip value' });
    }

    // 验证time_slot是否合法
    if (time_slot && !Object.values(ClassDivided).includes(time_slot)) {
      return res.status(400).json({
        message: 'Invalid time slot',
        validTimeSlots: Object.values(ClassDivided)
      });
    }

    // 构建基础查询
    let baseQuery = `
      SELECT 
        a.*,
        t.name AS teacher_name,
        t.email AS teacher_email
      FROM activity a
      LEFT JOIN teachers t ON a.teacher_id = t.teacher_id
    `;

    // 构建筛选条件
    const whereClauses = [];
    const params = [];

    if (name) {
      whereClauses.push('a.name LIKE ?');
      params.push(`%${name}%`);
    }

    if (description) {
      whereClauses.push('a.description LIKE ?');
      params.push(`%${description}%`);
    }

    if (date_from) {
      whereClauses.push('a.date >= ?');
      params.push(date_from);
    }

    if (date_to) {
      whereClauses.push('a.date <= ?');
      params.push(date_to);
    }

    if (time_slot) {
      whereClauses.push('a.time_slot = ?');
      params.push(time_slot);
    }

    if (teacher_id) {
      whereClauses.push('a.teacher_id = ?');
      params.push(teacher_id);
    }

    if (min_participants) {
      whereClauses.push('a.participants >= ?');
      params.push(min_participants);
    }

    if (max_participants) {
      whereClauses.push('a.participants <= ?');
      params.push(max_participants);
    }

    // 组合WHERE条件
    if (whereClauses.length > 0) {
      baseQuery += ' WHERE ' + whereClauses.join(' AND ');
    }

    // 默认按日期和时间段排序
    baseQuery += ' ORDER BY a.date ASC, a.time_slot ASC';

    // 获取总数
    const countQuery = `SELECT COUNT(*) AS total FROM (${baseQuery}) AS count_query`;
    const [totalResult] = await db.query(countQuery, params);
    const total = totalResult[0].total;

    // 获取分页数据
    const paginatedQuery = `${baseQuery} LIMIT ? OFFSET ?`;
    const [activities] = await db.query(paginatedQuery, [...params, parsedLimit, parsedSkip]);

    // 计算分页信息
    const totalPages = Math.ceil(total / parsedLimit);
    const currentPage = Math.floor(parsedSkip / parsedLimit) + 1;

    res.status(200).json({
      totalPages,
      currentPage,
      data: {
        activities,
        total,
        filters: {
          name,
          description,
          date_from,
          date_to,
          time_slot,
          teacher_id,
          min_participants,
          max_participants
        },
        validTimeSlots: ClassDivided
      }
    });
  } catch (err) {
    console.error('Error fetching activities:', err);
    next(err);
  }
};

exports.getActivityById = async (req, res, next) => {
  try {
    const activityId = req.params.id;
    const query = `
      SELECT 
        a.*,
        t.name AS teacher_name,
        t.email AS teacher_email,
        t.phone AS teacher_phone
      FROM activity a
      LEFT JOIN teachers t ON a.teacher_id = t.teacher_id
      WHERE a.activity_id = ?
    `;

    const [activity] = await db.query(query, [activityId]);

    if (!activity || activity.length === 0) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    res.status(200).json(activity[0]);
  } catch (err) {
    console.error('Error fetching activity by ID:', err);
    next(err);
  }
};

exports.createActivity = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const {
      name,
      description,
      date,
      time_slot,
      teacher_id,
      participants = 1
    } = req.body;

    // 参数验证
    if (!name || !date || !time_slot) {
      await connection.rollback();
      return res.status(400).json({ message: 'name, date and time_slot are required' });
    }

    // 验证时间节点是否合法
    if (!Object.values(ClassDivided).includes(time_slot)) {
      await connection.rollback();
      return res.status(400).json({
        message: 'Invalid time slot',
        validTimeSlots: ClassDivided
      });
    }

    // 检查教师是否存在（如果提供了teacher_id）
    if (teacher_id) {
      const [teacher] = await connection.query('SELECT 1 FROM teachers WHERE teacher_id = ?', [teacher_id]);
      if (!teacher || teacher.length === 0) {
        await connection.rollback();
        return res.status(400).json({ message: 'Teacher not found' });
      }
    }

    // 创建活动
    const [result] = await connection.query(`
      INSERT INTO activity (
        name, description, date, 
        time_slot, teacher_id, participants
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [name, description, date, time_slot, teacher_id, participants]);

    await connection.commit();

    res.status(201).json({
      activity_id: result.insertId,
      message: 'Activity created successfully'
    });
  } catch (err) {
    await connection.rollback();
    console.error('Error creating activity:', err);
    next(err);
  } finally {
    connection.release();
  }
};

exports.updateActivity = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const activityId = req.params.id;
    const {
      name,
      description,
      date,
      time_slot,
      teacher_id,
      participants
    } = req.body;

    // 检查活动是否存在
    const [existingActivity] = await connection.query(
      'SELECT * FROM activity WHERE activity_id = ? FOR UPDATE',
      [activityId]
    );

    if (!existingActivity || existingActivity.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Activity not found' });
    }

    // 验证时间节点是否合法（如果提供了time_slot）
    if (time_slot && !Object.values(ClassDivided).includes(time_slot)) {
      await connection.rollback();
      return res.status(400).json({
        message: 'Invalid time slot',
        validTimeSlots: ClassDivided
      });
    }

    // 检查教师是否存在（如果提供了teacher_id）
    if (teacher_id) {
      const [teacher] = await connection.query('SELECT 1 FROM teachers WHERE teacher_id = ?', [teacher_id]);
      if (!teacher || teacher.length === 0) {
        await connection.rollback();
        return res.status(400).json({ message: 'Teacher not found' });
      }
    }

    // 更新活动
    await connection.query(`
      UPDATE activity SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        date = COALESCE(?, date),
        time_slot = COALESCE(?, time_slot),
        teacher_id = COALESCE(?, teacher_id),
        participants = COALESCE(?, participants)
      WHERE activity_id = ?
    `, [
      name,
      description,
      date,
      time_slot,
      teacher_id,
      participants,
      activityId
    ]);

    await connection.commit();

    res.status(200).json({
      message: 'Activity updated successfully',
      activity_id: activityId
    });
  } catch (err) {
    await connection.rollback();
    console.error('Error updating activity:', err);
    next(err);
  } finally {
    connection.release();
  }
};

exports.deleteActivity = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const activityId = req.params.id;

    // 检查活动是否存在
    const [activity] = await connection.query(
      'SELECT 1 FROM activity WHERE activity_id = ? FOR UPDATE',
      [activityId]
    );

    if (!activity || activity.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Activity not found' });
    }

    // 删除活动
    await connection.query(
      'DELETE FROM activity WHERE activity_id = ?',
      [activityId]
    );

    await connection.commit();

    res.status(200).json({
      message: 'Activity deleted successfully',
      activity_id: activityId
    });
  } catch (err) {
    await connection.rollback();
    console.error('Error deleting activity:', err);
    next(err);
  } finally {
    connection.release();
  }
};