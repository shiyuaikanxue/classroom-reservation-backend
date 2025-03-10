const db = require("../config/db");

class Schedule {
  static async getAll() {
    const [rows] = await db.query("SELECT * FROM schedule");
    return rows;
  }

  static async getById(schedule_id) {
    const [rows] = await db.query(
      "SELECT * FROM schedule WHERE schedule_id = ?",
      [schedule_id]
    );
    return rows[0];
  }

  static async create(
    student_id,
    course_name,
    classroom_id,
    start_time,
    end_time,
    status,
    teacher_id,
    time_slot
  ) {
    const [result] = await db.query(
      "INSERT INTO schedule (student_id, course_name, classroom_id, start_time, end_time, status, teacher_id, time_slot) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        student_id,
        course_name,
        classroom_id,
        start_time,
        end_time,
        status,
        teacher_id,
        time_slot,
      ]
    );
    return result.insertId;
  }

  static async update(
    schedule_id,
    student_id,
    course_name,
    classroom_id,
    start_time,
    end_time,
    status,
    teacher_id,
    time_slot
  ) {
    await db.query(
      "UPDATE schedule SET student_id = ?, course_name = ?, classroom_id = ?, start_time = ?, end_time = ?, status = ?, teacher_id = ?, time_slot = ? WHERE schedule_id = ?",
      [
        student_id,
        course_name,
        classroom_id,
        start_time,
        end_time,
        status,
        teacher_id,
        time_slot,
        schedule_id,
      ]
    );
  }

  static async delete(schedule_id) {
    await db.query("DELETE FROM schedule WHERE schedule_id = ?", [schedule_id]);
  }
}

module.exports = Schedule;
