const db = require('../config/db');

class School {
  static async getAll() {
    const [rows] = await db.query('SELECT * FROM school');
    return rows;
  }

  static async getById(school_id) {
    const [rows] = await db.query('SELECT * FROM school WHERE school_id = ?', [school_id]);
    return rows[0];
  }

  static async create(name, address, contact) {
    const [result] = await db.query(
      'INSERT INTO school (name, address, contact) VALUES (?, ?, ?)',
      [name, address, contact]
    );
    return result.insertId;
  }

  static async update(school_id, name, address, contact) {
    await db.query(
      'UPDATE school SET name = ?, address = ?, contact = ? WHERE school_id = ?',
      [name, address, contact, school_id]
    );
  }

  static async delete(school_id) {
    await db.query('DELETE FROM school WHERE school_id = ?', [school_id]);
  }
}

module.exports = School;