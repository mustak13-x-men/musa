import ssl
import certifi
from pymongo import MongoClient

uri = "mongodb+srv://mustakmdcj09_db_user:Gcw7whZRXHflaqwn@cluster0.3cd6iay.mongodb.net/expense_tracker?retryWrites=true&w=majority&appName=Cluster0"

try:
    client = MongoClient(
        uri,
        serverSelectionTimeoutMS=8000,
        tls=True,
        tlsCAFile=certifi.where()
    )
    client.admin.command('ping')
    print("MongoDB Atlas Connected Successfully!")
    print("Database:", client.get_database("expense_tracker").name)
except Exception as e:
    print(f"certifi attempt failed: {e}")

    try:
        print("\nTrying with tlsAllowInvalidCertificates...")
        client2 = MongoClient(
            uri,
            serverSelectionTimeoutMS=8000,
            tlsAllowInvalidCertificates=True
        )
        client2.admin.command('ping')
        print("Connected with tlsAllowInvalidCertificates!")
    except Exception as e2:
        print(f"Also failed: {e2}")
