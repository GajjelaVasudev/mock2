const skillAssessmentModel = require('../models/skillAssessment.model');
const mockInterviewAttemptModel = require('../models/mockInterviewAttempt.model');
const learnerModel = require('../models/learner.model');
const { checkAndAwardBadges } = require('../services/badge.service');
const mcpClient = require('../ai/mcpClient');

async function evaluateInterview(req, res) {
    try {
        const { question, text_response, audio_base64, audio_mime_type, language } = req.body;

        if (!question) {
            return res.status(400).json({ error: "question is required" });
        }

        if (!text_response && !audio_base64) {
            return res.status(400).json({ error: "Either text_response or audio_base64 must be provided" });
        }

        // Prepare arguments for the AI tool
        const args = { question };
        if (text_response) args.text_response = text_response;
        if (audio_base64) args.audio_base64 = audio_base64;
        if (audio_mime_type) args.audio_mime_type = audio_mime_type;
        if (language) args.language = language;

        // Call the MCP tool exposed by the Python AI service
        const aiResponse = await mcpClient.callTool("evaluate_interview_response", args);

        if (aiResponse && aiResponse.error) {
            return res.status(400).json(aiResponse);
        }

        // If the user is authenticated, save the attempt to the DB
        if (req.user) {
            const learner = await learnerModel.findOne({ user: req.user.id });
            if (learner) {
                // 1. Map and scale the scores (the schema returns 1-10 natively, no need to divide by 10)
                const communicationScore = aiResponse.scores?.communication || 0;
                const confidenceScore = aiResponse.scores?.confidence || 0;
                const interviewReadinessScore =
                    ((aiResponse.scores?.relevance || 0) + (aiResponse.scores?.grammar || 0)) / 2;

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
                        clarity: aiResponse.scores?.grammar || 0,
                        tone: aiResponse.scores?.confidence || 0,
                        structure: aiResponse.scores?.relevance || 0,
                        confidence: aiResponse.scores?.confidence || 0
                    },
                    overallScore,
                    feedback: aiResponse.feedback ? JSON.stringify(aiResponse.feedback) : 'No feedback text provided'
                });

                // 4. Trigger badge logic
                await checkAndAwardBadges(learner._id);
            }
        }

        // 5. Return success to frontend
        return res.status(200).json({
            message: 'Evaluation successful',
            evaluation: aiResponse
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Evaluation failed: ' + (err.message || String(err)) });
    }
}

async function generateScenario(req, res) {
    try {
        const { soft_skill } = req.body;
        if (!soft_skill) return res.status(400).json({ error: "soft_skill is required" });

        const aiResponse = await mcpClient.callTool("generate_scenario_practice", { soft_skill });
        return res.status(200).json({ scenario: aiResponse });
    } catch (error) {
        return res.status(500).json({ error: "Failed to generate scenario from AI service." });
    }
}

module.exports = { 
    evaluateInterview,
    generateScenario
};
