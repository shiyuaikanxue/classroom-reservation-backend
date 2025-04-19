const Schedule = require("../models/scheduleModel");
const Classroom = require("../models/classroomModel"); // 新增教室模型
const Teacher = require("../models/teacherModel"); // 新增教师模型
const { ClassDivided } = require("../constants/reservations");

exports.getAllSchedules = async (req, res, next) => {
  try {
    const { student_id, week } = req.query;

    if (!student_id || !week) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: "student_id and week are required",
        data: null
      });
    }

    // 配置学期开始日期（应放在模块顶部常量区）
    const SEMESTER_START_DATE = new Date('2025-02-24');

    // 基于学期开始日期的周数计算
    const getWeekDateRange = (week) => {
      const startDate = new Date(SEMESTER_START_DATE);
      startDate.setDate(startDate.getDate() + (week - 1) * 7);
      
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      
      return { startDate, endDate };
    };

    const { startDate, endDate } = getWeekDateRange(parseInt(week));

    // 格式化日期函数保持不变
    const formatDate = (date) => {
      const pad = num => num.toString().padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    };

    // 获取课程数据（保持不变）
    const schedules = await Schedule.getByStudentAndDateRange(
      student_id,
      formatDate(startDate),
      formatDate(endDate)
    );

    // 获取所有相关的教室和教师信息
    const classroomIds = [...new Set(schedules.map(s => s.classroom_id))];
    const teacherIds = [...new Set(schedules.map(s => s.teacher_id))];

    // 获取教室信息
    const classrooms = await Classroom.getByIds(classroomIds);
    const classroomMap = classrooms.reduce((map, classroom) => {
      map[classroom.classroom_id] = classroom;
      return map;
    }, {});

    // 获取教师信息
    const teachers = await Teacher.getByIds(teacherIds);
    const teacherMap = teachers.reduce((map, teacher) => {
      map[teacher.teacher_id] = teacher;
      return map;
    }, {});

    // 按天分组课程并添加教室和教师信息
    const weeklySchedule = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: []
    };

    schedules.forEach(schedule => {
      const dayOfWeek = new Date(schedule.start_time).getDay();
      
      // 获取教室和教师信息
      const classroom = classroomMap[schedule.classroom_id];
      const teacher = teacherMap[schedule.teacher_id];
      
      const enrichedSchedule = {
        ...schedule,
        classroom_code: classroom ? classroom.code : null,
        teacher_name: teacher ? teacher.name : null
      };

      switch (dayOfWeek) {
        case 0: weeklySchedule.Sunday.push(enrichedSchedule); break;
        case 1: weeklySchedule.Monday.push(enrichedSchedule); break;
        case 2: weeklySchedule.Tuesday.push(enrichedSchedule); break;
        case 3: weeklySchedule.Wednesday.push(enrichedSchedule); break;
        case 4: weeklySchedule.Thursday.push(enrichedSchedule); break;
        case 5: weeklySchedule.Friday.push(enrichedSchedule); break;
        case 6: weeklySchedule.Saturday.push(enrichedSchedule); break;
      }
    });

    // 按时间排序（保持不变）
    Object.keys(weeklySchedule).forEach(day => {
      weeklySchedule[day].sort((a, b) =>
        new Date(a.start_time) - new Date(b.start_time)
      );
    });

    res.status(200).json({
      code: 200,
      success: true,
      message: "Weekly schedule retrieved successfully",
      data: {
        week: parseInt(week),
        start_date: formatDate(startDate),
        end_date: formatDate(endDate),
        schedule: weeklySchedule
      }
    });

  } catch (err) {
    console.error('Error in getStudentWeeklySchedule:', err);
    res.status(500).json({
      code: 500,
      success: false,
      message: "Failed to retrieve weekly schedule",
      data: null,
      error: process.env.NODE_ENV === 'development' ? err.message : null
    });
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