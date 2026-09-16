const learnerModel = require('../models/learner.model');

async function getMyProfile(req, res) {
    const learner = await learnerModel
        .findOne({ user: req.user.id })
        .populate('user', 'username email role');

    if (!learner) {
        return res.status(404).json({ message: 'Learner profile not found' });
    }

    return res.status(200).json({ learner });
}

module.exports = { getMyProfile };