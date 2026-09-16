const mongoose = require('mongoose');

const pipelineSchema = new mongoose.Schema(
  {
    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    employerName: {
      type: String,
      default: 'Apex Retail Solutions',
      trim: true,
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    candidateName: {
      type: String,
      required: true,
      trim: true,
    },
    roleApplied: {
      type: String,
      default: 'Frontline Customer Associate',
      trim: true,
    },
    stage: {
      type: String,
      enum: ['shortlisted', 'interview_scheduled', 'offered', 'hired', 'rejected'],
      default: 'shortlisted',
    },
    interviewDate: {
      type: String,
    },
    interviewTime: {
      type: String,
    },
    offeredSalary: {
      type: Number,
      default: 16500,
    },
    notes: {
      type: String,
      default: 'Candidate shortlisted based on high confidence and retail readiness scores.',
    },
    center: {
      type: String,
      default: 'Sangam Vihar CDC',
    },
    batch: {
      type: String,
      default: 'Batch 2026-A',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Pipeline', pipelineSchema);
