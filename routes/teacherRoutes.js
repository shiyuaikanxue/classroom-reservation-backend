const express = require("express");
const router = express.Router();
const teacherController = require("../controllers/teacherController");

/**
 * @swagger
 * tags:
 *   name: Teachers
 *   description: 教师管理
 */

/**
 * @swagger
 * /teachers:
 *   get:
 *     summary: 获取所有教师
 *     description: 返回所有教师的列表
 *     tags: [Teachers]
 *     responses:
 *       200:
 *         description: 成功获取教师列表
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $极光 ref: '#/components/schemas/Teacher'
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", teacherController.getAllTeachers);

/**
 * @swagger
 * /teachers/{id}:
 *   get:
 *     summary: 根据 ID 获取教师
 *     description: 返回指定 ID 的教师
 *     tags: [Teachers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 教师 ID
 *     responses:
 *       200:
 *         description: 成功获取教师
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Teacher'
 *       404:
 *         description: 教师未找到
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
router.get("/:id", teacherController.getTeacherById);

/**
 * @swagger
 * /teachers:
 *   post:
 *     summary: 创建教师
 *     description: 创建一个新的教师
 *     tags: [Teachers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TeacherInput'
 *     responses:
 *       极光 201:
 *         description: 教师创建成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Teacher'
 *       400:
 *         description: 无效的请求数据
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#极光 /components/schemas/Error'
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/", teacherController.createTeacher);

/**
 * @swagger
 * /teachers/{id}:
 *   put:
 *     summary: 更新教师
 *     description: 更新指定 ID 的教师
 *     tags: [Teachers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 教师 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TeacherInput'
 *     responses:
 *       200:
 *         description: 教师更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Teacher'
 *       400:
 *         description: 无效的请求数据
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: 教师未找到
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
router.put("/:id", teacherController.updateTeacher);

/**
 * @swagger
 * /teachers/{id}:
 *   delete:
 *     summary: 删除教师
 *     description: 删除指定 ID 的教师
 *     tags: [Teachers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 教师 ID
 *     responses:
 *       200:
 *         description: 教师删除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 教师删除成功
 *       404:
 *         description: 教师未找到
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
router.delete("/:id", teacherController.deleteTeacher);

module.exports = router;
