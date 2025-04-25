const Notification = require("../models/notificationModel");

exports.getAllNotifications = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      admin_id,
      student_id,
      is_urgent,
      publish_type,
      keyword,
      date_from,
      date_to
    } = req.query;

    // 构建筛选条件
    const filter = {
      admin_id,
      student_id,
      is_urgent: is_urgent !== undefined ? Boolean(is_urgent) : undefined,
      publish_type,
      keyword,
      date_from,
      date_to
    };

    // 获取通知数据（带分页和筛选）
    const { notifications, total } = await Notification.getAllWithPagination(
      Number(page),
      Number(limit),
      filter
    );

    // 获取每个通知的target信息
    const notificationsWithTargets = await Promise.all(
      notifications.map(async (notification) => {
        // 如果是全校通知，返回空数组
        if (notification.publish_type === 'all') {
          return {
            ...notification,
            targets: []
          };
        }

        // 否则查询通知目标
        const targets = await Notification.getNotificationTargets(notification.id);
        return {
          ...notification,
          targets: targets || []
        };
      })
    );

    res.status(200).json({
      code: 200,
      data: {
        notifications: notificationsWithTargets,
        total,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit))
        },
        filter
      }
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

    res.status(200).json({
      code: 200,
      data: notification
    });
  } catch (err) {
    next(err);
  }
};

exports.createNotification = async (req, res, next) => {
  try {
    const {
      admin_id,
      title,
      message,
      is_urgent = false,
      publish_type = 'selected',
      start_time,
      end_time,
      targets = []
    } = req.body;

    // 验证必需字段
    if (!admin_id || !title || !message) {
      return res.status(400).json({
        message: "admin_id, title and message are required"
      });
    }

    // 验证目标数据
    if (publish_type === 'selected' && (!targets || targets.length === 0)) {
      return res.status(400).json({
        message: "At least one target is required when publish_type is 'selected'"
      });
    }

    // 生成通知ID (NOT+年月日+4位随机数)
    const notificationId = `NOT${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${Math.floor(1000 + Math.random() * 9000)}`;

    // 创建通知数据
    const notificationData = {
      id: notificationId,
      admin_id,
      title,
      message,
      is_urgent,
      publish_type,
      start_time,
      end_time
    };

    // 创建通知（包含目标）
    await Notification.createWithTargets(notificationData, targets);

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
    const {
      title,
      message,
      is_urgent,
      publish_type,
      start_time,
      end_time,
      targets = []
    } = req.body;

    // 检查通知是否存在
    const notification = await Notification.getById(id);
    if (!notification) {
      return res.status(404).json({
        message: "Notification not found"
      });
    }

    // 验证目标数据
    if (publish_type === 'selected' && (!targets || targets.length === 0)) {
      return res.status(400).json({
        message: "At least one target is required when publish_type is 'selected'"
      });
    }

    // 更新数据
    const updateData = {
      title,
      message,
      is_urgent,
      publish_type,
      start_time,
      end_time
    };

    // 更新通知（包含目标）
    await Notification.updateWithTargets(id, updateData, targets);

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

// 获取学生未读通知数量
exports.getUnreadCount = async (req, res, next) => {
  try {
    const { student_id } = req.params;

    if (!student_id) {
      return res.status(400).json({
        message: "student_id is required"
      });
    }

    const count = await Notification.getUnreadCount(student_id);

    res.status(200).json({
      student_id,
      unread_count: count
    });
  } catch (err) {
    next(err);
  }
};