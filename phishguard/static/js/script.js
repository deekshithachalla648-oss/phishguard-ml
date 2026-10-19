const SAMPLES = {
  bank: "CHASE-ALERT: Unusual transaction of $842.19 was flagged on your debit card. If this was not you, please verify your identity immediately to prevent permanent account suspension: https://bit.ly/chase-auth-security",
  delivery: "USPS Notice: Your package US-8947291 could not be delivered due to an incomplete address. Immediate action required. Update your shipping details and pay $1.99 redelivery fee within 12 hours: http://192.168.10.45/usps/track",
  academic: "Hi class,\n\nThe lecture slides for Module 4 (Graph Traversal & Dijkstra's Algorithm) have been uploaded to the university portal. Remember that Lab 3 is due this Friday by 11:59 PM. Professor Miller will hold office hours in Room 302 on Thursday afternoon for anyone with questions on the programming assignment.\n\nBest regards,\nTeaching Assistant Sarah"
};

const textarea = document.getElementById('messageInput');
const charCount = document.getElementById('charCount');
const analyzeBtn = document.getElementById('analyzeBtn');
const loading = document.getElementById('loadingIndicator');
const errorAlert = document.getElementById('errorAlert');
const resultBox = document.getElementById('resultContainer');

if (textarea) {
  textarea.addEventListener('input', () => {
    charCount.textContent = `${textarea.value.length} characters`;
  });
}

function loadSample(key) {
  if (SAMPLES[key]) {
    textarea.value = SAMPLES[key];
    charCount.textContent = `${textarea.value.length} characters`;
    hideError();
    resultBox.classList.add('hidden');
  }
}

function clearInput() {
  textarea.value = '';
  charCount.textContent = '0 characters';
  hideError();
  resultBox.classList.add('hidden');
}

function resetForm() {
  clearInput();
  textarea.focus();
}

function showError(msg) {
  errorAlert.textContent = msg;
  errorAlert.classList.remove('hidden');
}

function hideError() {
  errorAlert.classList.add('hidden');
}

async function submitAnalysis() {
  const text = textarea.value.trim();
  hideError();

  if (!text) {
    showError("Please enter or paste an email or SMS message to analyze.");
    return;
  }

  analyzeBtn.disabled = true;
  loading.classList.remove('hidden');
  resultBox.classList.add('hidden');

  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Server error occurred during analysis');
    }

    displayResults(data);
  } catch (err) {
    showError(err.message || 'Failed to connect to the PhishGuard analysis backend.');
  } finally {
    analyzeBtn.disabled = false;
    loading.classList.add('hidden');
  }
}

function displayResults(data) {
  const isPhish = data.prediction === 'Potentially Phishing';
  const tag = document.getElementById('predictionTag');
  tag.textContent = data.prediction;
  tag.className = 'prediction-tag ' + (isPhish ? 'phishing' : 'legitimate');

  const heading = document.getElementById('predictionHeading');
  heading.textContent = isPhish ? '⚠️ High Suspicion of Phishing' : '✅ Likely Legitimate Communication';

  const scoreEl = document.getElementById('confidenceScore');
  scoreEl.textContent = `${data.confidence_score}%`;
  scoreEl.style.color = isPhish ? '#ef4444' : '#10b981';

  const list = document.getElementById('indicatorsList');
  list.innerHTML = '';

  if (data.rule_indicators && data.rule_indicators.length > 0) {
    data.rule_indicators.forEach(ind => {
      const item = document.createElement('div');
      item.className = `indicator-item ${ind.severity === 'danger' ? 'danger' : ''}`;
      item.innerHTML = `<strong>${ind.title}</strong><p>${ind.description}</p>`;
      list.appendChild(item);
    });
  } else {
    const item = document.createElement('div');
    item.className = 'indicator-item';
    item.innerHTML = `<strong>No High-Risk Rules Triggered</strong><p>The message does not contain obvious URL shorteners, direct IP addresses, or overt password harvest patterns.</p>`;
    list.appendChild(item);
  }

  document.getElementById('resultDisclaimer').textContent = data.disclaimer;
  resultBox.classList.remove('hidden');
  resultBox.scrollIntoView({ behavior: 'smooth' });
}
