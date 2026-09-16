const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      index: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    studentName: {
      type: String,
      trim: true,
    },
    date: {
      type: String, // format: YYYY-MM-DD
      required: true,
      index: true,
    },
    sessionDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late'],
      default: 'present',
    },
    center: {
      type: String,
      default: 'Sangam Vihar CDC',
    },
    batch: {
      type: String,
      default: 'Batch 2026-A',
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast lookups and unique constraint per student per date
AttendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });

module.exports =
  mongoose.models.attendance || mongoose.model('attendance', AttendanceSchema);
