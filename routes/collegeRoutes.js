const express = require("express");
const collegeController = require("../controllers/collegeController");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Colleges
 *   description: 学院管理
 */

/**
 * @swagger
 * /college:
 *   get:
 *     summary: 获取所有学院
 *     description: 返回所有学院的列表
 *     tags: [Colleges]
 *     responses:
 *       200:
 *         description: 成功获取学院列表
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/College'
 */
router.get("/", collegeController.getAllColleges);

/**
 * @swagger
 * /college/{id}:
 *   get:
 *     summary: 根据 ID 获取学院
 *     description: 返回指定 ID 的学院
 *     tags: [Colleges]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 学院 ID
 *     responses:
 *       200:
 *         description: 成功获取学院
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/College'
 *       404:
 *         description: 学院未找到
 */
router.get("/:id", collegeController.getCollegeById);

/**
 * @swagger
 * /college:
 *   post:
 *     summary: 创建学院
 *     description: 创建一个新的学院
 *     tags: [Colleges]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CollegeInput'
 *     responses:
 *       201:
 *         description: 学院创建成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/searmas/College'
 *       400:
 *         description: 无效的输入
 */
router.post("/", collegeController.createCollege);

/**
 * @swagger
 * /college/{id}:
 *   put:
 *     summary: 更新学院
 *     description: 更新指定 ID 的学院
 *     tags: [Colleges]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 学院 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CollegeInput'
 *     responses:
 *       200:
 *         description: 学院更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/College'
 *       404:
 *         description: 学院未找到
 *       400:
 *         description: 无效的输入
 */
router.put("/:id", collegeController.updateCollege);

/**
 * @swagger
 * /college/{id}:
 *   delete:
 *     summary: 删除学院
 *     description: 删除指定 ID 的学院
 *     tags: [Colleges]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 学院 ID
 *     responses:
 *       200:
 *         description: 学院删除成功
 *       404:
 *         description: 学院未找到
 */
router.delete("/:id", collegeController.deleteCollege);

module.exports = router;
