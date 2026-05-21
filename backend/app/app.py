from flask import Flask, jsonify
from flask_cors import CORS
from app.config.config import Config
from app.utils.db import init_db

# Import Blueprints
from app.routes.auth import auth_bp
from app.routes.expenses import expenses_bp
from app.routes.savings import savings_bp
from app.routes.ai import ai_bp

def create_app():
    app = Flask(__name__)
    
    # Enable CORS for all routes (important for React frontend access)
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Initialize Database
    init_db()

    # Register Blueprints with the /api URL prefix
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(expenses_bp, url_prefix='/api')
    app.register_blueprint(savings_bp, url_prefix='/api')
    app.register_blueprint(ai_bp, url_prefix='/api')

    @app.route('/')
    def home():
        return jsonify({
            "status": "online",
            "message": "AI Smart Expense Tracker & Savings Planner API is active!",
            "endpoints": {
                "auth": ["/api/register", "/api/login"],
                "expenses": ["/api/expenses", "/api/add-expense", "/api/update-expense/<id>", "/api/delete-expense/<id>"],
                "savings": ["/api/goals", "/api/add-goal", "/api/update-goal/<id>", "/api/delete-goal/<id>"],
                "ai": ["/api/ai/analyze", "/api/ai/predict"]
            }
        }), 200

    @app.route('/api/health', methods=['GET'])
    def health():
        return jsonify({"status": "healthy", "database": "connected"}), 200

    return app

app = create_app()

if __name__ == '__main__':
    # Start development server
    app.run(host='0.0.0.0', port=Config.PORT, debug=Config.DEBUG)
