const Reservation = require('../models/reservationModel');

exports.getAllReservations = async (req, res, next) => {
  try {
    const reservations = await Reservation.getAll();
    res.status(200).json(reservations);
  } catch (err) {
    next(err);
  }
};

exports.getReservationById = async (req, res, next) => {
  try {
    const reservation = await Reservation.getById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    res.status(200).json(reservation);
  } catch (err) {
    next(err);
  }
};

exports.createReservation = async (req, res, next) => {
  try {
    const { student_id, classroom_id, activity_name, description, date, time_slot, status, teacher_id, participants } = req.body;
    const reservation_id = await Reservation.create(student_id, classroom_id, activity_name, description, date, time_slot, status, teacher_id, participants);
    res.status(201).json({ reservation_id });
  } catch (err) {
    next(err);
  }
};

exports.updateReservation = async (req, res, next) => {
  try {
    const { student_id, classroom_id, activity_name, description, date, time_slot, status, teacher_id, participants } = req.body;
    await Reservation.update(req.params.id, student_id, classroom_id, activity_name, description, date, time_slot, status, teacher_id, participants);
    res.status(200).json({ message: 'Reservation updated' });
  } catch (err) {
    next(err);
  }
};

exports.deleteReservation = async (req, res, next) => {
  try {
    await Reservation.delete(req.params.id);
    res.status(200).json({ message: 'Reservation deleted' });
  } catch (err) {
    next(err);
  }
};