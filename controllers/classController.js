const Class = require('../models/classModel');
const db = require('../config/db');
exports.getAllClasses = async (req, res, next) => {
  try {
    const {
      limit = 10,
      skip = 0,
      major_id,
      name,
      college_id,
      school_id,
      min_students,  // 新增：最少学生人数筛选
      max_students   // 新增：最多学生人数筛选
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
        c.class_id,
        c.name AS class_name,
        c.major_id,
        m.name AS major_name,
        m.college_id,
        co.name AS college_name,
        co.school_id,
        sc.name AS school_name,
        COUNT(s.student_id) AS student_count
      FROM class c
      LEFT JOIN major m ON c.major_id = m.major_id
      LEFT JOIN college co ON m.college_id = co.college_id
      LEFT JOIN school sc ON co.school_id = sc.school_id
      LEFT JOIN student s ON c.class_id = s.class_id
    `;

    // 构建筛选条件
    const whereClauses = [];
    const params = [];

    if (major_id) {
      whereClauses.push('c.major_id = ?');
      params.push(major_id);
    }

    if (name) {
      whereClauses.push('c.name LIKE ?');
      params.push(`%${name}%`);
    }

    if (college_id) {
      whereClauses.push('m.college_id = ?');
      params.push(college_id);
    }

    if (school_id) {
      whereClauses.push('co.school_id = ?');
      params.push(school_id);
    }

    // 组合WHERE条件
    if (whereClauses.length > 0) {
      baseQuery += ' WHERE ' + whereClauses.join(' AND ');
    }

    // 添加GROUP BY子句
    baseQuery += ' GROUP BY c.class_id';

    // 添加HAVING子句用于筛选学生人数
    const havingClauses = [];
    if (min_students) {
      havingClauses.push('COUNT(s.student_id) >= ?');
      params.push(min_students);
    }
    if (max_students) {
      havingClauses.push('COUNT(s.student_id) <= ?');
      params.push(max_students);
    }
    if (havingClauses.length > 0) {
      baseQuery += ' HAVING ' + havingClauses.join(' AND ');
    }

    // 默认按班级ID排序
    baseQuery += ' ORDER BY c.class_id ASC';

    // 获取总数（需要修改为计算分组后的总数）
    const countQuery = `
      SELECT COUNT(*) AS total FROM (
        SELECT c.class_id
        FROM class c
        LEFT JOIN major m ON c.major_id = m.major_id
        LEFT JOIN college co ON m.college_id = co.college_id
        LEFT JOIN student s ON c.class_id = s.class_id
        ${whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : ''}
        GROUP BY c.class_id
        ${havingClauses.length > 0
        ? 'HAVING ' + havingClauses.join(' AND ')
        : ''
      }
      ) AS temp
    `;
    const [totalResult] = await db.query(countQuery, params);
    const total = totalResult[0].total;

    // 获取分页数据
    const paginatedQuery = `${baseQuery} LIMIT ? OFFSET ?`;
    const [classes] = await db.query(paginatedQuery, [...params, parsedLimit, parsedSkip]);

    // 计算分页信息
    const totalPages = Math.ceil(total / parsedLimit);
    const currentPage = Math.floor(parsedSkip / parsedLimit) + 1;

    res.status(200).json({
      totalPages,
      currentPage,
      data: {
        classes,
        total,
        filters: {
          major_id,
          name,
          college_id,
          school_id,
          min_students,
          max_students
        }
      }
    });
  } catch (err) {
    console.error('Error fetching classes:', err);
    next(err);
  }
};

exports.getClassById = async (req, res, next) => {
  try {
    const classId = req.params.id;
    const query = `
      SELECT 
        c.class_id,
        c.name AS class_name,
        c.major_id,
        m.name AS major_name,
        m.college_id,
        co.name AS college_name,
        co.school_id,
        sc.name AS school_name,
        COUNT(s.student_id) AS student_count
      FROM class c
      LEFT JOIN major m ON c.major_id = m.major_id
      LEFT JOIN college co ON m.college_id = co.college_id
      LEFT JOIN school sc ON co.school_id = sc.school_id
      LEFT JOIN student s ON c.class_id = s.class_id
      WHERE c.class_id = ?
      GROUP BY c.class_id
    `;

    const [classInfo] = await db.query(query, [classId]);

    if (!classInfo || classInfo.length === 0) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // 获取学生列表（可选）
    const [students] = await db.query(`
      SELECT student_id, name, gender, email, phone 
      FROM student 
      WHERE class_id = ?
    `, [classId]);

    res.status(200).json({
      ...classInfo[0],
      students: students || []
    });
  } catch (err) {
    console.error('Error fetching class by ID:', err);
    next(err);
  }
};

exports.getClassById = async (req, res, next) => {
  try {
    const classId = req.params.id;
    const query = `
      SELECT 
        c.class_id,
        c.name AS class_name,
        c.major_id,
        m.name AS major_name,
        m.college_id,
        co.name AS college_name,
        co.school_id,
        sc.name AS school_name
      FROM class c
      LEFT JOIN major m ON c.major_id = m.major_id
      LEFT JOIN college co ON m.college_id = co.college_id
      LEFT JOIN school sc ON co.school_id = sc.school_id
      WHERE c.class_id = ?
    `;

    const [classInfo] = await db.query(query, [classId]);

    if (!classInfo || classInfo.length === 0) {
      return res.status(404).json({ message: 'Class not found' });
    }

    res.status(200).json(classInfo[0]);
  } catch (err) {
    console.error('Error fetching class by ID:', err);
    next(err);
  }
};

exports.createClass = async (req, res, next) => {
  try {
    const { major_id, class_name } = req.body;

    // 参数验证
    if (!major_id || !class_name) {
      return res.status(400).json({ message: 'major_id and name are required' });
    }

    // 检查专业是否存在
    const [major] = await db.query('SELECT 1 FROM major WHERE major_id = ?', [major_id]);
    if (!major || major.length === 0) {
      return res.status(400).json({ message: 'Major not found' });
    }

    // 检查班级名称是否已存在
    const [existingClass] = await db.query('SELECT 1 FROM class WHERE name = ? AND major_id = ?', [class_name, major_id]);
    if (existingClass && existingClass.length > 0) {
      return res.status(400).json({ message: 'Class with this name already exists in this major' });
    }

    const result = await db.query('INSERT INTO class (major_id, name) VALUES (?, ?)', [major_id, class_name]);
    const class_id = result[0].insertId;

    res.status(201).json({
      class_id,
      message: 'Class created successfully'
    });
  } catch (err) {
    console.error('Error creating class:', err);
    next(err);
  }
};

exports.updateClass = async (req, res, next) => {
  try {
    const classId = req.params.id;
    const { major_id, name } = req.body;

    // 参数验证
    if (!major_id || !name) {
      return res.status(400).json({ message: 'major_id and name are required' });
    }

    // 检查班级是否存在
    const [existingClass] = await db.query('SELECT 1 FROM class WHERE class_id = ?', [classId]);
    if (!existingClass || existingClass.length === 0) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // 检查专业是否存在
    const [major] = await db.query('SELECT 1 FROM major WHERE major_id = ?', [major_id]);
    if (!major || major.length === 0) {
      return res.status(400).json({ message: 'Major not found' });
    }

    // 检查班级名称是否已存在（排除当前班级）
    const [duplicateClass] = await db.query(
      'SELECT 1 FROM class WHERE name = ? AND major_id = ? AND class_id != ?',
      [name, major_id, classId]
    );
    if (duplicateClass && duplicateClass.length > 0) {
      return res.status(400).json({ message: 'Class with this name already exists in this major' });
    }

    await db.query('UPDATE class SET major_id = ?, name = ? WHERE class_id = ?', [major_id, name, classId]);

    res.status(200).json({
      message: 'Class updated successfully',
      class_id: classId,
      changes: { major_id, name }
    });
  } catch (err) {
    console.error('Error updating class:', err);
    next(err);
  }
};

exports.deleteClass = async (req, res, next) => {
  try {
    const classId = req.params.id;

    // 检查班级是否存在
    const [existingClass] = await db.query('SELECT 1 FROM class WHERE class_id = ?', [classId]);
    if (!existingClass || existingClass.length === 0) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // 检查是否有学生关联到这个班级
    const [students] = await db.query('SELECT 1 FROM student WHERE class_id = ? LIMIT 1', [classId]);
    if (students && students.length > 0) {
      return res.status(400).json({
        message: 'Cannot delete class with associated students. Please reassign students first.'
      });
    }

    await db.query('DELETE FROM class WHERE class_id = ?', [classId]);

    res.status(200).json({
      message: 'Class deleted successfully',
      class_id: classId
    });
  } catch (err) {
    console.error('Error deleting class:', err);
    next(err);
  }
};