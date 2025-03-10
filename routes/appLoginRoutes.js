const express = require("express");
const router = express.Router();
const appLoginController = require("../controllers/appLoginController");

/**
 * @swagger
 * tags:
 *   name: App Login
 *   description: 小程序登录
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AppUser:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         username:
 *           type: string
 *           example: "user1"
 *         email:
 *           type: string
 *           example: "user1@example.com"
 *         phone:
 *           type: string
 *           example: "1234567890"
 */

/**
 * @swagger
 * /app/login:
 *   post:
 *     summary: 小程序用户登录
 *     description: 小程序用户通过电话或邮箱登录
 *     tags: [App Login]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: 电话或邮箱
 *                 example: "user1@example.com"
 *               password:
 *                 type: string
 *                 description: 密码
 *                 example: "password123"
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
 *                 user:
 *                   $ref: '#/components/schemas/AppUser'
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
router.post("/login", appLoginController.login);
    
module.exports = router;
