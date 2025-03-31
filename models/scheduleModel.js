const db = require("../config/db");

module.exports = {
  // 获取所有课表（带分页和筛选）
  async getAllWithPagination(page, limit, filter) {
    const offset = (page - 1) * limit;
    
    // 构建WHERE条件
    const whereConditions = [];
    const params = [];
    
    if (filter.student_id) {
      whereConditions.push('s.student_id = ?');
      params.push(filter.student_id);
    }
    
    if (filter.teacher_id) {
      whereConditions.push('s.teacher_id = ?');
      params.push(filter.teacher_id);
    }
    
    if (filter.classroom_id) {
      whereConditions.push('s.classroom_id = ?');
      params.push(filter.classroom_id);
    }
    
    if (filter.course_name) {
      whereConditions.push('s.course_name LIKE ?');
      params.push(`%${filter.course_name}%`);
    }
    
    if (filter.status) {
      whereConditions.push('s.status = ?');
      params.push(filter.status);
    }
    
    if (filter.date_from) {
      whereConditions.push('s.start_time >= ?');
      params.push(filter.date_from);
    }
    
    if (filter.date_to) {
      whereConditions.push('s.end_time <= ?');
      params.push(filter.date_to);
    }
    
    if (filter.time_slot) {
      whereConditions.push('s.time_slot = ?');
      params.push(filter.time_slot);
    }
    
    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';
    
    // 查询总数
    const [totalResult] = await db.query(
      `SELECT COUNT(*) as total FROM schedules s ${whereClause}`,
      params
    );
    const total = totalResult[0].total;
    
    // 查询分页数据
    const [schedules] = await db.query(
      `SELECT 
        s.*,
        st.name as student_name,
        t.name as teacher_name,
        c.code as classroom_code,
        c.location as classroom_location
       FROM schedules s
       LEFT JOIN students st ON s.student_id = st.student_id
       LEFT JOIN teachers t ON s.teacher_id = t.teacher_id
       LEFT JOIN classrooms c ON s.classroom_id = c.classroom_id
       ${whereClause}
       ORDER BY s.start_time ASC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    
    return { schedules, total };
  },

  // 根据ID获取课表详情（带关联信息）
  async getByIdWithDetails(id) {
    const [schedules] = await db.query(
      `SELECT 
        s.*,
        st.name as student_name,
        t.name as teacher_name,
        c.code as classroom_code,
        c.location as classroom_location
       FROM schedules s
       LEFT JOIN students st ON s.student_id = st.student_id
       LEFT JOIN teachers t ON s.teacher_id = t.teacher_id
       LEFT JOIN classrooms c ON s.classroom_id = c.classroom_id
       WHERE s.schedule_id = ?`,
      [id]
    );
    return schedules[0];
  },

  // 检查时间冲突
  async checkTimeConflict(classroom_id, start_time, end_time, excludeId = null) {
    let query = `
      SELECT 1 FROM schedules 
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
      query += ' AND schedule_id != ?';
      params.push(excludeId);
    }

    const [results] = await db.query(query, params);
    return results.length > 0;
  },

  // 基础CRUD方法
  async getById(id) {
    const [schedules] = await db.query(
      'SELECT * FROM schedules WHERE schedule_id = ?', 
      [id]
    );
    return schedules[0];
  },

  async create(scheduleData) {
    const [result] = await db.query(
      'INSERT INTO schedules SET ?', 
      [scheduleData]
    );
    return result.insertId;
  },

  async update(id, updateData) {
    await db.query(
      'UPDATE schedules SET ? WHERE schedule_id = ?', 
      [updateData, id]
    );
  },

  async delete(id) {
    await db.query(
      'DELETE FROM schedules WHERE schedule_id = ?', 
      [id]
    );
  }
};