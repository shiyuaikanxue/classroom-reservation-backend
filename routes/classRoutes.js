const express = require("express");
const classController = require("../controllers/classController");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Classes
 *   description: 班级管理
 */

/**
 * @swagger
 * /classes:
 *   get:
 *     summary: 获取所有班级
 *     description: 返回所有班级的列表
 *     tags: [Classes]
 *     responses:
 *       200:
 *         description: 成功获取班级列表
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Class'
 */
router.get("/", classController.getAllClasses);

/**
 * @swagger
 * /classes/{id}:
 *   get:
 *     summary: 根据 ID 获取班级
 *     description: 返回指定 ID 的班级
 *     tags: [Classes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 班级 ID
 *     responses:
 *       200:
 *         description: 成功获取班级
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Class'
 *       404:
 *         description: 班级未找到
 */
router.get("/:id", classController.getClassById);

/**
 * @swagger
 * /classes:
 *   post:
 *     summary: 创建班级
 *     description: 创建一个新的班级
 *     tags: [Classes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClassInput'
 *     responses:
 *       201:
 *         description: 班级创建成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Class'
 *       400:
 *         description: 无效的输入
 */
router.post("/", classController.createClass);

/**
 * @swagger
 * /classes/{id}:
 *   put:
 *     summary: 更新班级
 *     description: 更新指定 ID 的班级
 *     tags: [Classes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 班级 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClassInput'
 *     responses:
 *       200:
 *         description: 班级更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Class'
 *       404:
 *         description: 班级未找到
 *       400:
 *         description: 无效的输入
 */
router.put("/:id", classController.updateClass);

/**
 * @swagger
 * /classes/{id}:
 *   delete:
 *     summary: 删除班级
 *     description: 删除指定 ID 的班级
 *     tags: [Classes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 班级 ID
 *     responses:
 *       200:
 *         description: 班级删除成功
 *       404:
 *         description: 班级未找到
 */
router.delete("/:id", classController.deleteClass);

module.exports = router;
