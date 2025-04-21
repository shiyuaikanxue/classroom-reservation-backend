const Teacher = require("../models/teacherModel");

exports.getAllTeachers = async (req, res, next) => {
  try {
    const {
      page,
      limit,
      name,
      gender,
      email,
      college_id,
      min_courses,
      search
    } = req.query;

    // 构建筛选条件
    const filter = {
      name,
      gender,
      email,
      college_id,
      min_courses: min_courses ? Number(min_courses) : undefined,
      search
    };

    // 判断是否需要进行分页
    const shouldPaginate = page !== undefined && limit !== undefined;

    let result;
    if (shouldPaginate) {
      // 获取分页数据
      const { teachers, total } = await Teacher.getAllWithPagination(
        Number(page),
        Number(limit),
        filter
      );

      result = {
        teachers,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit))
        }
      };
    } else {
      // 获取全部数据
      const teachers = await Teacher.getAll(filter);
      result = {
        teachers,
        pagination: null // 表示未分页
      };
    }

    res.status(200).json({
      code: 200,
      data: {
        ...result,
        filter
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getTeacherById = async (req, res, next) => {
  try {
    const teacher = await Teacher.getByIdWithDetails(req.params.id);
    if (!teacher) {
      return res.status(404).json({
        message: "Teacher not found"
      });
    }
    res.status(200).json(teacher);
  } catch (err) {
    next(err);
  }
};

exports.createTeacher = async (req, res, next) => {
  try {
    const { name, gender, email, phone, college_id } = req.body;

    // 验证必需字段
    if (!name || !email || !college_id) {
      return res.status(400).json({
        message: "name, email and college_id are required"
      });
    }

    // 检查邮箱是否已存在
    const emailExists = await Teacher.checkEmailExists(email);
    if (emailExists) {
      return res.status(409).json({
        message: "Email already in use"
      });
    }

    // 创建教师
    const teacherId = await Teacher.create({
      name,
      gender,
      email,
      phone,
      college_id
    });

    res.status(201).json({
      teacher_id: teacherId,
      message: "Teacher created successfully"
    });
  } catch (err) {
    next(err);
  }
};

exports.updateTeacher = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, gender, email, phone, college_id } = req.body;

    // 检查教师是否存在
    const teacher = await Teacher.getById(id);
    if (!teacher) {
      return res.status(404).json({
        message: "Teacher not found"
      });
    }

    // 检查邮箱是否已被其他教师使用
    if (email && email !== teacher.email) {
      const emailExists = await Teacher.checkEmailExists(email);
      if (emailExists) {
        return res.status(409).json({
          message: "Email already in use by another teacher"
        });
      }
    }

    // 更新教师信息
    await Teacher.update(id, {
      name,
      gender,
      email,
      phone,
      college_id
    });

    res.status(200).json({
      message: "Teacher updated successfully"
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteTeacher = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 检查教师是否存在
    const teacher = await Teacher.getById(id);
    if (!teacher) {
      return res.status(404).json({
        message: "Teacher not found"
      });
    }

    // 检查是否有关联课程
    const hasCourses = await Teacher.checkHasCourses(id);
    if (hasCourses) {
      return res.status(400).json({
        message: "Cannot delete teacher with assigned courses"
      });
    }

    // 删除教师
    await Teacher.delete(id);

    res.status(200).json({
      message: "Teacher deleted successfully"
    });
  } catch (err) {
    next(err);
  }
};