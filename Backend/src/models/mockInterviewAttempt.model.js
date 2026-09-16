const mongoose = require('mongoose');

const MockInterviewAttemptSchema = new mongoose.Schema({
    learner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'learner',
        required: true
    },
    question: {
        type: String,
        required: true
    },
    inputType: {
        type: String,
        enum: ['text', 'audio'],
        required: true
    },
    transcript: {
        type: String // either the raw text_response, or the AI's transcription of the audio
    },
    scores: {
        clarity: Number,
        tone: Number,
        structure: Number,
        confidence: Number
    },
    overallScore: {
        type: Number,
        required: true
    },
    feedback: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('mockInterviewAttempt', MockInterviewAttemptSchema);