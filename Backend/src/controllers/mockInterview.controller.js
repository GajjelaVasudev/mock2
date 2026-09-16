const mockInterviewAttemptModel = require('../models/mockInterviewAttempt.model');
const { checkAndAwardBadges } = require('../services/badge.service');
const skillAssessmentModel = require('../models/skillAssessment.model');
const learnerModel = require('../models/learner.model');
const { analyzeMockInterviewResponse } = require('../services/ai.service');

async function submitMockInterview(req, res) {
    const { question, text_response, audio_base64, audio_mime_type } = req.body;

    if (!question || (!text_response && !audio_base64)) {
        return res.status(400).json({
            message: 'question and either text_response or audio_base64 are required'
        });
    }

    const learner = await learnerModel.findOne({ user: req.user.id });
    if (!learner) {
        return res.status(404).json({ message: 'Learner profile not found' });
    }

    const inputType = audio_base64 ? 'audio' : 'text';

    const aiResult = await analyzeMockInterviewResponse({
        question,
        textResponse: text_response,
        audioBase64: audio_base64,
        audioMimeType: audio_mime_type
    });

    const attempt = await mockInterviewAttemptModel.create({
        learner: learner._id,
        question,
        inputType,
        transcript: aiResult.transcript,
        scores: aiResult.scores,
        overallScore: aiResult.overallScore,
        feedback: aiResult.feedback
    });

    // Feed the same score into the shared progress tracker, source: 'ai'
    await skillAssessmentModel.create({
        learner: learner._id,
        skillCategory: 'interview-readiness',
        score: aiResult.overallScore,
        source: 'ai',
        notes: aiResult.feedback
    });
    await checkAndAwardBadges(learner._id);
    return res.status(201).json({ message: 'Mock interview analyzed', attempt });
}

async function getMockInterviewHistory(req, res) {
    const learner = await learnerModel.findOne({ user: req.user.id });
    if (!learner) {
        return res.status(404).json({ message: 'Learner profile not found' });
    }

    const attempts = await mockInterviewAttemptModel
        .find({ learner: learner._id })
        .sort({ createdAt: -1 });

    return res.status(200).json({ attempts });
}

module.exports = { submitMockInterview, getMockInterviewHistory };