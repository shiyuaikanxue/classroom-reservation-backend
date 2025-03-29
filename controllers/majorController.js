const Major = require('../models/majorModel');
const db = require('../config/db');
exports.getAllMajors = async (req, res, next) => {
  try {
    const { limit = 10, skip = 0, college_id } = req.query;

    // 参数验证
    const parsedLimit = parseInt(limit, 10);
    const parsedSkip = parseInt(skip, 10);
    if (isNaN(parsedLimit) || isNaN(parsedSkip)) {
      return res.status(400).json({ message: 'Invalid limit or skip value' });
    }

    // 构建基础查询
    let baseQuery = `
      SELECT m.*, 
        c.name AS college_name,
        (SELECT COUNT(*) FROM class WHERE major_id = m.major_id) AS class_count,
        (SELECT COUNT(*) FROM student s 
         JOIN class cl ON s.class_id = cl.class_id 
         WHERE cl.major_id = m.major_id) AS student_count
      FROM major m
      JOIN college c ON m.college_id = c.college_id
    `;

    // 添加学院筛选条件
    if (college_id) {
      baseQuery += ` WHERE m.college_id = ${college_id}`;
    }

    // 获取总数
    const totalQuery = `SELECT COUNT(*) AS total FROM (${baseQuery}) AS count_query`;
    const [totalResult] = await db.query(totalQuery);
    const total = totalResult[0].total;

    // 获取分页数据
    const paginatedQuery = `${baseQuery} LIMIT ? OFFSET ?`;
    const [majors] = await db.query(paginatedQuery, [parsedLimit, parsedSkip]);

    // 计算分页信息
    const totalPages = Math.ceil(total / parsedLimit);
    const currentPage = Math.floor(parsedSkip / parsedLimit) + 1;

    res.status(200).json({
      totalPages,
      currentPage,
      data: {
        majors,
        total
      }
    });
  } catch (err) {
    console.error('Error fetching majors:', err);
    next(err);
  }
};
exports.getMajorById = async (req, res, next) => {
  try {
    const majorId = req.params.id;
    if (!majorId) {
      return res.status(400).json({ message: 'Major ID is required' });
    }

    // 获取专业基础信息
    const [major] = await db.query(`
      SELECT m.*, c.name AS college_name 
      FROM major m
      JOIN college c ON m.college_id = c.college_id
      WHERE m.major_id = ?
    `, [majorId]);

    if (!major.length) {
      return res.status(404).json({ message: 'Major not found' });
    }

    // 获取关联统计信息
    const [classCount] = await db.query(
      'SELECT COUNT(*) AS count FROM class WHERE major_id = ?',
      [majorId]
    );
    const [studentCount] = await db.query(
      `SELECT COUNT(*) AS count FROM student s
       JOIN class c ON s.class_id = c.class_id
       WHERE c.major_id = ?`,
      [majorId]
    );

    res.status(200).json({
      data: {
        ...major[0],
        class_count: classCount[0].count,
        student_count: studentCount[0].count
      }
    });
  } catch (err) {
    console.error(`Error fetching major ${req.params.id}:`, err);
    next(err);
  }
};

exports.createMajor = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    const { college_id, name } = req.body;

    // 参数验证
    if (!college_id || !name) {
      return res.status(400).json({
        message: 'college_id and name are required'
      });
    }

    await connection.beginTransaction();

    // 检查学院是否存在
    const [college] = await connection.query(
      'SELECT 1 FROM college WHERE college_id = ? LIMIT 1',
      [college_id]
    );
    if (!college.length) {
      return res.status(404).json({ message: 'College not found' });
    }

    // 创建专业
    const [result] = await connection.query(
      'INSERT INTO major (college_id, name) VALUES (?, ?)',
      [college_id, name]
    );

    await connection.commit();

    // 获取创建的专业信息
    const [newMajor] = await db.query(
      'SELECT * FROM major WHERE major_id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'Major created successfully',
      data: newMajor[0]
    });
  } catch (err) {
    await connection.rollback();
    console.error('Error creating major:', err);
    next(err);
  } finally {
    connection.release();
  }
};

exports.updateMajor = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    const majorId = req.params.id;
    const { college_id, name } = req.body;

    // 参数验证
    if (!majorId) {
      return res.status(400).json({ message: 'Major ID is required' });
    }
    if (!college_id && !name) {
      return res.status(400).json({
        message: 'At least one field (college_id or name) is required'
      });
    }

    await connection.beginTransaction();

    // 检查专业是否存在
    const [major] = await connection.query(
      'SELECT * FROM major WHERE major_id = ?',
      [majorId]
    );
    if (!major.length) {
      return res.status(404).json({ message: 'Major not found' });
    }

    // 检查新学院是否存在（如果提供了college_id）
    if (college_id) {
      const [college] = await connection.query(
        'SELECT 1 FROM college WHERE college_id = ? LIMIT 1',
        [college_id]
      );
      if (!college.length) {
        return res.status(404).json({ message: 'New college not found' });
      }
    }

    // 更新专业
    await connection.query(
      'UPDATE major SET college_id = ?, name = ? WHERE major_id = ?',
      [college_id || major[0].college_id, name || major[0].name, majorId]
    );

    await connection.commit();

    // 获取更新后的数据
    const [updatedMajor] = await db.query(
      'SELECT * FROM major WHERE major_id = ?',
      [majorId]
    );

    res.status(200).json({
      message: 'Major updated successfully',
      data: updatedMajor[0]
    });
  } catch (err) {
    await connection.rollback();
    console.error(`Error updating major ${req.params.id}:`, err);
    next(err);
  } finally {
    connection.release();
  }
};

exports.deleteMajor = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    const majorId = req.params.id;
    if (!majorId) {
      return res.status(400).json({ message: 'Major ID is required' });
    }

    await connection.beginTransaction();

    // 1. 检查专业是否存在
    const [major] = await connection.query(
      'SELECT * FROM major WHERE major_id = ?',
      [majorId]
    );
    if (!major.length) {
      return res.status(404).json({ message: 'Major not found' });
    }

    // 初始化变量
    let classIds = [];
    let deletedStudentsCount = 0;

    // 2. 获取所有关联班级ID
    const [classes] = await connection.query(
      'SELECT class_id FROM class WHERE major_id = ?',
      [majorId]
    );
    classIds = classes.map(c => c.class_id);

    if (classIds.length > 0) {
      // 3. 删除关联学生并获取删除数量
      const [studentDeleteResult] = await connection.query(
        'DELETE FROM student WHERE class_id IN (?)',
        [classIds]
      );
      deletedStudentsCount = studentDeleteResult.affectedRows;

      // 4. 删除班级
      await connection.query(
        'DELETE FROM class WHERE class_id IN (?)',
        [classIds]
      );
    }

    // 5. 删除专业
    await connection.query(
      'DELETE FROM major WHERE major_id = ?',
      [majorId]
    );

    await connection.commit();

    res.status(200).json({
      message: 'Major and all associated data deleted successfully',
      deleted_major: major[0],
      deleted_classes_count: classIds.length,
      deleted_students_count: deletedStudentsCount
    });

  } catch (err) {
    await connection.rollback();
    console.error(`Error deleting major ${req.params.id}:`, err);
    next(err);
  } finally {
    connection.release();
  }
};