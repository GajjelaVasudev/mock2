# pyrefly: ignore [missing-import]
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# pyrefly: ignore [missing-import]
from fastmcp import FastMCP
from typing import Optional, List, Dict
import json
from dotenv import load_dotenv
load_dotenv()

from app.services.gemini_provider import GeminiProvider
from app.models.scoring import InterviewEvaluation

# Create the MCP server using FastMCP
mcp = FastMCP("etasha-ai-mcp")

# Instantiate LLM Provider
llm_provider = GeminiProvider()

# --- 1. Mock Interview & Communication Tools ---

@mcp.tool()
async def generate_interview_question(industry: str, role: str, difficulty: str = "entry-level") -> str:
    """
    Generates a contextual, entry-level interview question for a given industry and role.
    E.g., industry="Retail", role="Customer Service Representative"
    """
    prompt = f"Generate a single, realistic entry-level interview question for a {role} in the {industry} industry. The difficulty should be {difficulty}. Only output the question text."
    response = await llm_provider.generate_response(prompt)
    return response

import base64

@mcp.tool()
async def evaluate_interview_response(question: str, text_response: Optional[str] = None, audio_base64: Optional[str] = None, audio_mime_type: str = "audio/webm", language: str = "en") -> str:
    """
    Analyzes the learner's response for tone, clarity, and structure.
    Accepts text or base64 compressed audio. Returns constructive feedback and a score as JSON.
    """
    audio_bytes = None
    if audio_base64:
        try:
            audio_bytes = base64.b64decode(audio_base64)
        except Exception:
            return json.dumps({"error": "Invalid base64 string provided for audio."})
    
    if not text_response and not audio_bytes:
        return json.dumps({"error": "No text response or audio provided."})
        
    prompt_sections = [
        f"You are an expert soft-skills trainer for entry-level jobs in India.",
        f"Evaluate the following interview response in {language}.",
        f"Question: {question}"
    ]
    
    if text_response:
        prompt_sections.append(f"Answer Transcript: {text_response}")
    if audio_bytes:
        prompt_sections.append("Listen to the provided audio to evaluate the tone, pace, filler words, and confidence. Ignore the Answer Transcript if the audio tells a different story.")
        
    prompt_sections.append("Analyze the answer and provide scores, speech metrics, constructive feedback, and skill updates according to the schema.")
    
    prompt = "\n".join(prompt_sections)
    
    evaluation = await llm_provider.generate_structured_response(prompt, InterviewEvaluation, audio_bytes=audio_bytes, mime_type=audio_mime_type)
    return evaluation.model_dump_json()

@mcp.tool()
async def generate_scenario_practice(soft_skill: str) -> str:
    """
    Creates bite-sized roleplay scenarios for a specific soft skill (e.g., 'conflict resolution').
    """
    prompt = f"Create a short, interactive, and realistic workplace scenario based on the soft skill '{soft_skill}' for an entry-level worker in India. The scenario should end with a question asking the user how they would handle it."
    response = await llm_provider.generate_response(prompt)
    return response

# --- 2. Learner Analytics & Early Warning Tools ---

@mcp.tool()
async def analyze_learner_sentiment(recent_responses: List[str]) -> str:
    """
    Analyzes the learner's recent practice texts to gauge confidence levels and attitude changes.
    """
    responses_text = "\n".join([f"- {resp}" for resp in recent_responses])
    prompt = f"Analyze the following recent practice responses from a job seeker. Provide a brief 1-2 sentence psychological analysis of their confidence level and attitude over time.\nResponses:\n{responses_text}"
    response = await llm_provider.generate_response(prompt)
    return response

@mcp.tool()
async def flag_at_risk_learner(attendance_rate: float, performance_scores: List[float]) -> str:
    """
    Analyzes engagement patterns to flag learners who might drop out, providing early-warning signals for Trainers.
    """
    if attendance_rate < 0.75:
        return "[MOCK] FLAG: High risk of dropout due to low attendance."
    return "[MOCK] Learner is on track."

@mcp.tool()
async def recommend_personalized_tasks(weaknesses: List[str]) -> str:
    """
    Suggests specific bite-sized soft skills modules based on a learner's recent assessment scores.
    """
    weaknesses_text = ", ".join(weaknesses)
    prompt = f"As a career coach, recommend 2-3 specific, actionable mini-exercises for an entry-level job seeker to improve the following weaknesses: {weaknesses_text}. Keep it brief."
    response = await llm_provider.generate_response(prompt)
    return response

# --- 3. Employer Matching & Summarization Tools ---

@mcp.tool()
async def generate_candidate_summary(skill_badges: List[str], mock_scores: Dict[str, float], trainer_endorsement: str) -> str:
    """
    Synthesizes disparate data points into a standardized, professional summary paragraph for recruiters.
    """
    scores_text = ", ".join([f"{k}: {v}/10" for k, v in mock_scores.items()])
    prompt = f"Write a polished, professional 3-4 sentence paragraph that recruiters can instantly read to assess a candidate's job-readiness.\nSkill Badges: {', '.join(skill_badges)}\nMock Scores: {scores_text}\nTrainer Endorsement: {trainer_endorsement}"
    response = await llm_provider.generate_response(prompt)
    return response

@mcp.tool()
async def match_candidate_to_role(candidate_profile: str, job_description: str) -> str:
    """
    Analyzes how well a candidate's specific soft skills align with an employer's requirements.
    """
    prompt = f"Act as an AI recruiter. Compare the candidate's profile against the job description and output an analysis of why they are a good fit, highlighting transferable soft skills. Give an estimated match percentage at the beginning.\nCandidate Profile: {candidate_profile}\nJob Description: {job_description}"
    response = await llm_provider.generate_response(prompt)
    return response
