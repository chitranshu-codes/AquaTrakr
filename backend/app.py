from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error

app = Flask(__name__)

# Define water usage data
water_usage_per_unit = {
    'Showering': 7.9,
    'Dishwashing': 15,
    'Laundry': 50,
    'Swimming': 50000,
    'Car Washing': 100,
    'Gardening': 20
}

# Simulated user activity data for baseline training
activities = list(water_usage_per_unit.keys())
data = []
for _ in range(100):
    activity = np.random.choice(activities)
    frequency = np.random.randint(1, 31)
    time_spent = np.random.randint(1, 120)
    water_used = water_usage_per_unit[activity] * (
        frequency if activity in ['Dishwashing', 'Laundry', 'Swimming', 'Car Washing'] else time_spent)
    data.append({
        'activity': activity,
        'time_spent': time_spent,
        'frequency': frequency,
        'water_used': water_used
    })

df = pd.DataFrame(data)

# Machine learning model setup
X = df[['time_spent', 'frequency']]
y = df['water_used']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
model = LinearRegression()
model.fit(X_train, y_train)

# Generate personalized tips
def generate_tips(user_data, total_usage):
    tips = []
    if user_data['Showering'] * 7.9 * 30 > 1000:
        tips.append("Reduce shower time by 2-3 minutes.")
    if user_data['Dishwashing'] > 2:
        tips.append("Use the dishwasher only when full.")
    if user_data['Laundry'] > 3:
        tips.append("Wash full loads only.")
    if user_data['Car Washing'] > 1:
        tips.append("Reduce car washing frequency.")
    if user_data['Gardening'] > 10:
        tips.append("Consider efficient irrigation.")
    return tips

# API endpoint for water usage analysis
@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    logs = data.get('logs', [])
    if not logs:
        return jsonify({"error": "No logs provided"}), 400

    # Calculate total water usage
    total_usage = sum(log['waterUsed'] for log in logs)

    # Generate tips
    user_data = {
        log['activityType']: log['waterUsed']
        for log in logs if log['activityType'] in water_usage_per_unit
    }
    tips = generate_tips(user_data, total_usage)

    return jsonify({
        "total_usage": total_usage,
        "tips": tips
    })

# API endpoint for generating tips
@app.route('/generate-tips', methods=['POST'])
def generate_tips_endpoint():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    total_usage = 0
    for activity, value in data.items():
        if activity in water_usage_per_unit:
            if activity in ['Showering', 'Dishwashing', 'Gardening']:
                total_usage += water_usage_per_unit[activity] * int(value) * 30
            elif activity in ['Laundry', 'Swimming', 'Car Washing']:
                total_usage += water_usage_per_unit[activity] * int(value)

    tips = generate_tips(data, total_usage)

    return jsonify({
        "tips": tips,
        "total_water_usage": total_usage
    })

if __name__ == '__main__':
    app.run(debug=True)
