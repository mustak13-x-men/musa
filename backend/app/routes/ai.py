from flask import Blueprint, request, jsonify

from app.utils.db import get_db

from app.utils.auth_middleware import token_required

from app.config.config import Config

from bson import ObjectId

import datetime

import json

ai_bp = Blueprint('ai', __name__)

DEFAULT_TIPS = [

    "Reduce food delivery spending by 10% this month.",

    "Your travel expenses increased slightly. Consider carpooling or public transport.",

    "You can save ₹3000 / $50 monthly by reducing non-essential shopping.",

    "Pay your credit card bills early to avoid compound interest rates.",

    "Track subscription renewals and cancel services you haven't used in 30 days."

]

def get_rule_based_analysis(expenses, goals):

    total_spent = sum(exp["amount"] for exp in expenses)

    category_totals = {}

    for exp in expenses:

        cat = exp["category"]

        category_totals[cat] = category_totals.get(cat, 0) + exp["amount"]

    sorted_categories = sorted(category_totals.items(), key=lambda x: x[1], reverse=True)

    insights = []

    overspending_warnings = []

    if total_spent == 0:

        return {

            "insights": [

                "Welcome to AI Coach! Start adding your expenses to unlock personalized budgeting reviews.",

                "Create a savings goal in the Savings Planner to outline your financial milestones."

            ],

            "warnings": [],

            "suggestions": [

                "Add your first expense (e.g., Groceries or Internet Bill) to trigger the analysis engine.",

                "Build a starter emergency fund target of $1,000."

            ],

            "source": "Rule Engine (No transaction history)"

        }

    top_cat, top_amount = sorted_categories[0]

    top_pct = round((top_amount / total_spent) * 100, 1)

    insights.append(f"Your largest spending category is '{top_cat}' at {top_pct}% of total expenses (spent {top_amount:.2f}).")

    if top_pct > 35:

        overspending_warnings.append(f"High concentration of expense in {top_cat}! It consumes over 35% of your total budget. Consider trimming discretionary items.")

    if top_cat == "Shopping" or top_cat == "Entertainment":

        insights.append(f"Discretionary spending in '{top_cat}' represents a major portion of your cash outflow. Trimming this category by 15% would save you significant money.")

    elif top_cat == "Food":

        insights.append("Food expenses are high. Consider planning meals weekly and reducing restaurant or takeaway orders.")

    bills_amount = category_totals.get("Bills", 0)

    if bills_amount > 0:

        insights.append(f"You spent {bills_amount:.2f} on Bills. Audit your active utilities and subscriptions annually to secure competitive rates.")

    goals_completed = 0

    for goal in goals:

        if goal.get("progress_percent", 0) >= 100:

            goals_completed += 1

    if goals_completed > 0:

        insights.append(f"Outstanding work! You have fully achieved {goals_completed} of your savings goals. Keep maintaining this habit.")

    elif len(goals) > 0:

        active_goal = goals[0]

        insights.append(f"Focus on your active goal '{active_goal['goal_name']}'. You have saved {active_goal['saved_amount']:.2f} of your {active_goal['target_amount']:.2f} goal ({active_goal['progress_percent']}% completed).")

    suggestions = [

        f"Try setting a weekly limit of {(total_spent / 4) * 0.9:.2f} to reduce your current monthly spending velocity by 10%.",

        f"Automate at least 15% of your income into savings on payday before making discretionary purchases."

    ]

    if category_totals.get("Shopping", 0) > 0:

        suggestions.append(f"Establish a 48-hour cooling-off rule on all Shopping items to decrease impulse purchases by up to 20%.")

    if category_totals.get("Travel", 0) > 0:

        suggestions.append(f"Consider pre-booking travel passes or using shared mobility providers to save on Travel.")

    return {

        "insights": insights,

        "warnings": overspending_warnings,

        "suggestions": suggestions,

        "source": "Local Rule-Based Analysis Engine (Offline)"

    }

@ai_bp.route('/ai/analyze', methods=['POST'])

@token_required

