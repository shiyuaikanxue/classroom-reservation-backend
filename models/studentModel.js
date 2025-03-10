const db = require('../config/db');

class Student {
  static async getAll() {
    const [rows] = await db.query('SELECT * FROM student');
    return rows;
  }

  static async getById(student_id) {
    const [rows] = await db.query('SELECT * FROM student WHERE student_id = ?', [student_id]);
    return rows[0];
  }

  static async create(school_id, class_id, name, gender, email, phone, password) {
    const [result] = await db.query(
      'INSERT INTO student (school_id, class_id, name, gender, email, phone, password) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [school_id, class_id, name, gender, email, phone, password]
    );
    return result.insertId;
  }

  static async update(student_id, school_id, class_id, name, gender, email, phone, password) {
    await db.query(
      'UPDATE student SET school_id = ?, class_id = ?, name = ?, gender = ?, email = ?, phone = ?, password = ? WHERE student_id = ?',
      [school_id, class_id, name, gender, email, phone, password, student_id]
    );
  }

  static async delete(student_id) {
    await db.query('DELETE FROM student WHERE student_id = ?', [student_id]);
  }
}

module.exports = Student;