const School = require('../models/schoolModel');

exports.getAllSchools = async (req, res, next) => {
  try {
    const schools = await School.getAll();
    res.status(200).json(schools);
  } catch (err) {
    next(err);
  }
};

exports.getSchoolById = async (req, res, next) => {
  try {
    const school = await School.getById(req.params.id);
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }
    res.status(200).json(school);
  } catch (err) {
    next(err);
  }
};

exports.createSchool = async (req, res, next) => {
  try {
    const { name, address, contact } = req.body;
    const school_id = await School.create(name, address, contact);
    res.status(201).json({ school_id });
  } catch (err) {
    next(err);
  }
};

exports.updateSchool = async (req, res, next) => {
  try {
    const { name, address, contact } = req.body;
    await School.update(req.params.id, name, address, contact);
    res.status(200).json({ message: 'School updated' });
  } catch (err) {
    next(err);
  }
};

exports.deleteSchool = async (req, res, next) => {
  try {
    await School.delete(req.params.id);
    res.status(200).json({ message: 'School deleted' });
  } catch (err) {
    next(err);
  }
};