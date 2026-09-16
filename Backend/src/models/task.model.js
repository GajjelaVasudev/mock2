const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    category: {
      type: String,
      enum: [
        'Spoken English',
        'Mock Interview',
        'Customer Service Roleplay',
        'Professional Grooming',
        'Confidence Check-in',
      ],
      default: 'Spoken English',
    },
    targetType: {
      type: String,
      enum: ['individual', 'batch'],
      default: 'batch',
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    studentName: { type: String },
    batch: { type: String, default: 'Batch 2026-A' },
    trainerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    dueDate: { type: String },
    status: {
      type: String,
      enum: ['pending', 'submitted', 'reviewed'],
      default: 'pending',
    },
    feedback: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
