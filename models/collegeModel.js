const db = require('../config/db');

class College {
  static async getAll() {
    const [rows] = await db.query('SELECT * FROM college');
    return rows;
  }

  static async getById(college_id) {
    const [rows] = await db.query('SELECT * FROM college WHERE college_id = ?', [college_id]);
    return rows[0];
  }

  static async create(school_id, name) {
    const [result] = await db.query(
      'INSERT INTO college (school_id, name) VALUES (?, ?)',
      [school_id, name]
    );
    return result.insertId;
  }

  static async update(college_id, school_id, name) {
    await db.query(
      'UPDATE college SET school_id = ?, name = ? WHERE college_id = ?',
      [school_id, name, college_id]
    );
  }

  static async delete(college_id) {
    await db.query('DELETE FROM college WHERE college_id = ?', [college_id]);
  }
}

module.exports = College;