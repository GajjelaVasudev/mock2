const learnerModel = require('../models/learner.model');

async function getMyPlacement(req, res) {
    const learner = await learnerModel.findOne({ user: req.user.id });
    if (!learner) {
        return res.status(404).json({ message: 'Learner profile not found' });
    }

    return res.status(200).json({
        placementStatus: learner.placementStatus,
        company: learner.placedCompany,
        role: learner.placedRole,
        placedDate: learner.placedDate
    });
}

module.exports = { getMyPlacement };