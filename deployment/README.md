
# Career Guidance App Deployment

This folder contains the Streamlit application for the Career Guidance System.

## Local Setup
1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Run the app:
   ```bash
   streamlit run app.py
   ```

## Deploying to Render
1. Upload this `deployment` folder to a GitHub repository.
2. Go to [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** -> **Web Service**.
4. Connect your GitHub repository.
5. Configure the service:
   - **Root Directory**: `deployment` (if you uploaded the whole project) or `.` (if you uploaded just this folder).
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `streamlit run app.py --server.port $PORT --server.address 0.0.0.0`
6. Click **Create Web Service**.

Your app will be live in a few minutes!
