import React, { useState } from 'react';
import { AnalysisResult } from '../types';
import { analyzeMessage } from '../lib/mlEngine';
import { SAMPLE_MESSAGES } from '../lib/sampleMessages';
import { ShieldCheck, Trash2, ArrowRight, Loader2, Sparkles, AlertCircle } from 'lucide-react';

interface DetectorDashboardProps {
  onAnalysisResult: (result: AnalysisResult) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const DetectorDashboard: React.FC<DetectorDashboardProps> = ({
  onAnalysisResult,
  isLoading,
  setIsLoading,
}) => {
  const [inputText, setInputText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);

  const charCount = inputText.length;
  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const MAX_CHARS = 10000;

  const handleClear = () => {
    setInputText('');
    setErrorMessage(null);
    setSelectedSampleId(null);
  };

  const handleLoadSample = (sampleId: string) => {
    const sample = SAMPLE_MESSAGES.find((s) => s.id === sampleId);
    if (sample) {
      setInputText(sample.text);
      setSelectedSampleId(sample.id);
      setErrorMessage(null);
    }
  };

  const handleAnalyze = () => {
    const trimmed = inputText.trim();

    if (!trimmed) {
      setErrorMessage('Please enter or paste an email or SMS message text to analyze.');
      return;
    }

    if (trimmed.length > MAX_CHARS) {
      setErrorMessage(`Message exceeds the maximum limit of ${MAX_CHARS.toLocaleString()} characters.`);
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    // Simulate realistic async pipeline (tokenization, vectorization, weights evaluation)
    setTimeout(() => {
      try {
        const result = analyzeMessage(trimmed);
        onAnalysisResult(result);
      } catch (err) {
        setErrorMessage('An unexpected error occurred during message preprocessing.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }, 450);
  };

  return (
    <div id="analyzer-section" className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl relative">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-800/80 gap-2">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <span>Detection Dashboard</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
              TF-IDF + Heuristics
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Paste suspicious email contents, SMS notifications, or security alerts for immediate screening.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
          <span>{wordCount} words</span>
          <span>•</span>
          <span className={charCount > MAX_CHARS ? 'text-rose-400 font-bold' : ''}>
            {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()} chars
          </span>
        </div>
      </div>

      {/* Quick Test Samples */}
      <div className="mb-4">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Quick Load Test Samples (Authentic Email & SMS benchmarks):</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_MESSAGES.map((s) => (
            <button
              key={s.id}
              onClick={() => handleLoadSample(s.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                selectedSampleId === s.id
                  ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400'
                  : s.category === 'phishing'
                  ? 'bg-slate-800/90 hover:bg-slate-800 text-slate-300 border border-rose-900/40 hover:border-rose-500/60'
                  : 'bg-slate-800/90 hover:bg-slate-800 text-slate-300 border border-emerald-900/40 hover:border-emerald-500/60'
              }`}
              title={s.preview}
            >
              <span
                className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${
                  s.category === 'phishing' ? 'bg-rose-400' : 'bg-emerald-400'
                }`}
              />
              <span className="font-semibold mr-1">[{s.type}]</span>
              {s.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Textarea */}
      <div className="relative">
        <textarea
          value={inputText}
          onChange={(e) => {
            setInputText(e.target.value);
            if (errorMessage) setErrorMessage(null);
          }}
          placeholder="Paste full email subject & body or SMS message text here...&#10;&#10;Example:&#10;From: Security Alert <service@bank-auth.com>&#10;Your debit card has been suspended due to 3 invalid login attempts. Click http://bit.ly/bank-verify within 24 hours to re-activate your account."
          rows={8}
          className="w-full bg-slate-950/80 border border-slate-700/80 rounded-2xl p-4 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-sans leading-relaxed resize-y"
        />

        {/* Floating Quick Clear */}
        {inputText.length > 0 && (
          <button
            onClick={handleClear}
            className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all text-xs flex items-center gap-1 cursor-pointer"
            title="Clear text"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        )}
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mt-3 p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Text remains local • Zero external network calls</span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleClear}
            disabled={isLoading || inputText.length === 0}
            className="w-1/3 sm:w-auto px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Clear Text
          </button>

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isLoading}
            className="w-2/3 sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Running Pipeline...</span>
              </>
            ) : (
              <>
                <span>Analyze Message</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Active Loading Indicator Overlay */}
      {isLoading && (
        <div className="mt-5 p-4 rounded-xl bg-blue-950/30 border border-blue-800/50 flex flex-col sm:flex-row items-center gap-4 text-xs text-blue-200 animate-pulse">
          <Loader2 className="w-5 h-5 text-blue-400 animate-spin shrink-0" />
          <div className="flex-1 space-y-1">
            <p className="font-semibold text-blue-300">Preprocessing & Vectorizing Text...</p>
            <p className="text-[11px] text-blue-400/80">
              Extracting n-grams • Computing document frequency weights • Applying Logistic Regression decision boundary • Auditing URL patterns
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
