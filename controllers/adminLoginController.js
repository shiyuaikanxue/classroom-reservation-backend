const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Admin = require("../models/adminModel");

exports.login = async (req, res, next) => {
  const { username, password } = req.body;

  try {
    // 查找管理员
    const admin = await Admin.findByUsername(username);
    if (!admin) {
      return res.status(400).json({ message: "管理员不存在" });
    }

    // 验证密码
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "密码错误" });
    }

    // 生成 token
    const token = jwt.sign(
      { id: admin.admin_id, role: "admin" },
      "your_secret_key",
      {
        expiresIn: "1h",
      }
    );

    res.status(200).json({ success: true, token, admin });
  } catch (err) {
    next(err);
  }
};
