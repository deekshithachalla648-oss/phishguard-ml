import React, { useState } from 'react';
import { AnalysisResult } from '../types';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  BookmarkPlus,
  Check,
  RotateCcw,
  Info,
  Clock,
  Link as LinkIcon,
  HelpCircle,
  FileText
} from 'lucide-react';

interface ResultsViewProps {
  result: AnalysisResult;
  onReset: () => void;
  onSaveHistory: (result: AnalysisResult) => void;
  isSaved: boolean;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  result,
  onReset,
  onSaveHistory,
  isSaved,
}) => {
  const [showTokensDetails, setShowTokensDetails] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  const isPhishing = result.prediction === 'Potentially Phishing';

  const handleSave = () => {
    onSaveHistory(result);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  return (
    <div className="mt-8 space-y-6">
      {/* 1. Main Verdict Header Card */}
      <div
        className={`rounded-3xl p-6 sm:p-8 border shadow-2xl relative overflow-hidden transition-all ${
          isPhishing
            ? 'bg-gradient-to-b from-rose-950/60 via-slate-900 to-slate-950 border-rose-800/80'
            : 'bg-gradient-to-b from-emerald-950/50 via-slate-900 to-slate-950 border-emerald-800/80'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Verdict Info */}
          <div className="flex items-start gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                isPhishing
                  ? 'bg-rose-500/20 border border-rose-500/40 text-rose-400'
                  : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
              }`}
            >
              {isPhishing ? (
                <ShieldAlert className="w-8 h-8 animate-bounce-subtle" />
              ) : (
                <ShieldCheck className="w-8 h-8" />
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span
                  className={`text-xs uppercase font-extrabold px-2.5 py-0.5 rounded-full border ${
                    isPhishing
                      ? 'bg-rose-950 text-rose-300 border-rose-700/80'
                      : 'bg-emerald-950 text-emerald-300 border-emerald-700/80'
                  }`}
                >
                  {result.prediction}
                </span>

                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                    result.riskLevel === 'High'
                      ? 'bg-rose-900/30 text-rose-400 border-rose-800/50'
                      : result.riskLevel === 'Medium'
                      ? 'bg-amber-900/30 text-amber-400 border-amber-800/50'
                      : 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50'
                  }`}
                >
                  Risk Level: {result.riskLevel}
                </span>

                <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3" />
                  {result.timestamp} ({result.analysisTimeMs}ms)
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {isPhishing ? 'High Suspicion of Phishing' : 'Message Appears Likely Legitimate'}
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
                {isPhishing
                  ? 'Our machine learning classifier and rule-based heuristic checks detected language patterns, deceptive cues, or link anomalies commonly deployed in credential theft and social engineering attacks.'
                  : 'The evaluated text predominantly features vocabulary and conversational patterns characteristic of normal communication. However, review the caveats below.'}
              </p>
            </div>
          </div>

          {/* Model Confidence Metric Card */}
          <div className="lg:w-60 bg-slate-950/70 border border-slate-800 rounded-2xl p-4 shrink-0 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="font-semibold text-slate-300">Model Metric</span>
                <span className="font-mono text-[11px]">Logit: {result.rawModelProbability.toFixed(3)}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-3xl font-extrabold font-mono ${
                    isPhishing ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {result.confidenceScore}%
                </span>
                <span className="text-xs text-slate-400">
                  {isPhishing ? 'Phish Score' : 'Benign Index'}
                </span>
              </div>
            </div>

            {/* Visual Probability Bar */}
            <div className="mt-3">
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-700 ${
                    isPhishing
                      ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                      : 'bg-gradient-to-r from-blue-500 to-emerald-500'
                  }`}
                  style={{ width: `${Math.max(5, result.confidenceScore)}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5 leading-tight">
                Statistical confidence in feature space. Not a verified measure of absolute real-world danger.
              </p>
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="mt-6 pt-5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={isSaved}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isSaved
                  ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-default'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              {isSaved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
              <span>{isSaved ? 'Saved to History' : 'Save Analysis to History'}</span>
            </button>

            {saveToast && (
              <span className="text-xs text-emerald-400 font-medium animate-fade-in flex items-center gap-1">
                <Check className="w-3 h-3" /> Saved!
              </span>
            )}
          </div>

          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Analyze Another Message</span>
          </button>
        </div>
      </div>

      {/* 2. Transparent Warning Indicators (Rule-Based Heuristics) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span>Transparent Warning Indicators</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                {result.ruleIndicators.length} detected
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Deterministic rule checks (clearly distinguished from statistical model weights). These are warning indicators, not definitive proof of malicious intent.
            </p>
          </div>
        </div>

        {result.ruleIndicators.length === 0 ? (
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-900/40 text-emerald-200 text-xs flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-emerald-300">No Rule-Based Red Flags Found:</span> The message text did not trigger rules for artificial urgency deadlines, credential/OTP harvesting demands, or obfuscated URL shorteners.
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {result.ruleIndicators.map((indicator) => (
              <div
                key={indicator.id}
                className={`p-4 rounded-2xl border text-xs leading-relaxed ${
                  indicator.severity === 'danger'
                    ? 'bg-rose-950/30 border-rose-800/60 text-rose-200'
                    : 'bg-amber-950/30 border-amber-800/60 text-amber-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white text-sm flex items-center gap-1.5">
                    {indicator.severity === 'danger' ? (
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                    )}
                    {indicator.title}
                  </span>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                      indicator.severity === 'danger'
                        ? 'bg-rose-900/80 text-rose-300'
                        : 'bg-amber-900/80 text-amber-300'
                    }`}
                  >
                    {indicator.severity}
                  </span>
                </div>
                <p className="text-slate-300 mt-1">{indicator.description}</p>
                {indicator.matchedText && (
                  <div className="mt-2 p-1.5 rounded bg-black/40 font-mono text-[11px] text-slate-300 truncate">
                    Matched: {indicator.matchedText}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Safe URL Analysis Section (If links exist) */}
      {result.extractedUrls.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-blue-400" />
                <span>Extracted URL Static Safety Audit</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  {result.extractedUrls.length} link{result.extractedUrls.length > 1 ? 's' : ''}
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Parsed purely via string analysis. PhishGuard <strong className="text-slate-300">never visits or pings URLs</strong> over the network to protect you.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {result.extractedUrls.map((url, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="space-y-1 overflow-hidden">
                  <div className="flex items-center gap-2 font-mono text-xs text-blue-300 font-semibold truncate">
                    <ExternalLink className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">{url.rawUrl}</span>
                  </div>
                  <div className="text-slate-400 flex flex-wrap gap-2 text-[11px]">
                    <span>Domain: <strong className="text-slate-200">{url.domain}</strong></span>
                    <span>•</span>
                    <span>Protocol: <strong className={url.isHttp ? 'text-amber-400' : 'text-emerald-400'}>{url.isHttp ? 'HTTP (Insecure)' : 'HTTPS'}</strong></span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 shrink-0">
                  {url.isShortener && (
                    <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-semibold text-[10px]">
                      URL Shortener
                    </span>
                  )}
                  {url.isIpAddress && (
                    <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-semibold text-[10px]">
                      Raw IP Address Host
                    </span>
                  )}
                  {url.isDeceptiveBrand && (
                    <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-semibold text-[10px]">
                      Brand Spoofing Suspected
                    </span>
                  )}
                  {url.suspiciousTld && (
                    <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-semibold text-[10px]">
                      High-Risk TLD
                    </span>
                  )}
                  {url.warnings.length === 0 && (
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold text-[10px]">
                      Standard Domain Structure
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Token-Level Machine Learning Attribution (TF-IDF Feature Weights) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              <span>Token Influence Breakdown (Model Weights)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              How specific words in this message shifted the Logistic Regression log-odds toward Phishing (+) or Legitimate (-).
            </p>
          </div>

          <button
            onClick={() => setShowTokensDetails(!showTokensDetails)}
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold cursor-pointer underline"
          >
            {showTokensDetails ? 'Hide Formulas' : 'Show Math Details'}
          </button>
        </div>

        {result.tokenWeights.length === 0 ? (
          <p className="text-xs text-slate-400">
            No strong discriminative vocabulary tokens matched the trained dictionary.
          </p>
        ) : (
          <div>
            {/* Visual Tokens Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {result.tokenWeights.map((t, idx) => (
                <div
                  key={idx}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-2 ${
                    t.direction === 'phishing'
                      ? 'bg-rose-950/40 border-rose-800/80 text-rose-300'
                      : 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
                  }`}
                >
                  <span className="font-bold">{t.token}</span>
                  <span
                    className={`text-[10px] px-1 rounded ${
                      t.direction === 'phishing' ? 'bg-rose-900/60 text-rose-200' : 'bg-emerald-900/60 text-emerald-200'
                    }`}
                  >
                    {t.contribution > 0 ? `+${t.contribution}` : t.contribution}
                  </span>
                </div>
              ))}
            </div>

            {/* Detailed Table (expandable) */}
            {showTokensDetails && (
              <div className="overflow-x-auto mt-4 rounded-xl border border-slate-800 bg-slate-950">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Token</th>
                      <th className="py-2.5 px-3">TF</th>
                      <th className="py-2.5 px-3">IDF</th>
                      <th className="py-2.5 px-3">Coeff (w)</th>
                      <th className="py-2.5 px-3">Contribution</th>
                      <th className="py-2.5 px-3">Impact Direction</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {result.tokenWeights.map((t, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/40">
                        <td className="py-2 px-3 font-bold text-white">{t.token}</td>
                        <td className="py-2 px-3 text-slate-400">{t.tf}</td>
                        <td className="py-2 px-3 text-slate-400">{t.idf}</td>
                        <td className="py-2 px-3 text-slate-300">{t.weight > 0 ? `+${t.weight}` : t.weight}</td>
                        <td className="py-2 px-3 font-semibold text-slate-200">{t.contribution}</td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              t.direction === 'phishing'
                                ? 'bg-rose-950 text-rose-400 border border-rose-900'
                                : 'bg-emerald-950 text-emerald-400 border border-emerald-900'
                            }`}
                          >
                            {t.direction === 'phishing' ? 'Pushes Phishing' : 'Pushes Legitimate'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. Mandatory Ethical & Security Notice */}
      <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/40 text-amber-200/90 text-xs flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-amber-300">Critical Safety & Limitation Disclaimer:</p>
          <p className="text-slate-300 leading-relaxed">{result.disclaimer}</p>
        </div>
      </div>
    </div>
  );
};
