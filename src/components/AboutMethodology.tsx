import React from 'react';
import { Info, ShieldAlert, Cpu, Database, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const AboutMethodology: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Title Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
            <Info className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Project Methodology & Educational Guide</h2>
            <p className="text-xs text-slate-400">
              An in-depth explanation of Natural Language Processing, classification mechanics, and cybersecurity limitations.
            </p>
          </div>
        </div>
      </div>

      {/* 1. What is Phishing */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>1. What is Phishing & Why Detection Matters</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Phishing is a deceptive cyber attack where adversaries craft counterfeit electronic messages masquerading as trusted institutions (banks, software providers, employers, or schools). Unlike technical vulnerabilities in code, phishing attacks <strong>exploit human psychology</strong>—specifically triggers of urgency, fear of financial loss, curiosity, and authority.
        </p>
        <p className="text-xs text-slate-300 leading-relaxed">
          According to cybersecurity reports, more than 80% of reported security incidents begin with a phishing lure. Automated message screening serves as an essential layer in defense-in-depth, warning users before they provide credentials or execute harmful downloads.
        </p>
      </div>

      {/* 2. Text Preprocessing */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Cpu className="w-4 h-4 text-indigo-400" />
          <span>2. Text Preprocessing & Cleaning</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Raw user text contains erratic formatting, capitalization, and punctuation. Before feeding text into a mathematical model, it undergoes structured preprocessing:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <strong className="text-white block mb-1">Lowercasing</strong>
            <span className="text-slate-400">Normalizes case variants so that "URGENT", "Urgent", and "urgent" map to the identical vocabulary token.</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <strong className="text-white block mb-1">Regex Tokenization</strong>
            <span className="text-slate-400">Splits the stream of characters into words and hyphenated compound terms (e.g., "re-activate").</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <strong className="text-white block mb-1">Stop-Words Removal</strong>
            <span className="text-slate-400">Filters non-discriminative grammar words ("the", "is", "at", "which") that appear uniformly across all messages.</span>
          </div>
        </div>
      </div>

      {/* 3. TF-IDF Intuition */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-400" />
          <span>3. Understanding TF-IDF (Term Frequency – Inverse Document Frequency)</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Computers cannot directly compute on text strings; words must be represented as numerical feature vectors. TF-IDF combines two fundamental intuitions:
        </p>
        <div className="space-y-2 text-xs">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <strong className="text-blue-300 block mb-0.5">Term Frequency (TF):</strong>
            <span className="text-slate-300">How frequently word <em>t</em> appears in document <em>d</em>. If an email repeatedly mentions "password", its TF is high.</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <strong className="text-indigo-300 block mb-0.5">Inverse Document Frequency (IDF):</strong>
            <span className="text-slate-300">Measures how rare a word is across all documents: <code className="text-white">IDF(t) = ln((1+N)/(1+DF(t))) + 1</code>. Words like "urgent" or "suspended" are rare in normal chat but frequent in scams, giving them a high IDF multiplier.</span>
          </div>
        </div>
      </div>

      {/* 4. How the Classifier Learns */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>4. How Logistic Regression Learns From Labeled Examples</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          During training on labeled examples (class 1 for phishing, class 0 for legitimate), the optimization algorithm (L-BFGS) adjusts a weight coefficient <code className="text-white font-mono">w_i</code> for every vocabulary feature.
        </p>
        <p className="text-xs text-slate-300 leading-relaxed">
          Words that consistently appear in phishing lures receive positive weights (e.g. <code className="text-rose-400">+3.82</code> for "suspended"). Words common in benign communication receive negative weights (e.g. <code className="text-emerald-400">-3.50</code> for "lecture"). The dot-product is summed with a bias intercept and passed through the standard sigmoid function to yield a bounded probability between 0% and 100%.
        </p>
      </div>

      {/* 5. Project Limitations & Ethical Guidelines */}
      <div className="bg-slate-900 border border-amber-900/60 rounded-3xl p-6 shadow-xl space-y-3">
        <h3 className="text-base font-bold text-amber-300 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <span>5. Limitations of Machine Learning & Why Safety Cannot Be Guaranteed</span>
        </h3>
        <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
          <p>
            The system purposefully presents its predictions as <strong>"Potentially Phishing"</strong> or <strong>"Likely Legitimate"</strong>, never claiming that an email or SMS is completely safe.
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-slate-400">
            <li><strong className="text-slate-200">Adversarial Vocabulary Evasion:</strong> Attackers regularly substitute keywords or insert invisible unicode spaces to bypass fixed n-gram models.</li>
            <li><strong className="text-slate-200">No Network Destination Execution:</strong> Text-only inspection cannot verify SSL certificates, IP reputations, or dynamic web server redirects that happen after a victim clicks.</li>
            <li><strong className="text-slate-200">Spear Phishing Context Blindness:</strong> A highly customized email referencing genuine company projects can appear statistically benign while containing malicious instructions.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
