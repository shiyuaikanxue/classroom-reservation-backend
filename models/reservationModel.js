const db = require('../config/db');

class Reservation {
  static async getAll() {
    const [rows] = await db.query('SELECT * FROM reservation');
    return rows;
  }

  static async getById(reservation_id) {
    const [rows] = await db.query('SELECT * FROM reservation WHERE reservation_id = ?', [reservation_id]);
    return rows[0];
  }

  static async create(student_id, classroom_id, activity_name, description, date, time_slot, status, teacher_id, participants) {
    const [result] = await db.query(
      'INSERT INTO reservation (student_id, classroom_id, activity_name, description, date, time_slot, status, teacher_id, participants) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [student_id, classroom_id, activity_name, description, date, time_slot, status, teacher_id, participants]
    );
    return result.insertId;
  }

  static async update(reservation_id, student_id, classroom_id, activity_name, description, date, time_slot, status, teacher_id, participants) {
    await db.query(
      'UPDATE reservation SET student_id = ?, classroom_id = ?, activity_name = ?, description = ?, date = ?, time_slot = ?, status = ?, teacher_id = ?, participants = ? WHERE reservation_id = ?',
      [student_id, classroom_id, activity_name, description, date, time_slot, status, teacher_id, participants, reservation_id]
    );
  }

  static async delete(reservation_id) {
    await db.query('DELETE FROM reservation WHERE reservation_id = ?', [reservation_id]);
  }
}

module.exports = Reservation;