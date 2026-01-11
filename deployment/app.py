
import streamlit as st
import pandas as pd
from logic import recommend_stream, recommend_subject_career, recommend_colleges
from data import QUIZ_TO_SUBJECT_CAREER

st.set_page_config(page_title="Career Guidance System", page_icon="🎓")

st.title("🎓 AI-Powered Career Guidance System")
st.write("Get personalized stream, subject, and college recommendations based on your profile.")

# --- Step 1: Stream Recommendation ---
st.header("Step 1: Find Your Ideal Stream")
st.write("Rate your interests (1-5) and enter your marks/grades (0-100).")

col1, col2 = st.columns(2)

with col1:
    sci_score = st.slider("Scientific Interest (Physics, Bio, Tech)", 1, 5, 3)
    maths_marks = st.number_input("Mathematics Marks (%)", 0, 100, 75)
    
    biz_score = st.slider("Business Interest (Finance, Management)", 1, 5, 3)
    comm_marks = st.number_input("Commerce/Business Marks (%) (if applicable, else 0)", 0, 100, 0)

with col2:
    creative_score = st.slider("Creativity Interest (Art, Writing, History)", 1, 5, 3)
    social_marks = st.number_input("Social Science/Humanities Marks (%)", 0, 100, 65)

user_data = {
    "scientific_interest_score": sci_score,
    "maths_marks_percent": maths_marks,
    "creativity_score": creative_score,
    "social_science_marks_percent": social_marks,
    "business_interest_score": biz_score,
    "commerce_marks_percent": comm_marks
}

# Recommendation Button
if st.button("Predict Stream"):
    stream = recommend_stream(user_data)
    st.session_state["stream"] = stream
    st.success(f"Recommended Stream: **{stream}**")
else:
    if "stream" not in st.session_state:
        st.session_state["stream"] = None

# --- Step 2: Subject & Career ---
if st.session_state["stream"]:
    st.header(f"Step 2: Subject & Career Path in {st.session_state['stream']}")
    st.write("Rate your specific interests in this field to find the best specialization.")
    
    stream = st.session_state["stream"]
    relevant_interests = QUIZ_TO_SUBJECT_CAREER.get(stream, {}).keys()
    
    user_interests = {}
    for intr in relevant_interests:
        label = intr.replace("_", " ").title()
        user_interests[intr] = st.slider(f"{label} (1-5)", 1, 5, 3, key=intr)
    
    if st.button("Find Career Path"):
        subject, career = recommend_subject_career(stream, user_interests)
        st.session_state["subject"] = subject
        st.session_state["career"] = career
        st.info(f"Recommended Subject: **{subject}**")
        st.success(f"Recommended Career: **{career}**")
    else:
        if "subject" not in st.session_state:
            st.session_state["subject"] = None

# --- Step 3: Colleges ---
if st.session_state.get("subject"):
    st.header("Step 3: Top College Recommendations")
    
    if st.button("Show Colleges"):
        colleges = recommend_colleges(st.session_state["stream"], st.session_state["subject"])
        
        if colleges:
            st.write(f"Showing top colleges for **{st.session_state['subject']}**:")
            df = pd.DataFrame(colleges)
            # Select columns to display
            display_cols = ["college_name", "city", "rating", "distance_km", "tuition_fees", "facilities"]
            st.dataframe(df[display_cols])
        else:
            st.warning("No specific colleges found in our database for this combination. Please try general search.")

st.markdown("---")
st.caption("Powered by Career Guidance AI Logic")
