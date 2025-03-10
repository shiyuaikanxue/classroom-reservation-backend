const db = require("../config/db");

class Activity {
  static async getAll() {
    const [rows] = await db.query("SELECT * FROM activity");
    return rows;
  }

  static async getById(activity_id) {
    const [rows] = await db.query(
      "SELECT * FROM activity WHERE activity_id = ?",
      [activity_id]
    );
    return rows[0];
  }

  static async create(name, description, date, time_slot, teacher_id, participants) {
    const [result] = await db.query(
      "INSERT INTO activity (name, description, date, time_slot, teacher_id, participants) VALUES (?, ?, ?, ?, ?, ?)",
      [name, description, date, time_slot, teacher_id, participants]
    );
    return result.insertId;
  }

  static async update(activity_id, name, description, date, time_slot, teacher_id, participants) {
    await db.query(
      "UPDATE activity SET name = ?, description = ?, date = ?, time_slot = ?, teacher_id = ?, participants = ? WHERE activity_id = ?",
      [name, description, date, time_slot, teacher_id, participants, activity_id]
    );
  }

  static async delete(activity_id) {
    await db.query("DELETE FROM activity WHERE activity_id = ?", [activity_id]);
  }
}

module.exports = Activity;