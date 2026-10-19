export type PredictionCategory = 'Potentially Phishing' | 'Likely Legitimate';

export type RiskLevel = 'High' | 'Medium' | 'Low';

export interface RuleIndicator {
  id: string;
  category: 'urgency' | 'credentials' | 'account' | 'url' | 'financial';
  title: string;
  severity: 'danger' | 'warning' | 'info';
  description: string;
  matchedText?: string;
}

export interface AnalyzedUrl {
  rawUrl: string;
  domain: string;
  isShortener: boolean;
  isIpAddress: boolean;
  isDeceptiveBrand: boolean;
  suspiciousTld: boolean;
  isHttp: boolean;
  warnings: string[];
}

export interface TokenWeight {
  token: string;
  tf: number;
  idf: number;
  weight: number;
  contribution: number; // weight * tfidf
  direction: 'phishing' | 'legitimate' | 'neutral';
}

export interface AnalysisResult {
  id: string;
  message: string;
  prediction: PredictionCategory;
  confidenceScore: number; // 0 - 100
  rawModelProbability: number; // 0.0 - 1.0
  riskLevel: RiskLevel;
  ruleIndicators: RuleIndicator[];
  tokenWeights: TokenWeight[];
  extractedUrls: AnalyzedUrl[];
  characterCount: number;
  wordCount: number;
  analysisTimeMs: number;
  timestamp: string;
  disclaimer: string;
}

export interface HistoryItem {
  id: string;
  timestamp: string;
  messagePreview: string;
  fullMessage: string;
  prediction: PredictionCategory;
  confidenceScore: number;
  riskLevel: RiskLevel;
  indicatorsCount: number;
}

export interface SampleMessage {
  id: string;
  title: string;
  category: 'phishing' | 'legitimate';
  type: 'Email' | 'SMS';
  preview: string;
  text: string;
  keySignals: string[];
}
