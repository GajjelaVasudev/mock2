const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    studentName: { type: String },
    trainerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    date: {
      type: String, // YYYY-MM-DD
      default: () => new Date().toISOString().split('T')[0],
    },
    confidenceScore: { type: Number, min: 0, max: 100, required: true },
    communicationScore: { type: Number, min: 0, max: 100, required: true },
    workplaceEtiquetteScore: { type: Number, min: 0, max: 100, required: true },
    interviewReadinessScore: { type: Number, min: 0, max: 100, required: true },
    overallScore: { type: Number },
    remarks: { type: String, trim: true },
    badgesAwarded: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Assessment', assessmentSchema);
