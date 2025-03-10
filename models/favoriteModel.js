const db = require('../config/db');

class Favorite {
  static async getAll() {
    const [rows] = await db.query('SELECT * FROM favorite');
    return rows;
  }

  static async getById(favorite_id) {
    const [rows] = await db.query('SELECT * FROM favorite WHERE favorite_id = ?', [favorite_id]);
    return rows[0];
  }

  static async create(student_id, classroom_id, favorite_time) {
    const [result] = await db.query(
      'INSERT INTO favorite (student_id, classroom_id, favorite_time) VALUES (?, ?, ?)',
      [student_id, classroom_id, favorite_time]
    );
    return result.insertId;
  }

  static async update(favorite_id, student_id, classroom_id, favorite_time) {
    await db.query(
      'UPDATE favorite SET student_id = ?, classroom_id = ?, favorite_time = ? WHERE favorite_id = ?',
      [student_id, classroom_id, favorite_time, favorite_id]
    );
  }

  static async delete(favorite_id) {
    await db.query('DELETE FROM favorite WHERE favorite_id = ?', [favorite_id]);
  }
}

module.exports = Favorite;