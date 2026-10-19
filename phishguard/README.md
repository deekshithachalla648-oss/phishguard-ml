# PhishGuard – Machine Learning-Based Phishing Message Detection System

**Author:** Computer Science & Engineering Undergraduate Project  
**Tech Stack:** Python 3.10+, Flask, Scikit-Learn, Pandas, NumPy, Joblib, SQLite, HTML5, CSS3, JavaScript  

---

## 1. Project Overview & Problem Statement

Phishing attacks remain the leading initial access vector for security breaches worldwide. Fraudulent emails and SMS messages (smishing) manipulate psychological urgency, fear of financial loss, or curiosity to coerce victims into surrendering passwords, one-time passwords (OTP), or sensitive personal data.

**PhishGuard** is an end-to-end, privacy-focused machine learning detection system designed to inspect user-submitted email and SMS text. It combines:
1. **Statistical Natural Language Processing (TF-IDF + Logistic Regression):** Evaluates vocabulary weights and discriminative n-grams learned from labeled corpora.
2. **Deterministic Rule-Based Warning Indicators:** Scans for obfuscated shortened URLs (e.g., bit.ly, tinyurl), raw IP address hosts, password/OTP demands, and artificial urgency.

> **⚠️ Security & Ethical Notice:** Machine learning is probabilistic. A "Likely Legitimate" prediction is **never a guarantee of safety**. Attackers continually refine pretexts, and text-only inspection cannot confirm domain DNS ownership or dynamic server redirect behaviors.

---

## 2. Project Directory Structure

```
phishguard/
│
├── app.py                      # Flask server with REST API endpoints (/api/analyze, /api/health)
├── train_model.py              # ML training pipeline: TF-IDF vectorizer + Logistic Regression
├── requirements.txt            # Python dependencies
├── phishguard.db               # SQLite database for optional local history (auto-created)
├── README.md                   # Full documentation & execution instructions
│
├── data/
│   ├── README.md               # Dataset documentation
│   └── phishing_dataset.csv    # Balanced labeled training dataset (text, label)
│
├── models/
│   ├── .gitkeep
│   ├── tfidf_vectorizer.joblib # Fitted TF-IDF vectorizer artifact
│   └── classifier.joblib       # Trained Logistic Regression model artifact
│
├── templates/
│   └── index.html              # Frontend user interface
│
├── static/
│   ├── css/
│   │   └── style.css           # Dark navy cybersecurity dashboard stylesheet
│   └── js/
│       └── script.js           # Asynchronous REST client & DOM manipulator
│
└── tests/
    └── test_api.py             # Automated unit tests for API and error validation
```

---

## 3. Windows VS Code Terminal Setup & Execution

Open the VS Code Terminal (`Ctrl + \``) in Windows and execute the following commands in order:

### 1. Navigate to the project directory
```powershell
cd phishguard
```

### 2. Create Python virtual environment
```powershell
python -m venv venv
```

### 3. Activate the virtual environment
```powershell
.\venv\Scripts\activate
```
*(If you encounter a script execution policy restriction, run: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` and then run `.\venv\Scripts\activate` again)*

### 4. Install all dependencies
```powershell
pip install -r requirements.txt
```

### 5. Train the Machine Learning Model
```powershell
python train_model.py
```
*Output will display data cleaning stats, class distributions, train/test split size, classification report, and confusion matrix. Artifacts will be saved into `models/`.*

### 6. Start the Flask Web Application
```powershell
python app.py
```

### 7. View in Web Browser
Open:
```
http://127.0.0.1:5000
```

### 8. Run Automated Unit Tests
Open a second terminal window (with `venv` activated) and run:
```powershell
pytest tests/test_api.py -v
```
Or with standard library:
```powershell
python -m unittest tests/test_api.py
```

---

## 4. Machine Learning Architecture & Equations

### TF-IDF (Term Frequency – Inverse Document Frequency)
$$\text{TF}(t, d) = \frac{\text{Count of token } t \text{ in message } d}{\text{Total tokens in message } d}$$

$$\text{IDF}(t) = \ln\left(\frac{1 + N}{1 + \text{DF}(t)}\right) + 1$$

$$\text{TF-IDF}(t, d) = \text{TF}(t, d) \times \text{IDF}(t)$$

L2 vector normalization ensures long emails do not artificially dominate shorter SMS messages.

### Logistic Regression Classifier
$$z = w_0 + \sum_{i=1}^m w_i \cdot x_i$$

$$P(\text{Phishing} \mid \mathbf{x}) = \frac{1}{1 + e^{-z}}$$

- **Decision Rule:** If $P \ge 0.50 \implies \text{Potentially Phishing}$; Else $\implies \text{Likely Legitimate}$.

---

## 5. Defense & Viva Guide (For Engineering Students)

- **Q: Why split data before fitting the vectorizer?**  
  *A:* Fitting TF-IDF on the entire dataset causes **data leakage** (the vectorizer learns document frequencies of words in the test set, giving artificially inflated evaluation scores). By fitting only on `X_train`, `X_test` remains strictly unseen.
- **Q: Why is Precision vs. Recall important in cybersecurity?**  
  *A:* High Recall reduces False Negatives (dangerous phishing messages reaching the user). High Precision reduces False Positives (legitimate emails marked as scams). In phishing defense, high Recall is prioritized, but balanced with Precision to avoid alert fatigue.
- **Q: Can machine learning alone solve phishing?**  
  *A:* No. Adversaries use lookalike domains, zero-width spaces, and novel lures. Robust defense requires defense-in-depth: DMARC/SPF/DKIM email authentication, multi-factor hardware keys (FIDO2/WebAuthn), and user awareness.
