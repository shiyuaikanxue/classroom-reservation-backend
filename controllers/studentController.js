const Student = require('../models/studentModel');

exports.getAllStudents = async (req, res, next) => {
  try {
    const students = await Student.getAll();
    res.status(200).json(students);
  } catch (err) {
    next(err);
  }
};

exports.getStudentById = async (req, res, next) => {
  try {
    const student = await Student.getById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.status(200).json(student);
  } catch (err) {
    next(err);
  }
};

exports.createStudent = async (req, res, next) => {
  try {
    const { school_id, class_id, name, gender, email, phone, password } = req.body;
    const student_id = await Student.create(school_id, class_id, name, gender, email, phone, password);
    res.status(201).json({ student_id });
  } catch (err) {
    next(err);
  }
};

exports.updateStudent = async (req, res, next) => {
  try {
    const { school_id, class_id, name, gender, email, phone, password } = req.body;
    await Student.update(req.params.id, school_id, class_id, name, gender, email, phone, password);
    res.status(200).json({ message: 'Student updated' });
  } catch (err) {
    next(err);
  }
};

exports.deleteStudent = async (req, res, next) => {
  try {
    await Student.delete(req.params.id);
    res.status(200).json({ message: 'Student deleted' });
  } catch (err) {
    next(err);
  }
};