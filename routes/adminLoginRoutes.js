const express = require("express");
const router = express.Router();
const adminLoginController = require("../controllers/adminLoginController");

/**
 * @swagger
 * tags:
 *   name: Admin Login
 *   description: 后台管理登录
 */

/**
 * @swagger
 * /admin/login:
 *   post:
 *     summary: 后台管理员登录
 *     description: 后台管理员通过用户名和密码登录
 *     tags: [Admin Login]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: 用户名
 *               password:
 *                 type: string
 *                 description: 密码
 *     responses:
 *       200:
 *         description: 登录成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 admin:
 *                   $ref: '#/components/schemas/Admin'
 *       400:
 *         description: 用户名或密码错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "密码错误"
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "服务器错误"
 */
router.post("/login", adminLoginController.login);

module.exports = router;
