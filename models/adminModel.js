const db = require("../config/db");

class Admin {
  static async findByUsername(username) {
    const [rows] = await db.query("SELECT * FROM admin WHERE username = ?", [
      username,
    ]);
    return rows[0];
  }
  // 获取某学校的所有管理员账号
  static async getAdminsBySchool(schoolId, offset, pageSize, name) {
    let query = `
        SELECT admin_id, username, avatar, phone_number, role, created_at
        FROM admin
        WHERE school_id = ?
    `;
    const params = [schoolId];

    // 添加用户名查询条件
    if (name) {
      query += ' AND username LIKE ?';
      params.push(`%${name}%`);
    }

    // 添加分页条件，确保参数为整数
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(pageSize), parseInt(offset));

    // 执行查询
    const [admins] = await db.query(query, params);

    // 获取总数
    let countQuery = `
        SELECT COUNT(*) AS total
        FROM admin
        WHERE school_id = ?
    `;
    const countParams = [schoolId];

    if (name) {
      countQuery += ' AND username LIKE ?';
      countParams.push(`%${name}%`);
    }

    const [totalResult] = await db.query(countQuery, countParams);
    const total = totalResult[0].total;

    return { admins, total };
  }

  static async createAdmin(schoolId, username, hashedPassword, phoneNumber, avatar, role = 'admin') {
    const query = `
        INSERT INTO admin (school_id, username, hashed_password, phone_number, avatar, role, created_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;
    const params = [schoolId, username, hashedPassword, phoneNumber, avatar, role];
    const [result] = await db.query(query, params);
    return result.insertId; // 返回新插入的管理员 ID
  }

  // 更新管理员信息
  static async updateAdmin(adminId, data) {
    const { username, avatar, phone_number, role } = data;
    const [result] = await db.query(
      `UPDATE admin
         SET username = ?, avatar = ?, phone_number = ?, role = ?
         WHERE admin_id = ?`,
      [username, avatar, phone_number, role, adminId]
    );
    return result.affectedRows > 0;
  }

  // 删除管理员账号
  static async deleteAdmin(adminId) {
    const [result] = await db.query(
      `DELETE FROM admin
         WHERE admin_id = ?`,
      [adminId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Admin;
