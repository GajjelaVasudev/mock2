const mongoose = require('mongoose');

const LearnerBadgeSchema = new mongoose.Schema({
    learner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'learner',
        required: true
    },
    badge: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'badge',
        required: true
    },
    awardedAt: {
        type: Date,
        default: Date.now
    }
});

LearnerBadgeSchema.index({ learner: 1, badge: 1 }, { unique: true }); // prevent duplicate awards

module.exports = mongoose.model('learnerBadge', LearnerBadgeSchema);