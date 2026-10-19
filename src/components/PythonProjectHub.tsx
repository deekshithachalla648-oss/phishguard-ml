import React, { useState } from 'react';
import { PYTHON_PROJECT_FILES } from '../lib/pythonCodeTemplates';
import {
  Terminal,
  FileCode,
  Copy,
  Check,
  Download,
  FolderTree,
  HelpCircle,
  Play,
  Layers,
  ChevronRight
} from 'lucide-react';

export const PythonProjectHub: React.FC = () => {
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  const currentFile = PYTHON_PROJECT_FILES[selectedFileIndex];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentFile.content);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCommand(cmd);
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([currentFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = currentFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const windowsSteps = [
    { title: '1. Navigate into project folder', cmd: 'cd phishguard' },
    { title: '2. Create virtual environment', cmd: 'python -m venv venv' },
    { title: '3. Activate virtual environment', cmd: '.\\venv\\Scripts\\activate' },
    { title: '4. Install dependencies', cmd: 'pip install -r requirements.txt' },
    { title: '5. Train machine learning model', cmd: 'python train_model.py' },
    { title: '6. Start local Flask backend server', cmd: 'python app.py' },
    { title: '7. Run automated test suite', cmd: 'pytest tests/test_api.py -v' }
  ];

  const vivaQuestions = [
    {
      q: 'How did you prevent data leakage during model training?',
      a: 'We applied train_test_split (stratified 75% train, 25% test) BEFORE fitting the TF-IDF vectorizer. The vectorizer was fitted exclusively on X_train. X_test was only transformed using the already-fitted vocabulary and IDF weights, ensuring no future information leaked into the model.'
    },
    {
      q: 'Why use TF-IDF rather than a simple CountVectorizer (bag of words)?',
      a: 'CountVectorizer only counts word frequencies, causing frequent common words to dominate. TF-IDF penalizes words that appear universally across all emails (low IDF) and rewards words that are specifically concentrated in phishing lures (high IDF), dramatically sharpening feature signals.'
    },
    {
      q: 'Why prioritize Recall in phishing detection over raw Accuracy?',
      a: 'In cybersecurity, a False Negative (a phishing email slipping into an employee inbox) can lead to ransomware infection or account takeover. A False Positive simply results in a user verifying an authentic email. Therefore, high Recall (catching true attacks) is the primary defensive priority.'
    },
    {
      q: 'What is the role of the sigmoid activation in Logistic Regression?',
      a: 'Logistic Regression calculates a linear decision logit z = w0 + ∑(wi * xi). The sigmoid function σ(z) = 1 / (1 + e^-z) maps this unbounded real number into a bounded probabilistic range [0, 1], representing the estimated likelihood of the message being phishing.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
              <Terminal className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Python Flask Project Hub & Source Center</h2>
              <p className="text-xs text-slate-400">
                Complete, clean source code files ready to run on Windows in VS Code with Python and Scikit-Learn.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1.5 rounded-xl">
            <FolderTree className="w-4 h-4" />
            <span>Filesystem: /phishguard/</span>
          </div>
        </div>
      </div>

      {/* Windows VS Code Step-by-Step Terminal Guide */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
          <Play className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">
            Exact Windows VS Code Terminal Commands (Step-by-Step)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {windowsSteps.map((step, idx) => (
            <div key={idx} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs">
              <div className="overflow-hidden">
                <span className="text-slate-400 block text-[11px] mb-0.5">{step.title}</span>
                <code className="font-mono text-emerald-300 font-bold text-xs truncate block">
                  {step.cmd}
                </code>
              </div>
              <button
                onClick={() => handleCopyCommand(step.cmd)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all shrink-0 cursor-pointer"
                title="Copy command"
              >
                {copiedCommand === step.cmd ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Code Viewer with Tab Switcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        {/* File tabs */}
        <div className="flex flex-wrap items-center gap-1 p-3 bg-slate-950/80 border-b border-slate-800 overflow-x-auto">
          {PYTHON_PROJECT_FILES.map((f, idx) => (
            <button
              key={f.name}
              onClick={() => setSelectedFileIndex(idx)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
                selectedFileIndex === idx
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{f.name}</span>
            </button>
          ))}
        </div>

        {/* File Description Header */}
        <div className="p-4 bg-slate-900/60 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-mono text-blue-400 font-bold">{currentFile.path}</span>
            <p className="text-slate-400 text-[11px] mt-0.5">{currentFile.description}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-all cursor-pointer"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
            </button>

            <button
              onClick={handleDownloadFile}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download {currentFile.name}</span>
            </button>
          </div>
        </div>

        {/* Code Block */}
        <div className="p-4 bg-slate-950 max-h-[480px] overflow-y-auto">
          <pre className="font-mono text-xs text-slate-300 leading-relaxed whitespace-pre font-normal">
            {currentFile.content}
          </pre>
        </div>
      </div>

      {/* Architecture Flow Diagram */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          <span>System Pipeline Architecture</span>
        </h3>
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 leading-loose overflow-x-auto">
          <div className="text-blue-400 font-bold mb-1">[Client Input (Email or SMS Text)]</div>
          <div> &nbsp;│</div>
          <div> &nbsp;├──▶ <span className="text-amber-400">Rule-Based Indicators Scanner</span> (Urgency, Credential Harvesting, Suspicious URLs, Shorteners)</div>
          <div> &nbsp;└──▶ <span className="text-emerald-400">NLP Preprocessor</span> (Lowercasing, Regex Tokenization, Stop-Words Filter)</div>
          <div> &nbsp; &nbsp; &nbsp; &nbsp;│</div>
          <div> &nbsp; &nbsp; &nbsp; &nbsp;└──▶ <span className="text-indigo-400">TF-IDF Vectorizer</span> (Term Frequency × Inverse Document Frequency + L2 Norm)</div>
          <div> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;│</div>
          <div> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;└──▶ <span className="text-blue-400">Logistic Regression Model</span> (Dot-product z = w·x + b → Sigmoid σ(z))</div>
          <div> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;│</div>
          <div> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;└──▶ <span className="text-emerald-300">Decision Fusion & Risk Rating</span> (High / Med / Low + Caveat Notice)</div>
        </div>
      </div>

      {/* 2nd-Year CS Project Viva / Defense Questions */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-emerald-400" />
          <span>Academic Viva & Project Defense Guide (Key Questions & Answers)</span>
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Master these questions when explaining your project architecture and findings to professors and evaluators:
        </p>

        <div className="space-y-3">
          {vivaQuestions.map((item, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
              <h4 className="font-bold text-white text-sm mb-1.5 flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>{item.q}</span>
              </h4>
              <p className="text-slate-300 leading-relaxed pl-6">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
