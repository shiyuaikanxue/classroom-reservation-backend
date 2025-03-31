const Schedule = require("../models/scheduleModel");
const { ClassDivided } = require("../constants/reservations");

exports.getAllSchedules = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      student_id,
      teacher_id,
      classroom_id,
      course_name,
      status,
      date_from,
      date_to,
      time_slot
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
      student_id,
      teacher_id,
      classroom_id,
      course_name,
      status,
      date_from,
      date_to,
      time_slot
    };

    // 获取课表数据（带分页和筛选）
    const { schedules, total } = await Schedule.getAllWithPagination(
      Number(page),
      Number(limit),
      filter
    );

    res.status(200).json({
      schedules,
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

exports.getScheduleById = async (req, res, next) => {
  try {
    const schedule = await Schedule.getByIdWithDetails(req.params.id);
    if (!schedule) {
      return res.status(404).json({ 
        message: "Schedule not found" 
      });
    }
    res.status(200).json(schedule);
  } catch (err) {
    next(err);
  }
};

exports.createSchedule = async (req, res, next) => {
  try {
    const {
      student_id,
      course_name,
      classroom_id,
      start_time,
      end_time,
      status = 'pending',
      teacher_id,
      time_slot
    } = req.body;

    // 验证必需字段
    if (!student_id || !course_name || !classroom_id || !start_time || !end_time || !time_slot) {
      return res.status(400).json({ 
        message: "student_id, course_name, classroom_id, start_time, end_time and time_slot are required" 
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
    const isConflict = await Schedule.checkTimeConflict(
      classroom_id,
      start_time,
      end_time
    );
    if (isConflict) {
      return res.status(409).json({ 
        message: 'Time conflict with existing schedule' 
      });
    }

    // 创建课表
    const scheduleId = await Schedule.create({
      student_id,
      course_name,
      classroom_id,
      start_time,
      end_time,
      status,
      teacher_id,
      time_slot
    });

    res.status(201).json({ 
      schedule_id: scheduleId,
      message: "Schedule created successfully" 
    });
  } catch (err) {
    next(err);
  }
};

exports.updateSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      student_id,
      course_name,
      classroom_id,
      start_time,
      end_time,
      status,
      teacher_id,
      time_slot
    } = req.body;

    // 检查课表是否存在
    const schedule = await Schedule.getById(id);
    if (!schedule) {
      return res.status(404).json({ 
        message: "Schedule not found" 
      });
    }

    // 验证时间节点
    if (time_slot && !Object.values(ClassDivided).includes(time_slot)) {
      return res.status(400).json({
        message: 'Invalid time slot',
        validTimeSlots: Object.values(ClassDivided)
      });
    }

    // 检查时间冲突（排除当前课表）
    if (classroom_id || start_time || end_time) {
      const checkClassroomId = classroom_id || schedule.classroom_id;
      const checkStartTime = start_time || schedule.start_time;
      const checkEndTime = end_time || schedule.end_time;

      const isConflict = await Schedule.checkTimeConflict(
        checkClassroomId,
        checkStartTime,
        checkEndTime,
        id
      );
      if (isConflict) {
        return res.status(409).json({ 
          message: 'Time conflict with existing schedule' 
        });
      }
    }

    // 更新课表
    await Schedule.update(id, {
      student_id,
      course_name,
      classroom_id,
      start_time,
      end_time,
      status,
      teacher_id,
      time_slot
    });

    res.status(200).json({ 
      message: "Schedule updated successfully" 
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 检查课表是否存在
    const schedule = await Schedule.getById(id);
    if (!schedule) {
      return res.status(404).json({ 
        message: "Schedule not found" 
      });
    }

    // 删除课表
    await Schedule.delete(id);

    res.status(200).json({ 
      message: "Schedule deleted successfully" 
    });
  } catch (err) {
    next(err);
  }
};