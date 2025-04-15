const db = require("../config/db");

module.exports = {
  // 获取所有教师（带分页和筛选）
  async getAllWithPagination(page, limit, filter) {
    const offset = (page - 1) * limit;

    // 构建WHERE条件
    const whereConditions = [];
    const params = [];

    if (filter.name) {
      whereConditions.push('t.name LIKE ?');
      params.push(`%${filter.name}%`);
    }

    if (filter.gender) {
      whereConditions.push('t.gender = ?');
      params.push(filter.gender);
    }

    if (filter.email) {
      whereConditions.push('t.email LIKE ?');
      params.push(`%${filter.email}%`);
    }

    if (filter.college_id) {
      whereConditions.push('t.college_id = ?');
      params.push(filter.college_id);
    }

    if (filter.search) {
      whereConditions.push('(t.name LIKE ? OR t.email LIKE ?)');
      params.push(`%${filter.search}%`);
      params.push(`%${filter.search}%`);
    }

    const whereClause = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // 查询总数
    const [totalResult] = await db.query(
      `SELECT COUNT(*) as total FROM teachers t ${whereClause}`,
      params
    );
    const total = totalResult[0].total;

    // 基础查询
    let query = `
      SELECT 
        t.*,
        c.name as college_name,
        COUNT(co.course_id) as course_count
      FROM teachers t
      LEFT JOIN colleges c ON t.college_id = c.college_id
      LEFT JOIN courses co ON t.teacher_id = co.teacher_id
      ${whereClause}
      GROUP BY t.teacher_id
    `;

    // 添加课程数量筛选
    if (filter.min_courses) {
      query += ' HAVING course_count >= ?';
      params.push(filter.min_courses);
    }

    // 添加分页
    query += ' ORDER BY t.name ASC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    // 执行查询
    const [teachers] = await db.query(query, params);

    return { teachers, total };
  },
  // 在 module.exports 中添加
  async getByIds(teacherIds) {
    if (!teacherIds || teacherIds.length === 0) return [];

    const [teachers] = await db.query(
      "SELECT * FROM teachers WHERE teacher_id IN (?)",
      [teacherIds]
    );
    return teachers;
  },
  // 根据ID获取教师详情（带关联信息）
  async getByIdWithDetails(id) {
    const [teachers] = await db.query(
      `SELECT 
        t.*,
        c.name as college_name
       FROM teachers t
       LEFT JOIN colleges c ON t.college_id = c.college_id
       WHERE t.teacher_id = ?`,
      [id]
    );

    if (teachers.length === 0) return null;

    // 获取教师教授的课程
    const [courses] = await db.query(
      `SELECT 
        course_id, 
        name, 
        code 
       FROM courses 
       WHERE teacher_id = ?`,
      [id]
    );

    return {
      ...teachers[0],
      courses
    };
  },

  // 检查邮箱是否已存在
  async checkEmailExists(email) {
    const [results] = await db.query(
      'SELECT 1 FROM teachers WHERE email = ?',
      [email]
    );
    return results.length > 0;
  },

  // 检查教师是否有课程
  async checkHasCourses(teacherId) {
    const [results] = await db.query(
      'SELECT 1 FROM courses WHERE teacher_id = ? LIMIT 1',
      [teacherId]
    );
    return results.length > 0;
  },

  // 基础CRUD方法
  async getById(id) {
    const [teachers] = await db.query(
      'SELECT * FROM teachers WHERE teacher_id = ?',
      [id]
    );
    return teachers[0];
  },

  async create(teacherData) {
    const [result] = await db.query(
      'INSERT INTO teachers SET ?',
      [teacherData]
    );
    return result.insertId;
  },

  async update(id, updateData) {
    await db.query(
      'UPDATE teachers SET ? WHERE teacher_id = ?',
      [updateData, id]
    );
  },

  async delete(id) {
    await db.query(
      'DELETE FROM teachers WHERE teacher_id = ?',
      [id]
    );
  }
};