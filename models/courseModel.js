const db = require("../config/db");

module.exports = {
  // 获取所有课程（带分页和筛选）
  async getAllWithPagination(page, limit, filter) {
    const offset = (page - 1) * limit;

    // 构建WHERE条件
    const whereConditions = [];
    const params = [];

    if (filter.name) {
      whereConditions.push('c.name LIKE ?');
      params.push(`%${filter.name}%`);
    }

    if (filter.teacher_id) {
      whereConditions.push('c.teacher_id = ?');
      params.push(filter.teacher_id);
    }

    if (filter.classroom_id) {
      whereConditions.push('c.classroom_id = ?');
      params.push(filter.classroom_id);
    }

    if (filter.date_from) {
      whereConditions.push('c.start_time >= ?');
      params.push(filter.date_from);
    }

    if (filter.date_to) {
      whereConditions.push('c.end_time <= ?');
      params.push(filter.date_to);
    }

    if (filter.time_slot) {
      whereConditions.push('c.time_slot = ?');
      params.push(filter.time_slot);
    }

    if (filter.min_participants) {
      whereConditions.push('c.participants >= ?');
      params.push(filter.min_participants);
    }

    if (filter.max_participants) {
      whereConditions.push('c.participants <= ?');
      params.push(filter.max_participants);
    }

    const whereClause = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // 查询总数
    const [totalResult] = await db.query(
      `SELECT COUNT(*) as total FROM courses c ${whereClause}`,
      params
    );
    const total = totalResult[0].total;

    // 查询分页数据
    const [courses] = await db.query(
      `SELECT 
        c.*,
        t.name as teacher_name,
        cr.code as classroom_code,
        cr.location as classroom_location
       FROM courses c
       LEFT JOIN teachers t ON c.teacher_id = t.teacher_id
       LEFT JOIN classrooms cr ON c.classroom_id = cr.classroom_id
       ${whereClause}
       ORDER BY c.start_time ASC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return { courses, total };
  },

  // 根据ID获取课程详情（带关联信息）
  async getByIdWithDetails(id) {
    const [courses] = await db.query(
      `SELECT 
        c.*,
        t.name as teacher_name,
        t.email as teacher_email,
        cr.code as classroom_code,
        cr.location as classroom_location
       FROM courses c
       LEFT JOIN teachers t ON c.teacher_id = t.teacher_id
       LEFT JOIN classrooms cr ON c.classroom_id = cr.classroom_id
       WHERE c.course_id = ?`,
      [id]
    );
    return courses[0];
  },

  // 检查时间冲突
  async checkTimeConflict(classroom_id, start_time, end_time, excludeId = null) {
    let query = `
      SELECT 1 FROM courses 
      WHERE classroom_id = ? 
        AND (
          (start_time < ? AND end_time > ?) OR
          (start_time >= ? AND start_time < ?) OR
          (end_time > ? AND end_time <= ?)
        )
    `;
    const params = [
      classroom_id,
      end_time, start_time,
      start_time, end_time,
      start_time, end_time
    ];

    if (excludeId) {
      query += ' AND course_id != ?';
      params.push(excludeId);
    }

    const [results] = await db.query(query, params);
    return results.length > 0;
  },

  // 其他基础CRUD方法
  async getById(id) {
    const [courses] = await db.query('SELECT * FROM courses WHERE course_id = ?', [id]);
    return courses[0];
  },

  async create(courseData) {
    const [result] = await db.query('INSERT INTO courses SET ?', [courseData]);
    return result.insertId;
  },

  async update(id, courseData) {
    await db.query('UPDATE courses SET ? WHERE course_id = ?', [courseData, id]);
  },

  async delete(id) {
    await db.query('DELETE FROM courses WHERE course_id = ?', [id]);
  }
};