import React from 'react';
import { Shield, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 border-t border-slate-800 bg-slate-950 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-slate-300">PhishGuard Detection System</span>
          <span>•</span>
          <span>Computer Science Engineering Academic Project</span>
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <Lock className="w-3.5 h-3.5 text-blue-400" />
          <span>Local NLP Inference • No Paid APIs • Client-Side Privacy</span>
        </div>
      </div>
    </footer>
  );
};
