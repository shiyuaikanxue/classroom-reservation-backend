const db = require('../config/db');

module.exports = {
  // 获取所有收藏（带分页和筛选）
  async getAllWithPagination(page, limit, filter) {
    const offset = (page - 1) * limit;

    // 构建WHERE条件
    const whereConditions = [];
    const params = [];

    if (filter.student_id) {
      whereConditions.push('f.student_id = ?');
      params.push(filter.student_id);
    }

    if (filter.classroom_id) {
      whereConditions.push('f.classroom_id = ?');
      params.push(filter.classroom_id);
    }

    if (filter.date_from) {
      whereConditions.push('f.favorite_time >= ?');
      params.push(filter.date_from);
    }

    if (filter.date_to) {
      whereConditions.push('f.favorite_time <= ?');
      params.push(filter.date_to);
    }

    const whereClause = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // 查询总数
    const [totalResult] = await db.query(
      `SELECT COUNT(*) as total FROM favorites f ${whereClause}`,
      params
    );
    const total = totalResult[0].total;

    // 查询分页数据
    const [favorites] = await db.query(
      `SELECT 
        f.*,
        s.name as student_name,
        c.code as classroom_code,
        c.location as classroom_location
       FROM favorites f
       LEFT JOIN students s ON f.student_id = s.student_id
       LEFT JOIN classrooms c ON f.classroom_id = c.classroom_id
       ${whereClause}
       ORDER BY f.favorite_time DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return { favorites, total };
  },

  // 根据ID获取收藏详情（带关联信息）
  async getByIdWithDetails(id) {
    const [favorites] = await db.query(
      `SELECT 
        f.*,
        s.name as student_name,
        c.code as classroom_code,
        c.location as classroom_location
       FROM favorites f
       LEFT JOIN students s ON f.student_id = s.student_id
       LEFT JOIN classrooms c ON f.classroom_id = c.classroom_id
       WHERE f.favorite_id = ?`,
      [id]
    );
    return favorites[0];
  },

  // 检查是否已收藏
  async checkExists(student_id, classroom_id) {
    const [results] = await db.query(
      'SELECT 1 FROM favorites WHERE student_id = ? AND classroom_id = ?',
      [student_id, classroom_id]
    );
    return results.length > 0;
  },

  // 基础CRUD方法
  async getById(id) {
    const [favorites] = await db.query(
      'SELECT * FROM favorites WHERE favorite_id = ?',
      [id]
    );
    return favorites[0];
  },

  async create(favoriteData) {
    const [result] = await db.query(
      'INSERT INTO favorites SET ?',
      [favoriteData]
    );
    return result.insertId;
  },

  async update(id, updateData) {
    await db.query(
      'UPDATE favorites SET ? WHERE favorite_id = ?',
      [updateData, id]
    );
  },

  async delete(id) {
    await db.query(
      'DELETE FROM favorites WHERE favorite_id = ?',
      [id]
    );
  }
};