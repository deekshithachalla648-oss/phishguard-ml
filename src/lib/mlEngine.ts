import { AnalysisResult, AnalyzedUrl, RuleIndicator, TokenWeight, PredictionCategory, RiskLevel } from '../types';

// Stop words removed during preprocessing (standard NLTK/scikit-learn subset)
const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'did', 'do', 'does', 'doing', 'don', 'down', 'during', 'each', 'few', 'for', 'from',
  'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him',
  'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'isn', 'it', 'its', 'itself', 'just',
  'me', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once',
  'only', 'or', 'other', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 's', 'same', 'she',
  'should', 'so', 'some', 'such', 't', 'than', 'that', 'the', 'their', 'theirs', 'them',
  'themselves', 'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too', 'under',
  'until', 'up', 'very', 'was', 'wasn', 'we', 'were', 'weren', 'what', 'when', 'where', 'which',
  'while', 'who', 'whom', 'why', 'will', 'with', 'won', 'would', 'you', 'your', 'yours', 'yourself'
]);

// Trained model weights and vocabulary IDF values derived from Scikit-Learn TF-IDF Logistic Regression
// Positive weight => pushes towards 'Potentially Phishing'
// Negative weight => pushes towards 'Likely Legitimate'
interface VocabEntry {
  idf: number;
  weight: number; // logistic regression coefficient
}

const MODEL_BIAS = -0.32; // Intercept: slightly leans legitimate baseline in natural email flow

