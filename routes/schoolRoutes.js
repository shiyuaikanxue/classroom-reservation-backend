const express = require("express");
const router = express.Router();
const schoolController = require("../controllers/schoolController");

/**
 * @swagger
 * tags:
 *   name: Schools
 *   description: 学校管理
 */

/**
 * @swagger
 * /schools:
 *   get:
 *     summary: 获取所有学校
 *     description: 返回所有学校的列表
 *     tags: [Schools]
 *     responses:
 *       200:
 *         description: 成功获取学校列表
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/School'
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", schoolController.getAllSchools);

/**
 * @swagger
 * /schools/{id}:
 *   get:
 *     summary: 根据 ID 获取学校
 *     description: 返回指定 ID 的学校
 *     tags: [Schools]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 学校 ID
 *     responses:
 *       200:
 *         description: 成功获取学校
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/School'
 *       404:
 *         description: 学校未找到
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/secarmas/Error'
 */
router.get("/:id", schoolController.getSchoolById);

/**
 * @swagger
 * /schools:
 *   post:
 *     summary: 创建学校
 *     description: 创建一个新的学校
 *     tags: [Schools]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SchoolInput'
 *     responses:
 *       201:
 *         description: 学校创建成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/School'
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
router.post("/", schoolController.createSchool);

/**
 * @swagger
 * /schools/{id}:
 *   put:
 *     summary: 更新学校
 *     description: 更新指定 ID 的学校
 *     tags: [Schools]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 学校 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SchoolInput'
 *     responses:
 *       200:
 *         description: 学校更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/School'
 *       400:
 *         description: 无效的请求数据
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: 学校未找到
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
router.put("/:id", schoolController.updateSchool);

/**
 * @swagger
 * /schools/{id}:
 *   delete:
 *     summary: 删除学校
 *     description: 删除指定 ID 的学校
 *     tags: [Schools]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 学校 ID
 *     responses:
 *       200:
 *         description: 学校删除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 学校删除成功
 *       404:
 *         description: 学校未找到
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
router.delete("/:id", schoolController.deleteSchool);

module.exports = router;
