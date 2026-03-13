import os
import json
from datetime import datetime
from flask import Flask, render_template, request, jsonify, session, redirect, url_for

app = Flask(__name__)
app.secret_key = 'manaidekhi_secured_demo'
ADMIN_PASSWORD = 'password123'
PORT = 5090
DATA_FILE = 'database.json'

def load_data():
    if not os.path.exists(DATA_FILE):
        return {"orders": [], "inquiries": []}
    with open(DATA_FILE, 'r') as f:
        return json.load(f)

def save_data(data):
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=4)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        if request.form.get('password') == ADMIN_PASSWORD:
            session['logged_in'] = True
            return redirect(url_for('admin'))
        else:
            return render_template('login.html', error="Invalid password")
    return render_template('login.html')

@app.route('/admin')
def admin():
    if not session.get('logged_in'):
        return redirect(url_for('login'))
    return render_template('admin.html')

@app.route('/api/data', methods=['GET'])
def get_data():
    if not session.get('logged_in'):
        return jsonify({"error": "Unauthorized"}), 401
    return jsonify(load_data())

@app.route('/api/order', methods=['POST'])
def submit_order():
    data = load_data()
    order = request.json
    order['id'] = str(datetime.now().timestamp())
    order['status'] = 'Pending'
    order['date'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    data['orders'].append(order)
    save_data(data)
    return jsonify({"success": True, "message": "Order submitted successfully"})

@app.route('/api/inquiry', methods=['POST'])
def submit_inquiry():
    data = load_data()
    inq = request.json
    inq['id'] = str(datetime.now().timestamp())
    inq['date'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    data['inquiries'].append(inq)
    save_data(data)
    return jsonify({"success": True, "message": "Inquiry submitted successfully"})

@app.route('/api/orders/<order_id>/status', methods=['POST'])
def update_status(order_id):
    if not session.get('logged_in'):
        return jsonify({"error": "Unauthorized"}), 401
    data = load_data()
    req = request.json
    for order in data['orders']:
        if order['id'] == order_id:
            order['status'] = req.get('status', order['status'])
            break
    save_data(data)
    return jsonify({"success": True})

if __name__ == '__main__':
    app.run(debug=False, port=PORT, host='0.0.0.0')
