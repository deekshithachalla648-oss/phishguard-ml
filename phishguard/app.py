"""
PhishGuard - Machine Learning-Based Phishing Message Detection System
Flask Backend Server & API
"""

import os
import re
import sqlite3
import joblib
from datetime import datetime
from flask import Flask, request, jsonify, render_template

app = Flask(__name__, template_folder='templates', static_folder='static')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'models', 'classifier.joblib')
VECTORIZER_PATH = os.path.join(BASE_DIR, 'models', 'tfidf_vectorizer.joblib')
DB_PATH = os.path.join(BASE_DIR, 'phishguard.db')
MAX_MESSAGE_LENGTH = 10000

vectorizer = None
classifier = None

def load_artifacts():
    global vectorizer, classifier
    try:
        if os.path.exists(MODEL_PATH) and os.path.exists(VECTORIZER_PATH):
            vectorizer = joblib.load(VECTORIZER_PATH)
            classifier = joblib.load(MODEL_PATH)
            print("[INFO] Model and vectorizer artifacts loaded successfully.")
        else:
            print("[WARNING] Model artifacts not found. Run 'python train_model.py' to generate them.")
    except Exception as e:
        print(f"[ERROR] Failed to load model artifacts: {e}")

def init_db():
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                message TEXT NOT NULL,
                prediction TEXT NOT NULL,
                confidence REAL NOT NULL,
                risk_level TEXT NOT NULL,
                indicators_count INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"[ERROR] Database initialization failed: {e}")

URL_REGEX = re.compile(r'(?:https?://|www\.)[^\s<>"\'{}|\\^`[\]]+', re.IGNORECASE)
KNOWN_SHORTENERS = {'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'is.gd', 'cutt.ly', 'rb.gy'}
SUSPICIOUS_TLDS = {'.xyz', '.top', '.buzz', '.click', '.cam', '.work', '.gq', '.tk'}

def check_rule_indicators(text):
    indicators = []
    lower_text = text.lower()

    if re.search(r'\b(within (24|12|48|2|1) (hours?|hrs?)|immediate(ly)? action|account (will be|has been) (suspended|terminated|locked))\b', lower_text):
        indicators.append({
            'category': 'urgency',
            'title': 'Artificial Urgency & Threat of Suspension',
            'severity': 'danger',
            'description': 'Relies on tight deadlines or threats of immediate suspension to rush the victim into clicking.'
        })

    if re.search(r'\b(password|pin|passcode|one-time password|otp|verification code|ssn)\b', lower_text) and \
       re.search(r'\b(enter|verify|provide|confirm|send|share|reply)\b', lower_text):
        indicators.append({
            'category': 'credentials',
            'title': 'Request for Passwords or Verification Codes',
            'severity': 'danger',
            'description': 'Directly asks for credentials or 2FA codes. Legitimate organizations never request sensitive codes via email/SMS.'
        })

    if re.search(r'\b(update|confirm|verify)\b.{0,30}\b(billing|banking|credit card|identity|profile)\b', lower_text):
        indicators.append({
            'category': 'account',
            'title': 'Account Verification / Financial Demand',
            'severity': 'warning',
            'description': 'Prompts recipient to confirm or update financial/account information.'
        })

    urls = URL_REGEX.findall(text)
    for raw_url in urls:
        clean_url = raw_url.lower()
        for shortener in KNOWN_SHORTENERS:
            if shortener in clean_url:
                indicators.append({
                    'category': 'url',
                    'title': f'Obfuscated URL Shortener ({shortener})',
                    'severity': 'danger',
                    'description': 'Shortened links mask the destination server, preventing inspection prior to clicking.'
                })
                break
        
        if re.search(r'https?://(?:\d{1,3}\.){3}\d{1,3}', clean_url):
            indicators.append({
                'category': 'url',
                'title': 'Direct Numeric IP Address in Link',
                'severity': 'danger',
                'description': 'Uses a raw IP address instead of a registered domain, frequently indicative of phishing hosting.'
            })

        for tld in SUSPICIOUS_TLDS:
            if tld in clean_url:
                indicators.append({
                    'category': 'url',
                    'title': f'Unusual Top-Level Domain ({tld})',
                    'severity': 'warning',
                    'description': 'Uses a top-level domain often associated with automated spam campaigns.'
                })
                break

    return indicators

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'model_loaded': classifier is not None and vectorizer is not None,
        'database': os.path.exists(DB_PATH),
        'timestamp': datetime.utcnow().isoformat()
    }), 200

