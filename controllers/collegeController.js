const College = require('../models/collegeModel');
const db = require('../config/db');
exports.getAllCollegesBySchoolId = async (req, res, next) => {
  try {
    const { limit = 10, skip = 0, school_id } = req.query;

    if (!school_id) {
      return res.status(400).json({ message: "school_id is required" });
    }

    const parsedLimit = parseInt(limit, 10);
    const parsedSkip = parseInt(skip, 10);
    if (isNaN(parsedLimit) || isNaN(parsedSkip)) {
      return res.status(400).json({ message: 'Invalid limit or skip value' });
    }

    // 获取学院基础信息（带分页）
    const baseQuery = `
      SELECT c.*, 
        (SELECT COUNT(*) FROM major WHERE college_id = c.college_id) AS major_count,
        (SELECT COUNT(*) FROM student s 
         JOIN class cl ON s.class_id = cl.class_id 
         JOIN major m ON cl.major_id = m.major_id 
         WHERE m.college_id = c.college_id) AS student_count
      FROM college c 
      WHERE c.school_id = ?`;

    // 获取总数
    const [totalResult] = await db.query(
      `SELECT COUNT(*) AS total FROM college WHERE school_id = ?`,
      [school_id]
    );
    const total = totalResult[0].total;

    // 获取分页数据
    const [colleges] = await db.query(
      `${baseQuery} LIMIT ? OFFSET ?`,
      [school_id, parsedLimit, parsedSkip]
    );

    // 计算分页信息
    const totalPages = Math.ceil(total / parsedLimit);
    const currentPage = Math.floor(parsedSkip / parsedLimit) + 1;

    res.status(200).json({
      totalPages,
      currentPage,
      data: {
        colleges,
        total
      }
    });
  } catch (err) {
    console.error('Error fetching colleges:', err);
    next(err);
  }
};

exports.getCollegeById = async (req, res, next) => {
  try {
    const collegeId = req.params.id;
    if (!collegeId) {
      return res.status(400).json({ message: 'College ID is required' });
    }

    // 获取学院基础信息
    const college = await College.getById(collegeId);
    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }

    // 获取关联统计信息
    const [majorCount] = await db.query(
      'SELECT COUNT(*) AS count FROM major WHERE college_id = ?',
      [collegeId]
    );
    const [studentCount] = await db.query(
      `SELECT COUNT(*) AS count FROM student s
       JOIN class c ON s.class_id = c.class_id
       JOIN major m ON c.major_id = m.major_id
       WHERE m.college_id = ?`,
      [collegeId]
    );

    res.status(200).json({
      data: {
        ...college,
        major_count: majorCount[0].count,
        student_count: studentCount[0].count
      }
    });
  } catch (err) {
    console.error(`Error fetching college ${req.params.id}:`, err);
    next(err);
  }
};
exports.createCollege = async (req, res, next) => {
  try {
    const { school_id, name } = req.body;

    // 参数验证
    if (!school_id || !name) {
      return res.status(400).json({
        message: 'school_id and name are required'
      });
    }

    // 检查学校是否存在
    const [school] = await db.query(
      'SELECT 1 FROM school WHERE school_id = ? LIMIT 1',
      [school_id]
    );
    if (!school.length) {
      return res.status(404).json({ message: 'School not found' });
    }

    // 创建学院
    const collegeId = await College.create(school_id, name);

    res.status(201).json({
      message: 'College created successfully',
      data: {
        college_id: collegeId,
        school_id,
        name
      }
    });
  } catch (err) {
    console.error('Error creating college:', err);
    next(err);
  }
};

exports.updateCollege = async (req, res, next) => {
  try {
    const collegeId = req.params.id;
    const { school_id, name } = req.body;

    // 参数验证
    if (!collegeId) {
      return res.status(400).json({ message: 'College ID is required' });
    }
    if (!school_id && !name) {
      return res.status(400).json({
        message: 'At least one field (school_id or name) is required'
      });
    }

    // 检查学院是否存在
    const [college] = await db.query(
      'SELECT 1 FROM college WHERE college_id = ? LIMIT 1',
      [collegeId]
    );
    if (!college.length) {
      return res.status(404).json({ message: 'College not found' });
    }

    // 更新学院
    await College.update(collegeId, school_id, name);

    // 获取更新后的数据
    const [updatedCollege] = await db.query(
      'SELECT * FROM college WHERE college_id = ?',
      [collegeId]
    );

    res.status(200).json({
      message: 'College updated successfully',
      data: updatedCollege[0]
    });
  } catch (err) {
    console.error(`Error updating college ${req.params.id}:`, err);
    next(err);
  }
};
exports.deleteCollege = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    const collegeId = req.params.id;
    if (!collegeId) {
      return res.status(400).json({ message: 'College ID is required' });
    }

    await connection.beginTransaction();

    // 1. 检查学院是否存在
    const [college] = await connection.query(
      'SELECT * FROM college WHERE college_id = ?',
      [collegeId]
    );
    if (!college.length) {
      return res.status(404).json({ message: 'College not found' });
    }

    // 初始化变量
    let majorIds = [];
    let classIds = [];
    let deletedStudentsCount = 0;

    // 2. 获取所有关联专业ID
    const [majors] = await connection.query(
      'SELECT major_id FROM major WHERE college_id = ?',
      [collegeId]
    );
    majorIds = majors.map(m => m.major_id);

    if (majorIds.length > 0) {
      // 3. 获取所有关联班级ID
      const [classes] = await connection.query(
        'SELECT class_id FROM class WHERE major_id IN (?)',
        [majorIds]
      );
      classIds = classes.map(c => c.class_id);

      if (classIds.length > 0) {
        // 4. 删除关联学生并获取删除数量
        const [studentDeleteResult] = await connection.query(
          'DELETE FROM student WHERE class_id IN (?)',
          [classIds]
        );
        deletedStudentsCount = studentDeleteResult.affectedRows;

        // 5. 删除班级
        await connection.query(
          'DELETE FROM class WHERE class_id IN (?)',
          [classIds]
        );
      }

      // 6. 删除专业
      await connection.query(
        'DELETE FROM major WHERE major_id IN (?)',
        [majorIds]
      );
    }

    // 7. 删除学院
    await connection.query(
      'DELETE FROM college WHERE college_id = ?',
      [collegeId]
    );

    await connection.commit();

    res.status(200).json({
      message: 'College and all associated data deleted successfully',
      deleted_college: college[0],
      deleted_majors_count: majorIds.length,
      deleted_classes_count: classIds.length,
      deleted_students_count: deletedStudentsCount
    });

  } catch (err) {
    await connection.rollback();
    console.error(`Error deleting college ${req.params.id}:`, err);
    next(err);
  } finally {
    connection.release();
  }
};