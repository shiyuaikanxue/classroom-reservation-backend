const db = require('../config/db');

module.exports = {
  // 获取所有评价（带分页和筛选）
  async getAllWithPagination(page, limit, filter) {
    const offset = (page - 1) * limit;
    
    // 构建WHERE条件
    const whereConditions = [];
    const params = [];
    
    if (filter.classroom_id) {
      whereConditions.push('r.classroom_id = ?');
      params.push(filter.classroom_id);
    }
    
    if (filter.student_id) {
      whereConditions.push('r.student_id = ?');
      params.push(filter.student_id);
    }
    
    if (filter.min_rating) {
      whereConditions.push('r.rating >= ?');
      params.push(filter.min_rating);
    }
    
    if (filter.max_rating) {
      whereConditions.push('r.rating <= ?');
      params.push(filter.max_rating);
    }
    
    if (filter.date_from) {
      whereConditions.push('r.review_time >= ?');
      params.push(filter.date_from);
    }
    
    if (filter.date_to) {
      whereConditions.push('r.review_time <= ?');
      params.push(filter.date_to);
    }
    
    if (filter.has_comment !== undefined) {
      if (filter.has_comment) {
        whereConditions.push('r.comment IS NOT NULL');
      } else {
        whereConditions.push('r.comment IS NULL');
      }
    }
    
    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';
    
    // 查询总数
    const [totalResult] = await db.query(
      `SELECT COUNT(*) as total FROM reviews r ${whereClause}`,
      params
    );
    const total = totalResult[0].total;
    
    // 查询分页数据
    const [reviews] = await db.query(
      `SELECT 
        r.*,
        s.name as student_name,
        c.code as classroom_code,
        c.location as classroom_location
       FROM reviews r
       LEFT JOIN students s ON r.student_id = s.student_id
       LEFT JOIN classrooms c ON r.classroom_id = c.classroom_id
       ${whereClause}
       ORDER BY r.review_time DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    
    return { reviews, total };
  },

  // 根据ID获取评价详情（带关联信息）
  async getByIdWithDetails(id) {
    const [reviews] = await db.query(
      `SELECT 
        r.*,
        s.name as student_name,
        c.code as classroom_code,
        c.location as classroom_location
       FROM reviews r
       LEFT JOIN students s ON r.student_id = s.student_id
       LEFT JOIN classrooms c ON r.classroom_id = c.classroom_id
       WHERE r.review_id = ?`,
      [id]
    );
    return reviews[0];
  },

  // 检查是否已评价
  async checkExists(student_id, classroom_id) {
    const [results] = await db.query(
      'SELECT 1 FROM reviews WHERE student_id = ? AND classroom_id = ?',
      [student_id, classroom_id]
    );
    return results.length > 0;
  },

  // 基础CRUD方法
  async getById(id) {
    const [reviews] = await db.query(
      'SELECT * FROM reviews WHERE review_id = ?', 
      [id]
    );
    return reviews[0];
  },

  async create(reviewData) {
    const [result] = await db.query(
      'INSERT INTO reviews SET ?', 
      [reviewData]
    );
    return result.insertId;
  },

  async update(id, updateData) {
    await db.query(
      'UPDATE reviews SET ? WHERE review_id = ?', 
      [updateData, id]
    );
  },

  async delete(id) {
    await db.query(
      'DELETE FROM reviews WHERE review_id = ?', 
      [id]
    );
  }
};