@app.route('/api/analyze', methods=['POST'])
def analyze_message():
    if not request.is_json:
        return jsonify({'error': 'Invalid request: Content-Type must be application/json'}), 400

    data = request.get_json()
    message = data.get('message', '')

    if not isinstance(message, str):
        return jsonify({'error': 'Field "message" must be a string'}), 400

    trimmed = message.strip()
    if len(trimmed) == 0:
        return jsonify({'error': 'Message cannot be empty. Please enter an email or SMS to analyze.'}), 400

    if len(trimmed) > MAX_MESSAGE_LENGTH:
        return jsonify({'error': f'Message exceeds maximum allowed length of {MAX_MESSAGE_LENGTH} characters'}), 400

    rule_indicators = check_rule_indicators(trimmed)

    if classifier is not None and vectorizer is not None:
        try:
            vectorized = vectorizer.transform([trimmed])
            pred_class = classifier.predict(vectorized)[0]
            proba = float(classifier.predict_proba(vectorized)[0][1])
            prediction = 'Potentially Phishing' if pred_class == 1 else 'Likely Legitimate'
            confidence = round(proba * 100, 1)
        except Exception as e:
            return jsonify({'error': f'ML classification inference failed: {str(e)}'}), 500
    else:
        has_danger = any(ind['severity'] == 'danger' for ind in rule_indicators)
        prediction = 'Potentially Phishing' if has_danger else 'Likely Legitimate'
        confidence = 85.0 if has_danger else 20.0
        proba = confidence / 100.0

    if prediction == 'Potentially Phishing' or any(ind['severity'] == 'danger' for ind in rule_indicators):
        risk_level = 'High'
    elif len(rule_indicators) > 0:
        risk_level = 'Medium'
    else:
        risk_level = 'Low'

    response_payload = {
        'prediction': prediction,
        'confidence_score': confidence,
        'model_probability': proba,
        'risk_level': risk_level,
        'rule_indicators': rule_indicators,
        'indicators_count': len(rule_indicators),
        'character_count': len(trimmed),
        'disclaimer': (
            'NOTICE: This prediction is generated by statistical machine learning and rule heuristics. '
            'It is NOT a guarantee of safety. Attackers continually adapt text, and text-only inspection '
            'cannot confirm that an email or SMS is genuinely authentic.'
        )
    }

    return jsonify(response_payload), 200

@app.route('/api/history', methods=['GET', 'POST', 'DELETE'])
def manage_history():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    if request.method == 'GET':
        cursor.execute('SELECT id, message, prediction, confidence, risk_level, indicators_count, created_at FROM history ORDER BY id DESC LIMIT 50')
        rows = cursor.fetchall()
        conn.close()
        items = [{
            'id': r[0],
            'message': r[1],
            'prediction': r[2],
            'confidence': r[3],
            'risk_level': r[4],
            'indicators_count': r[5],
            'created_at': r[6]
        } for r in rows]
        return jsonify({'history': items}), 200

    elif request.method == 'POST':
        data = request.get_json() or {}
        cursor.execute(
            'INSERT INTO history (message, prediction, confidence, risk_level, indicators_count) VALUES (?, ?, ?, ?, ?)',
            (data.get('message', '')[:500], data.get('prediction', ''), data.get('confidence', 0), data.get('risk_level', ''), data.get('indicators_count', 0))
        )
        conn.commit()
        last_id = cursor.lastrowid
        conn.close()
        return jsonify({'success': True, 'saved_id': last_id}), 201

    elif request.method == 'DELETE':
        cursor.execute('DELETE FROM history')
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': 'History cleared successfully'}), 200

if __name__ == '__main__':
    init_db()
    load_artifacts()
    print("[INFO] Starting PhishGuard Flask server on http://127.0.0.1:5000 ...")
    app.run(host='127.0.0.1', port=5000, debug=True)
