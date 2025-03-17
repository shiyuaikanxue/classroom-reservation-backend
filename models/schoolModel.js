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

  static async create(name, type, country, city, address, contact, email, website) {
    const [result] = await db.query(
      'INSERT INTO school (name, type, country, city, address, contact, email, website, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())',
      [name, type, country, city, address, contact, email, website]
    );
    return result.insertId; // 返回自动生成的 school_id
  }

  static async update(school_id, name, type, country, city, address, contact, email, website) {
    await db.query(
      'UPDATE school SET name = ?, type = ?, country = ?, city = ?, address = ?, contact = ?, email = ?, website = ? WHERE school_id = ?',
      [name, type, country, city, address, contact, email, website, school_id]
    );
  }

  static async delete(school_id) {
    await db.query('DELETE FROM school WHERE school_id = ?', [school_id]);
  }
}

module.exports = School;