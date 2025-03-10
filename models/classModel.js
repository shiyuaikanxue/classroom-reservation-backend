const db = require('../config/db');

class Class {
  static async getAll() {
    const [rows] = await db.query('SELECT * FROM class');
    return rows;
  }

  static async getById(class_id) {
    const [rows] = await db.query('SELECT * FROM class WHERE class_id = ?', [class_id]);
    return rows[0];
  }

  static async create(major_id, name) {
    const [result] = await db.query(
      'INSERT INTO class (major_id, name) VALUES (?, ?)',
      [major_id, name]
    );
    return result.insertId;
  }

  static async update(class_id, major_id, name) {
    await db.query(
      'UPDATE class SET major_id = ?, name = ? WHERE class_id = ?',
      [major_id, name, class_id]
    );
  }

  static async delete(class_id) {
    await db.query('DELETE FROM class WHERE class_id = ?', [class_id]);
  }
}

module.exports = Class;