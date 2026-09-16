const mongoose = require('mongoose');

const placementSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    studentName: { type: String, required: true, trim: true },
    employerName: { type: String, required: true, trim: true },
    roleTitle: { type: String, required: true, trim: true },
    sector: {
      type: String,
      default: 'Retail',
    },
    monthlySalary: { type: Number, required: true },
    placementDate: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
    },
    center: { type: String, default: 'Sangam Vihar CDC' },
    batch: { type: String, default: 'Batch 2026-A' },
    status: {
      type: String,
      enum: ['placed', 'shortlisted', 'in_interview'],
      default: 'placed',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Placement', placementSchema);
