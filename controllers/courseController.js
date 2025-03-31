const Course = require("../models/courseModel");
const { ClassDivided } = require("../constants/reservations");
const db = require('../config/db');
exports.getAllCourses = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      name,
      teacher_id,
      classroom_id,
      date_from,
      date_to,
      time_slot,
      min_participants,
      max_participants
    } = req.query;

    // 验证时间节点
    if (time_slot && !Object.values(ClassDivided).includes(time_slot)) {
      return res.status(400).json({
        message: 'Invalid time slot',
        validTimeSlots: Object.values(ClassDivided)
      });
    }

    // 构建筛选条件
    const filter = {
      name,
      teacher_id,
      classroom_id,
      date_from,
      date_to,
      time_slot,
      min_participants: min_participants ? Number(min_participants) : undefined,
      max_participants: max_participants ? Number(max_participants) : undefined
    };

    // 获取课程数据
    const { courses, total } = await Course.getAllWithPagination(
      Number(page),
      Number(limit),
      filter
    );

    res.status(200).json({
      courses,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      },
      filter
    });
  } catch (err) {
    next(err);
  }
};

exports.getCourseById = async (req, res, next) => {
  try {
    const course = await Course.getByIdWithDetails(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.status(200).json(course);
  } catch (err) {
    next(err);
  }
};

exports.createCourse = async (req, res, next) => {
  try {
    const {
      name,
      teacher_id,
      classroom_id,
      start_time,
      end_time,
      time_slot,
      participants = 1
    } = req.body;

    // 验证必需字段
    if (!name || !teacher_id || !classroom_id || !time_slot) {
      return res.status(400).json({
        message: 'name, teacher_id, classroom_id and time_slot are required'
      });
    }

    // 验证时间节点
    if (!Object.values(ClassDivided).includes(time_slot)) {
      return res.status(400).json({
        message: 'Invalid time slot',
        validTimeSlots: Object.values(ClassDivided)
      });
    }

    // 检查时间冲突
    const isConflict = await Course.checkTimeConflict(
      classroom_id,
      start_time,
      end_time
    );
    if (isConflict) {
      return res.status(400).json({
        message: 'Time conflict with existing course'
      });
    }

    // 创建课程
    const courseId = await Course.create({
      name,
      teacher_id,
      classroom_id,
      start_time,
      end_time,
      time_slot,
      participants
    });

    res.status(201).json({
      course_id: courseId,
      message: 'Course created successfully'
    });
  } catch (err) {
    next(err);
  }
};

exports.updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      teacher_id,
      classroom_id,
      start_time,
      end_time,
      time_slot,
      participants
    } = req.body;

    // 检查课程是否存在
    const existingCourse = await Course.getById(id);
    if (!existingCourse) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // 验证时间节点
    if (time_slot && !Object.values(ClassDivided).includes(time_slot)) {
      return res.status(400).json({
        message: 'Invalid time slot',
        validTimeSlots: Object.values(ClassDivided)
      });
    }

    // 检查时间冲突（排除当前课程）
    if (classroom_id || start_time || end_time) {
      const checkClassroomId = classroom_id || existingCourse.classroom_id;
      const checkStartTime = start_time || existingCourse.start_time;
      const checkEndTime = end_time || existingCourse.end_time;

      const isConflict = await Course.checkTimeConflict(
        checkClassroomId,
        checkStartTime,
        checkEndTime,
        id
      );

      if (isConflict) {
        return res.status(400).json({
          message: 'Time conflict with existing course'
        });
      }
    }

    // 更新课程
    await Course.update(id, {
      name,
      teacher_id,
      classroom_id,
      start_time,
      end_time,
      time_slot,
      participants
    });

    res.status(200).json({ message: 'Course updated successfully' });
  } catch (err) {
    next(err);
  }
};

exports.deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 检查课程是否存在
    const course = await Course.getById(id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // 删除课程
    await Course.delete(id);

    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (err) {
    next(err);
  }
};