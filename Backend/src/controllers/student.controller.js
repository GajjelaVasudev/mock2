const learnerModel = require('../models/learner.model');
const userModel = require('../models/user.model');

async function getMyProfile(req, res) {
    const learner = await learnerModel
        .findOne({ user: req.user.id })
        .populate('user', 'username email role');

    if (!learner) {
        return res.status(404).json({ message: 'Learner profile not found' });
    }

    return res.status(200).json({ learner });
}

async function updateMyProfile(req, res) {
    const { phoneNumber, center, cohort } = req.body;

    if (phoneNumber !== undefined) {
        await userModel.findByIdAndUpdate(req.user.id, { phoneNumber });
    }

    const learnerUpdates = {};
    if (center !== undefined) learnerUpdates.center = center;
    if (cohort !== undefined) learnerUpdates.cohort = cohort;

    const learner = await learnerModel
        .findOneAndUpdate(
            { user: req.user.id },
            { $set: learnerUpdates },
            { new: true }
        )
        .populate('user', 'username email role phoneNumber');

    if (!learner) {
        return res.status(404).json({ message: 'Learner profile not found' });
    }

    return res.status(200).json({ message: 'Profile updated', learner });
}

module.exports = { getMyProfile, updateMyProfile };