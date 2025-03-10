const express = require("express");
const router = express.Router();
const majorController = require("../controllers/majorController");

/**
 * @swagger
 * tags:
 *   name: Majors
 *   description: 专业管理
 */

/**
 * @swagger
 * /majors:
 *   get:
 *     summary: 获取所有专业
 *     description: 返回所有专业的列表
 *     tags: [Majors]
 *     responses:
 *       200:
 *         description: 成功获取专业列表
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Major'
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", majorController.getAllMajors);

/**
 * @swagger
 * /majors/{id}:
 *   get:
 *     summary: 根据 ID 获取专业
 *     description: 返回指定 ID 的专业
 *     tags: [Majors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 专业 ID
 *     responses:
 *       200:
 *         description: 成功获取专业
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Major'
 *       404:
 *         description: 专业未找到
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
router.get("/:id", majorController.getMajorById);

/**
 * @swagger
 * /majors:
 *   post:
 *     summary: 创建专业
 *     description: 创建一个新的专业
 *     tags: [Majors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MajorInput'
 *     responses:
 *       201:
 *         description: 专业创建成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Major'
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
router.post("/", majorController.createMajor);

/**
 * @swagger
 * /majors/{id}:
 *   put:
 *     summary: 更新专业
 *     description: 更新指定 ID 的专业
 *     tags: [Majors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 专业 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MajorInput'
 *     responses:
 *       200:
 *         description: 专业更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Major'
 *       400:
 *         description: 无效的请求数据
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: 专业未找到
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
router.put("/:id", majorController.updateMajor);

/**
 * @swagger
 * /majors/{id}:
 *   delete:
 *     summary: 删除专业
 *     description: 删除指定 ID 的专业
 *     tags: [Majors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 专业 ID
 *     responses:
 *       200:
 *         description: 专业删除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 专业删除成功
 *       404:
 *         description: 专业未找到
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
router.delete("/:id", majorController.deleteMajor);

module.exports = router;
