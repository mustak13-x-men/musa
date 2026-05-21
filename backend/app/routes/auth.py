from flask import Blueprint, request, jsonify

import bcrypt

import jwt

import datetime

import re

from app.utils.db import get_db

auth_bp = Blueprint('auth', __name__)

EMAIL_REGEX = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'

@auth_bp.route('/register', methods=['POST'])

def register():

    try:

        data = request.get_json()

        if not data:

            return jsonify({"error": "No input data provided"}), 400

        username = data.get('username', '').strip()

        email = data.get('email', '').strip().lower()

        password = data.get('password', '')

        if not username or not email or not password:

            return jsonify({"error": "All fields (username, email, password) are required"}), 400

        if not re.match(EMAIL_REGEX, email):

            return jsonify({"error": "Invalid email address format"}), 400

        if len(password) < 6:

            return jsonify({"error": "Password must be at least 6 characters long"}), 400

        db = get_db()

        if db is None:

            return jsonify({"error": "Database connection unavailable"}), 500

        if db.users.find_one({"email": email}):

            return jsonify({"error": "Email is already registered"}), 400

        if db.users.find_one({"username": username}):

            return jsonify({"error": "Username is already taken"}), 400

        salt = bcrypt.gensalt(12)

        password_hash = bcrypt.hashpw(password.encode('utf-8'), salt)

        new_user = {

            "username": username,

            "email": email,

            "password_hash": password_hash.decode('utf-8'),

            "created_at": datetime.datetime.utcnow()

        }

        db.users.insert_one(new_user)

        return jsonify({"message": "User registered successfully!"}), 201

    except Exception as e:

        print(f"Error in register: {str(e)}")

        return jsonify({"error": "An internal server error occurred"}), 500

@auth_bp.route('/login', methods=['POST'])

def login():

    try:

        data = request.get_json()

        if not data:

            return jsonify({"error": "No credentials provided"}), 400

        email = data.get('email', '').strip().lower()

        password = data.get('password', '')

        if not email or not password:

            return jsonify({"error": "Email and password are required"}), 400

        db = get_db()

        if db is None:

            return jsonify({"error": "Database connection unavailable"}), 500

        user = db.users.find_one({"email": email})

        if not user:

            return jsonify({"error": "Invalid email or password"}), 401

        if not bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):

            return jsonify({"error": "Invalid email or password"}), 401

        from app.config.config import Config

        token_payload = {

            "user_id": str(user['_id']),

            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24)

        }

        token = jwt.encode(token_payload, Config.JWT_SECRET, algorithm="HS256")

        return jsonify({

            "token": token,

            "user": {

                "id": str(user['_id']),

                "username": user['username'],

                "email": user['email']

            },

            "message": "Login successful!"

        }), 200

    except Exception as e:

        print(f"Error in login: {str(e)}")

        return jsonify({"error": "An internal server error occurred"}), 500

