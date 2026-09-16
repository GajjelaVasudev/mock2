const learnerModel = require('../models/learner.model');
const mentorshipRequestModel = require('../models/mentorshipRequest.model');

async function getMentors(req, res) {
    const mentors = await learnerModel
        .find({ isAlumni: true, isMentor: true })
        .populate('user', 'username email');

    return res.status(200).json({ mentors });
}

async function requestMentorship(req, res) {
    const { mentorId, message } = req.body;

    if (!mentorId) {
        return res.status(400).json({ message: 'mentorId is required' });
    }

    const requesterLearner = await learnerModel.findOne({ user: req.user.id });
    if (!requesterLearner) {
        return res.status(404).json({ message: 'Learner profile not found' });
    }

    const mentor = await learnerModel.findById(mentorId);
    if (!mentor || !mentor.isMentor) {
        return res.status(404).json({ message: 'Mentor not found' });
    }

    const existing = await mentorshipRequestModel.findOne({
        requester: requesterLearner._id,
        mentor: mentorId,
        status: 'pending'
    });
    if (existing) {
        return res.status(400).json({ message: 'You already have a pending request with this mentor' });
    }

    const request = await mentorshipRequestModel.create({
        requester: requesterLearner._id,
        mentor: mentorId,
        message
    });

    return res.status(201).json({ message: 'Mentorship request sent', request });
}

module.exports = { getMentors, requestMentorship };