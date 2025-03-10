const db = require('../config/db');

class Review {
  static async getAll() {
    const [rows] = await db.query('SELECT * FROM review');
    return rows;
  }

  static async getById(review_id) {
    const [rows] = await db.query('SELECT * FROM review WHERE review_id = ?', [review_id]);
    return rows[0];
  }

  static async create(classroom_id, student_id, rating, comment, review_time) {
    const [result] = await db.query(
      'INSERT INTO review (classroom_id, student_id, rating, comment, review_time) VALUES (?, ?, ?, ?, ?)',
      [classroom_id, student_id, rating, comment, review_time]
    );
    return result.insertId;
  }

  static async update(review_id, classroom_id, student_id, rating, comment, review_time) {
    await db.query(
      'UPDATE review SET classroom_id = ?, student_id = ?, rating = ?, comment = ?, review_time = ? WHERE review_id = ?',
      [classroom_id, student_id, rating, comment, review_time, review_id]
    );
  }

  static async delete(review_id) {
    await db.query('DELETE FROM review WHERE review_id = ?', [review_id]);
  }
}

module.exports = Review;