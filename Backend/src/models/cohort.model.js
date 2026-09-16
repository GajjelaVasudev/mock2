const mongoose = require('mongoose');

const cohortSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    courseName: {
      type: String,
      required: true,
      default: 'Retail & Soft Skills Readiness',
    },
    center: { type: String, required: true, default: 'Sangam Vihar CDC' },
    trainerName: { type: String, default: 'Sunita Sharma' },
    startDate: { type: String },
    endDate: { type: String },
    maxCapacity: { type: Number, default: 30 },
    enrolledCount: { type: Number, default: 0 },
    placementTarget: { type: Number, default: 80 },
    status: {
      type: String,
      enum: ['active', 'completed', 'upcoming'],
      default: 'active',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Cohort', cohortSchema);
