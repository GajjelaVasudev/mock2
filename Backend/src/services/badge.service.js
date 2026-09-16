const badgeModel = require('../models/badge.model');
const learnerBadgeModel = require('../models/learnerBadge.model');
const mockInterviewAttemptModel = require('../models/mockInterviewAttempt.model');
const skillAssessmentModel = require('../models/skillAssessment.model');

async function checkAndAwardBadges(learnerId) {
    const badges = await badgeModel.find();
    const alreadyAwarded = await learnerBadgeModel.find({ learner: learnerId }).select('badge');
    const awardedIds = new Set(alreadyAwarded.map(b => b.badge.toString()));

    for (const badge of badges) {
        if (awardedIds.has(badge._id.toString())) continue; // skip if already earned

        let qualifies = false;

        if (badge.criteriaType === 'mock_interview_count') {
            const count = await mockInterviewAttemptModel.countDocuments({ learner: learnerId });
            qualifies = count >= badge.criteriaValue;
        }

        if (badge.criteriaType === 'self_assessment_count') {
            const count = await skillAssessmentModel.countDocuments({ learner: learnerId, source: 'self' });
            qualifies = count >= badge.criteriaValue;
        }

        if (badge.criteriaType === 'average_score') {
            const attempts = await mockInterviewAttemptModel.find({ learner: learnerId });
            if (attempts.length > 0) {
                const avg = attempts.reduce((sum, a) => sum + a.overallScore, 0) / attempts.length;
                qualifies = avg >= badge.criteriaValue;
            }
        }

        if (qualifies) {
            await learnerBadgeModel.create({ learner: learnerId, badge: badge._id });
        }
    }
}

module.exports = { checkAndAwardBadges };