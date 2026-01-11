
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
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
    allow_origins=["*"],  # In production, replace with specific frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Career Guidance API"}

@app.get("/quiz-questions")
def get_quiz_questions():
    """
    Returns the list of quiz questions organized by category.
    """
    return QUIZ_QUESTIONS

@app.post("/predict-stream", response_model=StreamResponse)
def predict_stream(request: StreamPredictionRequest):
    """
    Calculates psychometric scores from quiz responses and predicts the best stream.
    """
    # 1. Calculate aggregate scores from raw quiz responses
    calculated_scores = calculate_quiz_scores(request.quiz_responses)
    
    # 2. Prepare user data for logic function
    user_data = calculated_scores.copy()
    user_data.update({
        "maths_marks_percent": request.maths_marks_percent,
        "social_science_marks_percent": request.social_science_marks_percent,
        "commerce_marks_percent": request.commerce_marks_percent
    })
    
    # 3. Predict stream
    stream = recommend_stream(user_data)
    
    return StreamResponse(
        recommended_stream=stream,
        calculated_scores=calculated_scores
    )

@app.get("/interests/{stream}")
def get_stream_interests(stream: str):
    """
    Returns the list of specific interest keys relevant to a choosing a career in the given stream.
    Useful for generating the second-step form on the frontend.
    """
    if stream not in QUIZ_TO_SUBJECT_CAREER:
        raise HTTPException(status_code=400, detail="Invalid stream")
    
    return list(QUIZ_TO_SUBJECT_CAREER[stream].keys())

@app.post("/recommend-career", response_model=CareerResponse)
def recommend_career(request: CareerPathRequest):
    """
    Recommends a subject and career path based on stream-specific interests.
    """
    subject, career = recommend_subject_career(request.stream, request.interests)
    
    if not subject:
        raise HTTPException(status_code=404, detail="Could not determine a career path with given data.")
        
    return CareerResponse(recommended_subject=subject, recommended_career=career)

@app.post("/recommend-colleges", response_model=list[CollegeResponse])
def get_college_recommendations(request: CollegeRecommendationRequest):
    """
    Returns a list of colleges matching the stream and subject.
    """
    colleges = recommend_colleges(request.stream, request.subject)
    return colleges
