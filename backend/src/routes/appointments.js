const express = require('express');
const { body, validationResult } = require('express-validator');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const { protect } = require('../middleware/auth');

const router = express.Router();

const MAX_PER_DAY = parseInt(process.env.MAX_APPOINTMENTS_PER_DAY) || 20;

// GET /api/appointments - View appointments (filtered by role)
router.get('/', protect, async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === 'patient') filter.patient = req.user._id;
    else if (req.user.role === 'doctor') filter.doctor = req.user._id;
    // admin sees all

    const appointments = await Appointment.find(filter)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name specialization consultationFee')
      .sort({ date: -1 });

    res.json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/appointments - Book appointment
router.post(
  '/',
  protect,
  [
    body('doctor').notEmpty().withMessage('Doctor ID is required'),
    body('date').isISO8601().withMessage('Valid date is required'),
    body('timeSlot').matches(/^\d{2}:\d{2}$/).withMessage('Time slot must be in HH:MM format'),
    body('reason').notEmpty().withMessage('Reason for appointment is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { doctor: doctorId, date, timeSlot, reason, notes } = req.body;

      const doctor = await Doctor.findById(doctorId);
      if (!doctor) {
        return res.status(404).json({ success: false, message: 'Doctor not found' });
      }

      const appointmentDate = new Date(date);
      const dayStart = new Date(appointmentDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(appointmentDate);
      dayEnd.setHours(23, 59, 59, 999);

      // Check daily limit
      const dailyCount = await Appointment.countDocuments({
        doctor: doctorId,
        date: { $gte: dayStart, $lte: dayEnd },
        status: { $ne: 'cancelled' }
      });

      if (dailyCount >= MAX_PER_DAY) {
        return res.status(400).json({
          success: false,
          message: `Doctor has reached the maximum of ${MAX_PER_DAY} appointments for this day`
        });
      }

      // Check double booking (also enforced by unique index)
      const existingSlot = await Appointment.findOne({
        doctor: doctorId,
        date: { $gte: dayStart, $lte: dayEnd },
        timeSlot,
        status: { $ne: 'cancelled' }
      });

      if (existingSlot) {
        return res.status(400).json({
          success: false,
          message: 'This time slot is already booked. Please choose another time.'
        });
      }

      const appointment = await Appointment.create({
        patient: req.user._id,
        doctor: doctorId,
        date: appointmentDate,
        timeSlot,
        reason,
        notes
      });

      const populated = await appointment.populate([
        { path: 'patient', select: 'name email phone' },
        { path: 'doctor', select: 'name specialization consultationFee' }
      ]);

      res.status(201).json({
        success: true,
        message: 'Appointment booked successfully',
        data: populated
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'This time slot is already booked. Please choose another time.'
        });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// PUT /api/appointments/:id - Update appointment status
router.put('/:id', protect, async (req, res) => {
  try {
    const { status, notes, prescription } = req.body;

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Patients can only cancel their own; doctors manage their own
    if (req.user.role === 'patient') {
      if (appointment.patient.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
      if (status && status !== 'cancelled') {
        return res.status(403).json({ success: false, message: 'Patients can only cancel appointments' });
      }
    } else if (req.user.role === 'doctor') {
      if (appointment.doctor.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
    }

    if (status) appointment.status = status;
    if (notes) appointment.notes = notes;
    if (prescription) appointment.prescription = prescription;

    await appointment.save();
    await appointment.populate([
      { path: 'patient', select: 'name email phone' },
      { path: 'doctor', select: 'name specialization' }
    ]);

    res.json({ success: true, message: 'Appointment updated', data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
