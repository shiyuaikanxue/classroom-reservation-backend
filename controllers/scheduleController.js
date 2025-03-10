const Schedule = require("../models/scheduleModel");

exports.getAllSchedules = async (req, res, next) => {
  try {
    const schedules = await Schedule.getAll();
    res.status(200).json(schedules);
  } catch (err) {
    next(err);
  }
};

exports.getScheduleById = async (req, res, next) => {
  try {
    const schedule = await Schedule.getById(req.params.id);
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
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
      status,
      teacher_id,
      time_slot,
    } = req.body;
    const scheduleId = await Schedule.create(
      student_id,
      course_name,
      classroom_id,
      start_time,
      end_time,
      status,
      teacher_id,
      time_slot
    );
    res.status(201).json({ schedule_id: scheduleId });
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
      time_slot,
    } = req.body;
    await Schedule.update(
      id,
      student_id,
      course_name,
      classroom_id,
      start_time,
      end_time,
      status,
      teacher_id,
      time_slot
    );
    res.status(200).json({ message: "Schedule updated successfully" });
  } catch (err) {
    next(err);
  }
};

exports.deleteSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Schedule.delete(id);
    res.status(200).json({ message: "Schedule deleted successfully" });
  } catch (err) {
    next(err);
  }
};

