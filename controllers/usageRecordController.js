const UsageRecord = require("../models/usageRecordModel");

exports.getAllUsageRecords = async (req, res, next) => {
  try {
    const usageRecords = await UsageRecord.getAll();
    res.status(200).json(usageRecords);
  } catch (err) {
    next(err);
  }
};

exports.getUsageRecordById = async (req, res, next) => {
  try {
    const usageRecord = await UsageRecord.getById(req.params.id);
    if (!usageRecord) {
      return res.status(404).json({ message: "UsageRecord not found" });
    }
    res.status(200).json(usageRecord);
  } catch (err) {
    next(err);
  }
};

exports.createUsageRecord = async (req, res, next) => {
  try {
    const {
      classroom_id,
      date,
      time_slot,
      type,
      event_id,
      status,
      teacher_id,
      participants,
    } = req.body;
    const usageId = await UsageRecord.create(
      classroom_id,
      date,
      time_slot,
      type,
      event_id,
      status,
      teacher_id,
      participants
    );
    res.status(201).json({ usage_id: usageId });
  } catch (err) {
    next(err);
  }
};

exports.updateUsageRecord = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      classroom_id,
      date,
      time_slot,
      type,
      event_id,
      status,
      teacher_id,
      participants,
    } = req.body;
    await UsageRecord.update(
      id,
      classroom_id,
      date,
      time_slot,
      type,
      event_id,
      status,
      teacher_id,
      participants
    );
    res.status(200).json({ message: "UsageRecord updated successfully" });
  } catch (err) {
    next(err);
  }
};

exports.deleteUsageRecord = async (req, res, next) => {
  try {
    const { id } = req.params;
    await UsageRecord.delete(id);
    res.status(200).json({ message: "UsageRecord deleted successfully" });
  } catch (err) {
    next(err);
  }
};
