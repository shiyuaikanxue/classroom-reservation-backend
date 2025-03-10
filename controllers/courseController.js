const Course = require("../models/courseModel");

exports.getAllCourses = async (req, res, next) => {
  try {
    const courses = await Course.getAll();
    res.status(200).json(courses);
  } catch (err) {
    next(err);
  }
};

exports.getCourseById = async (req, res, next) => {
  try {
    const course = await Course.getById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
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
      participants,
    } = req.body;
    const courseId = await Course.create(
      name,
      teacher_id,
      classroom_id,
      start_time,
      end_time,
      time_slot,
      participants
    );
    res.status(201).json({ course_id: courseId });
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
      participants,
    } = req.body;
    await Course.update(
      id,
      name,
      teacher_id,
      classroom_id,
      start_time,
      end_time,
      time_slot,
      participants
    );
    res.status(200).json({ message: "Course updated successfully" });
  } catch (err) {
    next(err);
  }
};

exports.deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Course.delete(id);
    res.status(200).json({ message: "Course deleted successfully" });
  } catch (err) {
    next(err);
  }
};
