const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    roleCategory: {
      type: String,
      enum: ['Retail', 'Customer Care / BPO', 'Banking & Finance', 'Hospitality', 'Logistics & Supply Chain', 'Healthcare', 'IT & Digital'],
      default: 'Retail',
    },
    employerName: {
      type: String,
      required: true,
      default: 'Apex Retail Partners',
    },
    contactPerson: {
      type: String,
      default: 'Rajesh Mehra',
    },
    email: {
      type: String,
      default: 'rajesh.employer@etasha.org',
    },
    phone: {
      type: String,
      default: '+91 98102 33445',
    },
    openings: {
      type: Number,
      required: true,
      default: 5,
    },
    minSalary: {
      type: Number,
      required: true,
      default: 16000,
    },
    maxSalary: {
      type: Number,
      default: 22000,
    },
    location: {
      type: String,
      default: 'South Delhi (Sangam Vihar / Saket)',
    },
    jobType: {
      type: String,
      enum: ['Full-Time', 'Part-Time', 'Internship', 'Apprenticeship'],
      default: 'Full-Time',
    },
    description: {
      type: String,
      default: 'Engage with retail customers, provide product guidance, handle billing, and ensure store presentation.',
    },
    requirements: {
      type: [String],
      default: [
        'Good verbal communication in Hindi & basic English',
        'Customer-friendly attitude and grooming',
        'Basic arithmetic and billing familiarity',
      ],
    },
    requiredBadges: {
      type: [String],
      default: ['Active Communicator', 'Confidence Champion'],
    },
    minConfidenceScore: {
      type: Number,
      default: 65,
    },
    minAttendanceRate: {
      type: Number,
      default: 75,
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'closed'],
      default: 'active',
    },
    employerUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Job || mongoose.model('Job', JobSchema);
