const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: 通知管理
 */

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: 获取所有通知
 *     description: 返回所有通知的列表
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: 成功获取通知列表
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", notificationController.getAllNotifications);

/**
 * @swagger
 * /notifications/{id}:
 *   get:
 *     summary: 根据 ID 获取通知
 *     description: 返回指定 ID 的通知
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 通知 ID
 *     responses:
 *       200:
 *         description: 成功获取通知
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       404:
 *         description: 通知未找到
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
router.get("/:id", notificationController.getNotificationById);

/**
 * @swagger
 * /notifications:
 *   post:
 *     summary: 创建通知
 *     description: 创建一个新的通知
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NotificationInput'
 *     responses:
 *       201:
 *         description: 通知创建成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
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
router.post("/", notificationController.createNotification);

/**
 * @swagger
 * /notifications/{id}:
 *   put:
 *     summary: 更新通知
 *     description: 更新指定 ID 的通知
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 通知 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NotificationInput'
 *     responses:
 *       200:
 *         description: 通知更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/secarmas/Notification'
 *       400:
 *         description: 无效的请求数据
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: 通知未找到
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
router.put("/:id", notificationController.updateNotification);

/**
 * @swagger
 * /notifications/{id}:
 *   delete:
 *     summary: 删除通知
 *     description: 删除指定 ID 的通知
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 通知 ID
 *     responses:
 *       200:
 *         description: 通知删除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 通知删除成功
 *       404:
 *         description: 通知未找到
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
router.delete("/:id", notificationController.deleteNotification);

module.exports = router;
