const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    title: { type: String, required: true },
    description: { type: String },
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    fileType: { type: String },
    fileSize: { type: Number },
    storageType: { type: String, enum: ['local', 's3'], default: 'local' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);
