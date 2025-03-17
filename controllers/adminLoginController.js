const jwt = require("jsonwebtoken");
const Admin = require("../models/adminModel");

exports.login = async (req, res, next) => {
  const { username, password } = req.body;

  try {
    // 查找管理员
    const admin = await Admin.findByUsername(username);
    if (!admin) {
      return res.status(400).json({ message: "管理员不存在" });
    }
    // 直接比较加密后的密码
    if (password !== admin.hashed_password) {
      return res.status(400).json({ message: "密码错误" });
    }

    // 生成 token，包含 role 信息
    const token = jwt.sign(
      { id: admin.admin_id, role: admin.role },
      "your_secret_key",
      { expiresIn: "1h" }
    );

    // 返回管理员信息和 token
    res.status(200).json({
      success: true,
      token,
      admin: {
        admin_id: admin.admin_id,
        username: admin.username,
        role: admin.role,
        school_id: admin.school_id,
        phone_number: admin.phone_number,
        hashed_password: admin.hashed_password,
        avatar: admin.avatar,
      },
    });
  } catch (err) {
    next(err);
  }
};

