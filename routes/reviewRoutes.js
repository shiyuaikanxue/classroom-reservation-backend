const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: 评价管理
 */

/**
 * @swagger
 * /reviews:
 *   get:
 *     summary: 获取所有评价
 *     description: 返回所有评价的列表
 *     tags: [Reviews]
 *     responses:
 *       200:
 *         description: 成功获取评价列表
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", reviewController.getAllReviews);

/**
 * @swagger
 * /reviews/{id}:
 *   get:
 *     summary: 根据 ID 获取评价
 *     description: 返回指定 ID 的评价
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 评价 ID
 *     responses:
 *       200:
 *         description: 成功获取评价
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       404:
 *         description: 评价未找到
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
router.get("/:id", reviewController.getReviewById);

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: 创建评价
 *     description: 创建一个新的评价
 *     tags: [Reviews]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReviewInput'
 *     responses:
 *       201:
 *         description: 评价创建成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
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
router.post("/", reviewController.createReview);

/**
 * @swagger
 * /reviews/{id}:
 *   put:
 *     summary: 更新评价
 *     description: 更新指定 ID 的评价
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 评价 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/secarmas/ReviewInput'
 *     responses:
 *       200:
 *         description: 评价更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       400:
 *         description: 无效的请求数据
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: 评价未找到
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
router.put("/:id", reviewController.updateReview);

/**
 * @swagger
 * /reviews/{id}:
 *   delete:
 *     summary: 删除评价
 *     description: 删除指定 ID 的评价
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 评价 ID
 *     responses:
 *       200:
 *         description: 评价删除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 评价删除成功
 *       404:
 *         description: 评价未找到
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
router.delete("/:id", reviewController.deleteReview);

module.exports = router;
