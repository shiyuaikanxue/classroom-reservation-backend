const express = require("express");
const router = express.Router();
const favoriteController = require("../controllers/favoriteController");
/**
 * @swagger
 * tags:
 *   name: Favorites
 *   description: 收藏管理
 */

/**
 * @swagger
 * /favorites:
 *   get:
 *     summary: 获取所有收藏
 *     description: 返回所有收藏的列表
 *     tags: [Favorites]
 *     responses:
 *       200:
 *         description: 成功获取收藏列表
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Favorite'
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", favoriteController.getAllFavorites);

/**
 * @swagger
 * /favorites/{id}:
 *   get:
 *     summary: 根据 ID 获取收藏
 *     description: 返回指定 ID 的收藏
 *     tags: [Favorites]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 收藏 ID
 *     responses:
 *       200:
 *         description: 成功获取收藏
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Favorite'
 *       404:
 *         description: 收藏未找到
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
router.get("/:id", favoriteController.getFavoriteById);

/**
 * @swagger
 * /favorites:
 *   post:
 *     summary: 添加收藏
 *     description: 用户添加收藏
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FavoriteInput'
 *     responses:
 *       201:
 *         description: 收藏添加成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Favorite'
 *       401:
 *         description: 未授权，请先登录
 *       500:
 *         description: 服务器错误
 */
router.post("/", favoriteController.createFavorite);

/**
 * @swagger
 * /favorites/{id}:
 *   put:
 *     summary: 更新收藏
 *     description: 更新指定 ID 的收藏
 *     tags: [Favorites]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 收藏 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FavoriteInput'
 *     responses:
 *       200:
 *         description: 收藏更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Favorite'
 *       400:
 *         description: 无效的请求数据
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: 收藏未找到
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
router.put("/:id", favoriteController.updateFavorite);

/**
 * @swagger
 * /favorites/{id}:
 *   delete:
 *     summary: 删除收藏
 *     description: 删除指定 ID 的收藏
 *     tags: [Favorites]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 收藏 ID
 *     responses:
 *       200:
 *         description: 收藏删除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 收藏删除成功
 *       404:
 *         description: 收藏未找到
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
router.delete("/:id", favoriteController.deleteFavorite);

module.exports = router;
