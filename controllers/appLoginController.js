const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const AppUser = require("../models/appUserModel");

exports.login = async (req, res, next) => {
  const { username, password } = req.body;
  console.log(username, password);
  try {
    // 查找用户
    const user = await AppUser.findByUsername(username);
    if (!user) {
      return res.status(400).json({ message: "用户不存在" });
    }
    // 验证密码
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "密码错误" });
    }

    // 生成 token
    const token = jwt.sign(
      { id: user.student_id, role: "app_user" },
      "your_secret_key",
      {
        expiresIn: "1h",
      }
    );

    res.status(200).json({ success: true, token, user });
  } catch (err) {
    next(err);
  }
};