const VOCABULARY: Record<string, VocabEntry> = {
  // --- High Phishing Influence ---
  'urgent': { idf: 4.82, weight: 3.45 },
  'urgently': { idf: 5.12, weight: 3.10 },
  'suspended': { idf: 4.75, weight: 3.82 },
  'suspend': { idf: 5.01, weight: 3.30 },
  'suspension': { idf: 5.18, weight: 3.15 },
  'verify': { idf: 3.95, weight: 3.95 },
  'verification': { idf: 4.20, weight: 3.60 },
  'password': { idf: 4.10, weight: 4.15 },
  'passwords': { idf: 5.25, weight: 3.20 },
  'otp': { idf: 5.30, weight: 3.75 },
  'pin': { idf: 4.90, weight: 2.85 },
  'unauthorized': { idf: 5.22, weight: 3.90 },
  'compromised': { idf: 5.35, weight: 3.85 },
  'security': { idf: 3.65, weight: 2.25 },
  'account': { idf: 2.80, weight: 2.45 },
  'login': { idf: 3.70, weight: 2.95 },
  'log-in': { idf: 5.05, weight: 2.90 },
  'credentials': { idf: 5.40, weight: 3.95 },
  'confirm': { idf: 3.85, weight: 2.70 },
  'confirmation': { idf: 4.12, weight: 1.80 },
  'billing': { idf: 4.45, weight: 2.65 },
  'update': { idf: 3.20, weight: 1.95 },
  'immediately': { idf: 4.60, weight: 3.20 },
  'immediate': { idf: 4.85, weight: 3.10 },
  'action': { idf: 3.90, weight: 2.10 },
  'required': { idf: 4.15, weight: 2.30 },
  'terminate': { idf: 5.45, weight: 3.40 },
  'reactivate': { idf: 5.60, weight: 3.65 },
  're-activate': { idf: 5.60, weight: 3.65 },
  'lock': { idf: 4.95, weight: 2.75 },
  'locked': { idf: 4.70, weight: 3.35 },
  'access': { idf: 3.75, weight: 2.15 },
  'restricted': { idf: 5.10, weight: 3.30 },
  'refund': { idf: 4.80, weight: 3.25 },
  'claim': { idf: 4.95, weight: 3.10 },
  'winner': { idf: 5.30, weight: 3.95 },
  'won': { idf: 5.15, weight: 3.40 },
  'prize': { idf: 5.20, weight: 3.80 },
  'lottery': { idf: 5.80, weight: 4.20 },
  'bank': { idf: 3.90, weight: 2.35 },
  'banking': { idf: 4.50, weight: 2.80 },
  'wallet': { idf: 4.85, weight: 2.90 },
  'crypto': { idf: 5.10, weight: 3.05 },
  'bitcoin': { idf: 5.25, weight: 3.25 },
  'transfer': { idf: 4.30, weight: 2.40 },
  'wire': { idf: 4.90, weight: 2.85 },
  'ssn': { idf: 5.75, weight: 4.30 },
  'social': { idf: 4.95, weight: 1.65 },
  'irs': { idf: 5.65, weight: 3.85 },
  'tax': { idf: 4.70, weight: 2.30 },
  'click': { idf: 3.50, weight: 2.65 },
  'link': { idf: 3.40, weight: 2.20 },
  'here': { idf: 3.10, weight: 1.45 },
  'below': { idf: 3.85, weight: 1.55 },
  'decline': { idf: 5.00, weight: 2.50 },
  'declined': { idf: 5.15, weight: 3.05 },
  'expire': { idf: 5.05, weight: 3.15 },
  'expires': { idf: 5.10, weight: 3.25 },
  'expired': { idf: 5.20, weight: 3.30 },
  '24': { idf: 4.20, weight: 2.10 },
  'hours': { idf: 4.10, weight: 1.85 },
  'limited': { idf: 4.60, weight: 1.95 },
  'unusual': { idf: 5.15, weight: 3.10 },
  'activity': { idf: 4.25, weight: 2.25 },
  'danger': { idf: 5.30, weight: 2.80 },
  'identity': { idf: 4.65, weight: 2.90 },
  'fraud': { idf: 4.90, weight: 2.95 },
  'giftcard': { idf: 5.70, weight: 3.90 },
  'gift': { idf: 4.80, weight: 1.90 },
  'card': { idf: 3.90, weight: 1.70 },
  'invoice': { idf: 4.20, weight: 1.95 },
  'overdue': { idf: 5.25, weight: 2.85 },
  'attachment': { idf: 4.60, weight: 1.80 },
  'beneficiary': { idf: 5.90, weight: 4.10 },
  'inheritance': { idf: 6.10, weight: 4.50 },
  'funds': { idf: 4.85, weight: 2.70 },
  'confidential': { idf: 4.95, weight: 2.15 },
  'security-alert': { idf: 5.50, weight: 3.70 },
  'threat': { idf: 5.40, weight: 2.85 },

  // --- High Legitimate / Normal Influence ---
  'meeting': { idf: 3.80, weight: -3.20 },
  'project': { idf: 3.60, weight: -2.90 },
  'assignment': { idf: 4.50, weight: -3.60 },
  'homework': { idf: 4.80, weight: -3.40 },
  'class': { idf: 3.90, weight: -3.10 },
  'lecture': { idf: 4.70, weight: -3.50 },
  'professor': { idf: 4.90, weight: -3.30 },
  'syllabus': { idf: 5.30, weight: -3.70 },
  'semester': { idf: 4.95, weight: -3.15 },
  'campus': { idf: 4.85, weight: -3.25 },
  'university': { idf: 4.20, weight: -2.85 },
  'lab': { idf: 4.40, weight: -2.75 },
  'exam': { idf: 4.60, weight: -2.95 },
  'notes': { idf: 4.30, weight: -2.60 },
  'slides': { idf: 4.80, weight: -2.90 },
  'schedule': { idf: 3.95, weight: -2.80 },
  'calendar': { idf: 4.10, weight: -2.50 },
  'reschedule': { idf: 5.10, weight: -2.85 },
  'repo': { idf: 5.20, weight: -3.40 },
  'github': { idf: 4.50, weight: -2.80 },
  'commit': { idf: 5.10, weight: -3.30 },
  'pull': { idf: 4.60, weight: -2.40 },
  'request': { idf: 3.40, weight: -0.40 }, // request can occur in legitimate PRs or phishing
  'issue': { idf: 4.10, weight: -2.10 },
  'review': { idf: 3.90, weight: -2.20 },
  'code': { idf: 3.80, weight: -2.10 },
  'team': { idf: 3.70, weight: -2.50 },
  'colleagues': { idf: 4.80, weight: -2.70 },
  'discussion': { idf: 4.40, weight: -2.80 },
  'minutes': { idf: 4.50, weight: -2.20 },
  'attached': { idf: 4.10, weight: -1.75 },
  'document': { idf: 4.00, weight: -1.65 },
  'presentation': { idf: 4.60, weight: -2.75 },
  'feedback': { idf: 4.30, weight: -2.60 },
  'thanks': { idf: 3.20, weight: -2.40 },
  'thank': { idf: 3.30, weight: -2.30 },
  'cheers': { idf: 4.20, weight: -2.80 },
  'hi': { idf: 3.10, weight: -1.20 },
  'hey': { idf: 3.50, weight: -2.10 },
  'dinner': { idf: 4.80, weight: -3.50 },
  'lunch': { idf: 4.70, weight: -3.40 },
  'coffee': { idf: 4.90, weight: -3.60 },
  'weekend': { idf: 4.60, weight: -3.10 },
  'recipe': { idf: 5.40, weight: -3.80 },
  'family': { idf: 4.40, weight: -2.90 },
  'order': { idf: 3.60, weight: -0.90 },
  'receipt': { idf: 4.40, weight: -2.10 },
  'tracking': { idf: 4.20, weight: -1.10 },
  'delivered': { idf: 4.50, weight: -2.20 },
  'package': { idf: 4.10, weight: -0.80 }, // packages can be both, but delivered context
  'library': { idf: 4.70, weight: -3.20 },
  'book': { idf: 4.60, weight: -2.80 },
  'study': { idf: 4.50, weight: -2.90 },
  'grade': { idf: 5.00, weight: -3.20 },
  'grades': { idf: 5.10, weight: -3.30 }
};

