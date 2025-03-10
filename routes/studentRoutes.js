const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");

/**
 * @swagger
 * tags:
 *   name: Students
 *   description: 学生管理
 */

/**
 * @swagger
 * /students:
 *   get:
 *     summary: 获取所有学生
 *     description: 返回所有学生的列表
 *     tags: [Students]
 *     responses:
 *       200:
 *         description: 成功获取学生列表
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Student'
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", studentController.getAllStudents);

/**
 * @swagger
 * /students/{id}:
 *   get:
 *     summary: 根据 ID 获取学生
 *     description: 返回指定 ID 的学生
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 学生 ID
 *     responses:
 *       200:
 *         description: 成功获取学生
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Student'
 *       404:
 *         description: 学生未找到
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:id", studentController.getStudentById);

/**
 * @swagger
 * /students:
 *   post:
 *     summary: 创建学生
 *     description: 创建一个新的学生
 *     tags: [Students]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StudentInput'
 *     responses:
 *       201:
 *         description: 学生创建成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Student'
 *       400:
 *         description: 无效的请求数据
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/", studentController.createStudent);

/**
 * @swagger
 * /students/{id}:
 *   put:
 *     summary: 更新学生
 *     description: 更新指定 ID 的学生
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 学生 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StudentInput'
 *     responses:
 *       200:
 *         description: 学生更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Student'
 *       400:
 *         description: 无效的请求数据
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: 学生未找到
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put("/:id", studentController.updateStudent);

/**
 * @swagger
 * /students/{id}:
 *   delete:
 *     summary: 删除学生
 *     description: 删除指定 ID 的学生
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 学生 ID
 *     responses:
 *       200:
 *         description: 学生删除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 学生删除成功
 *       404:
 *         description: 学生未找到
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete("/:id", studentController.deleteStudent);

module.exports = router;
