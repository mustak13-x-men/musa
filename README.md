# AI Smart Expense Tracker & Savings Planner

A gorgeous, premium, dark-mode glassmorphic full-stack application for modern asset tracking, savings planning, and AI-driven budget coaching. Built using **Flask (Python)**, **React.js (Vite)**, **MongoDB**, and **OpenAI GPT-3.5 API**.

---

## 🌟 Key Features

*   **Premium Glassmorphic Interface**: Sleek glowing dark theme, interactive cards, smooth page transitions, responsive layouts, and animations.
*   **Secure Authentication**: Secure sign-up/logins using robust password hashing (`bcrypt`) and protected pages secured by JSON Web Tokens (`jwt`).
*   **Ledger Transaction Hub**: Advanced expense logger supporting categorization (Food, Travel, Shopping, Bills, Entertainment, Health, Education), date selection, search indexing, and range filters.
*   **Savings Milestone Modeler**: Interactive milestone boards featuring completion percentages, target deadlines, months remaining trackers, and suggested monthly velocities.
*   **Interactive Calculator Widget**: Model exact savings time horizons based on customizable monthly contributions.
*   **Dual AI Financial Coach**:
    *   **OpenAI GPT-3.5**: Full natural language analysis, overspending warning logs, and dynamic budget action advice.
    *   **Rule-Based Fallback Engine**: Mathematical statistics engine that triggers instantly if `OPENAI_API_KEY` is omitted, guaranteeing fully-functional offline modeling.
*   **Analytical Projections**: Forecast next month's spending aggregates against actual expenditures using a modern Bar graph.
*   **Downloadable Reports**: One-click generation of beautifully formatted PDF financial reports including active ledger items, milestone progressions, and AI suggestions.
*   **Global Currency Reactivity**: Live currency selector on the top navbar (INR `₹`, USD `$`, EUR `€`, GBP `£`) which immediately re-calculates and re-formats every cash label in real-time.

---

## 🛠️ Technology Stack

*   **Frontend**: React.js, React Router DOM, Axios, Chart.js, React-Chartjs-2, Lucide React, Modern Custom CSS.
*   **Backend**: Flask (Python), PyMongo, bcrypt, PyJWT, Python-Dotenv, Flask-CORS, OpenAI.
*   **Database**: MongoDB (Atlas or Local fallback).

---

## 🚀 Setup & Execution Guide

### Prerequisites
Make sure the following are installed on your environment:
*   [Node.js](https://nodejs.org/) (v16.0+)
*   [Python](https://www.python.org/) (v3.8+)
*   [MongoDB](https://www.mongodb.com/try/download/community) (Local server running on port `27017` or a MongoDB Atlas URI)

---

### Step 1: Backend Setup (Flask Server)

1.  Open your terminal, navigate to the `backend/` directory:
    ```bash
    cd backend
    ```

2.  Create a Python virtual environment and activate it:
    *   **Windows (PowerShell)**:
        ```powershell
        python -m venv venv
        .\venv\Scripts\Activate.ps1
        ```
    *   **Mac/Linux**:
        ```bash
        python3 -m venv venv
        source venv/bin/activate
        ```

3.  Install the required dependencies:
    ```bash
    pip install -r requirements.txt
    ```

4.  Configure environment parameters in `backend/.env`:
    *   Open `backend/.env` in your text editor.
    *   Ensure `MONGO_URI` is pointing to your active MongoDB instance.
    *   *(Optional)* Paste your OpenAI API Key into `OPENAI_API_KEY` to activate natural language coaching. If left blank, the app will run the statistical rules engine offline.

5.  Start the Flask server:
    ```bash
    python app/app.py
    ```
    The server will initiate on **`http://localhost:5000`**.

---

### Step 2: Frontend Setup (React App)

1.  Open a new terminal window, navigate to the `frontend/` directory:
    ```bash
    cd frontend
    ```

2.  Ensure Vite dependencies are fully loaded:
    ```bash
    npm install
    ```

3.  Fire up the hot-reloading development server:
    ```bash
    npm run dev
    ```

4.  Open the displayed localhost URL in your browser:
    Typically **`http://localhost:5173`**.

---

## 📊 Database Collections Schema

### `users`
*   `_id`: `ObjectId` (Primary Key)
*   `username`: `String` (Unique)
*   `email`: `String` (Unique)
*   `password_hash`: `String` (Securely salted and hashed)
*   `created_at`: `DateTime`

### `expenses`
*   `_id`: `ObjectId` (Primary Key)
*   `title`: `String`
*   `amount`: `Double`
*   `category`: `String` (Predefined validation set)
*   `description`: `String` (Optional notes)
*   `date`: `DateTime` (Parsed natively for fast range queries)
*   `user_id`: `ObjectId` (Foreign reference key)

### `savings`
*   `_id`: `ObjectId` (Primary Key)
*   `goal_name`: `String`
*   `target_amount`: `Double`
*   `saved_amount`: `Double`
*   `deadline`: `DateTime` (Goal deadline target)
*   `user_id`: `ObjectId` (Foreign reference key)

---

## 📈 Analytical Reports & Printing

To export your records:
1.  Navigate to the **AI Insights** page.
2.  Review the charts, projections, and checkboxes checklist.
3.  Click the **Export PDF Report** button at the bottom center.
4.  This triggers a custom structured template containing print-optimized ledger lists, statistics summary blocks, and active target statuses, prompting the browser's native **Print to PDF** system. Ensure popups are allowed!