def analyze_expenses(current_user_id):

    try:

        db = get_db()

        if db is None:

            return jsonify({"error": "Database connection unavailable"}), 500

        expenses_cursor = db.expenses.find({"user_id": ObjectId(current_user_id)})

        expenses = []

        for exp in expenses_cursor:

            expenses.append({

                "title": exp["title"],

                "amount": exp["amount"],

                "category": exp["category"],

                "description": exp.get("description", ""),

                "date": exp["date"].strftime("%Y-%m-%d") if isinstance(exp["date"], datetime.datetime) else str(exp["date"])

            })

        goals_cursor = db.savings.find({"user_id": ObjectId(current_user_id)})

        goals = []

        for goal in goals_cursor:

            target = float(goal["target_amount"])

            saved = float(goal["saved_amount"])

            progress_percent = round((saved / target) * 100, 2) if target > 0 else 0.0

            goals.append({

                "goal_name": goal["goal_name"],

                "target_amount": target,

                "saved_amount": saved,

                "progress_percent": progress_percent

            })

        if Config.OPENAI_API_KEY and Config.OPENAI_API_KEY.strip() != "":

            try:

                from openai import OpenAI

                client = OpenAI(api_key=Config.OPENAI_API_KEY)

                prompt = (

                    f"Perform a comprehensive financial review of the user's spending habits. "

                    f"Provide response in strict JSON format containing keys: 'insights' (list of strings), "

                    f"'warnings' (list of strings representing overspending alerts), and 'suggestions' (list of action items to save cash).\n"

                    f"Ensure recommendations are direct, realistic, and contain exact numbers or tips based on these transactions.\n\n"

                    f"DATA SUMMARY:\n"

                    f"- Recent Transactions: {json.dumps(expenses[-15:])}\n"

                    f"- Savings Milestones: {json.dumps(goals)}\n"

                    f"- Total Categories Traded: {len(set(e['category'] for e in expenses))}\n"

                    f"- Overall Expenses Spent: {sum(e['amount'] for e in expenses)}\n"

                )

                response = client.chat.completions.create(

                    model="gpt-3.5-turbo",

                    messages=[

                        {"role": "system", "content": "You are a professional financial coach and smart budgeting advisor. You output your reports as neat JSON payloads."},

                        {"role": "user", "content": prompt}

                    ],

                    response_format={"type": "json_object"},

                    timeout=10.0

                )

                ai_content = response.choices[0].message.content

                ai_payload = json.loads(ai_content)

                ai_payload["source"] = "OpenAI GPT-3.5"

                return jsonify(ai_payload), 200

            except Exception as openai_err:

                print(f"OpenAI analysis call failed: {openai_err}. Falling back to Rule-Engine.")

        analysis = get_rule_based_analysis(expenses, goals)

        return jsonify(analysis), 200

    except Exception as e:

        print(f"Error in analyze_expenses: {str(e)}")

        return jsonify({"error": "An internal server error occurred"}), 500

@ai_bp.route('/ai/predict', methods=['POST'])

@token_required

def predict_spending(current_user_id):

    try:

        db = get_db()

        if db is None:

            return jsonify({"error": "Database connection unavailable"}), 500

        expenses_cursor = db.expenses.find({"user_id": ObjectId(current_user_id)})

        expenses = []

        for exp in expenses_cursor:

            expenses.append({

                "amount": exp["amount"],

                "category": exp["category"],

                "date": exp["date"] if isinstance(exp["date"], datetime.datetime) else datetime.datetime.fromisoformat(str(exp["date"]))

            })

        if not expenses:

            return jsonify({

                "prediction": 0.0,

                "confidence": "low",

                "explanation": "No expenses available to calculate projections.",

                "category_forecast": {}

            }), 200

        monthly_spending = {}

        for exp in expenses:

            ym = exp["date"].strftime("%Y-%m")

            monthly_spending[ym] = monthly_spending.get(ym, 0) + exp["amount"]

        num_months = len(monthly_spending)

        total_spent = sum(exp["amount"] for exp in expenses)

        avg_monthly = total_spent / max(1, num_months)

        category_sums = {}

        for exp in expenses:

            cat = exp["category"]

            category_sums[cat] = category_sums.get(cat, 0) + exp["amount"]

        category_forecast = {}

        for cat, amt in category_sums.items():

            category_forecast[cat] = round(amt / max(1, num_months), 2)

        if Config.OPENAI_API_KEY and Config.OPENAI_API_KEY.strip() != "":

            try:

                from openai import OpenAI

                client = OpenAI(api_key=Config.OPENAI_API_KEY)

                prompt = (

                    f"Based on the monthly spending trend: {json.dumps(list(monthly_spending.items()))} "

                    f"and category aggregates: {json.dumps(list(category_sums.items()))}, predict next month's spending.\n"

                    f"Provide response in strict JSON format with keys: 'prediction' (float value representing next month's total prediction), "

                    f"'confidence' (string: low, medium, high), 'explanation' (brief explanation of the forecast), and "

                    f"'category_forecast' (JSON mapping of category names to forecasted float amounts)."

                )

                response = client.chat.completions.create(

                    model="gpt-3.5-turbo",

                    messages=[

                        {"role": "system", "content": "You are a smart financial forecasting model. Output your response as a strict JSON payload."},

                        {"role": "user", "content": prompt}

                    ],

                    response_format={"type": "json_object"},

                    timeout=10.0

                )

                ai_content = response.choices[0].message.content

                ai_payload = json.loads(ai_content)

                ai_payload["source"] = "OpenAI GPT-3.5 Projection"

                return jsonify(ai_payload), 200

            except Exception as openai_err:

                print(f"OpenAI prediction failed: {openai_err}. Falling back to statistical modeling.")

        confidence = "medium" if num_months >= 3 else "low"

        explanation = (

            f"Based on {num_months} months of registered expenditure trends, next month's expenses "

            f"are projected using your historical average spending of {avg_monthly:.2f}."

        )

        return jsonify({

            "prediction": round(avg_monthly, 2),

            "confidence": confidence,

            "explanation": explanation,

            "category_forecast": category_forecast,

            "source": "Local Statistical Forecaster (Offline)"

        }), 200

    except Exception as e:

        print(f"Error in predict_spending: {str(e)}")

        return jsonify({"error": "An internal server error occurred"}), 500

