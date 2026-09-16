const AI_SERVICE_URL = process.env.AI_SERVICE_URL;

async function analyzeMockInterviewResponse({ question, textResponse, audioBase64, audioMimeType }) {
    // Fallback mock so you can build/test before the real AI service is ready
    if (!AI_SERVICE_URL) {
        return {
            transcript: textResponse || '[audio transcript placeholder]',
            scores: { clarity: 6, tone: 6, structure: 6, confidence: 6 },
            overallScore: 6,
            feedback: 'Mock response — AI_SERVICE_URL not configured yet.'
        };
    }

    const response = await fetch(`${AI_SERVICE_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            question,
            text_response: textResponse,
            audio_base64: audioBase64,
            audio_mime_type: audioMimeType
        })
    });

    if (!response.ok) {
        throw new Error(`AI service error: ${response.status}`);
    }

    return response.json();
}

module.exports = { analyzeMockInterviewResponse };