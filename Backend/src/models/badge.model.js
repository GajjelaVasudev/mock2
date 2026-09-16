const mongoose = require('mongoose');

const BadgeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String
    },
    icon: {
        type: String // emoji or icon name, keep it simple for the demo
    },
    criteriaType: {
        type: String,
        enum: ['mock_interview_count', 'self_assessment_count', 'average_score'],
        required: true
    },
    criteriaValue: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('badge', BadgeSchema);