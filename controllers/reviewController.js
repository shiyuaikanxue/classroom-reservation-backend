const Review = require('../models/reviewModel');

exports.getAllReviews = async (req, res, next) => {
  try {
    const reviews = await Review.getAll();
    res.status(200).json(reviews);
  } catch (err) {
    next(err);
  }
};

exports.getReviewById = async (req, res, next) => {
  try {
    const review = await Review.getById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.status(200).json(review);
  } catch (err) {
    next(err);
  }
};

exports.createReview = async (req, res, next) => {
  try {
    const { classroom_id, student_id, rating, comment, review_time } = req.body;
    const review_id = await Review.create(classroom_id, student_id, rating, comment, review_time);
    res.status(201).json({ review_id });
  } catch (err) {
    next(err);
  }
};

exports.updateReview = async (req, res, next) => {
  try {
    const { classroom_id, student_id, rating, comment, review_time } = req.body;
    await Review.update(req.params.id, classroom_id, student_id, rating, comment, review_time);
    res.status(200).json({ message: 'Review updated' });
  } catch (err) {
    next(err);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    await Review.delete(req.params.id);
    res.status(200).json({ message: 'Review deleted' });
  } catch (err) {
    next(err);
  }
};