const Teacher = require("../models/teacherModel");

exports.getAllTeachers = async (req, res, next) => {
  try {
    const teachers = await Teacher.getAll();
    res.status(200).json(teachers);
  } catch (err) {
    next(err);
  }
};

exports.getTeacherById = async (req, res, next) => {
  try {
    const teacher = await Teacher.getById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }
    res.status(200).json(teacher);
  } catch (err) {
    next(err);
  }
};

exports.createTeacher = async (req, res, next) => {
  try {
    const { name, gender, email, phone, college_id } = req.body;
    const teacherId = await Teacher.create(name, gender, email, phone, college_id);
    res.status(201).json({ teacher_id: teacherId });
  } catch (err) {
    next(err);
  }
};

exports.updateTeacher = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, gender, email, phone, college_id } = req.body;
    await Teacher.update(id, name, gender, email, phone, college_id);
    res.status(200).json({ message: "Teacher updated successfully" });
  } catch (err) {
    next(err);
  }
};

exports.deleteTeacher = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Teacher.delete(id);
    res.status(200).json({ message: "Teacher deleted successfully" });
  } catch (err) {
    next(err);
  }
};