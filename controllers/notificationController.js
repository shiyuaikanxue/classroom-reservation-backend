const Notification = require("../models/notificationModel");

exports.getAllNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.getAll();
    res.status(200).json(notifications);
  } catch (err) {
    next(err);
  }
};

exports.getNotificationById = async (req, res, next) => {
  try {
    const notification = await Notification.getById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.status(200).json(notification);
  } catch (err) {
    next(err);
  }
};

exports.createNotification = async (req, res, next) => {
  try {
    const { title, message, recipient_id, sender_id, type } = req.body;
    const notificationId = await Notification.create(title, message, recipient_id, sender_id, type);
    res.status(201).json({ notification_id: notificationId });
  } catch (err) {
    next(err);
  }
};

exports.updateNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, message, recipient_id, sender_id, type } = req.body;
    await Notification.update(id, title, message, recipient_id, sender_id, type);
    res.status(200).json({ message: "Notification updated successfully" });
  } catch (err) {
    next(err);
  }
};

exports.deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Notification.delete(id);
    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (err) {
    next(err);
  }
};