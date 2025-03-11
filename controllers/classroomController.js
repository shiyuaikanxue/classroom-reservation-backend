const Classroom = require("../models/classroomModel");

exports.getAllClassrooms = async (req, res, next) => {
  try {
    const classrooms = await Classroom.getAll();
    res.status(200).json(classrooms);
  } catch (err) {
    next(err);
  }
};

exports.getClassroomById = async (req, res, next) => {
  try {
    const classroom = await Classroom.getById(req.params.id);
    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }
    res.status(200).json(classroom);
  } catch (err) {
    next(err);
  }
};

exports.createClassroom = async (req, res, next) => {
  try {
    const {
      college_id,
      code,
      capacity,
      location,
      equipment,
      status,
      desk_capacity,
      air_conditioner_count,
      multimedia_equipment,
      photo_url,
    } = req.body;
    const classroom_id = await Classroom.create(
      college_id,
      code,
      capacity,
      location,
      equipment,
      status,
      desk_capacity,
      air_conditioner_count,
      multimedia_equipment,
      photo_url
    );
    res.status(201).json({ classroom_id });
  } catch (err) {
    next(err);
  }
};

exports.updateClassroom = async (req, res, next) => {
  try {
    const {
      college_id,
      code,
      capacity,
      location,
      equipment,
      status,
      desk_capacity,
      air_conditioner_count,
      multimedia_equipment,
      photo_url,
    } = req.body;
    await Classroom.update(
      req.params.id,
      college_id,
      code,
      capacity,
      location,
      equipment,
      status,
      desk_capacity,
      air_conditioner_count,
      multimedia_equipment,
      photo_url
    );
    res.status(200).json({ message: "Classroom updated" });
  } catch (err) {
    next(err);
  }
};

exports.deleteClassroom = async (req, res, next) => {
  try {
    await Classroom.delete(req.params.id);
    res.status(200).json({ message: "Classroom deleted" });
  } catch (err) {
    next(err);
  }
};
