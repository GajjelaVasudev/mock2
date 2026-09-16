from pydantic import BaseModel, Field
from typing import List, Literal

class Scores(BaseModel):
    relevance: int = Field(ge=0, le=10, description="Score for relevance to the question from 0 to 10.")
    clarity: int = Field(ge=0, le=10, description="Score for clarity of expression from 0 to 10.")
    structure: int = Field(ge=0, le=10, description="Score for the structure of the answer from 0 to 10.")
    grammar: int = Field(ge=0, le=10, description="Score for grammatical correctness from 0 to 10.")
    confidence: int = Field(ge=0, le=10, description="Score for perceived confidence from 0 to 10.")
    communication: int = Field(ge=0, le=10, description="Score for overall communication from 0 to 10.")
    interview_readiness: int = Field(ge=0, le=10, description="Score for interview readiness from 0 to 10.")

class SpeechMetrics(BaseModel):
    word_count: int
    filler_word_count: int
    filler_words: List[str]
    estimated_speaking_pace: Literal["slow", "moderate", "fast"]

class Feedback(BaseModel):
    strengths: List[str]
    weaknesses: List[str]
    specific_feedback: List[str]
    recommendations: List[str]

class SkillUpdate(BaseModel):
    communication: int = Field(ge=0, le=100)
    confidence: int = Field(ge=0, le=100)
    interview_readiness: int = Field(ge=0, le=100)

class InterviewEvaluation(BaseModel):
    question: str
    answer: str
    scores: Scores
    speech_metrics: SpeechMetrics
    feedback: Feedback
    overall_score: int = Field(ge=0, le=10)
    skill_update: SkillUpdate
