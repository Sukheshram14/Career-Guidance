
import random
from data import COLLEGE_DB, QUIZ_TO_SUBJECT_CAREER

def recommend_stream(user_data):
    """
    Recommends a stream based on user interests and marks.
    User data should contain:
    - scientific_interest_score (1-5)
    - maths_marks_percent (0-100)
    - creativity_score (1-5)
    - social_science_marks_percent (0-100)
    - business_interest_score (1-5)
    - commerce_marks_percent (0-100)
    """
    sci_score = user_data.get("scientific_interest_score", 0)
    maths_marks = user_data.get("maths_marks_percent", 0)
    creative_score = user_data.get("creativity_score", 0)
    social_marks = user_data.get("social_science_marks_percent", 0)
    biz_score = user_data.get("business_interest_score", 0)
    comm_marks = user_data.get("commerce_marks_percent", 0)

    if sci_score > 3.5 and maths_marks > 70:
        return "Science"
    elif creative_score > 3.5 and social_marks > 60:
        return "Arts"
    elif biz_score > 3.5 and comm_marks > 65:
        return "Commerce"
    else:
        return "Vocational"

def recommend_subject_career(stream, interest_scores):
    """
    Recommends subject and career based on the stream and granular interest scores.
    interest_scores: dict mapping specific interest keys (e.g. 'math_interest') to scores (1-5).
    """
    if stream not in QUIZ_TO_SUBJECT_CAREER:
        return None, None
    
    # Filter scores relevant to the stream
    relevant_interests = QUIZ_TO_SUBJECT_CAREER[stream].keys()
    
    # Find the applicable scores provided by user
    stream_scores = {k: interest_scores.get(k, 0) for k in relevant_interests}
    
    if not stream_scores:
        return None, None
        
    # Get the key with max score
    # In case of tie, just pick one (Python max picks first encountered)
    best_interest = max(stream_scores, key=stream_scores.get)
    
    return QUIZ_TO_SUBJECT_CAREER[stream][best_interest]

def recommend_colleges(stream, subject, max_colleges=5):
    """
    Recommends colleges based on stream and subject match.
    Sorted by distance (simulated).
    """
    # Filter colleges that match stream and offer the subject
    suitable_colleges = [
        c for c in COLLEGE_DB 
        if c["stream"] == stream and subject in c["subjects"]
    ]
    
    # Sort by distance
    suitable_colleges.sort(key=lambda x: x["distance_km"])
    
    return suitable_colleges[:max_colleges]

def calculate_quiz_scores(responses):
    """
    Calculates the aggregate scores for each category based on quiz responses.
    responses: dict mapping 'category_index' to the user's rating (1-5).
    Example: {'scientific_interest_score_0': 5, 'scientific_interest_score_1': 4, ...}
    Returns: dict with averaged scores, e.g., {'scientific_interest_score': 4.5, ...}
    """
    scores = {}
    counts = {}
    
    for key, value in responses.items():
        # key format is "category_name_index", e.g. "scientific_interest_score_0"
        # We need to extract the category name
        category = "_".join(key.split("_")[:-1])
        
        if category not in scores:
            scores[category] = 0
            counts[category] = 0
            
        scores[category] += value
        counts[category] += 1
        
    # Calculate average
    averaged_scores = {cat: scores[cat] / counts[cat] for cat in scores}
    return averaged_scores
