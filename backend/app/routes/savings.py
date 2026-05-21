from flask import Blueprint, request, jsonify
from app.utils.db import get_db
from app.utils.auth_middleware import token_required
from bson import ObjectId
import datetime

savings_bp = Blueprint('savings', __name__)

@savings_bp.route('/goals', methods=['GET'])
@token_required
def get_goals(current_user_id):
    try:
        db = get_db()
        if db is None:
            return jsonify({"error": "Database connection unavailable"}), 500

        goals_cursor = db.savings.find({"user_id": ObjectId(current_user_id)}).sort("deadline", 1)
        goals_list = []

        for goal in goals_cursor:
            # Parse dates
            deadline_str = goal["deadline"].strftime("%Y-%m-%d") if isinstance(goal["deadline"], datetime.datetime) else goal["deadline"]
            
            # Calculations for remaining details
            target = float(goal["target_amount"])
            saved = float(goal["saved_amount"])
            progress_percent = round((saved / target) * 100, 2) if target > 0 else 0.0
            progress_percent = min(100.0, max(0.0, progress_percent))  # Cap between 0 and 100

            # Calculate months remaining to estimate monthly saving needed
            months_remaining = 1.0
            if isinstance(goal["deadline"], datetime.datetime):
                today = datetime.datetime.utcnow()
                delta = goal["deadline"] - today
                days = delta.days
                if days > 0:
                    months_remaining = max(1.0, round(days / 30.44, 1))

            remaining_amount = max(0.0, target - saved)
            suggested_monthly_saving = round(remaining_amount / months_remaining, 2)

            goals_list.append({
                "id": str(goal["_id"]),
                "goal_name": goal["goal_name"],
                "target_amount": target,
                "saved_amount": saved,
                "deadline": deadline_str,
                "progress_percent": progress_percent,
                "suggested_monthly_saving": suggested_monthly_saving,
                "months_remaining": months_remaining,
                "user_id": str(goal["user_id"])
            })

        return jsonify(goals_list), 200

    except Exception as e:
        print(f"Error in get_goals: {str(e)}")
        return jsonify({"error": "An internal server error occurred"}), 500


@savings_bp.route('/add-goal', methods=['POST'])
@token_required
def add_goal(current_user_id):
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        goal_name = data.get('goal_name', '').strip()
        target_amount_val = data.get('target_amount')
        saved_amount_val = data.get('saved_amount', 0.0)
        deadline_str = data.get('deadline', '').strip()

        if not goal_name or target_amount_val is None or not deadline_str:
            return jsonify({"error": "Fields (goal_name, target_amount, deadline) are required"}), 400

        try:
            target_amount = float(target_amount_val)
            if target_amount <= 0:
                return jsonify({"error": "Target amount must be greater than zero"}), 400
        except ValueError:
            return jsonify({"error": "Target amount must be a numeric value"}), 400

        try:
            saved_amount = float(saved_amount_val)
            if saved_amount < 0:
                return jsonify({"error": "Saved amount cannot be negative"}), 400
        except ValueError:
            return jsonify({"error": "Saved amount must be a numeric value"}), 400

        try:
            deadline = datetime.datetime.strptime(deadline_str, "%Y-%m-%d")
        except ValueError:
            return jsonify({"error": "Invalid deadline format. Please use YYYY-MM-DD"}), 400

        db = get_db()
        if db is None:
            return jsonify({"error": "Database connection unavailable"}), 500

        new_goal = {
            "goal_name": goal_name,
            "target_amount": target_amount,
            "saved_amount": saved_amount,
            "deadline": deadline,
            "user_id": ObjectId(current_user_id)
        }

        result = db.savings.insert_one(new_goal)

        return jsonify({
            "message": "Savings goal created successfully!",
            "goal": {
                "id": str(result.inserted_id),
                "goal_name": goal_name,
                "target_amount": target_amount,
                "saved_amount": saved_amount,
                "deadline": deadline.strftime("%Y-%m-%d"),
                "user_id": current_user_id
            }
        }), 201

    except Exception as e:
        print(f"Error in add_goal: {str(e)}")
        return jsonify({"error": "An internal server error occurred"}), 500


@savings_bp.route('/update-goal/<id>', methods=['PUT'])
@token_required
def update_goal(current_user_id, id):
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        db = get_db()
        if db is None:
            return jsonify({"error": "Database connection unavailable"}), 500

        try:
            goal_id = ObjectId(id)
        except Exception:
            return jsonify({"error": "Invalid goal ID format"}), 400

        # Retrieve goal to check ownership
        goal = db.savings.find_one({"_id": goal_id, "user_id": ObjectId(current_user_id)})
        if not goal:
            return jsonify({"error": "Savings goal not found or unauthorized"}), 404

        updates = {}

        if 'goal_name' in data:
            updates['goal_name'] = data['goal_name'].strip()
            if not updates['goal_name']:
                return jsonify({"error": "Goal name cannot be empty"}), 400

        if 'target_amount' in data:
            try:
                updates['target_amount'] = float(data['target_amount'])
                if updates['target_amount'] <= 0:
                    return jsonify({"error": "Target amount must be greater than zero"}), 400
            except ValueError:
                return jsonify({"error": "Target amount must be a numeric value"}), 400

        if 'saved_amount' in data:
            try:
                updates['saved_amount'] = float(data['saved_amount'])
                if updates['saved_amount'] < 0:
                    return jsonify({"error": "Saved amount cannot be negative"}), 400
            except ValueError:
                return jsonify({"error": "Saved amount must be a numeric value"}), 400

        if 'deadline' in data:
            deadline_str = data['deadline'].strip()
            try:
                updates['deadline'] = datetime.datetime.strptime(deadline_str, "%Y-%m-%d")
            except ValueError:
                return jsonify({"error": "Invalid deadline format. Please use YYYY-MM-DD"}), 400

        if not updates:
            return jsonify({"message": "No changes were specified"}), 200

        db.savings.update_one({"_id": goal_id}, {"$set": updates})

        # Fetch updated goal
        updated_goal = db.savings.find_one({"_id": goal_id})
        
        return jsonify({
            "message": "Savings goal updated successfully!",
            "goal": {
                "id": str(updated_goal["_id"]),
                "goal_name": updated_goal["goal_name"],
                "target_amount": updated_goal["target_amount"],
                "saved_amount": updated_goal["saved_amount"],
                "deadline": updated_goal["deadline"].strftime("%Y-%m-%d"),
                "user_id": str(updated_goal["user_id"])
            }
        }), 200

    except Exception as e:
        print(f"Error in update_goal: {str(e)}")
        return jsonify({"error": "An internal server error occurred"}), 500


@savings_bp.route('/delete-goal/<id>', methods=['DELETE'])
@token_required
def delete_goal(current_user_id, id):
    try:
        db = get_db()
        if db is None:
            return jsonify({"error": "Database connection unavailable"}), 500

        try:
            goal_id = ObjectId(id)
        except Exception:
            return jsonify({"error": "Invalid goal ID format"}), 400

        result = db.savings.delete_one({"_id": goal_id, "user_id": ObjectId(current_user_id)})
        
        if result.deleted_count == 0:
            return jsonify({"error": "Savings goal not found or unauthorized to delete"}), 404

        return jsonify({"message": "Savings goal deleted successfully!"}), 200

    except Exception as e:
        print(f"Error in delete_goal: {str(e)}")
        return jsonify({"error": "An internal server error occurred"}), 500
