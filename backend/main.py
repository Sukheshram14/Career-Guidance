
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, Optional
from pydantic import BaseModel
from .models import (
    StreamPredictionRequest, StreamResponse,
    CareerPathRequest, CareerResponse,
    CollegeRecommendationRequest, CollegeResponse
)
from .logic import recommend_stream, recommend_subject_career, recommend_colleges, calculate_quiz_scores
from .data import QUIZ_QUESTIONS, QUIZ_TO_SUBJECT_CAREER

app = FastAPI(title="Career Guidance API")

# Configure CORS for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Career Guidance API"}

@app.get("/quiz-questions")
def get_quiz_questions():
    return QUIZ_QUESTIONS

# --- Legacy Support for Frontend Stages ---

class Stage1Request(BaseModel):
    # Allow flexible dict input to handle Q1...Q24 and other flat fields
    # We use a permissive model or just accept Request and parse manually if keys are dynamic check
    # But better to define fields if known.
    # Frontend sends flat JSON with "Q1": val, "maths": val...
    # Let's use extra=allow compatible model
    maths_marks_percent: float
    social_science_marks_percent: float
    commerce_marks_percent: float = 0
    # Capture all Qs in extra fields
    class Config:
        extra = "allow"

@app.post("/stage1")
async def stage1_predict(request: Request):
    data = await request.json()
    
    # Map Q1-Q24 to scores (Logic from Notebook)
    # Q1-3: analytical
    # Q4-6: numerical
    # Q7-9: communication
    # Q10-12: creativity
    # Q13-15: scientific
    # Q16-18: business
    # Q19-21: practical
    # Q22-24: leadership
    
    def get_avg(keys):
        vals = [float(data.get(k, 0)) for k in keys]
        return sum(vals) / len(vals) if vals else 0
        
    scores = {
        "analytical_reasoning_score": get_avg(["Q1", "Q2", "Q3"]),
        "numerical_aptitude_score": get_avg(["Q4", "Q5", "Q6"]),
        "communication_score": get_avg(["Q7", "Q8", "Q9"]),
        "creativity_score": get_avg(["Q10", "Q11", "Q12"]),
        "scientific_interest_score": get_avg(["Q13", "Q14", "Q15"]),
        "business_interest_score": get_avg(["Q16", "Q17", "Q18"]),
        "practical_skills_score": get_avg(["Q19", "Q20", "Q21"]),
        "leadership_score": get_avg(["Q22", "Q23", "Q24"]),
    }
    
    # Prepare user data
    user_data = scores.copy()
    user_data.update({
        "maths_marks_percent": float(data.get("maths_marks_percent", 0)),
        "social_science_marks_percent": float(data.get("social_science_marks_percent", 0)),
        "commerce_marks_percent": float(data.get("commerce_marks_percent", 0)),
    })
    
    stream = recommend_stream(user_data)
    
    return {
        "predicted_stream": stream,
        "confidence_percent": 85.0, # Mock confidence as logic doesn't output prob
        "scores": scores
    }

@app.post("/predict-stream", response_model=StreamResponse)
def predict_stream(request: StreamPredictionRequest):
    """
    New Endpoint: Calculates psychometric scores from quiz responses and predicts the best stream.
    """
    calculated_scores = calculate_quiz_scores(request.quiz_responses)
    user_data = calculated_scores.copy()
    user_data.update({
        "maths_marks_percent": request.maths_marks_percent,
        "social_science_marks_percent": request.social_science_marks_percent,
        "commerce_marks_percent": request.commerce_marks_percent
    })
    stream = recommend_stream(user_data)
    return StreamResponse(
        recommended_stream=stream,
        calculated_scores=calculated_scores
    )

@app.get("/interests/{stream}")
def get_stream_interests(stream: str):
    if stream not in QUIZ_TO_SUBJECT_CAREER:
        raise HTTPException(status_code=400, detail="Invalid stream")
    return list(QUIZ_TO_SUBJECT_CAREER[stream].keys())

@app.post("/recommend-career", response_model=CareerResponse)
def recommend_career(request: CareerPathRequest):
    subject, career = recommend_subject_career(request.stream, request.interests)
    if not subject:
        raise HTTPException(status_code=404, detail="Could not determine a career path.")
    return CareerResponse(recommended_subject=subject, recommended_career=career)

@app.post("/recommend-colleges", response_model=list[CollegeResponse])
def get_college_recommendations(request: CollegeRecommendationRequest):
    colleges = recommend_colleges(request.stream, request.subject)
    return colleges

@app.post("/stage2")
async def stage2_predict(request: Request):
    """
    Legacy endpoint for Stage 2: Career and Subject prediction
    Frontend sends: predicted_stream + interest scores (e.g., math_interest: 5)
    """
    data = await request.json()
    stream = data.get("predicted_stream")
    
    if not stream or stream not in QUIZ_TO_SUBJECT_CAREER:
        raise HTTPException(status_code=400, detail="Invalid or missing stream")
    
    # Extract interest scores from the payload
    # Frontend sends keys like "math_interest", "chemistry_interest", etc.
    interests = {k: v for k, v in data.items() if k != "predicted_stream"}
    
    # Use the logic to recommend subject and career
    subject, career = recommend_subject_career(stream, interests)
    
    if not subject:
        raise HTTPException(status_code=404, detail="Could not determine career path")
    
    return {
        "predicted_subject": subject,
        "predicted_career": career,
        "career_confidence_percent": 88.0,  # Mock confidence
        "subject_confidence_percent": 90.0  # Mock confidence
    }

@app.post("/stage3")
async def stage3_colleges(request: Request):
    """
    Legacy endpoint for Stage 3: College recommendations
    Frontend sends: predicted_stream + predicted_subject
    """
    data = await request.json()
    stream = data.get("predicted_stream")
    subject = data.get("predicted_subject")
    
    if not stream or not subject:
        raise HTTPException(status_code=400, detail="Missing stream or subject")
    
    # Get college recommendations
    colleges = recommend_colleges(stream, subject, max_colleges=10)
    
    return {
        "recommended_colleges": colleges,
        "total_count": len(colleges)
    }
