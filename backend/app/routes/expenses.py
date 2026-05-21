from flask import Blueprint, request, jsonify

from app.utils.db import get_db

from app.utils.auth_middleware import token_required

from bson import ObjectId

import datetime

expenses_bp = Blueprint('expenses', __name__)

VALID_CATEGORIES = {"Food", "Travel", "Shopping", "Bills", "Entertainment", "Health", "Education"}

@expenses_bp.route('/expenses', methods=['GET'])

@token_required

def get_expenses(current_user_id):

    try:

        db = get_db()

        if db is None:

            return jsonify({"error": "Database connection unavailable"}), 500

        query = {"user_id": ObjectId(current_user_id)}

        search_query = request.args.get('search', '').strip()

        if search_query:

            query["$or"] = [

                {"title": {"$regex": search_query, "$options": "i"}},

                {"description": {"$regex": search_query, "$options": "i"}}

            ]

        category_filter = request.args.get('category', '').strip()

        if category_filter and category_filter != "All":

            query["category"] = category_filter

        start_date_str = request.args.get('start_date', '').strip()

        end_date_str = request.args.get('end_date', '').strip()

        if start_date_str or end_date_str:

            date_filter = {}

            if start_date_str:

                try:

                    start_date = datetime.datetime.strptime(start_date_str, "%Y-%m-%d")

                    date_filter["$gte"] = start_date

                except ValueError:

                    return jsonify({"error": "Invalid start_date format, must be YYYY-MM-DD"}), 400

            if end_date_str:

                try:

                    end_date = datetime.datetime.strptime(end_date_str, "%Y-%m-%d") + datetime.timedelta(days=1) - datetime.timedelta(seconds=1)

                    date_filter["$lte"] = end_date

                except ValueError:

                    return jsonify({"error": "Invalid end_date format, must be YYYY-MM-DD"}), 400

            query["date"] = date_filter

        expenses_cursor = db.expenses.find(query).sort("date", -1)

        expenses_list = []

        for exp in expenses_cursor:

            expenses_list.append({

                "id": str(exp["_id"]),

                "title": exp["title"],

                "amount": exp["amount"],

                "category": exp["category"],

                "description": exp.get("description", ""),

                "date": exp["date"].strftime("%Y-%m-%d") if isinstance(exp["date"], datetime.datetime) else exp["date"],

                "user_id": str(exp["user_id"])

            })

        return jsonify(expenses_list), 200

    except Exception as e:

        print(f"Error in get_expenses: {str(e)}")

        return jsonify({"error": "An internal server error occurred"}), 500

@expenses_bp.route('/add-expense', methods=['POST'])

@token_required

def add_expense(current_user_id):

    try:

        data = request.get_json()

        if not data:

            return jsonify({"error": "No data provided"}), 400

        title = data.get('title', '').strip()

        amount_val = data.get('amount')

        category = data.get('category', '').strip()

        description = data.get('description', '').strip()

        date_str = data.get('date', '').strip()

        if not title or amount_val is None or not category or not date_str:

            return jsonify({"error": "Fields (title, amount, category, date) are required"}), 400

        try:

            amount = float(amount_val)

            if amount <= 0:

                return jsonify({"error": "Amount must be greater than zero"}), 400

        except ValueError:

            return jsonify({"error": "Amount must be a numeric value"}), 400

        if category not in VALID_CATEGORIES:

            return jsonify({"error": f"Invalid category. Must be one of: {', '.join(VALID_CATEGORIES)}"}), 400

        try:

            expense_date = datetime.datetime.strptime(date_str, "%Y-%m-%d")

        except ValueError:

            try:

                expense_date = datetime.datetime.fromisoformat(date_str.replace('Z', '+00:00'))

            except ValueError:

                return jsonify({"error": "Invalid date format. Please use YYYY-MM-DD"}), 400

        db = get_db()

        if db is None:

            return jsonify({"error": "Database connection unavailable"}), 500

        new_expense = {

            "title": title,

            "amount": amount,

            "category": category,

            "description": description,

            "date": expense_date,

            "user_id": ObjectId(current_user_id)

        }

        result = db.expenses.insert_one(new_expense)

        return jsonify({

            "message": "Expense added successfully!",

            "expense": {

                "id": str(result.inserted_id),

                "title": title,

                "amount": amount,

                "category": category,

                "description": description,

                "date": expense_date.strftime("%Y-%m-%d"),

                "user_id": current_user_id

            }

        }), 201

    except Exception as e:

        print(f"Error in add_expense: {str(e)}")

        return jsonify({"error": "An internal server error occurred"}), 500

