
# Career Guidance FastAPI Backend

This is the backend API for the Career Guidance project, built with FastAPI. It handles the logic for stream prediction, career recommendation, and college searching.

## Setup

1.  **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

## Running the Server

1.  Navigate to the project root directory (one level up from `backend`).
2.  Run the following command:
    ```bash
    uvicorn backend.main:app --reload
    ```
    *Note: We run from the root so that python module imports work correctly.*

## API Endpoints

The API will be running at `http://127.0.0.1:8000`.

### Documentation
Interactive API docs are available at `http://127.0.0.1:8000/docs`.

### Core Endpoints

*   **`GET /quiz-questions`**: Get the list of psychometric quiz questions.
*   **`POST /predict-stream`**: Submit quiz scores and marks to get a recommended stream (Science, Arts, Commerce, etc.).
*   **`GET /interests/{stream}`**: Get the specific interest categories for a chosen stream (used for the next step).
*   **`POST /recommend-career`**: Submit specific interests to get a recommended Subject & Career.
*   **`POST /recommend-colleges`**: Get a list of colleges for a specific stream and subject.
