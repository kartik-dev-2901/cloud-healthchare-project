const express = require('express');
const { body, validationResult } = require('express-validator');
const Doctor = require('../models/Doctor');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/doctors - Get all doctors (public)
router.get('/', async (req, res) => {
  try {
    const { specialization, search } = req.query;
    const filter = { isActive: true };

    if (specialization) filter.specialization = new RegExp(specialization, 'i');
    if (search) filter.name = new RegExp(search, 'i');

    const doctors = await Doctor.find(filter).select('-password');
    res.json({ success: true, count: doctors.length, data: doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/doctors/:id - Get single doctor
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).select('-password');
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/doctors - Add doctor (admin only in production; open for assignment demo)
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('phone').notEmpty().withMessage('Phone is required'),
    body('specialization').notEmpty().withMessage('Specialization is required'),
    body('qualification').notEmpty().withMessage('Qualification is required'),
    body('experience').isNumeric().withMessage('Experience must be a number'),
    body('consultationFee').isNumeric().withMessage('Consultation fee must be a number')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const existing = await Doctor.findOne({ email: req.body.email });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Doctor already registered' });
      }

      const doctor = await Doctor.create(req.body);
      res.status(201).json({ success: true, message: 'Doctor added successfully', data: doctor });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// PUT /api/doctors/:id - Update doctor profile
router.put('/:id', protect, authorize('doctor', 'admin'), async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).select('-password');

    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
