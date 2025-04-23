const db = require('../config/db');
const Student = require('../models/studentModel');
exports.getAllStudents = async (req, res, next) => {
  try {
    const {
      limit = 10,
      skip = 0,
      school_id,
      class_id,
      name,
      gender,
      email,
      phone,
      status
    } = req.query;

    // 参数验证
    const parsedLimit = parseInt(limit, 10);
    const parsedSkip = parseInt(skip, 10);
    if (isNaN(parsedLimit) || isNaN(parsedSkip)) {
      return res.status(400).json({ message: 'Invalid limit or skip value' });
    }

    // 构建基础查询，添加专业和学院信息
    let baseQuery = `
      SELECT 
        s.*, 
        sc.name AS school_name,
        cl.name AS class_name,
        m.major_id,
        m.name AS major_name,
        co.college_id,
        co.name AS college_name
      FROM student s
      LEFT JOIN school sc ON s.school_id = sc.school_id
      LEFT JOIN class cl ON s.class_id = cl.class_id
      LEFT JOIN major m ON cl.major_id = m.major_id
      LEFT JOIN college co ON m.college_id = co.college_id
    `;

    // 构建筛选条件
    const whereClauses = [];
    const params = [];

    if (school_id) {
      whereClauses.push('s.school_id = ?');
      params.push(school_id);
    }

    if (class_id) {
      whereClauses.push('s.class_id = ?');
      params.push(class_id);
    }

    if (name) {
      whereClauses.push('s.name LIKE ?');
      params.push(`%${name}%`);
    }

    if (gender) {
      whereClauses.push('s.gender = ?');
      params.push(gender);
    }

    if (email) {
      whereClauses.push('s.email LIKE ?');
      params.push(`%${email}%`);
    }

    if (phone) {
      whereClauses.push('s.phone LIKE ?');
      params.push(`%${phone}%`);
    }

    if (status) {
      whereClauses.push('s.status = ?');
      params.push(status);
    }

    // 组合WHERE条件
    if (whereClauses.length > 0) {
      baseQuery += ' WHERE ' + whereClauses.join(' AND ');
    }

    // 默认按学号排序
    baseQuery += ' ORDER BY s.student_id ASC';

    // 获取总数
    const totalQuery = `SELECT COUNT(*) AS total FROM (${baseQuery}) AS count_query`;
    const [totalResult] = await db.query(totalQuery, params);
    const total = totalResult[0].total;

    // 获取分页数据
    const paginatedQuery = `${baseQuery} LIMIT ? OFFSET ?`;
    const [students] = await db.query(paginatedQuery, [...params, parsedLimit, parsedSkip]);

    // 计算分页信息
    const totalPages = Math.ceil(total / parsedLimit);
    const currentPage = Math.floor(parsedSkip / parsedLimit) + 1;

    res.status(200).json({
      totalPages,
      currentPage,
      data: {
        students,
        total,
        filters: {
          school_id,
          class_id,
          name,
          gender,
          email,
          phone,
          status
        }
      }
    });
  } catch (err) {
    console.error('Error fetching students:', err);
    next(err);
  }
};


// 获取学生详情（包含学院、专业、班级等完整信息）
exports.getStudentById = async (req, res, next) => {
  try {
    const studentId = req.params.id;
    if (!studentId) {
      return res.status(400).json({ message: 'Student ID is required' });
    }

    // 主查询：学生基本信息 + 学校 + 班级 + 专业 + 学院
    const [student] = await db.query(`
      SELECT 
        s.*,
        sc.name AS school_name,
        sc.address AS school_address,
        sc.phone AS school_phone,
        cl.name AS class_name,
        m.name AS major_name,
        co.name AS college_name
      FROM student s
      LEFT JOIN school sc ON s.school_id = sc.school_id
      LEFT JOIN class cl ON s.class_id = cl.class_id
      LEFT JOIN major m ON cl.major_id = m.major_id
      LEFT JOIN college co ON m.college_id = co.college_id
      WHERE s.student_id = ?
      LIMIT 1
    `, [studentId]);

    if (!student.length) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // 获取学生课程信息（通过teachers表关联）
    let courses = [];
    try {
      const [courseResults] = await db.query(`
        SELECT 
          c.course_id,
          c.name AS course_name,
          t.name AS teacher_name
        FROM courses c
        JOIN teachers t ON c.teacher_id = t.teacher_id
        WHERE c.teacher_id IN (
          SELECT teacher_id FROM teachers 
          WHERE college_id = (
            SELECT college_id FROM major 
            WHERE major_id = (
              SELECT major_id FROM class 
              WHERE class_id = ?
            )
          )
        )
      `, [student[0].class_id]);
      courses = courseResults;
    } catch (err) {
      console.error('Error fetching courses:', err);
    }

    // 构造返回数据
    const result = {
      ...student[0],
      courses: courses
    };

    res.status(200).json({
      code: 200,
      data: result
    });
  } catch (err) {
    console.error(`Error fetching student ${req.params.id}:`, err);
    next(err);
  }
};

