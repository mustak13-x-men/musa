import pymongo
from pymongo.errors import ConnectionFailure
import sys
import os
import json
import datetime
from bson import ObjectId
from app.config.config import Config

db = None
client = None

# Custom JSON Encoder/Decoder for MongoDB BSON types in persistent mock storage
class MongoJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return {"$oid": str(obj)}
        if isinstance(obj, datetime.datetime):
            return {"$date": obj.isoformat()}
        return super().default(obj)

def mongo_json_hook(dct):
    if "$oid" in dct:
        return ObjectId(dct["$oid"])
    if "$date" in dct:
        return datetime.datetime.fromisoformat(dct["$date"])
    return dct

def make_persistent(mock_db, filepath):
    def save_data():
        try:
            data = {
                "users": list(mock_db.users.find({})),
                "expenses": list(mock_db.expenses.find({})),
                "savings": list(mock_db.savings.find({}))
            }
            with open(filepath, "w") as f:
                json.dump(data, f, cls=MongoJSONEncoder, indent=2)
            print("[Mock DB] Saved persistent database state.")
        except Exception as e:
            print("[Mock DB] Error saving mock database:", e)

    def load_data():
        if os.path.exists(filepath):
            try:
                with open(filepath, "r") as f:
                    data = json.load(f, object_hook=mongo_json_hook)
                for col_name, docs in data.items():
                    if docs:
                        mock_db[col_name].insert_many(docs)
                print(f"[Mock DB] Successfully loaded persistent mock data from {filepath}")
            except Exception as e:
                print("[Mock DB] Error loading mock database:", e)

    load_data()

    # Wrap mutating methods to auto-save on changes
    def wrap_methods(col_name):
        col = mock_db[col_name]
        
        orig_insert_one = col.insert_one
        def new_insert_one(*args, **kwargs):
            res = orig_insert_one(*args, **kwargs)
            save_data()
            return res
        col.insert_one = new_insert_one

        orig_insert_many = col.insert_many
        def new_insert_many(*args, **kwargs):
            res = orig_insert_many(*args, **kwargs)
            save_data()
            return res
        col.insert_many = new_insert_many

        orig_update_one = col.update_one
        def new_update_one(*args, **kwargs):
            res = orig_update_one(*args, **kwargs)
            save_data()
            return res
        col.update_one = new_update_one

        orig_update_many = col.update_many
        def new_update_many(*args, **kwargs):
            res = orig_update_many(*args, **kwargs)
            save_data()
            return res
        col.update_many = new_update_many

        orig_delete_one = col.delete_one
        def new_delete_one(*args, **kwargs):
            res = orig_delete_one(*args, **kwargs)
            save_data()
            return res
        col.delete_one = new_delete_one

        orig_delete_many = col.delete_many
        def new_delete_many(*args, **kwargs):
            res = orig_delete_many(*args, **kwargs)
            save_data()
            return res
        col.delete_many = new_delete_many

    for col_name in ["users", "expenses", "savings"]:
        wrap_methods(col_name)

def init_db():
    global db, client

    # 1. Try connecting to MongoDB Atlas
    try:
        atlas_uri_censored = Config.MONGO_URI.split('@')[-1] if '@' in Config.MONGO_URI else Config.MONGO_URI
        print(f"Connecting to MongoDB Atlas: {atlas_uri_censored}")
        
        # Add serverSelectionTimeoutMS so we fail fast if unreachable/unauthorized
        client = pymongo.MongoClient(Config.MONGO_URI, serverSelectionTimeoutMS=3000)
        client.admin.command('ping')
        db = client.get_database()
        print("Successfully connected to MongoDB Atlas!")
        return db
    except Exception as e:
        print(f"MongoDB Atlas connection failed: {e}")

    # 2. Try Local MongoDB Fallback
    if Config.MONGO_URI != Config.MONGO_URI_FALLBACK:
        try:
            print(f"Attempting fallback to Local MongoDB: {Config.MONGO_URI_FALLBACK}")
            client = pymongo.MongoClient(Config.MONGO_URI_FALLBACK, serverSelectionTimeoutMS=2000)
            client.admin.command('ping')
            db = client.get_database()
            print("Successfully connected to Local MongoDB fallback database!")
            return db
        except Exception as e2:
            print(f"Local MongoDB fallback connection failed: {e2}")

    # 3. Persistent In-Memory Mock Fallback
    try:
        print("Activating persistent Local Mock Database Fallback (mongomock)...")
        import mongomock
        client = mongomock.MongoClient()
        db = client.get_database("expense_tracker")
        
        # Enable persistence to a local JSON file in the backend directory
        persistence_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "mock_db_persistence.json")
        make_persistent(db, persistence_path)
        
        print("Successfully initialized persistent Local Mock Database!")
        return db
    except Exception as e3:
        print(f"Failed to initialize mock database fallback: {e3}")
        return None

def get_db():
    global db
    if db is None:
        db = init_db()
    return db


