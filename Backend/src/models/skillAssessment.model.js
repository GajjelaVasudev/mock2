const mongoose = require('mongoose');

const SkillAssessmentSchema = new mongoose.Schema({
    learner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'learner',
        required: true
    },
    skillCategory: {
        type: String,
        required: true,
        enum: ['communication', 'confidence', 'teamwork', 'interview-readiness', 'etiquette']
    },
    score: {
        type: Number,
        required: true,
        min: 1,
        max: 10
    },
    source: {
        type: String,
        required: true,
        enum: ['self', 'trainer', 'ai']
    },
    notes: {
        type: String,
        trim: true
    }
}, { timestamps: true });

module.exports = mongoose.model('skillAssessment', SkillAssessmentSchema);