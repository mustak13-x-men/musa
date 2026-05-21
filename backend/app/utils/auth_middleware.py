import jwt

from functools import wraps

from flask import request, jsonify

from app.config.config import Config

from bson import ObjectId

def token_required(f):

    @wraps(f)

    def decorated(*args, **kwargs):

        token = None

        if 'Authorization' in request.headers:

            auth_header = request.headers['Authorization']

            if auth_header.startswith('Bearer '):

                token = auth_header.split(' ')[1]

        if not token:

            return jsonify({"error": "Authorization token is missing!"}), 401

        try:

            data = jwt.decode(token, Config.JWT_SECRET, algorithms=["HS256"])

            user_id = data.get("user_id")

            if not user_id:

                return jsonify({"error": "Invalid token content!"}), 401

            current_user_id = user_id

        except jwt.ExpiredSignatureError:

            return jsonify({"error": "Session expired! Please login again."}), 401

        except jwt.InvalidTokenError:

            return jsonify({"error": "Invalid token! Please login again."}), 401

        except Exception as e:

            return jsonify({"error": f"Authentication failed: {str(e)}"}), 401

        return f(current_user_id, *args, **kwargs)

    return decorated

