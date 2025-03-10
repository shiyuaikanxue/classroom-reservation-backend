const express = require("express");
const router = express.Router();
const activityController = require("../controllers/activityController");

/**
 * @swagger
 * tags:
 *   name: Activities
 *   description: 活动管理
 */

/**
 * @swagger
 * /activities:
 *   get:
 *     summary: 获取所有活动
 *     description: 返回所有活动的列表
 *     tags: [Activities]
 *     responses:
 *       200:
 *         description: 成功获取活动列表
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Activity'
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", activityController.getAllActivities);

/**
 * @swagger
 * /activities/{id}:
 *   get:
 *     summary: 根据 ID 获取活动
 *     description: 返回指定 ID 的活动
 *     tags: [Activities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 活动 ID
 *     responses:
 *       200:
 *         description: 成功获取活动
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Activity'
 *       404:
 *         description: 活动未找到
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
router.get("/:id", activityController.getActivityById);

/**
 * @swagger
 * /activities:
 *   post:
 *     summary: 创建活动
 *     description: 创建一个新的活动
 *     tags: [Activities]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ActivityInput'
 *     responses:
 *       201:
 *         description: 活动创建成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Activity'
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
router.post("/", activityController.createActivity);

/**
 * @swagger
 * /activities/{id}:
 *   put:
 *     summary: 更新活动
 *     description: 更新指定 ID 的活动
 *     tags: [Activities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 活动 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ActivityInput'
 *     responses:
 *       200:
 *         description: 活动更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Activity'
 *       400:
 *         description: 无效的请求数据
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: 活动未找到
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
router.put("/:id", activityController.updateActivity);

/**
 * @swagger
 * /activities/{id}:
 *   delete:
 *     summary: 删除活动
 *     description: 删除指定 ID 的活动
 *     tags: [Activities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 活动 ID
 *     responses:
 *       200:
 *         description: 活动删除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 活动删除成功
 *       404:
 *         description: 活动未找到
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
router.delete("/:id", activityController.deleteActivity);

module.exports = router;
