const Favorite = require('../models/favoriteModel');
const db = require('../config/db');
exports.getAllFavorites = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      student_id,
      classroom_id,
      date_from,
      date_to
    } = req.query;

    // 构建筛选条件
    const filter = {
      student_id,
      classroom_id,
      date_from,
      date_to
    };

    // 获取收藏数据（带分页和筛选）
    const { favorites, total } = await Favorite.getAllWithPagination(
      Number(page),
      Number(limit),
      filter
    );

    res.status(200).json({
      favorites,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      },
      filter
    });
  } catch (err) {
    next(err);
  }
};

exports.getFavoriteById = async (req, res, next) => {
  try {
    const favorite = await Favorite.getByIdWithDetails(req.params.id);
    if (!favorite) {
      return res.status(404).json({ 
        message: 'Favorite not found' 
      });
    }
    res.status(200).json(favorite);
  } catch (err) {
    next(err);
  }
};

exports.createFavorite = async (req, res, next) => {
  try {
    const { student_id, classroom_id, favorite_time = new Date() } = req.body;

    // 验证必需字段
    if (!student_id || !classroom_id) {
      return res.status(400).json({ 
        message: 'student_id and classroom_id are required' 
      });
    }

    // 检查是否已收藏
    const exists = await Favorite.checkExists(student_id, classroom_id);
    if (exists) {
      return res.status(409).json({ 
        message: 'This classroom is already in favorites' 
      });
    }

    // 创建收藏
    const favorite_id = await Favorite.create({
      student_id,
      classroom_id,
      favorite_time
    });

    res.status(201).json({ 
      favorite_id,
      message: 'Added to favorites successfully'
    });
  } catch (err) {
    next(err);
  }
};

exports.updateFavorite = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { favorite_time = new Date() } = req.body;

    // 检查收藏是否存在
    const favorite = await Favorite.getById(id);
    if (!favorite) {
      return res.status(404).json({ 
        message: 'Favorite not found' 
      });
    }

    // 更新收藏时间
    await Favorite.update(id, { favorite_time });

    res.status(200).json({ 
      message: 'Favorite updated successfully' 
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteFavorite = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 检查收藏是否存在
    const favorite = await Favorite.getById(id);
    if (!favorite) {
      return res.status(404).json({ 
        message: 'Favorite not found' 
      });
    }

    // 删除收藏
    await Favorite.delete(id);

    res.status(200).json({ 
      message: 'Removed from favorites successfully' 
    });
  } catch (err) {
    next(err);
  }
};