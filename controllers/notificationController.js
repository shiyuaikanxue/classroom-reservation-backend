const Notification = require("../models/notificationModel");

exports.getAllNotifications = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      recipient_id,
      sender_id,
      type,
      is_read,
      date_from,
      date_to
    } = req.query;

    // 构建筛选条件
    const filter = {
      recipient_id,
      sender_id,
      type,
      is_read: is_read ? Boolean(is_read) : undefined,
      date_from,
      date_to
    };

    // 获取通知数据（带分页和筛选）
    const { notifications, total } = await Notification.getAllWithPagination(
      Number(page),
      Number(limit),
      filter
    );

    res.status(200).json({
      notifications,
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

exports.getNotificationById = async (req, res, next) => {
  try {
    const notification = await Notification.getByIdWithDetails(req.params.id);
    if (!notification) {
      return res.status(404).json({ 
        message: "Notification not found" 
      });
    }
    
    // 标记为已读
    if (!notification.is_read) {
      await Notification.markAsRead(req.params.id);
      notification.is_read = true;
    }

    res.status(200).json(notification);
  } catch (err) {
    next(err);
  }
};

exports.createNotification = async (req, res, next) => {
  try {
    const { title, message, recipient_id, sender_id, type = 'system' } = req.body;

    // 验证必需字段
    if (!title || !message || !recipient_id) {
      return res.status(400).json({ 
        message: "title, message and recipient_id are required" 
      });
    }

    // 创建通知
    const notificationId = await Notification.create({
      title,
      message,
      recipient_id,
      sender_id,
      type,
      is_read: false
    });

    res.status(201).json({ 
      notification_id: notificationId,
      message: "Notification created successfully" 
    });
  } catch (err) {
    next(err);
  }
};

exports.updateNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, message, is_read } = req.body;

    // 检查通知是否存在
    const notification = await Notification.getById(id);
    if (!notification) {
      return res.status(404).json({ 
        message: "Notification not found" 
      });
    }

    // 更新通知
    await Notification.update(id, { 
      title, 
      message,
      is_read
    });

    res.status(200).json({ 
      message: "Notification updated successfully" 
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 检查通知是否存在
    const notification = await Notification.getById(id);
    if (!notification) {
      return res.status(404).json({ 
        message: "Notification not found" 
      });
    }

    // 删除通知
    await Notification.delete(id);

    res.status(200).json({ 
      message: "Notification deleted successfully" 
    });
  } catch (err) {
    next(err);
  }
};