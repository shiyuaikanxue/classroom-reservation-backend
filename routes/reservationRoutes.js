const express = require("express");
const router = express.Router();
const reservationController = require("../controllers/reservationController");
/**
 * @swagger
 * tags:
 *   name: Reservations
 *   description: 预约管理
 */

/**
 * @swagger
 * /reservations:
 *   get:
 *     summary: 获取所有预约
 *     description: 返回所有预约的列表
 *     tags: [Reservations]
 *     responses:
 *       200:
 *         description: 成功获取预约列表
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reservation'
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", reservationController.getAllReservations);

/**
 * @swagger
 * /reservations/{id}:
 *   get:
 *     summary: 根据 ID 获取预约
 *     description: 返回指定 ID 的预约
 *     tags: [Reservations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 预约 ID
 *     responses:
 *       200:
 *         description: 成功获取预约
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reservation'
 *       404:
 *         description: 预约未找到
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
router.get("/:id", reservationController.getReservationById);

/**
 * @swagger
 * /reservations:
 *   post:
 *     summary: 创建预约
 *     description: 用户创建预约
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReservationInput'
 *     responses:
 *       201:
 *         description: 预约创建成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reservation'
 *       401:
 *         description: 未授权，请先登录
 *       500:
 *         description: 服务器错误
 */
router.post("/", reservationController.createReservation);

/**
 * @swagger
 * /reservations/{id}:
 *   put:
 *     summary: 更新预约
 *     description: 更新指定 ID 的预约
 *     tags: [Reservations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 预约 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReservationInput'
 *     responses:
 *       200:
 *         description: 预约更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reservation'
 *       400:
 *         description: 无效的请求数据
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: 预约未找到
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
router.put("/:id", reservationController.updateReservation);

/**
 * @swagger
 * /reservations/{id}:
 *   delete:
 *     summary: 删除预约
 *     description: 删除指定 ID 的预约
 *     tags: [Reservations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 预约 ID
 *     responses:
 *       200:
 *         description: 预约删除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 预约删除成功
 *       404:
 *         description: 预约未找到
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
router.delete("/:id", reservationController.deleteReservation);

module.exports = router;