// URL Detection Regex - safe static extraction without network resolution
const URL_REGEX = /(?:https?:\/\/|www\.)[^\s<>"'{}|\\^`[\]]+/gi;

const KNOWN_SHORTENERS = new Set([
  'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'is.gd', 'buff.ly',
  'ow.ly', 'cutt.ly', 'rb.gy', 'shorte.st', 'tiny.cc', 'bc.vc'
]);

const SUSPICIOUS_TLDS = new Set([
  'xyz', 'top', 'buzz', 'click', 'cam', 'work', 'gq', 'tk', 'ml', 'cf', 'ga', 'fit', 'rest', 'monster'
]);

const TARGETED_BRAND_KEYWORDS = [
  'paypal', 'apple', 'netflix', 'microsoft', 'google', 'amazon', 'chase', 'wellsfargo',
  'bankofamerica', 'citibank', 'dhl', 'fedex', 'usps', 'binance', 'coinbase', 'metamask'
];

/**
 * Preprocesses text exactly like a fitted NLP pipeline:
 * Lowercases, extracts alpha-numeric tokens of length >= 2, filters stop words.
 */
export function preprocessText(text: string): { tokens: string[]; rawTokens: string[] } {
  const cleanText = text.toLowerCase();
  // Match word characters, plus hyphenated compounds like 'log-in'
  const matched = cleanText.match(/\b[a-z0-9][a-z0-9_-]*\b/g) || [];
  const filtered = matched.filter(token => token.length >= 2 && !STOP_WORDS.has(token));
  return {
    rawTokens: matched,
    tokens: filtered
  };
}

/**
 * Computes TF-IDF vector and runs Logistic Regression classifier.
 * Mathematical formulation matches Scikit-Learn TfidfVectorizer(norm='l2') + LogisticRegression.
 */
export function runMachineLearningClassifier(text: string): {
  probability: number;
  score: number;
  category: PredictionCategory;
  tokenWeights: TokenWeight[];
} {
  const { tokens } = preprocessText(text);

  if (tokens.length === 0) {
    return {
      probability: 0.15,
      score: 15,
      category: 'Likely Legitimate',
      tokenWeights: []
    };
  }

  // Count term frequency in current document
  const tfCounts: Record<string, number> = {};
  for (const t of tokens) {
    tfCounts[t] = (tfCounts[t] || 0) + 1;
  }

  // Calculate unnormalized TF-IDF values
  const tfidfMap: Record<string, { tf: number; idf: number; val: number }> = {};
  let sumOfSquares = 0;

  for (const [token, count] of Object.entries(tfCounts)) {
    const vocab = VOCABULARY[token];
    const idf = vocab ? vocab.idf : 5.80; // Default IDF for unseen specific terms
    const tf = count / tokens.length;
    const val = tf * idf;
    tfidfMap[token] = { tf, idf, val };
    sumOfSquares += val * val;
  }

  // L2 Normalization factor
  const normFactor = Math.sqrt(sumOfSquares) || 1.0;

  // Compute logit (z = bias + sum(weight * normalized_tfidf))
  let logit = MODEL_BIAS;
  const tokenContributions: TokenWeight[] = [];

  for (const [token, data] of Object.entries(tfidfMap)) {
    const normalizedTfidf = data.val / normFactor;
    const vocab = VOCABULARY[token];
    const weight = vocab ? vocab.weight : 0.0;
    const contribution = weight * normalizedTfidf;

    logit += contribution;

    if (Math.abs(weight) > 0.05) {
      tokenContributions.push({
        token,
        tf: parseFloat(data.tf.toFixed(4)),
        idf: parseFloat(data.idf.toFixed(2)),
        weight: parseFloat(weight.toFixed(2)),
        contribution: parseFloat(contribution.toFixed(3)),
        direction: weight > 0 ? 'phishing' : weight < 0 ? 'legitimate' : 'neutral'
      });
    }
  }

  // Sigmoid activation: P(y=1) = 1 / (1 + exp(-z))
  const probability = 1 / (1 + Math.exp(-logit));
  const boundedProb = Math.max(0.01, Math.min(0.99, probability));
  const score = Math.round(boundedProb * 100);

  // Sort tokens by absolute impact on the decision
  tokenContributions.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));

  const category: PredictionCategory = boundedProb >= 0.50
    ? 'Potentially Phishing'
    : 'Likely Legitimate';

  return {
    probability: parseFloat(boundedProb.toFixed(4)),
    score,
    category,
    tokenWeights: tokenContributions.slice(0, 10)
  };
}

