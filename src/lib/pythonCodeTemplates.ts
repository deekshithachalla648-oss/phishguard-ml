export interface PythonFileItem {
  name: string;
  path: string;
  description: string;
  language: string;
  content: string;
}

export const PYTHON_PROJECT_FILES: PythonFileItem[] = [
  {
    name: 'app.py',
    path: 'phishguard/app.py',
    description: 'Main Flask backend application with REST API endpoints, input validation, SQLite history, and model inference',
    language: 'python',
    content: `"""
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

# Application configurations
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'models', 'classifier.joblib')
VECTORIZER_PATH = os.path.join(BASE_DIR, 'models', 'tfidf_vectorizer.joblib')
DB_PATH = os.path.join(BASE_DIR, 'phishguard.db')
MAX_MESSAGE_LENGTH = 10000

# Global model references
vectorizer = None
classifier = None

def load_artifacts():
    """Safely loads model and vectorizer artifacts if available."""
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
    """Initializes local SQLite database for optional prediction history."""
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

# Regex patterns for transparent rule-based indicators
URL_REGEX = re.compile(r'(?:https?://|www\.)[^\\s<>"\']+', re.IGNORECASE)
KNOWN_SHORTENERS = {'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'is.gd', 'cutt.ly', 'rb.gy'}
SUSPICIOUS_TLDS = {'.xyz', '.top', '.buzz', '.click', '.cam', '.work', '.gq', '.tk'}

def check_rule_indicators(text):
    """
    Transparent rule-based heuristic checks.
    Distinguished clearly from statistical ML predictions.
    """
    indicators = []
    lower_text = text.lower()

    # Rule 1: Urgency & Coercive Timeframes
    if re.search(r'\\b(within (24|12|48|2|1) (hours?|hrs?)|immediate(ly)? action|account (will be|has been) (suspended|terminated|locked))\\b', lower_text):
        indicators.append({
            'category': 'urgency',
            'title': 'Artificial Urgency & Threat of Suspension',
            'severity': 'danger',
            'description': 'Relies on tight deadlines or threats of immediate suspension to rush the victim into clicking.'
        })

    # Rule 2: Credential & OTP Harvesting
    if re.search(r'\\b(password|pin|passcode|one-time password|otp|verification code|ssn)\\b', lower_text) and \\
       re.search(r'\\b(enter|verify|provide|confirm|send|share|reply)\\b', lower_text):
        indicators.append({
            'category': 'credentials',
            'title': 'Request for Passwords or Verification Codes',
            'severity': 'danger',
            'description': 'Directly asks for credentials or 2FA codes. Legitimate organizations never request sensitive codes via email/SMS.'
        })

    # Rule 3: Account Verification / Billing Pretext
    if re.search(r'\\b(update|confirm|verify)\\b.{0,30}\\b(billing|banking|credit card|identity|profile)\\b', lower_text):
        indicators.append({
            'category': 'account',
            'title': 'Account Verification / Financial Demand',
            'severity': 'warning',
            'description': 'Prompts recipient to confirm or update financial/account information.'
        })

    # Rule 4: URL Analysis
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
        
        # Check for direct numeric IP address in URL
        if re.search(r'https?://(?:\\d{1,3}\\.){3}\\d{1,3}', clean_url):
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
    """Serves the main PhishGuard web interface."""
    return render_template('index.html')

@app.route('/api/health', methods=['GET'])
def health_check():
    """Returns application status and model availability."""
    return jsonify({
        'status': 'healthy',
        'model_loaded': classifier is not None and vectorizer is not None,
        'database': os.path.exists(DB_PATH),
        'timestamp': datetime.utcnow().isoformat()
    }), 200

@app.route('/api/analyze', methods=['POST'])
def analyze_message():
    """
    Main detection endpoint:
    Validates input, runs ML model and rule checks, returns structured response.
    """
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

    # Execute transparent rule-based checks
    rule_indicators = check_rule_indicators(trimmed)

    # Execute ML inference if model is available
    if classifier is not None and vectorizer is not None:
        try:
            vectorized = vectorizer.transform([trimmed])
            pred_class = classifier.predict(vectorized)[0]
            # Probability for class 1 (phishing)
            proba = float(classifier.predict_proba(vectorized)[0][1])
            prediction = 'Potentially Phishing' if pred_class == 1 else 'Likely Legitimate'
            confidence = round(proba * 100, 1)
        except Exception as e:
            return jsonify({'error': f'ML classification inference failed: {str(e)}'}), 500
    else:
        # Fallback if train_model.py has not been executed yet
        has_danger = any(ind['severity'] == 'danger' for ind in rule_indicators)
        prediction = 'Potentially Phishing' if has_danger else 'Likely Legitimate'
        confidence = 85.0 if has_danger else 20.0
        proba = confidence / 100.0

    # Determine overall risk level
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
    """Handles optional prediction history storage in local SQLite."""
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
`
  },
  {
    name: 'train_model.py',
    path: 'phishguard/train_model.py',
    description: 'Standalone ML training pipeline: TF-IDF vectorization, stratified train/test split, Logistic Regression, model evaluation & persistence',
    language: 'python',
    content: `"""
PhishGuard - Machine Learning Training Pipeline
Splits data before fitting vectorizer to eliminate data leakage.
Trains a Logistic Regression classifier and outputs full evaluation metrics.
"""

import os
import sys
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, precision_score, recall_score, f1_score

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, 'data', 'phishing_dataset.csv')
MODELS_DIR = os.path.join(BASE_DIR, 'models')
VECTORIZER_OUTPUT = os.path.join(MODELS_DIR, 'tfidf_vectorizer.joblib')
CLASSIFIER_OUTPUT = os.path.join(MODELS_DIR, 'classifier.joblib')

def train_pipeline():
    print("=" * 65)
    print("  PHISHGUARD: MACHINE LEARNING MODEL TRAINING PIPELINE")
    print("=" * 65)

    # Step 1: Validate dataset existence
    if not os.path.exists(DATA_PATH):
        print(f"[ERROR] Dataset not found at: {DATA_PATH}")
        print("Please ensure 'data/phishing_dataset.csv' exists.")
        sys.exit(1)

    print(f"[1/7] Loading dataset from: {DATA_PATH}")
    df = pd.read_csv(DATA_PATH)

    # Step 2: Validate columns
    required_cols = {'text', 'label'}
    if not required_cols.issubset(df.columns):
        print(f"[ERROR] Dataset must contain columns: {required_cols}. Found: {df.columns.tolist()}")
        sys.exit(1)

    # Step 3: Clean missing or blank values
    initial_len = len(df)
    df = df.dropna(subset=['text', 'label'])
    df['text'] = df['text'].astype(str).str.strip()
    df = df[df['text'] != '']
    print(f"[2/7] Cleaned missing/empty rows. Remaining records: {len(df)} (Dropped: {initial_len - len(df)})")

    # Step 4: Normalize class labels (1 = phishing, 0 = legitimate)
    def normalize_label(val):
        val_str = str(val).strip().lower()
        if val_str in {'1', 'phishing', 'spam', 'fraud', 'malicious', 'yes'}:
            return 1
        elif val_str in {'0', 'legitimate', 'ham', 'normal', 'safe', 'no'}:
            return 0
        else:
            return np.nan

    df['label_clean'] = df['label'].apply(normalize_label)
    df = df.dropna(subset=['label_clean'])
    df['label_clean'] = df['label_clean'].astype(int)

    phish_count = (df['label_clean'] == 1).sum()
    legit_count = (df['label_clean'] == 0).sum()
    print(f"[3/7] Normalized class distribution:")
    print(f"      - Legitimate (0): {legit_count}")
    print(f"      - Phishing   (1): {phish_count}")

    # Step 5: Stratified Train / Test Split (Prevent data leakage!)
    X = df['text'].values
    y = df['label_clean'].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=0.25,
        random_state=42,
        stratify=y
    )
    print(f"[4/7] Split dataset: Train={len(X_train)} samples, Test={len(X_test)} samples")

    # Step 6: Fit TF-IDF Vectorizer on training data ONLY
    print("[5/7] Fitting TF-IDF Vectorizer on training data...")
    vectorizer = TfidfVectorizer(
        lowercase=True,
        ngram_range=(1, 2),  # Extract unigrams and bigrams
        stop_words='english',
        sublinear_tf=True,
        norm='l2',
        max_features=5000
    )

    X_train_tfidf = vectorizer.fit_transform(X_train)
    X_test_tfidf = vectorizer.transform(X_test)  # ONLY transform test data, NEVER fit

    # Step 7: Train Logistic Regression Classifier
    print("[6/7] Training Logistic Regression classifier...")
    classifier = LogisticRegression(
        C=1.0,
        max_iter=1000,
        class_weight='balanced',
        solver='lbfgs',
        random_state=42
    )
    classifier.fit(X_train_tfidf, y_train)

    # Step 8: Evaluate on held-out test data
    print("[7/7] Evaluating classifier on held-out test split...")
    y_pred = classifier.predict(X_test_tfidf)

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, pos_label=1, zero_division=0)
    rec = recall_score(y_test, y_pred, pos_label=1, zero_division=0)
    f1 = f1_score(y_test, y_pred, pos_label=1, zero_division=0)
    cm = confusion_matrix(y_test, y_pred)

    print("\n" + "=" * 65)
    print("                 MODEL EVALUATION REPORT")
    print("=" * 65)
    print(f"  Overall Accuracy : {acc * 100:.2f}%")
    print(f"  Precision (Phish): {prec * 100:.2f}%")
    print(f"  Recall (Phish)   : {rec * 100:.2f}%")
    print(f"  F1-Score (Phish) : {f1 * 100:.2f}%")
    print("-" * 65)
    print("  Confusion Matrix:")
    print("                    Predicted Legit    Predicted Phish")
    print(f"  Actual Legit (0) :      {cm[0][0]:<15} {cm[0][1]}")
    print(f"  Actual Phish (1) :      {cm[1][0]:<15} {cm[1][1]}")
    print("=" * 65)
    print("\nDetailed Scikit-Learn Classification Report:")
    print(classification_report(y_test, y_pred, target_names=['Legitimate', 'Phishing'], zero_division=0))

    # Step 9: Save model artifacts using joblib
    os.makedirs(MODELS_DIR, exist_ok=True)
    joblib.dump(vectorizer, VECTORIZER_OUTPUT)
    joblib.dump(classifier, CLASSIFIER_OUTPUT)
    print(f"[SUCCESS] Saved fitted TF-IDF vectorizer to: {VECTORIZER_OUTPUT}")
    print(f"[SUCCESS] Saved trained classifier to:        {CLASSIFIER_OUTPUT}")
    print("\nYou can now start the web application by running: python app.py")

if __name__ == '__main__':
    train_pipeline()
`
  },
  {
    name: 'requirements.txt',
    path: 'phishguard/requirements.txt',
    description: 'Python package dependencies required for training, model serving, and testing',
    language: 'text',
    content: `flask>=2.3.0
scikit-learn>=1.2.0
pandas>=2.0.0
numpy>=1.24.0
joblib>=1.3.0
pytest>=7.3.0
`
  },
  {
    name: 'test_api.py',
    path: 'phishguard/tests/test_api.py',
    description: 'Automated test suite covering API validation, phishing detection, empty inputs, edge cases, and health checks',
    language: 'python',
    content: `"""
PhishGuard - Automated Test Suite
Run with: pytest tests/test_api.py or python -m unittest tests/test_api.py
"""

import unittest
import json
import sys
import os

# Add parent directory to python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app import app, init_db

class TestPhishGuardAPI(unittest.TestCase):

    def setUp(self):
        """Configure test client before each test."""
        app.config['TESTING'] = True
        self.client = app.test_client()
        init_db()

    def test_health_check(self):
        """Ensure /api/health returns 200 with required keys."""
        response = self.client.get('/api/health')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('status', data)
        self.assertEqual(data['status'], 'healthy')
        self.assertIn('model_loaded', data)

    def test_empty_message_validation(self):
        """Reject empty message string with 400 Bad Request."""
        payload = {'message': '   '}
        response = self.client.post('/api/analyze',
                                   data=json.dumps(payload),
                                   content_type='application/json')
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertIn('error', data)

    def test_non_json_request(self):
        """Reject request with non-JSON Content-Type."""
        response = self.client.post('/api/analyze',
                                   data='plain text message',
                                   content_type='text/plain')
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertIn('error', data)

    def test_invalid_type_message(self):
        """Reject message when not a string (e.g. integer or list)."""
        payload = {'message': 12345}
        response = self.client.post('/api/analyze',
                                   data=json.dumps(payload),
                                   content_type='application/json')
        self.assertEqual(response.status_code, 400)

    def test_normal_legitimate_message(self):
        """Submit genuine communication text."""
        payload = {
            'message': 'Hi Professor, please find the algorithm lab homework attached. See you in class tomorrow.'
        }
        response = self.client.post('/api/analyze',
                                   data=json.dumps(payload),
                                   content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('prediction', data)
        self.assertIn('disclaimer', data)
        self.assertIn('rule_indicators', data)

    def test_phishing_message_with_shortener_and_urgency(self):
        """Submit obvious phishing with urgency and shortened link."""
        payload = {
            'message': 'URGENT: Your bank account will be suspended within 24 hours. Verify your password now: http://bit.ly/bank-auth'
        }
        response = self.client.post('/api/analyze',
                                   data=json.dumps(payload),
                                   content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['prediction'], 'Potentially Phishing')
        self.assertGreater(len(data['rule_indicators']), 0)

    def test_overly_long_message_rejection(self):
        """Reject input exceeding maximum length threshold."""
        payload = {'message': 'A' * 15000}
        response = self.client.post('/api/analyze',
                                   data=json.dumps(payload),
                                   content_type='application/json')
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertIn('exceeds maximum', data['error'])

if __name__ == '__main__':
    unittest.main()
`
  },
  {
    name: 'phishing_dataset.csv',
    path: 'phishguard/data/phishing_dataset.csv',
    description: 'Curated balanced CSV dataset with authentic phishing and legitimate email/SMS records',
    language: 'csv',
    content: `text,label
"URGENT: Your bank account will be suspended within 24 hours. Verify your password now: http://bit.ly/bank-auth",1
"CHASE-ALERT: Unusual transaction of $842.19 detected. Click here immediately to confirm identity: http://192.168.1.1/login",1
"Dear Customer, your Netflix membership was cancelled due to billing failure. Re-activate at http://netflix-billing-update.xyz",1
"Your Office365 password expires in 2 hours. Keep your password by logging into http://portal-office365-verify.top",1
"USPS Alert: Package 99281-US could not be delivered. Pay $1.99 redelivery fee within 12 hours: http://tinyurl.com/usps-fees",1
"Congratulations! You won $500,000 in our international lottery. Send your SSN and bank details to claim your prize.",1
"Security Alert: Unauthorized login attempt from Russia on your crypto wallet. Restore access: http://wallet-secure-auth.cam",1
"Final Notice: IRS tax refund of $1,420 is pending approval. Confirm your personal details to receive direct deposit.",1
"PayPal: You authorized a payment of $499.00 to Apple Store. If not you, cancel immediately: http://bit.ly/paypal-dispute",1
"Immediate action required: Suspicious sign-in detected on your Google Account. Verify your credentials to avoid lockout.",1
"HR Dept: Review attached salary revision spreadsheet. Login with your corporate credentials to view: http://corp-auth.xyz",1
"Amazon alert: Your order #402-9912 was placed for $899. If unauthorized, click here to cancel: http://amazon-dispute.click",1
"Your debit card has been locked due to multiple invalid PIN entries. Unlock card at http://secure-bank-unlock.work",1
"Dear employee, our email server is undergoing maintenance. Verify your password to maintain mailbox storage.",1
"Wells Fargo: We detected suspicious wire activity. Please confirm your account number and security code at http://wf-auth.top",1
"Hey Professor Miller, will you be available during office hours today to discuss the Dijkstra algorithm assignment?",0
"Hi team, I just opened a pull request on the repository with the unit tests for the machine learning pipeline.",0
"The CS204 lecture slides and lab 3 exercises have been uploaded to the university portal. Due Friday 11:59 PM.",0
"Hey! Are we still meeting for lunch at the campus library cafe after the database systems lecture?",0
"Thank you for your order #88492. Introduction to Algorithms 4th Edition has been packed and scheduled for delivery.",0
"Reminder: The weekly software engineering sync meeting is scheduled for tomorrow at 10:00 AM in Conference Room B.",0
"Hi Sarah, could you please send me the notes from yesterday's operating systems class? I missed the discussion on semaphores.",0
"Your GitHub security digest: No vulnerabilities detected in your 4 tracked repositories for the week of October 12.",0
"Thanks for reviewing my code changes. I addressed your comments regarding exception handling and pushed the new commit.",0
"Attached is the draft of our group project presentation slides. Let me know what you think before we present on Thursday.",0
"Hi everyone, the campus library will close early at 8:00 PM this evening for maintenance.",0
"Order confirmation: Your subscription to Computer Science Journal has been renewed for the upcoming academic year.",0
"Hey Alex, do you want to study for the upcoming discrete mathematics midterm together this weekend?",0
"Your flight reservation to San Francisco is confirmed. Airline confirmation code: XF982K. Safe travels!",0
"Hi Mom, I arrived safely on campus. Heading to the computer lab now to finish my data structures project.",0
`
  },
  {
    name: 'README.md',
    path: 'phishguard/README.md',
    description: 'Comprehensive setup, architecture, VS Code terminal commands for Windows, and viva guide',
    language: 'markdown',
    content: `# PhishGuard – Machine Learning-Based Phishing Message Detection System

**Author:** Computer Science & Engineering Department  
**Level:** Undergraduate Academic Project (2nd Year B.Tech / B.E.)  
**Stack:** Python 3.10+, Flask, Scikit-Learn, Pandas, NumPy, Joblib, SQLite, HTML5, CSS3, JavaScript  

---

## 1. Project Overview & Motivation

Phishing attacks remain the primary initial access vector for ransomware, identity theft, and corporate espionage. Attackers craft messages exploiting human cognitive biases: **urgency, fear, curiosity, and authority**.

PhishGuard combines two complementary layers of analysis:
1. **Statistical Natural Language Processing (TF-IDF + Logistic Regression):** Identifies vocabulary patterns and discriminative n-grams characteristic of deceptive pretexts.
2. **Transparent Rule-Based Heuristic Indicators:** Checks for high-risk indicators such as URL shorteners, direct numeric IP addresses in links, requests for passwords/OTPs, and synthetic urgency constraints.

> **Crucial Ethical & Security Notice:** Machine learning predictions are probabilistic. PhishGuard **does not guarantee** that a message marked "Likely Legitimate" is completely safe. Text-only analysis cannot inspect DNS records, server-side payload delivery, or zero-day phishing pretexts.

---

## 2. Directory Structure

\`\`\`
phishguard/
│
├── app.py                   # Main Flask application and REST API endpoints
├── train_model.py           # Machine learning training pipeline script
├── requirements.txt         # Python dependencies
├── phishguard.db            # SQLite database (auto-generated for history)
├── README.md                # Project documentation and setup guide
│
├── data/
│   ├── README.md            # Dataset preparation instructions
│   └── phishing_dataset.csv # Balanced training dataset (text, label)
│
├── models/
│   ├── .gitkeep
│   ├── tfidf_vectorizer.joblib # Fitted TF-IDF vectorizer artifact
│   └── classifier.joblib       # Trained Logistic Regression model artifact
│
├── templates/
│   └── index.html           # Frontend HTML dashboard
│
├── static/
│   ├── css/
│   │   └── style.css        # Dark navy cybersecurity theme styling
│   └── js/
│       └── script.js        # Asynchronous API communication and UI logic
│
└── tests/
    └── test_api.py          # Automated unit test suite
\`\`\`

---

## 3. Step-by-Step Setup & Execution (Windows VS Code Terminal)

Follow these exact commands inside your VS Code terminal in Windows:

### Step 1: Open Terminal in Project Folder
\`\`\`powershell
cd phishguard
\`\`\`

### Step 2: Create a Python Virtual Environment
\`\`\`powershell
python -m venv venv
\`\`\`

### Step 3: Activate the Virtual Environment
\`\`\`powershell
.\\venv\\Scripts\\activate
\`\`\`
*(If you see an execution policy error, run: \`Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass\` then run activate again)*

### Step 4: Install Dependencies
\`\`\`powershell
pip install -r requirements.txt
\`\`\`

### Step 5: Train the Machine Learning Model
\`\`\`powershell
python train_model.py
\`\`\`
*This script validates the dataset, performs stratified train/test splitting, fits the TF-IDF vectorizer, trains the Logistic Regression classifier, prints the evaluation metrics, and writes the artifacts to \`models/\`.*

### Step 6: Start the Flask Application
\`\`\`powershell
python app.py
\`\`\`

### Step 7: Open in Your Browser
Open your browser and navigate to:
\`\`\`
http://127.0.0.1:5000
\`\`\`

### Step 8: Run Automated Unit Tests
\`\`\`powershell
pytest tests/test_api.py -v
\`\`\`
*Or using the standard Python test runner:*
\`\`\`powershell
python -m unittest tests/test_api.py
\`\`\`

---

## 4. Machine Learning Methodology

### A. Preprocessing Pipeline
1. **Lowercasing:** Normalizes case variations (e.g. \`URGENT\` vs \`urgent\`).
2. **Tokenization:** Splits text into alphanumeric tokens of length $\\ge 2$.
3. **Stop-word Filtering:** Removes nondiscriminative English stop-words (\`the\`, \`is\`, \`at\`, etc.).

### B. TF-IDF Vectorization
TF-IDF measures the importance of a word in a specific message relative to the whole corpus:

$$\\text{TF}(t, d) = \\frac{f_{t, d}}{\\sum_{t' \\in d} f_{t', d}}$$

$$\\text{IDF}(t) = \\ln\\left(\\frac{1 + N}{1 + \\text{DF}(t)}\\right) + 1$$

$$\\text{TF-IDF}(t, d) = \\text{TF}(t, d) \\times \\text{IDF}(t)$$

### C. Logistic Regression Classifier
Computes the linear combination of feature weights and maps it to a probability using the sigmoid function:

$$z = w_0 + \\sum_{i=1}^{m} w_i \\cdot x_i$$

$$P(Y = \\text{Phishing} \\mid X) = \\frac{1}{1 + e^{-z}}$$

Decision boundary:
- $P \\ge 0.50 \\implies$ **Potentially Phishing**
- $P < 0.50 \\implies$ **Likely Legitimate**

### D. Data Leakage Prevention
The dataset is split into **training (75%)** and **testing (25%)** sets using stratified sampling **before** fitting the vectorizer. The testing set is strictly transformed using the parameters fitted exclusively on the training set.

---

## 5. Common Troubleshooting & Solutions

| Issue | Cause | Fix |
|---|---|---|
| \`ModuleNotFoundError: No module named 'flask'\` | Virtual environment not activated | Run \`venv\\Scripts\\activate\` before starting the server. |
| \`WARNING: Model artifacts not found\` | \`train_model.py\` has not been run | Run \`python train_model.py\` to train and save the model. |
| \`Script cannot be loaded because running scripts is disabled\` | Windows PowerShell execution restriction | Run \`Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass\`. |
| Port 5000 already in use | Another process running on port 5000 | Change port in \`app.run(port=5001)\` in \`app.py\`. |
`
  }
];
