const College = require('../models/collegeModel');

exports.getAllCollegesBySchoolId = async (req, res, next) => {
  try {
    const schoolId = req.query.school_id; // 从查询参数中获取学校ID
    if (!schoolId) {
      return res.status(400).json({ message: "school_id is required" });
    }
    const colleges = await College.getAllBySchoolId(schoolId); // 根据学校ID获取所有学院
    res.status(200).json(colleges);
  } catch (err) {
    next(err);
  }
};

exports.getCollegeById = async (req, res, next) => {
  try {
    const college = await College.getById(req.params.id);
    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }
    res.status(200).json(college);
  } catch (err) {
    next(err);
  }
};

exports.createCollege = async (req, res, next) => {
  try {
    const { school_id, name } = req.body;
    const college_id = await College.create(school_id, name);
    res.status(201).json({ college_id });
  } catch (err) {
    next(err);
  }
};

exports.updateCollege = async (req, res, next) => {
  try {
    const { school_id, name } = req.body;
    await College.update(req.params.id, school_id, name);
    res.status(200).json({ message: 'College updated' });
  } catch (err) {
    next(err);
  }
};

exports.deleteCollege = async (req, res, next) => {
  try {
    await College.delete(req.params.id);
    res.status(200).json({ message: 'College deleted' });
  } catch (err) {
    next(err);
  }
};