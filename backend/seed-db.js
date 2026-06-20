// Run: node scripts/seed-db.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './backend/.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/healthcare';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const doctorSchema = new mongoose.Schema({
    name: String, email: String, password: String, phone: String,
    specialization: String, qualification: String, experience: Number,
    consultationFee: Number, availableDays: [String],
    availableTimeStart: String, availableTimeEnd: String,
    role: { type: String, default: 'doctor' }, isActive: { type: Boolean, default: true }, bio: String
  });
  const patientSchema = new mongoose.Schema({
    name: String, email: String, password: String, phone: String,
    dateOfBirth: Date, gender: String, bloodGroup: String, address: String,
    role: { type: String, default: 'patient' }, isActive: { type: Boolean, default: true }
  });

  const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', doctorSchema);
  const Patient = mongoose.models.Patient || mongoose.model('Patient', patientSchema);

  const hashedPw = await bcrypt.hash('password123', 12);

  await Doctor.deleteMany({});
  await Patient.deleteMany({});

  await Doctor.insertMany([
    {
      name: 'Priya Sharma', email: 'dr.priya@hospital.com', password: hashedPw,
      phone: '9876543210', specialization: 'Cardiology', qualification: 'MBBS, MD (Cardiology)',
      experience: 12, consultationFee: 800,
      availableDays: ['Monday','Tuesday','Wednesday','Thursday','Friday'],
      availableTimeStart: '09:00', availableTimeEnd: '17:00',
      bio: 'Senior cardiologist with 12 years of experience.'
    },
    {
      name: 'Rahul Mehta', email: 'dr.rahul@hospital.com', password: hashedPw,
      phone: '9876543211', specialization: 'Orthopedics', qualification: 'MBBS, MS (Ortho)',
      experience: 8, consultationFee: 600,
      availableDays: ['Monday','Wednesday','Friday','Saturday'],
      availableTimeStart: '10:00', availableTimeEnd: '18:00',
      bio: 'Orthopedic surgeon specializing in joint replacements.'
    },
    {
      name: 'Ananya Patel', email: 'dr.ananya@hospital.com', password: hashedPw,
      phone: '9876543212', specialization: 'Dermatology', qualification: 'MBBS, MD (Dermatology)',
      experience: 6, consultationFee: 500,
      availableDays: ['Tuesday','Thursday','Saturday'],
      availableTimeStart: '11:00', availableTimeEnd: '19:00',
      bio: 'Dermatologist with expertise in skin disorders.'
    },
    {
      name: 'Vijay Kumar', email: 'dr.vijay@hospital.com', password: hashedPw,
      phone: '9876543213', specialization: 'Pediatrics', qualification: 'MBBS, MD (Pediatrics)',
      experience: 15, consultationFee: 400,
      availableDays: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
      availableTimeStart: '08:00', availableTimeEnd: '16:00',
      bio: 'Pediatrician with 15 years of child healthcare experience.'
    }
  ]);

  await Patient.insertMany([
    {
      name: 'Amit Singh', email: 'amit@example.com', password: hashedPw,
      phone: '9123456789', dateOfBirth: new Date('1990-05-15'), gender: 'male',
      bloodGroup: 'O+', address: 'Mumbai, Maharashtra'
    },
    {
      name: 'Sunita Rao', email: 'sunita@example.com', password: hashedPw,
      phone: '9123456790', dateOfBirth: new Date('1985-11-20'), gender: 'female',
      bloodGroup: 'B+', address: 'Pune, Maharashtra'
    }
  ]);

  console.log('Seed complete!');
  console.log('');
  console.log('Test credentials (password: password123):');
  console.log('  Patients: amit@example.com, sunita@example.com');
  console.log('  Doctors:  dr.priya@hospital.com, dr.rahul@hospital.com');
  console.log('            dr.ananya@hospital.com, dr.vijay@hospital.com');

  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
