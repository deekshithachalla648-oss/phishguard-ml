import React from 'react';
import { Shield, ShieldAlert, Cpu, Database, History, Terminal, Info } from 'lucide-react';

export type ActiveTab = 'detector' | 'tfidf-lab' | 'evaluation' | 'history' | 'python-project' | 'about';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  historyCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, historyCount }) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div
            onClick={() => setActiveTab('detector')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-emerald-500 p-0.5 shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/30 transition-all">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-white tracking-tight">PhishGuard</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-400 border border-blue-800/60">
                  ML Core
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Phishing Message Detection System</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('detector')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'detector'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Detector
            </button>

            <button
              onClick={() => setActiveTab('tfidf-lab')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'tfidf-lab'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              TF-IDF Math Lab
            </button>

            <button
              onClick={() => setActiveTab('evaluation')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'evaluation'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              Model Metrics & Matrix
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'history'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              History
              {historyCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  {historyCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('python-project')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'python-project'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              Python Project Hub
            </button>

            <button
              onClick={() => setActiveTab('about')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'about'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              About & Ethics
            </button>
          </nav>

          {/* Local Status Indicator */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-700/40 text-emerald-400 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="hidden sm:inline">Local ML Active</span>
              <span className="sm:hidden">Ready</span>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Scrollbar */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-2 border-t border-slate-800/80 no-scrollbar">
          <button
            onClick={() => setActiveTab('detector')}
            className={`whitespace-nowrap px-3 py-1 rounded-lg text-xs font-semibold ${
              activeTab === 'detector' ? 'bg-blue-600 text-white' : 'text-slate-400 bg-slate-900'
            }`}
          >
            Detector
          </button>
          <button
            onClick={() => setActiveTab('tfidf-lab')}
            className={`whitespace-nowrap px-3 py-1 rounded-lg text-xs font-semibold ${
              activeTab === 'tfidf-lab' ? 'bg-blue-600 text-white' : 'text-slate-400 bg-slate-900'
            }`}
          >
            TF-IDF Lab
          </button>
          <button
            onClick={() => setActiveTab('evaluation')}
            className={`whitespace-nowrap px-3 py-1 rounded-lg text-xs font-semibold ${
              activeTab === 'evaluation' ? 'bg-blue-600 text-white' : 'text-slate-400 bg-slate-900'
            }`}
          >
            Metrics
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`whitespace-nowrap px-3 py-1 rounded-lg text-xs font-semibold ${
              activeTab === 'history' ? 'bg-blue-600 text-white' : 'text-slate-400 bg-slate-900'
            }`}
          >
            History ({historyCount})
          </button>
          <button
            onClick={() => setActiveTab('python-project')}
            className={`whitespace-nowrap px-3 py-1 rounded-lg text-xs font-semibold ${
              activeTab === 'python-project' ? 'bg-blue-600 text-white' : 'text-slate-400 bg-slate-900'
            }`}
          >
            Python Code
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`whitespace-nowrap px-3 py-1 rounded-lg text-xs font-semibold ${
              activeTab === 'about' ? 'bg-blue-600 text-white' : 'text-slate-400 bg-slate-900'
            }`}
          >
            About
          </button>
        </div>
      </div>
    </header>
  );
};
