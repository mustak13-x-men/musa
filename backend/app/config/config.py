import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/expense_tracker")
    JWT_SECRET = os.getenv("JWT_SECRET", "ai_smart_expense_tracker_secret_998877")
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
    PORT = int(os.getenv("PORT", 5000))
    DEBUG = os.getenv("DEBUG", "True").lower() == "true"
