const Activity = require("../models/activityModel");

exports.getAllActivities = async (req, res, next) => {
  try {
    const activities = await Activity.getAll();
    res.status(200).json(activities);
  } catch (err) {
    next(err);
  }
};

exports.getActivityById = async (req, res, next) => {
  try {
    const activity = await Activity.getById(req.params.id);
    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }
    res.status(200).json(activity);
  } catch (err) {
    next(err);
  }
};

exports.createActivity = async (req, res, next) => {
  try {
    const { name, description, date, time_slot, teacher_id, participants } = req.body;
    const activityId = await Activity.create(name, description, date, time_slot, teacher_id, participants);
    res.status(201).json({ activity_id: activityId });
  } catch (err) {
    next(err);
  }
};

exports.updateActivity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, date, time_slot, teacher_id, participants } = req.body;
    await Activity.update(id, name, description, date, time_slot, teacher_id, participants);
    res.status(200).json({ message: "Activity updated successfully" });
  } catch (err) {
    next(err);
  }
};

exports.deleteActivity = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Activity.delete(id);
    res.status(200).json({ message: "Activity deleted successfully" });
  } catch (err) {
    next(err);
  }
};