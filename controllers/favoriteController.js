const Favorite = require('../models/favoriteModel');

exports.getAllFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.getAll();
    res.status(200).json(favorites);
  } catch (err) {
    next(err);
  }
};

exports.getFavoriteById = async (req, res, next) => {
  try {
    const favorite = await Favorite.getById(req.params.id);
    if (!favorite) {
      return res.status(404).json({ message: 'Favorite not found' });
    }
    res.status(200).json(favorite);
  } catch (err) {
    next(err);
  }
};

exports.createFavorite = async (req, res, next) => {
  try {
    const { student_id, classroom_id, favorite_time } = req.body;
    const favorite_id = await Favorite.create(student_id, classroom_id, favorite_time);
    res.status(201).json({ favorite_id });
  } catch (err) {
    next(err);
  }
};

exports.updateFavorite = async (req, res, next) => {
  try {
    const { student_id, classroom_id, favorite_time } = req.body;
    await Favorite.update(req.params.id, student_id, classroom_id, favorite_time);
    res.status(200).json({ message: 'Favorite updated' });
  } catch (err) {
    next(err);
  }
};

exports.deleteFavorite = async (req, res, next) => {
  try {
    await Favorite.delete(req.params.id);
    res.status(200).json({ message: 'Favorite deleted' });
  } catch (err) {
    next(err);
  }
};