@expenses_bp.route('/update-expense/<id>', methods=['PUT'])

@token_required

def update_expense(current_user_id, id):

    try:

        data = request.get_json()

        if not data:

            return jsonify({"error": "No data provided"}), 400

        db = get_db()

        if db is None:

            return jsonify({"error": "Database connection unavailable"}), 500

        try:

            expense_id = ObjectId(id)

        except Exception:

            return jsonify({"error": "Invalid expense ID format"}), 400

        expense = db.expenses.find_one({"_id": expense_id, "user_id": ObjectId(current_user_id)})

        if not expense:

            return jsonify({"error": "Expense not found or unauthorized to edit"}), 404

        updates = {}

        if 'title' in data:

            updates['title'] = data['title'].strip()

            if not updates['title']:

                return jsonify({"error": "Title cannot be empty"}), 400

        if 'amount' in data:

            try:

                updates['amount'] = float(data['amount'])

                if updates['amount'] <= 0:

                    return jsonify({"error": "Amount must be greater than zero"}), 400

            except ValueError:

                return jsonify({"error": "Amount must be a numeric value"}), 400

        if 'category' in data:

            updates['category'] = data['category'].strip()

            if updates['category'] not in VALID_CATEGORIES:

                return jsonify({"error": f"Invalid category. Must be one of: {', '.join(VALID_CATEGORIES)}"}), 400

        if 'description' in data:

            updates['description'] = data['description'].strip()

        if 'date' in data:

            date_str = data['date'].strip()

            try:

                updates['date'] = datetime.datetime.strptime(date_str, "%Y-%m-%d")

            except ValueError:

                try:

                    updates['date'] = datetime.datetime.fromisoformat(date_str.replace('Z', '+00:00'))

                except ValueError:

                    return jsonify({"error": "Invalid date format. Please use YYYY-MM-DD"}), 400

        if not updates:

            return jsonify({"message": "No changes were specified"}), 200

        db.expenses.update_one({"_id": expense_id}, {"$set": updates})

        updated_expense = db.expenses.find_one({"_id": expense_id})

        return jsonify({

            "message": "Expense updated successfully!",

            "expense": {

                "id": str(updated_expense["_id"]),

                "title": updated_expense["title"],

                "amount": updated_expense["amount"],

                "category": updated_expense["category"],

                "description": updated_expense.get("description", ""),

                "date": updated_expense["date"].strftime("%Y-%m-%d") if isinstance(updated_expense["date"], datetime.datetime) else updated_expense["date"],

                "user_id": str(updated_expense["user_id"])

            }

        }), 200

    except Exception as e:

        print(f"Error in update_expense: {str(e)}")

        return jsonify({"error": "An internal server error occurred"}), 500

@expenses_bp.route('/delete-expense/<id>', methods=['DELETE'])

@token_required

def delete_expense(current_user_id, id):

    try:

        db = get_db()

        if db is None:

            return jsonify({"error": "Database connection unavailable"}), 500

        try:

            expense_id = ObjectId(id)

        except Exception:

            return jsonify({"error": "Invalid expense ID format"}), 400

        result = db.expenses.delete_one({"_id": expense_id, "user_id": ObjectId(current_user_id)})

        if result.deleted_count == 0:

            return jsonify({"error": "Expense not found or unauthorized to delete"}), 404

        return jsonify({"message": "Expense deleted successfully!"}), 200

    except Exception as e:

        print(f"Error in delete_expense: {str(e)}")

        return jsonify({"error": "An internal server error occurred"}), 500

