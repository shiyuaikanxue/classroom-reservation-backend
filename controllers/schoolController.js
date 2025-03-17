const db = require('../config/db');
const School = require('../models/schoolModel');
const buildQuery = (filters) => {
  const {
    name,         // 校名（模糊搜索）
    type,         // 学校类型（模糊搜索）
    city,         // 所在城市（模糊搜索）
    country,      // 所在国家（模糊搜索）
    collegeCount, // 学院数量（>=）
    majorCount,   // 专业数量（>=）
    studentCount  // 学生人数（>=）
  } = filters;

  let query = `
    SELECT 
      s.school_id, 
      s.name, 
      s.address, 
      s.contact, 
      s.type, 
      s.website, 
      s.email, 
      s.city, 
      s.country, 
      s.phone, 
      s.created_at,
      COUNT(DISTINCT c.college_id) AS college_count,
      COUNT(DISTINCT m.major_id) AS major_count,
      COUNT(DISTINCT st.student_id) AS student_count
    FROM school s
    LEFT JOIN college c ON s.school_id = c.school_id
    LEFT JOIN major m ON c.college_id = m.college_id
    LEFT JOIN student st ON s.school_id = st.school_id
  `;

  // 动态构建 WHERE 条件
  const conditions = [];

  if (name) {
    conditions.push(`s.name LIKE '%${name}%'`);
  }
  if (type) {
    conditions.push(`s.type LIKE '%${type}%'`);
  }
  if (city) {
    conditions.push(`s.city LIKE '%${city}%'`);
  }
  if (country) {
    conditions.push(`s.country LIKE '%${country}%'`);
  }
  if (collegeCount) {
    conditions.push(`COUNT(DISTINCT c.college_id) >= ${collegeCount}`);
  }
  if (majorCount) {
    conditions.push(`COUNT(DISTINCT m.major_id) >= ${majorCount}`);
  }
  if (studentCount) {
    conditions.push(`COUNT(DISTINCT st.student_id) >= ${studentCount}`);
  }

  // 如果有条件，添加 WHERE 子句
  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`;
  }

  // 按学校分组
  query += ' GROUP BY s.school_id';

  return query;
};
exports.getSchools = async (req, res) => {
  try {
    const { limit = 10, skip = 0, ...filters } = req.query;

    // 校验 limit 和 skip 是否为有效数字
    const parsedLimit = parseInt(limit, 10);
    const parsedSkip = parseInt(skip, 10);
    if (isNaN(parsedLimit) || isNaN(parsedSkip)) {
      return res.status(400).json({ message: 'Invalid limit or skip value' });
    }

    // 构建查询条件
    let query = buildQuery(filters);

    // 获取总数
    const totalQuery = `SELECT COUNT(*) AS total FROM (${query}) AS countQuery`;
    const [totalResult] = await db.query(totalQuery);
    const total = totalResult[0].total;

    // 获取分页后的学校列表
    const paginatedQuery = `${query} LIMIT ${parsedLimit} OFFSET ${parsedSkip}`;
    const [schools] = await db.query(paginatedQuery);

    // 计算总页数和当前页数
    const totalPages = Math.ceil(total / parsedLimit);
    const currentPage = Math.floor(parsedSkip / parsedLimit) + 1;

    // 返回结果
    res.status(200).json({
      totalPages,
      currentPage,
      data: {
        schools,
        total
      }
    });
  } catch (error) {
    console.error('Error fetching schools:', error);
    res.status(500).json({ message: '获取学校列表失败' });
  }
};

exports.getSchoolById = async (req, res, next) => {
  try {
    const school = await School.getById(req.params.id);
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }
    res.status(200).json(school);
  } catch (err) {
    next(err);
  }
};

exports.createSchool = async (req, res, next) => {
  try {
    const {
      name,         // 校名（必传）
      type,         // 学校类型（必传）
      country,      // 所在国家（可选）
      city,         // 所在城市（可选）
      address,      // 地址（可选）
      contact,      // 联系电话（可选）
      email,        // 邮箱（可选）
      website       // 官网（可选）
    } = req.body;

    // 校验必填字段
    if (!name || !type) {
      return res.status(400).json({ message: '校名和学校类型是必填字段' });
    }

    // 调用 School 模型的 create 方法
    const school_id = await School.create(
      name,
      type,
      country,
      city,
      address,
      contact,
      email,
      website
    );

    // 返回创建成功的响应
    res.status(201).json({ school_id });
  } catch (err) {
    next(err);
  }
};
exports.updateSchool = async (req, res, next) => {
  try {
    const {
      name,         // 校名（必传）
      type,         // 学校类型（必传）
      country,      // 所在国家（可选）
      city,         // 所在城市（可选）
      address,      // 地址（可选）
      contact,      // 联系电话（可选）
      email,        // 邮箱（可选）
      website       // 官网（可选）
    } = req.body;

    // 校验必填字段
    if (!name || !type) {
      return res.status(400).json({ message: '校名和学校类型是必填字段' });
    }

    // 调用 School 模型的 update 方法
    await School.update(
      req.params.id, // 学校 ID
      name,
      type,
      country,
      city,
      address,
      contact,
      email,
      website
    );

    // 返回更新成功的响应
    res.status(200).json({ message: 'School updated' });
  } catch (err) {
    next(err);
  }
};

exports.deleteSchool = async (req, res, next) => {
  const { id } = req.params; // 学校 ID

  try {
    // 开启事务
    await db.query('START TRANSACTION');

    // 1. 删除活动（activities 表）
    await db.query(`
      DELETE a
      FROM activities a
      JOIN classroom cl ON a.classroom_id = cl.classroom_id
      JOIN college co ON cl.college_id = co.college_id
      WHERE co.school_id = ?
    `, [id]);

    // 2. 删除管理员（admin 表）
    await db.query('DELETE FROM admin WHERE school_id = ?', [id]);

    // 3. 删除课程（courses 表）
    await db.query(`
      DELETE c
      FROM courses c
      JOIN classroom cl ON c.classroom_id = cl.classroom_id
      JOIN college co ON cl.college_id = co.college_id
      WHERE co.school_id = ?
    `, [id]);

    // 4. 删除收藏（favorite 表）
    await db.query(`
      DELETE f
      FROM favorite f
      JOIN classroom cl ON f.classroom_id = cl.classroom_id
      JOIN college co ON cl.college_id = co.college_id
      WHERE co.school_id = ?
    `, [id]);

    // 5. 删除通知（notifications 表）
    await db.query(`
      DELETE n
      FROM notifications n
      JOIN student s ON n.student_id = s.student_id
      WHERE s.school_id = ?
    `, [id]);

    // 6. 删除预约（reservation 表）
    await db.query(`
      DELETE r
      FROM reservation r
      JOIN classroom cl ON r.classroom_id = cl.classroom_id
      JOIN college co ON cl.college_id = co.college_id
      WHERE co.school_id = ?
    `, [id]);

    // 7. 删除评价（review 表）
    await db.query(`
      DELETE r
      FROM review r
      JOIN classroom cl ON r.classroom_id = cl.classroom_id
      JOIN college co ON cl.college_id = co.college_id
      WHERE co.school_id = ?
    `, [id]);

    // 8. 删除课表（schedule 表）
    await db.query(`
      DELETE s
      FROM schedule s
      JOIN classroom cl ON s.classroom_id = cl.classroom_id
      JOIN college co ON cl.college_id = co.college_id
      WHERE co.school_id = ?
    `, [id]);

    // 9. 删除使用记录（usage_record 表）
    await db.query(`
      DELETE u
      FROM usage_record u
      JOIN classroom cl ON u.classroom_id = cl.classroom_id
      JOIN college co ON cl.college_id = co.college_id
      WHERE co.school_id = ?
    `, [id]);

    // 10. 删除教室（classroom 表）
    await db.query(`
      DELETE cl
      FROM classroom cl
      JOIN college co ON cl.college_id = co.college_id
      WHERE co.school_id = ?
    `, [id]);

    // 11. 删除学生（student 表）
    await db.query('DELETE FROM student WHERE school_id = ?', [id]);

    // 12. 删除教师（teachers 表）
    await db.query('DELETE FROM teachers WHERE school_id = ?', [id]);

    // 13. 删除专业（major 表）
    await db.query(`
      DELETE m
      FROM major m
      JOIN college c ON m.college_id = c.college_id
      WHERE c.school_id = ?
    `, [id]);

    // 14. 删除学院（college 表）
    await db.query('DELETE FROM college WHERE school_id = ?', [id]);

    // 15. 删除学校（school 表）
    await db.query('DELETE FROM school WHERE school_id = ?', [id]);

    // 提交事务
    await db.query('COMMIT');

    // 返回成功响应
    res.status(200).json({ message: 'School and all related data deleted' });
  } catch (err) {
    // 回滚事务
    await db.query('ROLLBACK');
    next(err);
  }
};