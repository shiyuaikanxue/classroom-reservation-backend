const db = require("../config/db");

module.exports = {
  // 获取所有使用记录（带分页和筛选）
  async getAllWithPagination(page, limit, filter) {
    const offset = (page - 1) * limit;

    // 构建WHERE条件
    const whereConditions = [];
    const params = [];

    if (filter.classroom_id) {
      whereConditions.push('u.classroom_id = ?');
      params.push(filter.classroom_id);
    }

    if (filter.date) {
      whereConditions.push('u.date = ?');
      params.push(filter.date);
    }

    if (filter.time_slot) {
      whereConditions.push('u.time_slot = ?');
      params.push(filter.time_slot);
    }

    if (filter.type) {
      whereConditions.push('u.type = ?');
      params.push(filter.type);
    }

    if (filter.event_id) {
      whereConditions.push('u.event_id = ?');
      params.push(filter.event_id);
    }

    if (filter.status) {
      whereConditions.push('u.status = ?');
      params.push(filter.status);
    }

    if (filter.teacher_id) {
      whereConditions.push('u.teacher_id = ?');
      params.push(filter.teacher_id);
    }

    if (filter.min_participants) {
      whereConditions.push('u.participants >= ?');
      params.push(filter.min_participants);
    }

    if (filter.max_participants) {
      whereConditions.push('u.participants <= ?');
      params.push(filter.max_participants);
    }

    if (filter.date_from) {
      whereConditions.push('u.date >= ?');
      params.push(filter.date_from);
    }

    if (filter.date_to) {
      whereConditions.push('u.date <= ?');
      params.push(filter.date_to);
    }

    const whereClause = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // 查询总数
    const [totalResult] = await db.query(
      `SELECT COUNT(*) as total FROM usage_records u ${whereClause}`,
      params
    );
    const total = totalResult[0].total;

    // 查询分页数据
    const [usageRecords] = await db.query(
      `SELECT 
        u.*,
        c.code as classroom_code,
        c.location as classroom_location,
        t.name as teacher_name
       FROM usage_records u
       LEFT JOIN classrooms c ON u.classroom_id = c.classroom_id
       LEFT JOIN teachers t ON u.teacher_id = t.teacher_id
       ${whereClause}
       ORDER BY u.date DESC, u.time_slot ASC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return { usageRecords, total };
  },

  // 根据ID获取使用记录详情（带关联信息）
  async getByIdWithDetails(id) {
    const [usageRecords] = await db.query(
      `SELECT 
        u.*,
        c.code as classroom_code,
        c.location as classroom_location,
        t.name as teacher_name
       FROM usage_records u
       LEFT JOIN classrooms c ON u.classroom_id = c.classroom_id
       LEFT JOIN teachers t ON u.teacher_id = t.teacher_id
       WHERE u.usage_id = ?`,
      [id]
    );
    return usageRecords[0];
  },

  // 检查时间冲突
  async checkTimeConflict(classroom_id, date, time_slot, excludeId = null) {
    let query = `
      SELECT 1 FROM usage_records 
      WHERE classroom_id = ? 
        AND date = ?
        AND time_slot = ?
    `;
    const params = [classroom_id, date, time_slot];

    if (excludeId) {
      query += ' AND usage_id != ?';
      params.push(excludeId);
    }

    const [results] = await db.query(query, params);
    return results.length > 0;
  },

  // 基础CRUD方法
  async getById(id) {
    const [usageRecords] = await db.query(
      'SELECT * FROM usage_records WHERE usage_id = ?',
      [id]
    );
    return usageRecords[0];
  },

  async create(usageRecordData) {
    const [result] = await db.query(
      'INSERT INTO usage_records SET ?',
      [usageRecordData]
    );
    return result.insertId;
  },

  async update(id, updateData) {
    await db.query(
      'UPDATE usage_records SET ? WHERE usage_id = ?',
      [updateData, id]
    );
  },

  async delete(id) {
    await db.query(
      'DELETE FROM usage_records WHERE usage_id = ?',
      [id]
    );
  }
};