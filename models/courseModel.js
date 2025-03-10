const db = require("../config/db");

class Course {
  static async getAll() {
    const [rows] = await db.query("SELECT * FROM course");
    return rows;
  }

  static async getById(course_id) {
    const [rows] = await db.query(
      "SELECT * FROM course WHERE course_id = ?",
      [course_id]
    );
    return rows[0];
  }

  static async create(name, teacher_id, classroom_id, start_time, end_time, time_slot, participants) {
    const [result] = await db.query(
      "INSERT INTO course (name, teacher_id, classroom_id, start_time, end_time, time_slot, participants) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [name, teacher_id, classroom_id, start_time, end_time, time_slot, participants]
    );
    return result.insertId;
  }

  static async update(course_id, name, teacher_id, classroom_id, start_time, end_time, time_slot, participants) {
    await db.query(
      "UPDATE course SET name = ?, teacher_id = ?, classroom_id = ?, start_time = ?, end_time = ?, time_slot = ?, participants = ? WHERE course_id = ?",
      [name, teacher_id, classroom_id, start_time, end_time, time_slot, participants, course_id]
    );
  }

  static async delete(course_id) {
    await db.query("DELETE FROM course WHERE course_id = ?", [course_id]);
  }
}

module.exports = Course;