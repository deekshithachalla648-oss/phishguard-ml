import React, { useState } from 'react';
import { HistoryItem } from '../types';
import { History, Trash2, Download, Search, ShieldCheck, ShieldAlert, Clock, ArrowRight } from 'lucide-react';

interface HistoryViewProps {
  history: HistoryItem[];
  onClearHistory: () => void;
  onDeleteItem: (id: string) => void;
  onSelectMessage: (fullMessage: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onClearHistory,
  onDeleteItem,
  onSelectMessage,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'phishing' | 'legitimate'>('all');
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const filteredHistory = history.filter((item) => {
    const matchesFilter =
      filterType === 'all'
        ? true
        : filterType === 'phishing'
        ? item.prediction === 'Potentially Phishing'
        : item.prediction === 'Likely Legitimate';

    const matchesSearch =
      item.messagePreview.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.prediction.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const exportAsJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `phishguard-history-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportAsCSV = () => {
    const headers = ['Timestamp', 'Prediction', 'ConfidenceScore', 'RiskLevel', 'IndicatorsCount', 'Message'];
    const rows = history.map((h) => [
      `"${h.timestamp}"`,
      `"${h.prediction}"`,
      h.confidenceScore,
      `"${h.riskLevel}"`,
      h.indicatorsCount,
      `"${h.fullMessage.replace(/"/g, '""').slice(0, 300)}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `phishguard-history-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <History className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Prediction History Log</h2>
              <p className="text-xs text-slate-400">
                Saved scans are preserved on your device only. You can inspect, re-analyze, or purge records at any time.
              </p>
            </div>
          </div>

          {/* Export & Clear Actions */}
          {history.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={exportAsCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
                title="Export history to CSV"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span>CSV</span>
              </button>
              <button
                onClick={exportAsJSON}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
                title="Export history to JSON"
              >
                <Download className="w-3.5 h-3.5 text-indigo-400" />
                <span>JSON</span>
              </button>
              <button
                onClick={() => setShowConfirmClear(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-semibold border border-rose-800/60 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Clear All</span>
              </button>
            </div>
          )}
        </div>

        {/* Search & Filter Bar */}
        {history.length > 0 && (
          <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search history messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  filterType === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({history.length})
              </button>
              <button
                onClick={() => setFilterType('phishing')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  filterType === 'phishing' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Phishing ({history.filter((h) => h.prediction === 'Potentially Phishing').length})
              </button>
              <button
                onClick={() => setFilterType('legitimate')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  filterType === 'legitimate' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Legitimate ({history.filter((h) => h.prediction === 'Likely Legitimate').length})
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmClear && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h4 className="text-base font-bold text-white mb-2">Delete Analysis History?</h4>
            <p className="text-xs text-slate-300 mb-5 leading-relaxed">
              This will permanently delete all {history.length} saved scans from your local storage. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowConfirmClear(false)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-xs text-slate-300 hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onClearHistory();
                  setShowConfirmClear(false);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs text-white font-bold cursor-pointer"
              >
                Yes, Delete All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Records List */}
      {filteredHistory.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center shadow-lg">
          <History className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-white mb-1">
            {history.length === 0 ? 'No Saved Scans Yet' : 'No Matching Records'}
          </h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {history.length === 0
              ? 'When you analyze an email or SMS, click "Save Analysis to History" on the results card to record it here.'
              : 'Try clearing your search query or switching your filter category.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map((item) => {
            const isPhish = item.prediction === 'Potentially Phishing';
            return (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                        isPhish
                          ? 'bg-rose-950 text-rose-300 border-rose-800'
                          : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      }`}
                    >
                      {item.prediction}
                    </span>

                    <span className="text-xs font-mono font-bold text-white">
                      Score: {item.confidenceScore}%
                    </span>

                    <span className="text-slate-500 text-xs">•</span>

                    <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {item.timestamp}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 font-mono leading-relaxed bg-slate-950/60 p-2 rounded-lg border border-slate-850">
                    {item.messagePreview}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onSelectMessage(item.fullMessage)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold transition-all cursor-pointer"
                    title="Load this message in the detector"
                  >
                    <span>Re-Analyze</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-all cursor-pointer"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
