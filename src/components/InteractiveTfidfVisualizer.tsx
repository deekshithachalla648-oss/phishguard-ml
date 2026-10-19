import React, { useState } from 'react';
import { preprocessText, runMachineLearningClassifier } from '../lib/mlEngine';
import { Cpu, Calculator, Sparkles, BookOpen, Layers } from 'lucide-react';

export const InteractiveTfidfVisualizer: React.FC = () => {
  const [testSentence, setTestSentence] = useState('urgent verify bank account password immediately');
  const [threshold, setThreshold] = useState(0.50);

  const { tokens, rawTokens } = preprocessText(testSentence);
  const mlOutput = runMachineLearningClassifier(testSentence);

  const isPhishingAtThreshold = mlOutput.probability >= threshold;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Interactive TF-IDF & Vectorizer Lab</h2>
            <p className="text-xs text-slate-400">
              Explore step-by-step how text is converted into mathematical vectors and classified using Logistic Regression.
            </p>
          </div>
        </div>

        {/* Input Sandbox */}
        <div className="mt-4">
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Test Sentence or N-Gram Phrases:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={testSentence}
              onChange={(e) => setTestSentence(e.target.value)}
              placeholder="e.g. urgent account verification required immediately"
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
            <button
              onClick={() => setTestSentence('Hi team, lecture slides for algorithms have been uploaded to canvas.')}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 whitespace-nowrap cursor-pointer"
            >
              Load Legitimate Sample
            </button>
            <button
              onClick={() => setTestSentence('Urgent: Your account is suspended. Verify password within 24 hours.')}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 whitespace-nowrap cursor-pointer"
            >
              Load Phishing Sample
            </button>
          </div>
        </div>
      </div>

      {/* Mathematical Pipeline Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Step 1: Preprocessing */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono uppercase text-blue-400 font-bold">Step 1: NLP Preprocessing</span>
              <BookOpen className="w-4 h-4 text-blue-400" />
            </div>
            <h4 className="text-sm font-bold text-white mb-2">Tokenization & Stop Words</h4>
            <p className="text-xs text-slate-400 mb-3">
              Lowers casing, removes non-alphanumeric punctuation, and discards non-discriminative stop words.
            </p>
            <div className="space-y-2">
              <div>
                <span className="text-[10px] text-slate-500 block">Raw extracted tokens ({rawTokens.length}):</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {rawTokens.map((t, idx) => (
                    <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-800 text-[11px] font-mono text-slate-300">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="pt-2 border-t border-slate-800">
                <span className="text-[10px] text-slate-500 block">Filtered informative tokens ({tokens.length}):</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {tokens.map((t, idx) => (
                    <span key={idx} className="px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 text-[11px] font-mono font-bold">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: TF-IDF Transformation */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono uppercase text-indigo-400 font-bold">Step 2: Vectorization</span>
              <Calculator className="w-4 h-4 text-indigo-400" />
            </div>
            <h4 className="text-sm font-bold text-white mb-2">TF-IDF Matrix Formula</h4>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-indigo-300 mb-3 space-y-1">
              <div>TF = Count(t, d) / Total(d)</div>
              <div>IDF = ln((1 + N)/(1 + DF(t))) + 1</div>
              <div>TF-IDF = TF × IDF</div>
              <div>Vector = L2_Normalize(TF-IDF)</div>
            </div>
            <p className="text-xs text-slate-400">
              Terms with high frequency in a single email but rare across the broader corpus receive higher numerical weights.
            </p>
          </div>
        </div>

        {/* Step 3: Classifier Decision */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono uppercase text-emerald-400 font-bold">Step 3: Classification</span>
              <Layers className="w-4 h-4 text-emerald-400" />
            </div>
            <h4 className="text-sm font-bold text-white mb-2">Sigmoid Logistic Output</h4>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 mb-3">
              <div className="text-slate-400">z = bias + ∑(w_i · x_i)</div>
              <div className="text-slate-400">P(Y=1) = 1 / (1 + e^-z)</div>
              <div className="mt-2 text-base font-extrabold text-white flex items-center justify-between">
                <span>Model Output:</span>
                <span className={mlOutput.probability >= threshold ? 'text-rose-400' : 'text-emerald-400'}>
                  {(mlOutput.probability * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="text-xs">
              <span className="text-slate-400">Classification Verdict: </span>
              <strong className={isPhishingAtThreshold ? 'text-rose-400' : 'text-emerald-400'}>
                {isPhishingAtThreshold ? 'Potentially Phishing' : 'Likely Legitimate'}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Threshold Slider */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Decision Boundary Threshold Tuning</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Adjust the decision threshold to trade off False Positives vs False Negatives.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-slate-400">Threshold:</span>
            <span className="font-bold text-white">{threshold.toFixed(2)}</span>
          </div>
        </div>

        <input
          type="range"
          min="0.10"
          max="0.90"
          step="0.05"
          value={threshold}
          onChange={(e) => setThreshold(parseFloat(e.target.value))}
          className="w-full accent-blue-500 cursor-pointer"
        />

        <div className="flex justify-between text-[11px] text-slate-400 mt-2 font-mono">
          <span>0.10 (Paranoid: High Recall, more False Positives)</span>
          <span className="font-bold text-blue-400">0.50 (Standard Balanced)</span>
          <span>0.90 (Conservative: High Precision, misses subtle attacks)</span>
        </div>
      </div>
    </div>
  );
};
