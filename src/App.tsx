/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { DetectorDashboard } from './components/DetectorDashboard';
import { ResultsView } from './components/ResultsView';
import { InteractiveTfidfVisualizer } from './components/InteractiveTfidfVisualizer';
import { EvaluationMetricsView } from './components/EvaluationMetricsView';
import { HistoryView } from './components/HistoryView';
import { PythonProjectHub } from './components/PythonProjectHub';
import { AboutMethodology } from './components/AboutMethodology';
import { Footer } from './components/Footer';
import { AnalysisResult, HistoryItem } from './types';

const STORAGE_KEY = 'phishguard_scan_history_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('detector');
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [savedResultIds, setSavedResultIds] = useState<Set<string>>(new Set());

  // Load history from localStorage on initial render
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as HistoryItem[];
        setHistory(parsed);
      }
    } catch (e) {
      console.error('Failed to load history from localStorage', e);
    }
  }, []);

  // Save history to localStorage whenever it changes
  const updateHistory = (newHistory: HistoryItem[]) => {
    setHistory(newHistory);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    } catch (e) {
      console.error('Failed to save history to localStorage', e);
    }
  };

  const handleAnalysisResult = (result: AnalysisResult) => {
    setCurrentResult(result);
    // Smooth scroll down to result view
    setTimeout(() => {
      const element = document.getElementById('results-anchor');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleSaveToHistory = (result: AnalysisResult) => {
    if (savedResultIds.has(result.id)) return;

    const newItem: HistoryItem = {
      id: result.id,
      timestamp: `${result.timestamp}`,
      messagePreview: result.message.slice(0, 180) + (result.message.length > 180 ? '...' : ''),
      fullMessage: result.message,
      prediction: result.prediction,
      confidenceScore: result.confidenceScore,
      riskLevel: result.riskLevel,
      indicatorsCount: result.ruleIndicators.length
    };

    const updated = [newItem, ...history];
    updateHistory(updated);
    setSavedResultIds((prev) => new Set(prev).add(result.id));
  };

  const handleClearHistory = () => {
    updateHistory([]);
    setSavedResultIds(new Set());
  };

  const handleDeleteHistoryItem = (id: string) => {
    const updated = history.filter((item) => item.id !== id);
    updateHistory(updated);
  };

  const handleReanalyzeFromHistory = (fullMessage: string) => {
    setActiveTab('detector');
    setCurrentResult(null);
    setTimeout(() => {
      const element = document.getElementById('analyzer-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleHeroAnalyzeClick = () => {
    setActiveTab('detector');
    setTimeout(() => {
      const element = document.getElementById('analyzer-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600/30 selection:text-blue-200">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        historyCount={history.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'detector' && (
          <div className="space-y-6">
            <HeroSection onAnalyzeClick={handleHeroAnalyzeClick} />

            <DetectorDashboard
              onAnalysisResult={handleAnalysisResult}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />

            <div id="results-anchor" />

            {currentResult && (
              <ResultsView
                result={currentResult}
                onReset={() => {
                  setCurrentResult(null);
                  const el = document.getElementById('analyzer-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                onSaveHistory={handleSaveToHistory}
                isSaved={savedResultIds.has(currentResult.id)}
              />
            )}
          </div>
        )}

        {activeTab === 'tfidf-lab' && <InteractiveTfidfVisualizer />}

        {activeTab === 'evaluation' && <EvaluationMetricsView />}

        {activeTab === 'history' && (
          <HistoryView
            history={history}
            onClearHistory={handleClearHistory}
            onDeleteItem={handleDeleteHistoryItem}
            onSelectMessage={handleReanalyzeFromHistory}
          />
        )}

        {activeTab === 'python-project' && <PythonProjectHub />}

        {activeTab === 'about' && <AboutMethodology />}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
