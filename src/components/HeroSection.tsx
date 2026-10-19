import React from 'react';
import { ShieldCheck, AlertTriangle, Lock, ArrowDown, Sparkles } from 'lucide-react';

interface HeroSectionProps {
  onAnalyzeClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onAnalyzeClick }) => {
  return (
    <section className="relative overflow-hidden pt-6 pb-10">
      {/* Glow Background Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-5xl mx-auto text-center px-4">
        {/* Academic / Engineering Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-700/80 text-slate-300 text-xs font-medium mb-5 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>Computer Science Engineering • NLP & Machine Learning Project</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight sm:leading-snug">
          Detect Suspicious Messages{' '}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
            Before You Trust Them
          </span>
        </h1>

        {/* Plain language explanation */}
        <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
          <strong className="text-white">Phishing</strong> is a deceptive social engineering attack where cybercriminals impersonate banks, colleagues, delivery carriers, or universities. They construct artificial panic or greed to trick you into surrendering passwords, financial details, or two-factor security codes.
        </p>

        {/* Action Button */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onAnalyzeClick}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all cursor-pointer group"
          >
            <span>Analyze a Message</span>
            <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
          </button>
        </div>

        {/* Three Feature Cards */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          {/* Card 1 */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-base font-bold text-white mb-1.5">Machine Learning Analysis</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Applies TF-IDF text vectorization and a calibrated Logistic Regression classifier to evaluate n-gram word associations learned from verified phishing and benign datasets.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="text-base font-bold text-white mb-1.5">Transparent Warning Indicators</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Separately highlights heuristic indicators: artificial urgency deadlines, password/OTP harvesting requests, obfuscated link shorteners (bit.ly), and raw IP address links.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
              <Lock className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-base font-bold text-white mb-1.5">Privacy-Focused Detection</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              No paid external APIs or third-party cloud analytics. All ML token calculations run securely without storing sensitive messages on remote tracking servers.
            </p>
          </div>
        </div>

        {/* Ethical Safety Notice */}
        <div className="mt-6 p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 text-amber-200/90 text-xs text-left flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-300">Important ML Limitation Notice:</span> Machine learning models make statistical predictions based on patterns in training data and can make mistakes (both False Positives and False Negatives). A message predicted as "Likely Legitimate" is <strong className="underline decoration-amber-500">never guaranteed to be safe</strong>. Text-only analysis cannot inspect DNS authentication, server redirections, or zero-day phishing pretexts.
          </div>
        </div>
      </div>
    </section>
  );
};
