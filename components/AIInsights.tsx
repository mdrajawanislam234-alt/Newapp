
import React, { useState } from 'react';
import { BrainCircuit, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { Trade } from '../types';
import { generateAIInsights } from '../services/gemini';

interface AIInsightsProps {
  trades: Trade[];
}

const AIInsights: React.FC<AIInsightsProps> = ({ trades }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getInsights = async () => {
    if (trades.length < 3) {
      setError("Please log at least 3 trades for the AI to detect meaningful patterns.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await generateAIInsights(trades);
      setInsight(result || "No specific insights generated.");
    } catch (err) {
      setError("Failed to reach the AlphaIntelligence engine. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            AlphaIntelligence
            <span className="text-xs bg-accent-primary/20 text-accent-primary px-2 py-1 rounded-full border border-accent-primary/30 font-bold uppercase tracking-wider">Experimental</span>
          </h2>
          <p className="text-gray-400">Personalized algorithmic performance review using Gemini 3.</p>
        </div>
        <button 
          onClick={getInsights}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-accent-primary to-purple-600 text-white py-3 px-8 rounded-xl font-bold shadow-xl shadow-accent-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
          {insight ? 'Refresh Analysis' : 'Run Algorithmic Analysis'}
        </button>
      </header>

      {!insight && !loading && !error && (
        <div className="bg-accent-surface border border-gray-800 rounded-3xl p-12 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-gray-900 rounded-2xl flex items-center justify-center mb-6 border border-gray-800">
            <BrainCircuit size={40} className="text-gray-600" />
          </div>
          <h3 className="text-xl font-bold mb-2">Unleash Deep Patterns</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-8">
            Our AI analyzes your trade notes, entry logic, and P&L distribution to identify hidden psychological blocks and execution flaws you might be missing.
          </p>
        </div>
      )}

      {loading && (
        <div className="bg-accent-surface border border-gray-800 rounded-3xl p-20 text-center flex flex-col items-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-accent-primary blur-2xl opacity-20 animate-pulse"></div>
            <Loader2 size={48} className="text-accent-primary animate-spin relative" />
          </div>
          <h3 className="text-xl font-bold mb-2">Decoding Your Market Edge...</h3>
          <p className="text-gray-500 animate-pulse">Running advanced pattern matching on your execution journal</p>
        </div>
      )}

      {error && (
        <div className="bg-accent-loss/10 border border-accent-loss/20 rounded-2xl p-6 flex items-start gap-4">
          <AlertCircle className="text-accent-loss shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-bold text-accent-loss">Analysis Blocked</h4>
            <p className="text-sm text-accent-loss/80">{error}</p>
          </div>
        </div>
      )}

      {insight && (
        <div className="bg-accent-surface border border-gray-800 rounded-3xl p-8 md:p-10 shadow-lg relative overflow-hidden prose prose-invert max-w-none">
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
             <BrainCircuit size={200} />
          </div>
          <div className="relative space-y-4">
            {insight.split('\n').map((line, i) => (
              <p key={i} className="text-gray-300 leading-relaxed text-lg">
                {line.startsWith('#') ? (
                  <span className="text-white font-bold block mt-6 mb-2 text-2xl">
                    {line.replace(/#/g, '').trim()}
                  </span>
                ) : line.startsWith('-') || line.startsWith('*') ? (
                  <span className="flex items-start gap-3 pl-4">
                    <span className="text-accent-primary mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-accent-primary"></span>
                    <span>{line.substring(1).trim()}</span>
                  </span>
                ) : line.trim() === '' ? (
                  <br />
                ) : (
                  line
                )}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIInsights;
