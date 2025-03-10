const Major = require('../models/majorModel');

exports.getAllMajors = async (req, res, next) => {
  try {
    const majors = await Major.getAll();
    res.status(200).json(majors);
  } catch (err) {
    next(err);
  }
};

exports.getMajorById = async (req, res, next) => {
  try {
    const major = await Major.getById(req.params.id);
    if (!major) {
      return res.status(404).json({ message: 'Major not found' });
    }
    res.status(200).json(major);
  } catch (err) {
    next(err);
  }
};

exports.createMajor = async (req, res, next) => {
  try {
    const { college_id, name } = req.body;
    const major_id = await Major.create(college_id, name);
    res.status(201).json({ major_id });
  } catch (err) {
    next(err);
  }
};

exports.updateMajor = async (req, res, next) => {
  try {
    const { college_id, name } = req.body;
    await Major.update(req.params.id, college_id, name);
    res.status(200).json({ message: 'Major updated' });
  } catch (err) {
    next(err);
  }
};

exports.deleteMajor = async (req, res, next) => {
  try {
    await Major.delete(req.params.id);
    res.status(200).json({ message: 'Major deleted' });
  } catch (err) {
    next(err);
  }
};