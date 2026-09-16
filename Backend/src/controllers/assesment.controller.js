const skillAssessmentModel = require('../models/skillAssessment.model');
const learnerModel = require('../models/learner.model');

async function submitSelfAssessment(req, res) {
    const { skillCategory, score, notes } = req.body;

    if (!skillCategory || score === undefined) {
        return res.status(400).json({ message: 'skillCategory and score are required' });
    }

    const learner = await learnerModel.findOne({ user: req.user.id });
    if (!learner) {
        return res.status(404).json({ message: 'Learner profile not found' });
    }

    const assessment = await skillAssessmentModel.create({
        learner: learner._id,
        skillCategory,
        score,
        source: 'self',
        notes
    });

    return res.status(201).json({ message: 'Self-assessment submitted', assessment });
}

async function getMyAssessments(req, res) {
    const learner = await learnerModel.findOne({ user: req.user.id });
    if (!learner) {
        return res.status(404).json({ message: 'Learner profile not found' });
    }

    const assessments = await skillAssessmentModel
        .find({ learner: learner._id })
        .sort({ createdAt: -1 });

    // Build a quick per-skill summary: average score + latest score per category
    const summary = {};
    for (const a of assessments) {
        if (!summary[a.skillCategory]) {
            summary[a.skillCategory] = { scores: [], latest: a.score, latestDate: a.createdAt };
        }
        summary[a.skillCategory].scores.push(a.score);
    }

    const skillSummary = Object.entries(summary).map(([skillCategory, data]) => ({
        skillCategory,
        average: Number((data.scores.reduce((a, b) => a + b, 0) / data.scores.length).toFixed(1)),
        latest: data.latest,
        latestDate: data.latestDate,
        totalEntries: data.scores.length
    }));

    return res.status(200).json({
        summary: skillSummary,
        history: assessments
    });
}

module.exports = { submitSelfAssessment, getMyAssessments };