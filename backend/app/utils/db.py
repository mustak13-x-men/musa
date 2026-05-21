from pymongo import MongoClient

from pymongo.errors import ConnectionFailure

import sys

from app.config.config import Config

db = None

client = None

def init_db():

    global db, client

    try:

        print(f"Connecting to MongoDB with URI: {Config.MONGO_URI.split('@')[-1] if '@' in Config.MONGO_URI else Config.MONGO_URI}")

        client = MongoClient(Config.MONGO_URI, serverSelectionTimeoutMS=5000)

        client.admin.command('ping')

        db = client.get_database()

        print("Successfully connected to MongoDB database!")

        return db

    except ConnectionFailure as e:

        print(f"MongoDB connection failed: {e}")

        print("Please ensure MongoDB is running locally or check your MONGO_URI in .env")

        return None

    except Exception as e:

        print(f"Error connecting to MongoDB: {e}")

        return None

def get_db():

    global db

    if db is None:

        db = init_db()

    return db

