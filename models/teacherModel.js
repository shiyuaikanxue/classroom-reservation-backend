const db = require("../config/db");

class Teacher {
  static async getAll() {
    const [rows] = await db.query("SELECT * FROM teacher");
    return rows;
  }

  static async getById(teacher_id) {
    const [rows] = await db.query(
      "SELECT * FROM teacher WHERE teacher_id = ?",
      [teacher_id]
    );
    return rows[0];
  }

  static async create(name, gender, email, phone, college_id) {
    const [result] = await db.query(
      "INSERT INTO teacher (name, gender, email, phone, college_id) VALUES (?, ?, ?, ?, ?)",
      [name, gender, email, phone, college_id]
    );
    return result.insertId;
  }

  static async update(teacher_id, name, gender, email, phone, college_id) {
    await db.query(
      "UPDATE teacher SET name = ?, gender = ?, email = ?, phone = ?, college_id = ? WHERE teacher_id = ?",
      [name, gender, email, phone, college_id, teacher_id]
    );
  }

  static async delete(teacher_id) {
    await db.query("DELETE FROM teacher WHERE teacher_id = ?", [teacher_id]);
  }
}

module.exports = Teacher;