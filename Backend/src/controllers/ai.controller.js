const skillAssessmentModel = require('../models/skillAssessment.model');
const mockInterviewAttemptModel = require('../models/mockInterviewAttempt.model');
const learnerModel = require('../models/learner.model');
const { checkAndAwardBadges } = require('../services/badge.service');
const { pingPythonServer } = require('../services/pythonAI.service');

async function evaluateInterview(req, res) {
    try {
        const { question, text_response, audio_base64, audio_mime_type } = req.body;

        if (!question || (!text_response && !audio_base64)) {
            return res.status(400).json({
                error: 'question and either text_response or audio_base64 are required'
            });
        }

        const aiResponse = await pingPythonServer({
            question,
            text_response,
            audio_base64,
            audio_mime_type
        });

        const learner = await learnerModel.findOne({ user: req.user.id });
        if (!learner) {
            return res.status(404).json({ error: 'Learner profile not found' });
        }

        // 1. Map and scale the scores (0-100 -> 1-10)
        const communicationScore = aiResponse.communication_score / 10;
        const confidenceScore = aiResponse.confidence_score / 10;
        const interviewReadinessScore =
            (aiResponse.relevance_score + aiResponse.grammar_score) / 20;

        const assessmentsToSave = [
            {
                learner: learner._id,
                skillCategory: 'communication',
                score: communicationScore,
                source: 'ai',
                notes: 'AI Evaluation'
            },
            {
                learner: learner._id,
                skillCategory: 'confidence',
                score: confidenceScore,
                source: 'ai',
                notes: 'AI Evaluation'
            },
            {
                learner: learner._id,
                skillCategory: 'interview-readiness',
                score: interviewReadinessScore,
                source: 'ai',
                notes: 'AI Evaluation'
            }
        ];

        // 2. Save skill scores
        await skillAssessmentModel.insertMany(assessmentsToSave);

        // 3. Save the attempt itself so mock-interview history stays populated
        const overallScore = Number(
            ((communicationScore + confidenceScore + interviewReadinessScore) / 3).toFixed(1)
        );

        await mockInterviewAttemptModel.create({
            learner: learner._id,
            question,
            inputType: audio_base64 ? 'audio' : 'text',
            transcript: text_response || aiResponse.transcript || null,
            scores: {
                clarity: aiResponse.grammar_score / 10,
                tone: aiResponse.confidence_score / 10,
                structure: aiResponse.relevance_score / 10,
                confidence: aiResponse.confidence_score / 10
            },
            overallScore,
            feedback: aiResponse.feedback || 'No feedback text provided'
        });

        // 4. Trigger badge logic
        await checkAndAwardBadges(learner._id);

        // 5. Return success to frontend
        return res.status(200).json({
            message: 'Evaluation successful and saved',
            evaluation: aiResponse
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Evaluation failed' });
    }
}

module.exports = { evaluateInterview };