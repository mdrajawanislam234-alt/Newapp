
import React from 'react';
import { Trade } from '../types';
import { 
  TrendingUp, 
  Activity, 
  Target, 
  Calendar,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Wallet
} from 'lucide-react';

interface DashboardProps {
  trades: Trade[];
}

const Dashboard: React.FC<DashboardProps> = ({ trades }) => {
  const totalPnl = trades.reduce((acc, t) => acc + t.pnl, 0);
  const winCount = trades.filter(t => t.pnl > 0).length;
  const winRate = trades.length > 0 ? (winCount / trades.length) * 100 : 0;
  
  const winningTrades = trades.filter(t => t.pnl > 0);
  const losingTrades = trades.filter(t => t.pnl < 0);
  
  const avgWin = winningTrades.length > 0 
    ? winningTrades.reduce((acc, t) => acc + t.pnl, 0) / winningTrades.length 
    : 0;
  
  const avgLoss = losingTrades.length > 0 
    ? Math.abs(losingTrades.reduce((acc, t) => acc + t.pnl, 0) / losingTrades.length) 
    : 0;

  const profitFactor = avgLoss > 0 ? (avgWin * winningTrades.length) / (avgLoss * losingTrades.length) : (winningTrades.length > 0 ? Infinity : 0);

  // Simple Heatmap logic: Last 30 days
  const today = new Date();
  const days = Array.from({length: 30}, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (29 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayTrades = trades.filter(t => t.date === dateStr);
    const dayPnl = dayTrades.reduce((acc, t) => acc + t.pnl, 0);
    return { date: dateStr, pnl: dayPnl, count: dayTrades.length };
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-white mb-2">Performance Center</h2>
          <p className="text-gray-400 font-medium">Tracking your statistical edge in real-time.</p>
        </div>
        <div className="flex gap-2 bg-accent-surface p-1 rounded-xl border border-accent-border">
          <button className="px-4 py-2 bg-accent-primary text-white rounded-lg text-sm font-bold shadow-lg shadow-accent-primary/20">Summary</button>
          <button className="px-4 py-2 text-gray-400 hover:text-white rounded-lg text-sm font-bold transition-colors">Risk Log</button>
        </div>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <SummaryCard 
          label="Net Profit" 
          value={`$${totalPnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          icon={<Wallet size={20} />}
          accent={totalPnl >= 0 ? 'text-accent-win' : 'text-accent-loss'}
          bg="bg-accent-primary/5"
        />
        <SummaryCard 
          label="Win Rate" 
          value={`${winRate.toFixed(1)}%`}
          icon={<Activity size={20} />}
          accent="text-blue-400"
        />
        <SummaryCard 
          label="Profit Factor" 
          value={profitFactor === Infinity ? '∞' : profitFactor.toFixed(2)}
          icon={<Target size={20} />}
          accent="text-purple-400"
        />
        <SummaryCard 
          label="Expectancy" 
          value={`$${(trades.length > 0 ? totalPnl / trades.length : 0).toFixed(2)}`}
          icon={<TrendingUp size={20} />}
          accent="text-amber-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Heatmap */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-8 border border-accent-border">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Calendar size={20} className="text-accent-primary" />
              Activity Grid
            </h3>
            <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Last 30 Days</span>
          </div>
          <div className="grid grid-cols-10 gap-2">
            {days.map((day, i) => (
              <div 
                key={i}
                className={`heatmap-cell border border-white/5 transition-transform hover:scale-110 cursor-help ${
                  day.count === 0 ? 'bg-gray-800/20' : 
                  day.pnl > 0 ? 'bg-accent-win opacity-80' : 
                  day.pnl < 0 ? 'bg-accent-loss opacity-80' : 'bg-gray-600'
                }`}
                title={`${day.date}: $${day.pnl.toFixed(2)} (${day.count} trades)`}
              />
            ))}
          </div>
          <div className="flex justify-between mt-6 pt-6 border-t border-gray-800 text-[10px] font-bold text-gray-500 uppercase">
            <span>{days[0].date}</span>
            <span>Today</span>
          </div>
        </div>

        {/* Breakdown Card */}
        <div className="glass-card rounded-3xl p-8 border border-accent-border flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold mb-6">Trade Ratios</h3>
            <div className="space-y-4">
              <BreakdownRow label="Avg. Win" value={`$${avgWin.toFixed(2)}`} color="text-accent-win" />
              <BreakdownRow label="Avg. Loss" value={`-$${avgLoss.toFixed(2)}`} color="text-accent-loss" />
              <BreakdownRow label="Reward/Risk" value={avgLoss > 0 ? (avgWin / avgLoss).toFixed(2) : '0.00'} color="text-white" />
              <div className="h-px bg-gray-800 my-4"></div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Longs Executed</span>
                <span className="font-mono font-bold">{trades.filter(t => t.type === 'LONG').length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Shorts Executed</span>
                <span className="font-mono font-bold">{trades.filter(t => t.type === 'SHORT').length}</span>
              </div>
            </div>
          </div>
          <button className="w-full mt-8 flex items-center justify-center gap-2 text-sm font-bold text-accent-primary hover:text-white transition-colors group">
            View Deep Analytics
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ label, value, icon, accent, bg = 'bg-accent-surface' }) => (
  <div className={`${bg} rounded-3xl p-6 border border-accent-border shadow-sm`}>
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 bg-gray-900 rounded-xl text-gray-500 border border-gray-800">
        {icon}
      </div>
      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</span>
    </div>
    <div className={`text-3xl font-black font-mono tracking-tighter ${accent}`}>
      {value}
    </div>
  </div>
);

const BreakdownRow = ({ label, value, color }) => (
  <div className="flex items-center justify-between">
    <span className="text-gray-400 text-sm">{label}</span>
    <span className={`font-mono font-bold ${color}`}>{value}</span>
  </div>
);

export default Dashboard;
