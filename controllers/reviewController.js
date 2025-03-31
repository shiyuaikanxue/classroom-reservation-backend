const Review = require('../models/reviewModel');

exports.getAllReviews = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      classroom_id,
      student_id,
      min_rating,
      max_rating,
      date_from,
      date_to,
      has_comment
    } = req.query;

    // 构建筛选条件
    const filter = {
      classroom_id,
      student_id,
      min_rating: min_rating ? Number(min_rating) : undefined,
      max_rating: max_rating ? Number(max_rating) : undefined,
      date_from,
      date_to,
      has_comment: has_comment ? has_comment === 'true' : undefined
    };

    // 获取评价数据（带分页和筛选）
    const { reviews, total } = await Review.getAllWithPagination(
      Number(page),
      Number(limit),
      filter
    );

    res.status(200).json({
      reviews,
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

exports.getReviewById = async (req, res, next) => {
  try {
    const review = await Review.getByIdWithDetails(req.params.id);
    if (!review) {
      return res.status(404).json({ 
        message: 'Review not found' 
      });
    }
    res.status(200).json(review);
  } catch (err) {
    next(err);
  }
};

exports.createReview = async (req, res, next) => {
  try {
    const { classroom_id, student_id, rating, comment = null } = req.body;

    // 验证必需字段
    if (!classroom_id || !student_id || !rating) {
      return res.status(400).json({ 
        message: 'classroom_id, student_id and rating are required' 
      });
    }

    // 验证评分范围
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        message: 'Rating must be between 1 and 5' 
      });
    }

    // 检查是否已评价
    const exists = await Review.checkExists(student_id, classroom_id);
    if (exists) {
      return res.status(409).json({ 
        message: 'You have already reviewed this classroom' 
      });
    }

    // 创建评价
    const review_id = await Review.create({
      classroom_id,
      student_id,
      rating,
      comment,
      review_time: new Date()
    });

    res.status(201).json({ 
      review_id,
      message: 'Review created successfully'
    });
  } catch (err) {
    next(err);
  }
};

exports.updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    // 检查评价是否存在
    const review = await Review.getById(id);
    if (!review) {
      return res.status(404).json({ 
        message: 'Review not found' 
      });
    }

    // 验证评分范围
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ 
        message: 'Rating must be between 1 and 5' 
      });
    }

    // 更新评价
    await Review.update(id, { 
      rating,
      comment,
      review_time: new Date()
    });

    res.status(200).json({ 
      message: 'Review updated successfully' 
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 检查评价是否存在
    const review = await Review.getById(id);
    if (!review) {
      return res.status(404).json({ 
        message: 'Review not found' 
      });
    }

    // 删除评价
    await Review.delete(id);

    res.status(200).json({ 
      message: 'Review deleted successfully' 
    });
  } catch (err) {
    next(err);
  }
};