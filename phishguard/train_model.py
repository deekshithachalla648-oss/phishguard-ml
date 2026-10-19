"""
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
