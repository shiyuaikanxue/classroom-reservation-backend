const express = require("express");
const router = express.Router();
const courseController = require("../controllers/courseController");

/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: 课程管理
 */

/**
 * @swagger
 * /courses:
 *   get:
 *     summary: 获取所有课程
 *     description: 返回所有课程的列表
 *     tags: [Courses]
 *     responses:
 *       200:
 *         description: 成功获取课程列表
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Course'
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", courseController.getAllCourses);

/**
 * @swagger
 * /courses/{id}:
 *   get:
 *     summary: 根据 ID 获取课程
 *     description: 返回指定 ID 的课程
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 课程 ID
 *     responses:
 *       200:
 *         description: 成功获取课程
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       404:
 *         description: 课程未找到
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
router.get("/:id", courseController.getCourseById);

/**
 * @swagger
 * /courses:
 *   post:
 *     summary: 创建课程
 *     description: 创建一个新的课程
 *     tags: [Courses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CourseInput'
 *     responses:
 *       201:
 *         description: 课程创建成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
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
 *               $ref: '#/components/searmas/Error'
 */
router.post("/", courseController.createCourse);

/**
 * @swagger
 * /courses/{id}:
 *   put:
 *     summary: 更新课程
 *     description: 更新指定 ID 的课程
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 课程 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CourseInput'
 *     responses:
 *       200:
 *         description: 课程更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       400:
 *         description: 无效的请求数据
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: 课程未找到
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
router.put("/:id", courseController.updateCourse);

/**
 * @swagger
 * /courses/{id}:
 *   delete:
 *     summary: 删除课程
 *     description: 删除指定 ID 的课程
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 课程 ID
 *     responses:
 *       200:
 *         description: 课程删除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 课程删除成功
 *       404:
 *         description: 课程未找到
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
router.delete("/:id", courseController.deleteCourse);

module.exports = router;
