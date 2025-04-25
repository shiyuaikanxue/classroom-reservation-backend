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

  static async getApprovedByStudentAndDateRange(student_id, startDate, endDate) {
    const [rows] = await db.query(
      `SELECT 
        r.reservation_id,
        r.student_id,
        r.classroom_id AS location_id,
        r.activity_name AS event_name,
        r.description,
        CONCAT(r.date, ' ', SUBSTRING_INDEX(r.time_slot, '-', 1), ':00:00') AS start_time,
        CONCAT(r.date, ' ', SUBSTRING_INDEX(r.time_slot, '-', -1), ':00:00') AS end_time,
        c.code AS location_name,
        r.status
      FROM reservation r
      LEFT JOIN classroom c ON r.classroom_id = c.classroom_id
      WHERE r.student_id = ?
        AND r.date BETWEEN ? AND ?
        AND r.status = 'approved'`,
      [student_id, startDate, endDate]
    );
    return rows;
  }
}

module.exports = Reservation;