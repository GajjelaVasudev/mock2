const learnerBadgeModel = require('../models/learnerBadge.model');
const learnerModel = require('../models/learner.model');

async function getMyBadges(req, res) {
    const learner = await learnerModel.findOne({ user: req.user.id });
    if (!learner) {
        return res.status(404).json({ message: 'Learner profile not found' });
    }

    const earned = await learnerBadgeModel
        .find({ learner: learner._id })
        .populate('badge')
        .sort({ awardedAt: -1 });

    return res.status(200).json({ badges: earned });
}

module.exports = { getMyBadges };