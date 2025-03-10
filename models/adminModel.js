const db = require("../config/db");

class Admin {
  static async findByUsername(username) {
    const [rows] = await db.query("SELECT * FROM admin WHERE username = ?", [
      username,
    ]);
    return rows[0];
  }
}

module.exports = Admin;
