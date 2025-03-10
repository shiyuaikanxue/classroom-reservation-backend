const db = require('../config/db');

class Classroom {
  static async getAll() {
    const [rows] = await db.query('SELECT * FROM classroom');
    return rows;
  }

  static async getById(classroom_id) {
    const [rows] = await db.query('SELECT * FROM classroom WHERE classroom_id = ?', [classroom_id]);
    return rows[0];
  }

  static async create(college_id, code, capacity, location, equipment, status) {
    const [result] = await db.query(
      'INSERT INTO classroom (college_id, code, capacity, location, equipment, status) VALUES (?, ?, ?, ?, ?, ?)',
      [college_id, code, capacity, location, equipment, status]
    );
    return result.insertId;
  }

  static async update(classroom_id, college_id, code, capacity, location, equipment, status) {
    await db.query(
      'UPDATE classroom SET college_id = ?, code = ?, capacity = ?, location = ?, equipment = ?, status = ? WHERE classroom_id = ?',
      [college_id, code, capacity, location, equipment, status, classroom_id]
    );
  }

  static async delete(classroom_id) {
    await db.query('DELETE FROM classroom WHERE classroom_id = ?', [classroom_id]);
  }
}

module.exports = Classroom;