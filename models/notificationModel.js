const db = require("../config/db");

class Notification {
  static async getAll() {
    const [rows] = await db.query("SELECT * FROM notification");
    return rows;
  }

  static async getById(notification_id) {
    const [rows] = await db.query(
      "SELECT * FROM notification WHERE notification_id = ?",
      [notification_id]
    );
    return rows[0];
  }

  static async create(title, message, recipient_id, sender_id, type) {
    const [result] = await db.query(
      "INSERT INTO notification (title, message, recipient_id, sender_id, type) VALUES (?, ?, ?, ?, ?)",
      [title, message, recipient_id, sender_id, type]
    );
    return result.insertId;
  }

  static async update(notification_id, title, message, recipient_id, sender_id, type) {
    await db.query(
      "UPDATE notification SET title = ?, message = ?, recipient_id = ?, sender_id = ?, type = ? WHERE notification_id = ?",
      [title, message, recipient_id, sender_id, type, notification_id]
    );
  }

  static async delete(notification_id) {
    await db.query("DELETE FROM notification WHERE notification_id = ?", [notification_id]);
  }
}

module.exports = Notification;