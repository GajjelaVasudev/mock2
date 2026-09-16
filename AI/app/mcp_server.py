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

@mcp.tool()
async def evaluate_interview_response(question: str, text_response: Optional[str] = None, audio_base64: Optional[str] = None, language: str = "en") -> str:
    """
    Analyzes the learner's response for tone, clarity, and structure.
    Accepts text or base64 compressed audio. Returns constructive feedback and a score as JSON.
    """
    if audio_base64:
        # TODO: Process audio STT here
        pass
    
    if not text_response:
        return json.dumps({"error": "No text response provided."})
        
    prompt = f"""
    You are an expert soft-skills trainer for entry-level jobs in India.
    Evaluate the following interview response in {language}.
    
    Question: {question}
    Answer: {text_response}
    
    Analyze the answer and provide scores, speech metrics, constructive feedback, and skill updates according to the schema.
    """
    
    evaluation = await llm_provider.generate_structured_response(prompt, InterviewEvaluation)
    return evaluation.model_dump_json()

@mcp.tool()
async def generate_scenario_practice(soft_skill: str) -> str:
    """
    Creates bite-sized roleplay scenarios for a specific soft skill (e.g., 'conflict resolution').
    """
    return f"[MOCK] Scenario for {soft_skill}: A coworker took credit for your work. How do you address this professionally?"

# --- 2. Learner Analytics & Early Warning Tools ---

@mcp.tool()
async def analyze_learner_sentiment(recent_responses: List[str]) -> str:
    """
    Analyzes the learner's recent practice texts to gauge confidence levels and attitude changes.
    """
    return "[MOCK] Learner shows increasing confidence over the last 3 sessions."

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
    return f"[MOCK] Recommended modules: 1. Active Listening, 2. Confident Posture."

# --- 3. Employer Matching & Summarization Tools ---

@mcp.tool()
async def generate_candidate_summary(skill_badges: List[str], mock_scores: Dict[str, float], trainer_endorsement: str) -> str:
    """
    Synthesizes disparate data points into a standardized, professional summary paragraph for recruiters.
    """
    return f"[MOCK] Candidate is highly recommended. Badges: {', '.join(skill_badges)}. Average Score: {sum(mock_scores.values())/len(mock_scores) if mock_scores else 0}."

@mcp.tool()
async def match_candidate_to_role(candidate_profile: str, job_description: str) -> str:
    """
    Analyzes how well a candidate's specific soft skills align with an employer's requirements.
    """
    return "[MOCK] 85% Match. Candidate excels in required communication skills."
