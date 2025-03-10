const db = require('../config/db');

class Major {
  static async getAll() {
    const [rows] = await db.query('SELECT * FROM major');
    return rows;
  }

  static async getById(major_id) {
    const [rows] = await db.query('SELECT * FROM major WHERE major_id = ?', [major_id]);
    return rows[0];
  }

  static async create(college_id, name) {
    const [result] = await db.query(
      'INSERT INTO major (college_id, name) VALUES (?, ?)',
      [college_id, name]
    );
    return result.insertId;
  }

  static async update(major_id, college_id, name) {
    await db.query(
      'UPDATE major SET college_id = ?, name = ? WHERE major_id = ?',
      [college_id, name, major_id]
    );
  }

  static async delete(major_id) {
    await db.query('DELETE FROM major WHERE major_id = ?', [major_id]);
  }
}

module.exports = Major;