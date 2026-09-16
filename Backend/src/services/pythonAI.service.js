const PYTHON_AI_SERVICE_URL = process.env.PYTHON_AI_SERVICE_URL;

async function pingPythonServer({ question, text_response, audio_base64, audio_mime_type }) {
    // TODO: replace with the real call once Member 1 shares his working code.
    // Expected to return: { communication_score, confidence_score, relevance_score, grammar_score, feedback, transcript }

    if (!PYTHON_AI_SERVICE_URL) {
        // Mock response so the rest of the flow can be built/tested now
        return {
            communication_score: 75,
            confidence_score: 70,
            relevance_score: 80,
            grammar_score: 85,
            feedback: 'Mock evaluation — PYTHON_AI_SERVICE_URL not set yet.',
            transcript: text_response || '[audio transcript placeholder]'
        };
    }

    const response = await fetch(`${PYTHON_AI_SERVICE_URL}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, text_response, audio_base64, audio_mime_type })
    });

    if (!response.ok) {
        throw new Error(`Python AI service error: ${response.status}`);
    }

    return response.json();
}

module.exports = { pingPythonServer };