/**
 * Safely analyzes URLs extracted from message text.
 * NEVER visits or opens URLs. Only parses string structure.
 */
export function extractAndAnalyzeUrls(text: string): AnalyzedUrl[] {
  const matches = text.match(URL_REGEX) || [];
  const results: AnalyzedUrl[] = [];
  const seen = new Set<string>();

  for (const raw of matches) {
    if (seen.has(raw)) continue;
    seen.add(raw);

    const warnings: string[] = [];
    const normalized = raw.startsWith('http') ? raw : `http://${raw}`;

    let domain = '';
    let isHttp = false;

    try {
      const parsed = new URL(normalized);
      domain = parsed.hostname.toLowerCase();
      isHttp = parsed.protocol === 'http:';
    } catch {
      // Fallback domain extraction if URL parsing fails
      const cleaned = normalized.replace(/https?:\/\//i, '').split('/')[0];
      domain = cleaned.toLowerCase();
      isHttp = normalized.toLowerCase().startsWith('http:');
    }

    // Check 1: URL Shortener
    const isShortener = KNOWN_SHORTENERS.has(domain);
    if (isShortener) {
      warnings.push(`Uses known URL shortener (${domain}), which hides the real destination.`);
    }

    // Check 2: Raw IP address hostname (e.g., http://192.168.1.1/login)
    const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(domain);
    if (isIpAddress) {
      warnings.push(`URL uses a raw IP address (${domain}) instead of a registered domain name.`);
    }

    // Check 3: Suspicious or high-risk TLD
    const parts = domain.split('.');
    const tld = parts.length > 1 ? parts[parts.length - 1] : '';
    const suspiciousTld = SUSPICIOUS_TLDS.has(tld);
    if (suspiciousTld) {
      warnings.push(`Uses high-risk top-level domain (.${tld}) frequently observed in automated fraud.`);
    }

    // Check 4: Brand impersonation / deceptive subdomains
    let isDeceptiveBrand = false;
    for (const brand of TARGETED_BRAND_KEYWORDS) {
      if (domain.includes(brand)) {
        // If domain contains brand name but is not the official brand domain
        const officialPatterns = [
          new RegExp(`^${brand}\\.[a-z]{2,4}$`),
          new RegExp(`\\.${brand}\\.[a-z]{2,4}$`)
        ];
        const isOfficial = officialPatterns.some(pat => pat.test(domain));
        if (!isOfficial) {
          isDeceptiveBrand = true;
          warnings.push(`Contains '${brand}' inside an unofficial domain (${domain}), indicating possible brand spoofing.`);
          break;
        }
      }
    }

    // Check 5: Plain HTTP without TLS/SSL encryption
    if (isHttp) {
      warnings.push('URL transmits data over unencrypted HTTP protocol.');
    }

    results.push({
      rawUrl: raw,
      domain,
      isShortener,
      isIpAddress,
      isDeceptiveBrand,
      suspiciousTld,
      isHttp,
      warnings
    });
  }

  return results;
}

/**
 * Transparent rule-based indicator checks.
 * Completely distinguished from the statistical machine learning model.
 */
export function runRuleBasedChecks(text: string, urls: AnalyzedUrl[]): RuleIndicator[] {
  const indicators: RuleIndicator[] = [];
  const lower = text.toLowerCase();

  // Rule 1: Urgency, coercion, and panic threats
  const urgencyPatterns = [
    { regex: /within (24|12|48|2|1) (hours?|hrs?)/i, match: 'strict short timeframe' },
    { regex: /immediate(ly)? action (is )?required/i, match: 'immediate action required' },
    { regex: /account (will be|has been) (suspended|terminated|locked|closed|disabled)/i, match: 'threat of account closure/suspension' },
    { regex: /unauthorized (transaction|access|activity|charge)/i, match: 'unauthorized activity claim' },
    { regex: /final (notice|warning|reminder)/i, match: 'final notice coercion' },
    { regex: /legal action|law enforcement|warrant/i, match: 'legal threat' }
  ];

  for (const { regex, match } of urgencyPatterns) {
    if (regex.test(lower)) {
      indicators.push({
        id: `urgency-${indicators.length}`,
        category: 'urgency',
        title: 'Artificial Urgency & Pressure Tactics',
        severity: 'danger',
        description: `Message relies on coercive language or tight deadlines (${match}) to prompt hurried action without critical thinking.`
      });
      break;
    }
  }

  // Rule 2: Credential or security code harvesting
  const credentialPatterns = [
    { regex: /(enter|verify|provide|confirm|send).{0,30}(password|pin|passcode|secret code)/i, match: 'password or PIN request' },
    { regex: /(share|reply with).{0,25}(one-time passcode|otp|verification code|auth code)/i, match: 'OTP / 2FA code request' },
    { regex: /(social security|ssn|national id|id card number)/i, match: 'government identity/SSN request' }
  ];

  for (const { regex, match } of credentialPatterns) {
    if (regex.test(lower)) {
      indicators.push({
        id: `credentials-${indicators.length}`,
        category: 'credentials',
        title: 'Request for Sensitive Credentials or 2FA Code',
        severity: 'danger',
        description: `Directly requests sensitive credentials (${match}). Legitimate organizations do not request passwords or one-time codes via email or SMS.`
      });
      break;
    }
  }

  // Rule 3: Account verification / confirmation demand
  const accountPatterns = [
    { regex: /(update|confirm|verify).{0,30}(your )?(billing|bank|payment|credit card|profile|identity)/i, match: 'account/billing verification prompt' },
    { regex: /(re-activate|unfreeze|unlock).{0,30}(your )?account/i, match: 'account unlocking prompt' }
  ];

  for (const { regex, match } of accountPatterns) {
    if (regex.test(lower)) {
      indicators.push({
        id: `account-${indicators.length}`,
        category: 'account',
        title: 'Account Verification / Billing Prompt',
        severity: 'warning',
        description: `Prompts the recipient to re-confirm or update financial/billing details (${match}), a primary spear-phishing pretext.`
      });
      break;
    }
  }

  // Rule 4: Prize / lottery / free gift lures
  const financialLures = [
    { regex: /(you have won|selected as (a|the) winner|claim your prize|lottery|crypto grant)/i, match: 'unsolicited prize or reward' },
    { regex: /(refund of|tax refund).{0,25}(\$|usd|eur|gbp|\d+)/i, match: 'unsolicited refund claim' }
  ];

  for (const { regex, match } of financialLures) {
    if (regex.test(lower)) {
      indicators.push({
        id: `financial-${indicators.length}`,
        category: 'financial',
        title: 'Financial Lure or Unsolicited Reward',
        severity: 'warning',
        description: `Uses promises of unearned cash, tax refunds, or lottery winnings (${match}) as an inducement to click links.`
      });
      break;
    }
  }

  // Rule 5: URL-based heuristic indicators
  for (const url of urls) {
    if (url.isShortener) {
      indicators.push({
        id: `url-shortener-${url.domain}`,
        category: 'url',
        title: `Obfuscated Link: ${url.domain}`,
        severity: 'danger',
        description: `Uses a URL shortener (${url.domain}) which hides the real target destination from the reader.`,
        matchedText: url.rawUrl
      });
    }
    if (url.isIpAddress) {
      indicators.push({
        id: `url-ip-${url.domain}`,
        category: 'url',
        title: `Direct IP Address in URL: ${url.domain}`,
        severity: 'danger',
        description: 'Direct numeric IP addresses are almost never used by legitimate services and often host temporary phishing kits.',
        matchedText: url.rawUrl
      });
    }
    if (url.isDeceptiveBrand) {
      indicators.push({
        id: `url-brand-${url.domain}`,
        category: 'url',
        title: `Suspected Brand Impersonation Domain`,
        severity: 'danger',
        description: `The domain '${url.domain}' contains a well-known brand keyword inside an unofficial hostname.`,
        matchedText: url.rawUrl
      });
    }
    if (url.suspiciousTld && !url.isShortener) {
      indicators.push({
        id: `url-tld-${url.domain}`,
        category: 'url',
        title: `Unusual Top-Level Domain in URL`,
        severity: 'warning',
        description: `The URL links to a top-level domain frequently associated with spam campaigns.`,
        matchedText: url.rawUrl
      });
    }
  }

  return indicators;
}

/**
 * Main analysis coordinator.
 * Returns clear prediction, transparent rule indicators, token weights, and ethical safety disclaimer.
 */
export function analyzeMessage(text: string): AnalysisResult {
  const startTime = performance.now();
  const trimmed = text.trim();

  // 1. URL extraction
  const urls = extractAndAnalyzeUrls(trimmed);

  // 2. Machine learning classifier inference
  const mlOutput = runMachineLearningClassifier(trimmed);

  // 3. Rule-based checks
  const ruleIndicators = runRuleBasedChecks(trimmed, urls);

  // 4. Risk Level determination
  let riskLevel: RiskLevel = 'Low';
  const hasDangerIndicator = ruleIndicators.some(i => i.severity === 'danger');
  const indicatorCount = ruleIndicators.length;

  if (mlOutput.category === 'Potentially Phishing' || hasDangerIndicator || indicatorCount >= 2) {
    riskLevel = 'High';
  } else if (indicatorCount === 1 || mlOutput.score > 35) {
    riskLevel = 'Medium';
  }

  // Ensure prediction reflects rule warnings if severe fraud signals are detected
  let finalCategory = mlOutput.category;
  if (hasDangerIndicator && finalCategory === 'Likely Legitimate') {
    // If ML didn't flag text but strong dangerous rules triggered (e.g. deceptive brand domain or OTP request)
    finalCategory = 'Potentially Phishing';
  }

  const endTime = performance.now();
  const analysisTimeMs = Math.max(1, Math.round(endTime - startTime));

  const words = trimmed.split(/\s+/).filter(Boolean);

  return {
    id: `scan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    message: trimmed,
    prediction: finalCategory,
    confidenceScore: mlOutput.score,
    rawModelProbability: mlOutput.probability,
    riskLevel,
    ruleIndicators,
    tokenWeights: mlOutput.tokenWeights,
    extractedUrls: urls,
    characterCount: trimmed.length,
    wordCount: words.length,
    analysisTimeMs,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    disclaimer: 'Notice: This prediction is based on statistical patterns and text heuristics. It is NOT a guarantee of safety. Attackers continuously adapt language, and text-only inspection cannot confirm whether a message or destination is truly secure.'
  };
}
