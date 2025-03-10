const db = require("../config/db");

class UsageRecord {
  static async getAll() {
    const [rows] = await db.query("SELECT * FROM usage_record");
    return rows;
  }

  static async getById(usage_id) {
    const [rows] = await db.query(
      "SELECT * FROM usage_record WHERE usage_id = ?",
      [usage_id]
    );
    return rows[0];
  }

  static async create(
    classroom_id,
    date,
    time_slot,
    type,
    event_id,
    status,
    teacher_id,
    participants
  ) {
    const [result] = await db.query(
      "INSERT INTO usage_record (classroom_id, date, time_slot, type, event_id, status, teacher_id, participants) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        classroom_id,
        date,
        time_slot,
        type,
        event_id,
        status,
        teacher_id,
        participants,
      ]
    );
    return result.insertId;
  }

  static async update(
    usage_id,
    classroom_id,
    date,
    time_slot,
    type,
    event_id,
    status,
    teacher_id,
    participants
  ) {
    await db.query(
      "UPDATE usage_record SET classroom_id = ?, date = ?, time_slot = ?, type = ?, event_id = ?, status = ?, teacher_id = ?, participants = ? WHERE usage_id = ?",
      [
        classroom_id,
        date,
        time_slot,
        type,
        event_id,
        status,
        teacher_id,
        participants,
        usage_id,
      ]
    );
  }

  static async delete(usage_id) {
    await db.query("DELETE FROM usage_record WHERE usage_id = ?", [usage_id]);
  }
}

module.exports = UsageRecord;
