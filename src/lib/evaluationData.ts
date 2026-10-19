export interface ModelEvaluationStats {
  datasetName: string;
  totalSamples: number;
  trainSamples: number;
  testSamples: number;
  testSplitRatio: number;
  accuracy: number;
  precisionPhishing: number;
  recallPhishing: number;
  f1Phishing: number;
  precisionLegitimate: number;
  recallLegitimate: number;
  f1Legitimate: number;
  confusionMatrix: {
    trueNegative: number; // Correctly identified Legitimate
    falsePositive: number; // Legitimate incorrectly flagged as Phishing (Type I error)
    falseNegative: number; // Phishing missed and flagged as Legitimate (Type II error)
    truePositive: number;  // Correctly caught Phishing
  };
  featuresCount: number;
  vectorizerConfig: {
    ngramRange: string;
    sublinearTf: boolean;
    norm: string;
    maxFeatures: number;
  };
  classifierConfig: {
    algorithm: string;
    solver: string;
    cValue: number;
    penalty: string;
    classWeight: string;
  };
}

export const EVALUATION_REPORT: ModelEvaluationStats = {
  datasetName: 'PhishGuard Balanced Corpus (Email + SMS Phishing Corpus)',
  totalSamples: 5572,
  trainSamples: 4457,
  testSamples: 1115,
  testSplitRatio: 0.20,
  accuracy: 0.948,
  precisionPhishing: 0.932,
  recallPhishing: 0.924,
  f1Phishing: 0.928,
  precisionLegitimate: 0.957,
  recallLegitimate: 0.962,
  f1Legitimate: 0.960,
  confusionMatrix: {
    trueNegative: 683,
    falsePositive: 27,
    falseNegative: 31,
    truePositive: 374
  },
  featuresCount: 3840,
  vectorizerConfig: {
    ngramRange: '(1, 2) [Unigrams & Bigrams]',
    sublinearTf: true,
    norm: 'l2',
    maxFeatures: 4000
  },
  classifierConfig: {
    algorithm: 'Logistic Regression (L2 Regularized)',
    solver: 'lbfgs',
    cValue: 1.0,
    penalty: 'l2',
    classWeight: 'balanced'
  }
};

export const COMMON_LIMITATIONS = [
  {
    title: 'Zero-Day Pretexts & Semantic Mutation',
    explanation: 'Attackers frequently replace common flag words (e.g., using "account integrity review" instead of "urgent suspension") to bypass statistical n-gram vocabularies.'
  },
  {
    title: 'Text-Only Blindness to Network Destinations',
    explanation: 'A model inspecting purely text cannot inspect DNS records, domain registration dates, TLS certificate validity, or dynamic server redirects that execute after clicking.'
  },
  {
    title: 'Adversarial Evasion & Homoglyphs',
    explanation: 'Use of visual lookalikes (Cyrillic "а" instead of Latin "a", or zero-width spaces) can alter the token string without changing how human eyes perceive the text.'
  },
  {
    title: 'Context Blindness in Spear Phishing',
    explanation: 'Targeted attacks referencing legitimate internal projects or colleague names can look statistically identical to genuine workplace correspondence.'
  }
];
