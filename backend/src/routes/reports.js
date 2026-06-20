const express = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client } = require('@aws-sdk/client-s3');
const path = require('path');
const fs = require('fs');
const Report = require('../models/Report');
const { protect } = require('../middleware/auth');

const router = express.Router();

const fileFilter = (req, file, cb) => {
  const allowed = /pdf|jpg|jpeg|png|doc|docx/;
  const ext = path.extname(file.originalname).toLowerCase().slice(1);
  if (allowed.test(ext)) cb(null, true);
  else cb(new Error('Only PDF, images, and Word documents are allowed'));
};

let upload;

if (process.env.NODE_ENV === 'production' && process.env.S3_BUCKET_NAME) {
  const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });
  upload = multer({
    storage: multerS3({
      s3,
      bucket: process.env.S3_BUCKET_NAME,
      metadata: (req, file, cb) => cb(null, { fieldName: file.fieldname }),
      key: (req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `reports/${unique}${path.extname(file.originalname)}`);
      }
    }),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter
  });
} else {
  const uploadsDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  upload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => cb(null, uploadsDir),
      filename: (req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${unique}${path.extname(file.originalname)}`);
      }
    }),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter
  });
}

router.post('/', protect, upload.single('report'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { title, description, doctor, appointment } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const fileUrl = req.file.location
      ? req.file.location
      : `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    const report = await Report.create({
      patient: req.user.role === 'patient' ? req.user._id : req.body.patient,
      doctor: doctor || undefined,
      appointment: appointment || undefined,
      title,
      description,
      fileUrl,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      storageType: req.file.location ? 's3' : 'local'
    });

    await report.populate('patient', 'name email');
    res.status(201).json({ success: true, message: 'Report uploaded successfully', data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'patient') filter.patient = req.user._id;
    else if (req.user.role === 'doctor') filter.doctor = req.user._id;
    const reports = await Report.find(filter)
      .populate('patient', 'name email')
      .populate('doctor', 'name specialization')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: reports.length, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('patient', 'name email')
      .populate('doctor', 'name specialization');
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;