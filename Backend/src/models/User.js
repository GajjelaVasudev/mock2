const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
    },
    role: {
      type: String,
      enum: ['learner', 'trainer', 'employer', 'admin'],
      default: 'learner',
    },
    center: {
      type: String,
      enum: [
        'Khanpur CDC',
        'Sangam Vihar CDC',
        'Dakshinpuri CDC',
        'Mangolpuri CDC',
        'Partner ITI / WCSC',
        'Central HQ',
      ],
      default: 'Sangam Vihar CDC',
    },
    batch: {
      type: String,
      default: 'Cohort 2026-A',
    },
    preferredLanguage: {
      type: String,
      enum: ['hi', 'en'],
      default: 'hi',
    },
    organization: {
      type: String,
      trim: true,
    },
    designation: {
      type: String,
      trim: true,
    },
    softSkillsProfile: {
      confidenceScore: { type: Number, default: 65 },
      communicationScore: { type: Number, default: 70 },
      workplaceEtiquetteScore: { type: Number, default: 68 },
      interviewReadinessScore: { type: Number, default: 60 },
      badgesEarned: {
        type: [String],
        default: ['Active Communicator', 'Punctuality Star'],
      },
      attendanceRate: { type: Number, default: 88 },
      mockInterviewsCompleted: { type: Number, default: 2 },
      trainerNotes: {
        type: String,
        default: 'Demonstrates strong motivation and active listening skills.',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Custom index to prevent empty string duplicate key errors
userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ phone: 1 }, { unique: true, sparse: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
