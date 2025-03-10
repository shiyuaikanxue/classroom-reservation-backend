const express = require("express");
const router = express.Router();
const scheduleController = require("../controllers/scheduleController");

/**
 * @swagger
 * tags:
 *   name: Schedules
 *   description: 课表管理
 */

/**
 * @swagger
 * /schedules:
 *   get:
 *     summary: 获取所有课表
 *     description: 返回所有课表的列表
 *     tags: [Schedules]
 *     responses:
 *       200:
 *         description: 成功获取课表列表
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Schedule'
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", scheduleController.getAllSchedules);

/**
 * @swagger
 * /schedules/{id}:
 *   get:
 *     summary: 根据 ID 获取课表
 *     description: 返回指定 ID 的课表
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 课表 ID
 *     responses:
 *       200:
 *         description: 成功获取课表
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Schedule'
 *       404:
 *         description: 课表未找到
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
router.get("/:id", scheduleController.getScheduleById);

/**
 * @swagger
 * /schedules:
 *   post:
 *     summary: 创建课表
 *     description: 创建一个新的课表
 *     tags: [Schedules]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ScheduleInput'
 *     responses:
 *       201:
 *         description: 课表创建成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Schedule'
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
router.post("/", scheduleController.createSchedule);

/**
 * @swagger
 * /schedules/{id}:
 *   put:
 *     summary: 更新课表
 *     description: 更新指定 ID 的课表
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 课表 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ScheduleInput'
 *     responses:
 *       200:
 *         description: 课表更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Schedule'
 *       400:
 *         description: 无效的请求数据
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: 课表未找到
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/secarmas/Error'
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put("/:id", scheduleController.updateSchedule);

/**
 * @swagger
 * /schedules/{id}:
 *   delete:
 *     summary: 删除课表
 *     description: 删除指定 ID 的课表
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 课表 ID
 *     responses:
 *       200:
 *         description: 课表删除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 课表删除成功
 *       404:
 *         description: 课表未找到
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
router.delete("/:id", scheduleController.deleteSchedule);

module.exports = router;
