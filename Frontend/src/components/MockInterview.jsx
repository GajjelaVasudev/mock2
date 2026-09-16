import React, { useState, useRef } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LOW_BANDWIDTH_TYPES = ['slow-2g', '2g', '3g'];
const AUDIO_BITRATE = 16000; // 16kbps — matches the low-data target

function getNetworkQuality() {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!conn || !conn.effectiveType) return 'unknown'; // Safari etc. — assume good, let user retry on failure
    return LOW_BANDWIDTH_TYPES.includes(conn.effectiveType) ? 'poor' : 'good';
}

function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]); // strip the data: prefix
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

export function MockInterview({ question }) {
    const { token } = useAuth();
    const [status, setStatus] = useState('idle'); // idle | recording | listening | processing | done | error
    const [result, setResult] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');

    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const recognitionRef = useRef(null);

    async function submitToServer(payload) {
        setStatus('processing');
        try {
            const response = await fetch('/api/ai/evaluate-interview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // sends the auth cookie
                body: JSON.stringify({ question, ...payload })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Evaluation failed');

            setResult(data.evaluation);
            setStatus('done');
        } catch (err) {
            setErrorMsg(err.message);
            setStatus('error');
        }
    }

    // --- Good connection: record + compress audio ---
    async function startAudioRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : 'audio/webm';

            const recorder = new MediaRecorder(stream, {
                mimeType,
                audioBitsPerSecond: AUDIO_BITRATE
            });

            chunksRef.current = [];
            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            recorder.onstop = async () => {
                stream.getTracks().forEach((t) => t.stop());
                const blob = new Blob(chunksRef.current, { type: mimeType });
                const base64 = await blobToBase64(blob);
                await submitToServer({ audio_base64: base64, audio_mime_type: mimeType });
            };

            mediaRecorderRef.current = recorder;
            recorder.start();
            setStatus('recording');
        } catch (err) {
            setErrorMsg('Microphone access denied or unavailable.');
            setStatus('error');
        }
    }

    function stopAudioRecording() {
        mediaRecorderRef.current?.stop();
    }

    // --- Poor connection: on-device speech-to-text, send text only ---
    function startSpeechToText() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setErrorMsg('Speech recognition not supported on this device — please type your answer instead.');
            setStatus('error');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-IN';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = async (event) => {
            const transcript = event.results[0][0].transcript;
            await submitToServer({ text_response: transcript });
        };

        recognition.onerror = () => {
            setErrorMsg('Could not capture speech — please try again or type your answer.');
            setStatus('error');
        };

        recognitionRef.current = recognition;
        recognition.start();
        setStatus('listening');
    }

    function stopSpeechToText() {
        recognitionRef.current?.stop();
    }

    // --- Smart entry point ---
    function handleStart() {
        setErrorMsg('');
        setResult(null);
        const quality = getNetworkQuality();
        if (quality === 'poor') {
            startSpeechToText();
        } else {
            startAudioRecording();
        }
    }

    function handleStop() {
        if (status === 'recording') stopAudioRecording();
        if (status === 'listening') stopSpeechToText();
    }

    return (
        <div className="mock-interview-card">
            <p className="question-text">{question}</p>

            {(status === 'idle' || status === 'error' || status === 'done') && (
                <button onClick={handleStart} className="record-btn">
                    <Mic size={18} /> Start Answer
                </button>
            )}

            {(status === 'recording' || status === 'listening') && (
                <button onClick={handleStop} className="stop-btn">
                    <Square size={18} /> {status === 'recording' ? 'Stop Recording' : 'Stop Listening'}
                </button>
            )}

            {status === 'processing' && (
                <div className="processing-indicator">
                    <Loader2 className="spin" size={18} /> Analyzing your answer...
                </div>
            )}

            {status === 'error' && <p className="error-text">{errorMsg}</p>}

            {status === 'done' && result && (
                <div className="result-box">
                    <p>Communication: {result.communication_score}/100</p>
                    <p>Confidence: {result.confidence_score}/100</p>
                    <p>Relevance: {result.relevance_score}/100</p>
                    <p>Grammar: {result.grammar_score}/100</p>
                    <p className="feedback-text">{result.feedback}</p>
                </div>
            )}
        </div>
    );
}

export default MockInterview;