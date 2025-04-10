const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const AppUser = require("../models/appUserModel");
const CryptoJS = require("crypto-js")
const key = CryptoJS.enc.Utf8.parse("y7xHoYB1CKYtj+nR");

// 定义状态码常量
const HTTP_CODE = {
  SUCCESS: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500
};

exports.login = async (req, res, next) => {
  const { username, password } = req.body;
  
  try {
    // 查找用户
    const user = await AppUser.findByUsername(username);
    if (!user) {
      return res.status(HTTP_CODE.BAD_REQUEST).json({
        code: HTTP_CODE.BAD_REQUEST,
        message: "用户不存在",
        data: null
      });
    }
    
    // 验证密码
    let encrypted = CryptoJS.AES.encrypt(password, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    });
    let encryptedPassword = encrypted.toString();
    const isMatch = encryptedPassword === user.password;
    
    if (!isMatch) {
      return res.status(HTTP_CODE.UNAUTHORIZED).json({
        code: HTTP_CODE.UNAUTHORIZED,
        message: "密码错误",
        data: null
      });
    }

    // 生成 token
    const token = jwt.sign(
      { id: user.student_id, role: "app_user" },
      "your_secret_key",
      { expiresIn: "1h" }
    );

    // 成功响应
    res.status(HTTP_CODE.SUCCESS).json({
      code: HTTP_CODE.SUCCESS,
      message: "登录成功",
      data: {
        token,
        user: {
          student_id: user.student_id,
          school_id: user.school_id,
          class_id: user.class_id,
          name: user.name,
          gender: user.gender,
          email: user.email,
          phone: user.phone
          // 可以根据需要添加更多字段
        }
      }
    });
    
  } catch (err) {
    // 错误处理
    res.status(HTTP_CODE.INTERNAL_ERROR).json({
      code: HTTP_CODE.INTERNAL_ERROR,
      message: "服务器内部错误",
      data: null
    });
    next(err);
  }
};