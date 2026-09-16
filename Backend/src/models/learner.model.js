const mongoose = require('mongoose');

const LearnerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        unique: true
    },
    center: {
        type: String,
        trim: true
    },
    cohort: {
        type: String,
        trim: true
    },
    placementStatus: {
        type: String,
        enum: ['in-training', 'seeking', 'placed'],
        default: 'in-training'
    }
}, { timestamps: true });

module.exports = mongoose.model('learner', LearnerSchema);