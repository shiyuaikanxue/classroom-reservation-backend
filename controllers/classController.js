const Class = require('../models/classModel');

exports.getAllClasses = async (req, res, next) => {
  try {
    const classes = await Class.getAll();
    res.status(200).json(classes);
  } catch (err) {
    next(err);
  }
};

exports.getClassById = async (req, res, next) => {
  try {
    const classInfo = await Class.getById(req.params.id);
    if (!classInfo) {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.status(200).json(classInfo);
  } catch (err) {
    next(err);
  }
};

exports.createClass = async (req, res, next) => {
  try {
    const { major_id, name } = req.body;
    const class_id = await Class.create(major_id, name);
    res.status(201).json({ class_id });
  } catch (err) {
    next(err);
  }
};

exports.updateClass = async (req, res, next) => {
  try {
    const { major_id, name } = req.body;
    await Class.update(req.params.id, major_id, name);
    res.status(200).json({ message: 'Class updated' });
  } catch (err) {
    next(err);
  }
};

exports.deleteClass = async (req, res, next) => {
  try {
    await Class.delete(req.params.id);
    res.status(200).json({ message: 'Class deleted' });
  } catch (err) {
    next(err);
  }
};