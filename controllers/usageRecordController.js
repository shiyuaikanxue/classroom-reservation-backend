const UsageRecord = require("../models/usageRecordModel");
const { ClassDivided } = require("../constants/reservations");

exports.getAllUsageRecords = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      classroom_id,
      date,
      time_slot,
      type,
      event_id,
      status,
      teacher_id,
      min_participants,
      max_participants,
      date_from,
      date_to
    } = req.query;

    // 验证时间节点
    if (time_slot && !Object.values(ClassDivided).includes(time_slot)) {
      return res.status(400).json({
        message: 'Invalid time slot',
        validTimeSlots: Object.values(ClassDivided)
      });
    }

    // 构建筛选条件
    const filter = {
      classroom_id,
      date,
      time_slot,
      type,
      event_id,
      status,
      teacher_id,
      min_participants: min_participants ? Number(min_participants) : undefined,
      max_participants: max_participants ? Number(max_participants) : undefined,
      date_from,
      date_to
    };

    // 获取使用记录数据（带分页和筛选）
    const { usageRecords, total } = await UsageRecord.getAllWithPagination(
      Number(page),
      Number(limit),
      filter
    );

    res.status(200).json({
      usageRecords,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      },
      filter
    });
  } catch (err) {
    next(err);
  }
};

exports.getUsageRecordById = async (req, res, next) => {
  try {
    const usageRecord = await UsageRecord.getByIdWithDetails(req.params.id);
    if (!usageRecord) {
      return res.status(404).json({ 
        message: "UsageRecord not found" 
      });
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
      status = 'scheduled',
      teacher_id,
      participants = 0
    } = req.body;

    // 验证必需字段
    if (!classroom_id || !date || !time_slot || !type) {
      return res.status(400).json({ 
        message: "classroom_id, date, time_slot and type are required" 
      });
    }

    // 验证时间节点
    if (!Object.values(ClassDivided).includes(time_slot)) {
      return res.status(400).json({
        message: 'Invalid time slot',
        validTimeSlots: Object.values(ClassDivided)
      });
    }

    // 检查时间冲突
    const isConflict = await UsageRecord.checkTimeConflict(
      classroom_id,
      date,
      time_slot
    );
    if (isConflict) {
      return res.status(409).json({ 
        message: 'Time conflict with existing usage record' 
      });
    }

    // 创建使用记录
    const usageId = await UsageRecord.create({
      classroom_id,
      date,
      time_slot,
      type,
      event_id,
      status,
      teacher_id,
      participants
    });

    res.status(201).json({ 
      usage_id: usageId,
      message: "UsageRecord created successfully" 
    });
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
      participants
    } = req.body;

    // 检查使用记录是否存在
    const usageRecord = await UsageRecord.getById(id);
    if (!usageRecord) {
      return res.status(404).json({ 
        message: "UsageRecord not found" 
      });
    }

    // 验证时间节点
    if (time_slot && !Object.values(ClassDivided).includes(time_slot)) {
      return res.status(400).json({
        message: 'Invalid time slot',
        validTimeSlots: Object.values(ClassDivided)
      });
    }

    // 检查时间冲突（排除当前记录）
    if (classroom_id || date || time_slot) {
      const checkClassroomId = classroom_id || usageRecord.classroom_id;
      const checkDate = date || usageRecord.date;
      const checkTimeSlot = time_slot || usageRecord.time_slot;

      const isConflict = await UsageRecord.checkTimeConflict(
        checkClassroomId,
        checkDate,
        checkTimeSlot,
        id
      );
      if (isConflict) {
        return res.status(409).json({ 
          message: 'Time conflict with existing usage record' 
        });
      }
    }

    // 更新使用记录
    await UsageRecord.update(id, {
      classroom_id,
      date,
      time_slot,
      type,
      event_id,
      status,
      teacher_id,
      participants
    });

    res.status(200).json({ 
      message: "UsageRecord updated successfully" 
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteUsageRecord = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 检查使用记录是否存在
    const usageRecord = await UsageRecord.getById(id);
    if (!usageRecord) {
      return res.status(404).json({ 
        message: "UsageRecord not found" 
      });
    }

    // 删除使用记录
    await UsageRecord.delete(id);

    res.status(200).json({ 
      message: "UsageRecord deleted successfully" 
    });
  } catch (err) {
    next(err);
  }
};