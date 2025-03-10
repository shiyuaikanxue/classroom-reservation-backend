const express = require("express");
const router = express.Router();
const classroomController = require("../controllers/classroomController");

/**
 * @swagger
 * tags:
 *   name: Classrooms
 *   description: 教室管理
 */

/**
 * @swagger
 * /classrooms:
 *   get:
 *     summary: 获取所有教室
 *     description: 返回所有教室的列表
 *     tags: [Classrooms]
 *     responses:
 *       200:
 *         description: 成功获取教室列表
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Classroom'
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", classroomController.getAllClassrooms);

/**
 * @swagger
 * /classrooms/{id}:
 *   get:
 *     summary: 根据 ID 获取教室
 *     description: 返回指定 ID 的教室
 *     tags: [Classrooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 教室 ID
 *     responses:
 *       200:
 *         description: 成功获取教室
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Classroom'
 *       404:
 *         description: 教室未找到
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
router.get("/:id", classroomController.getClassroomById);

/**
 * @swagger
 * /classrooms:
 *   post:
 *     summary: 创建教室
 *     description: 创建一个新的教室
 *     tags: [Classrooms]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClassroomInput'
 *     responses:
 *       201:
 *         description: 教室创建成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Classroom'
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
router.post("/", classroomController.createClassroom);

/**
 * @swagger
 * /classrooms/{id}:
 *   put:
 *     summary: 更新教室
 *     description: 更新指定 ID 的教室
 *     tags: [Classrooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 教室 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClassroomInput'
 *     responses:
 *       200:
 *         description: 教室更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Classroom'
 *       400:
 *         description: 无效的请求数据
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: 教室未找到
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
router.put("/:id", classroomController.updateClassroom);

/**
 * @swagger
 * /classrooms/{id}:
 *   delete:
 *     summary: 删除教室
 *     description: 删除指定 ID 的教室
 *     tags: [Classrooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 教室 ID
 *     responses:
 *       200:
 *         description: 教室删除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 教室删除成功
 *       404:
 *         description: 教室未找到
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
router.delete("/:id", classroomController.deleteClassroom);

module.exports = router;
