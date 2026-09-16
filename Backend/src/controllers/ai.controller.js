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

        return res.status(200).json({
            message: "Evaluation successful",
            evaluation: aiResponse
        });

    } catch (error) {
        console.error("Error in evaluateInterview:", error);
        return res.status(500).json({ error: "Failed to evaluate interview response from AI service." });
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
