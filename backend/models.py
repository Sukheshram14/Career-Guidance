
from pydantic import BaseModel
from typing import Dict, Optional, List

# --- Request Models ---

class StreamPredictionRequest(BaseModel):
    # This can accept either raw quiz responses OR pre-calculated scores
    # For flexibility, let's allow the frontend topass raw quiz answers
    quiz_responses: Dict[str, int]  # e.g., {"scientific_interest_score_0": 5, ...}
    
    # Marks
    maths_marks_percent: float
    social_science_marks_percent: float
    commerce_marks_percent: float = 0

class CareerPathRequest(BaseModel):
    stream: str
    # Detailed interests for the specific stream (1-5 scale)
    # e.g. {"math_interest": 5, "cs_interest": 4}
    interests: Dict[str, int]

class CollegeRecommendationRequest(BaseModel):
    stream: str
    subject: str

# --- Response Models ---

class StreamResponse(BaseModel):
    recommended_stream: str
    calculated_scores: Dict[str, float]

class CareerResponse(BaseModel):
    recommended_subject: str
    recommended_career: str

class CollegeResponse(BaseModel):
    college_id: int
    college_name: str
    city: str
    rating: float
    distance_km: float
    tuition_fees: int
    facilities: List[str]
    # Add other fields as needed
