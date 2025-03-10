const express = require("express");
const router = express.Router();
const usageRecordController = require("../controllers/usageRecordController");

/**
 * @swagger
 * tags:
 *   name: UsageRecords
 *   description: 使用记录管理
 */

/**
 * @swagger
 * /usage-records:
 *   get:
 *     summary: 获取所有使用记录
 *     description: 返回所有使用记录的列表
 *     tags: [UsageRecords]
 *     responses:
 *       200:
 *         description: 成功获取使用记录列表
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UsageRecord'
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", usageRecordController.getAllUsageRecords);

/**
 * @swagger
 * /usage-records/{id}:
 *   get:
 *     summary: 根据 ID 获取使用记录
 *     description: 返回指定 ID 的使用记录
 *     tags: [UsageRecords]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 使用记录 ID
 *     responses:
 *       200:
 *         description: 成功获取使用记录
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UsageRecord'
 *       404:
 *         description: 使用记录未找到
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
router.get("/:id", usageRecordController.getUsageRecordById);

/**
 * @swagger
 * /usage-records:
 *   post:
 *     summary: 创建使用记录
 *     description: 创建一个新的使用记录
 *     tags: [UsageRecords]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UsageRecordInput'
 *     responses:
 *       201:
 *         description: 使用记录创建成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UsageRecord'
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
router.post("/", usageRecordController.createUsageRecord);

/**
 * @swagger
 * /usage-records/{id}:
 *   put:
 *     summary: 更新使用记录
 *     description: 更新指定 ID 的使用记录
 *     tags: [UsageRecords]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 使用记录 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UsageRecordInput'
 *     responses:
 *       200:
 *         description: 使用记录更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UsageRecord'
 *       400:
 *         description: 无效的请求数据
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: 使用记录未找到
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
router.put("/:id", usageRecordController.updateUsageRecord);

/**
 * @swagger
 * /usage-records/{id}:
 *   delete:
 *     summary: 删除使用记录
 *     description: 删除指定 ID 的使用记录
 *     tags: [UsageRecords]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 使用记录 ID
 *     responses:
 *       200:
 *         description: 使用记录删除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 使用记录删除成功
 *       404:
 *         description: 使用记录未找到
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
router.delete("/:id", usageRecordController.deleteUsageRecord);

module.exports = router;
