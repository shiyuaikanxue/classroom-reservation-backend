const db = require("../config/db");

class AppUser {
  static async findByUsername(username) {
    const [rows] = await db.query(
      "SELECT * FROM student WHERE email = ? OR phone = ?",
      [username, username]
    );
    return rows[0];
  }
}

module.exports = AppUser;
