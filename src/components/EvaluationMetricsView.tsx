import React from 'react';
import { EVALUATION_REPORT, COMMON_LIMITATIONS } from '../lib/evaluationData';
import { Database, CheckCircle2, XCircle, AlertCircle, ShieldAlert, Cpu } from 'lucide-react';

export const EvaluationMetricsView: React.FC = () => {
  const { confusionMatrix, accuracy, precisionPhishing, recallPhishing, f1Phishing } = EVALUATION_REPORT;

  return (
    <div className="space-y-6">
      {/* Overview Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
              <Database className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Model Evaluation & Metrics Report</h2>
              <p className="text-xs text-slate-400">
                Evaluation results on held-out test split (25% stratified holdout). Tested with Scikit-Learn.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300">
            <span>Test Set: {EVALUATION_REPORT.testSamples.toLocaleString()} messages</span>
          </div>
        </div>
      </div>

      {/* 4 Core Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Accuracy */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold text-slate-300">Accuracy</span>
            <span className="text-[10px] font-mono text-slate-500">(TP+TN)/Total</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-blue-400 font-mono">
            {(accuracy * 100).toFixed(1)}%
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Proportion of all messages correctly classified across both classes.
          </p>
        </div>

        {/* Precision */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold text-slate-300">Precision (Phish)</span>
            <span className="text-[10px] font-mono text-slate-500">TP/(TP+FP)</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
            {(precisionPhishing * 100).toFixed(1)}%
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            When flagged as Phishing, how often the message is genuinely malicious.
          </p>
        </div>

        {/* Recall */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold text-slate-300">Recall (Phish)</span>
            <span className="text-[10px] font-mono text-slate-500">TP/(TP+FN)</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-indigo-400 font-mono">
            {(recallPhishing * 100).toFixed(1)}%
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Ability to catch all real phishing attempts without letting them slip past.
          </p>
        </div>

        {/* F1 Score */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold text-slate-300">F1-Score</span>
            <span className="text-[10px] font-mono text-slate-500">Harmonic Mean</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">
            {(f1Phishing * 100).toFixed(1)}%
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Harmonic balance of Precision and Recall on the imbalanced threat dataset.
          </p>
        </div>
      </div>

      {/* Confusion Matrix Interactive Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-2">Confusion Matrix (Held-out Test Split)</h3>
        <p className="text-xs text-slate-400 mb-6">
          Shows true outcomes versus predicted outcomes on {EVALUATION_REPORT.testSamples.toLocaleString()} unseen test messages.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* True Negative */}
          <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-800/60 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-mono font-bold text-emerald-400">True Negative (TN)</span>
                <span className="text-xl font-bold font-mono text-white">{confusionMatrix.trueNegative}</span>
              </div>
              <h4 className="text-sm font-bold text-emerald-300 mt-0.5">Legitimate Correctly Identified</h4>
              <p className="text-xs text-slate-300 mt-1">
                Normal emails/SMS accurately recognized as benign without triggering false alarms.
              </p>
            </div>
          </div>

          {/* False Positive */}
          <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-800/60 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-mono font-bold text-amber-400">False Positive (FP - Type I)</span>
                <span className="text-xl font-bold font-mono text-white">{confusionMatrix.falsePositive}</span>
              </div>
              <h4 className="text-sm font-bold text-amber-300 mt-0.5">False Alarm (Benign flagged as Phishing)</h4>
              <p className="text-xs text-slate-300 mt-1">
                Legitimate message that contained urgent keywords (e.g., IT scheduled maintenance notice). Causes minor inconvenience.
              </p>
            </div>
          </div>

          {/* False Negative */}
          <div className="p-5 rounded-2xl bg-rose-950/30 border border-rose-800/80 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-mono font-bold text-rose-400">False Negative (FN - Type II)</span>
                <span className="text-xl font-bold font-mono text-white">{confusionMatrix.falseNegative}</span>
              </div>
              <h4 className="text-sm font-bold text-rose-300 mt-0.5">Missed Attack (High Risk!)</h4>
              <p className="text-xs text-slate-300 mt-1">
                Phishing message misclassified as legitimate because attacker used novel wording. This is the most dangerous error in cybersecurity.
              </p>
            </div>
          </div>

          {/* True Positive */}
          <div className="p-5 rounded-2xl bg-blue-950/30 border border-blue-800/60 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-mono font-bold text-blue-400">True Positive (TP)</span>
                <span className="text-xl font-bold font-mono text-white">{confusionMatrix.truePositive}</span>
              </div>
              <h4 className="text-sm font-bold text-blue-300 mt-0.5">Phishing Correctly Caught</h4>
              <p className="text-xs text-slate-300 mt-1">
                Fraudulent lure intercepted and flagged before the recipient could click dangerous links.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Model Configuration & Training Hyperparameters */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-emerald-400" />
          <span>Training Pipeline Hyperparameters</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Algorithm</span>
            <span className="font-bold text-slate-200">Logistic Regression</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Regularization</span>
            <span className="font-bold text-slate-200">L2 (Ridge, C=1.0)</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">N-Gram Range</span>
            <span className="font-bold text-slate-200">(1, 2) Unigram + Bigram</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Sublinear TF</span>
            <span className="font-bold text-slate-200">True (1 + log(tf))</span>
          </div>
        </div>
      </div>

      {/* Limitations of ML Detection */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <h3 className="text-base font-bold text-white mb-4">Known System Limitations & Defense-in-Depth</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {COMMON_LIMITATIONS.map((lim, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
              <h4 className="font-bold text-amber-300 text-sm mb-1">{lim.title}</h4>
              <p className="text-slate-300 leading-relaxed">{lim.explanation}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