// 创建学生
exports.createStudent = async (req, res, next) => {
  try {
    const {
      school_id,
      class_id,
      name,
      gender,
      email,
      phone,
      password
    } = req.body;

    // 参数验证
    if (!school_id || !class_id || !name || !password) {
      return res.status(400).json({ message: 'school_id, class_id, name and password are required' });
    }

    // 检查学校是否存在
    const [school] = await db.query('SELECT 1 FROM school WHERE school_id = ?', [school_id]);
    if (!school || school.length === 0) {
      return res.status(400).json({ message: 'School not found' });
    }

    // 检查班级是否存在
    const [classInfo] = await db.query('SELECT 1 FROM class WHERE class_id = ?', [class_id]);
    if (!classInfo || classInfo.length === 0) {
      return res.status(400).json({ message: 'Class not found' });
    }

    // 创建学生
    const result = await db.query(
      'INSERT INTO student (school_id, class_id, name, gender, email, phone, password) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [school_id, class_id, name, gender, email, phone, password]
    );

    res.status(201).json({
      student_id: result[0].insertId,
      message: 'Student created successfully'
    });
  } catch (err) {
    console.error('Error creating student:', err);
    next(err);
  }
};

// 更新学生信息
exports.updateStudent = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    const studentId = req.params.id;
    const updateData = req.body;

    // 参数验证
    if (!studentId) {
      return res.status(400).json({ message: 'Student ID is required' });
    }

    await connection.beginTransaction();

    // 检查学生是否存在
    const [student] = await connection.query(
      'SELECT * FROM student WHERE student_id = ?',
      [studentId]
    );
    if (!student.length) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // 构建更新语句
    const setClauses = [];
    const params = [];
    const updatedFields = {};

    // 定义允许更新的字段
    const allowedFields = [
      'school_id', 'class_id', 'name', 'gender',
      'email', 'phone', 'status'
    ];

    // 检查每个字段是否有变化
    allowedFields.forEach(field => {
      if (field in updateData && updateData[field] !== student[0][field]) {
        setClauses.push(`${field} = ?`);
        params.push(updateData[field]);
        updatedFields[field] = {
          from: student[0][field],
          to: updateData[field]
        };
      }
    });

    // 特殊处理密码更新
    if (updateData.password) {
      setClauses.push('password = ?');
      params.push(updateData.password);
      updatedFields.password = { updated: true };
    }

    // 如果没有实际需要更新的字段
    if (setClauses.length === 0) {
      return res.status(200).json({
        message: 'No changes detected',
        data: student[0]
      });
    }

    params.push(studentId);

    // 执行更新
    await connection.query(
      `UPDATE student SET ${setClauses.join(', ')} WHERE student_id = ?`,
      params
    );

    await connection.commit();

    // 获取更新后的数据
    const [updatedStudent] = await db.query(
      'SELECT * FROM student WHERE student_id = ?',
      [studentId]
    );

    res.status(200).json({
      message: 'Student updated successfully',
      changes: updatedFields,
      data: updatedStudent[0]
    });
  } catch (err) {
    await connection.rollback();
    console.error(`Error updating student ${req.params.id}:`, err);
    next(err);
  } finally {
    connection.release();
  }
};

// 删除学生
exports.deleteStudent = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const studentId = req.params.id;

    // 1. 检查学生是否存在
    const [student] = await connection.query(
      'SELECT 1 FROM student WHERE student_id = ? FOR UPDATE',
      [studentId]
    );

    if (!student || student.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Student not found' });
    }

    // 2. 检查所有关联记录
    const relatedTables = [
      'reservation',
      'favorite',
      'review',
      'notifications',
      'schedule'
    ];

    for (const table of relatedTables) {
      const [records] = await connection.query(
        `SELECT 1 FROM ${table} WHERE student_id = ? LIMIT 1`,
        [studentId]
      );

      if (records && records.length > 0) {
        await connection.rollback();
        return res.status(400).json({
          message: `Cannot delete student with associated ${table} records`
        });
      }
    }

    // 3. 执行删除
    await connection.query(
      'DELETE FROM student WHERE student_id = ?',
      [studentId]
    );

    await connection.commit();
    res.status(200).json({
      message: 'Student deleted successfully',
      student_id: studentId
    });
  } catch (err) {
    await connection.rollback();
    console.error('Error deleting student:', err);
    next(err);
  } finally {
    connection.release();
  }
};