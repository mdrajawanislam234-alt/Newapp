
import React from 'react';
import { Trade } from '../types';
import { 
  TrendingUp, 
  Activity, 
  Target, 
  Calendar,
  ChevronRight,
  Wallet,
  Hash,
  Scale
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
  const avgRR = avgLoss > 0 ? (avgWin / avgLoss) : 0;

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
    <div className="space-y-10 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-700">
      {/* Dynamic Header */}
      <header>
        <h2 className="text-5xl font-black tracking-tighter text-white uppercase">Dashboard</h2>
        <p className="text-accent-primary font-bold text-lg mt-1">Hello Razanul 👋</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Vertical Stats Column */}
        <div className="w-full lg:w-80 flex flex-col gap-4 shrink-0">
          <VerticalStatCard 
            label="Net P&L" 
            value={`$${totalPnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            icon={<Wallet size={18} />}
            color={totalPnl >= 0 ? 'text-accent-win' : 'text-accent-loss'}
          />
          <VerticalStatCard 
            label="Total Trades" 
            value={trades.length.toString()}
            icon={<Hash size={18} />}
            color="text-blue-400"
          />
          <VerticalStatCard 
            label="Profit Factor" 
            value={profitFactor === Infinity ? '∞' : profitFactor.toFixed(2)}
            icon={<Target size={18} />}
            color="text-purple-400"
          />
          <VerticalStatCard 
            label="Winrate" 
            value={`${winRate.toFixed(1)}%`}
            icon={<Activity size={18} />}
            color="text-amber-400"
          />
          <VerticalStatCard 
            label="Avg. Risk/Reward" 
            value={`1:${avgRR.toFixed(2)}`}
            icon={<Scale size={18} />}
            color="text-pink-400"
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 space-y-8">
          {/* Activity Heatmap */}
          <div className="glass-card rounded-3xl p-8 border border-accent-border shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <Calendar size={120} />
             </div>
            <div className="flex items-center justify-between mb-8 relative z-10">
              <h3 className="text-xl font-bold flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-accent-primary animate-pulse"></div>
                Activity Grid
              </h3>
              <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">30 Day Snapshot</span>
            </div>
            <div className="grid grid-cols-10 gap-3 relative z-10">
              {days.map((day, i) => (
                <div 
                  key={i}
                  className={`heatmap-cell border border-white/5 transition-all duration-300 hover:scale-125 hover:z-20 cursor-help rounded-lg shadow-sm ${
                    day.count === 0 ? 'bg-gray-800/20' : 
                    day.pnl > 0 ? 'bg-accent-win shadow-accent-win/20' : 
                    day.pnl < 0 ? 'bg-accent-loss shadow-accent-loss/20' : 'bg-gray-600'
                  }`}
                  title={`${day.date}: $${day.pnl.toFixed(2)} (${day.count} trades)`}
                />
              ))}
            </div>
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-800 text-[10px] font-black text-gray-500 uppercase tracking-widest">
              <span>{new Date(days[0].date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
              <div className="flex gap-4">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-accent-win"></div> Profit</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-accent-loss"></div> Loss</div>
              </div>
              <span>Today</span>
            </div>
          </div>

          {/* Additional Info Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card rounded-3xl p-6 border border-accent-border">
              <h4 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-4">Long vs Short</h4>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span>Longs</span>
                    <span>{trades.filter(t => t.type === 'LONG').length}</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-accent-win" 
                      style={{ width: `${trades.length > 0 ? (trades.filter(t => t.type === 'LONG').length / trades.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span>Shorts</span>
                    <span>{trades.filter(t => t.type === 'SHORT').length}</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-accent-loss" 
                      style={{ width: `${trades.length > 0 ? (trades.filter(t => t.type === 'SHORT').length / trades.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-3xl p-6 border border-accent-border flex items-center justify-between group cursor-pointer hover:border-accent-primary transition-colors">
              <div>
                <h4 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-1">Expectancy Per Trade</h4>
                <div className="text-2xl font-mono font-black text-white">
                  ${(trades.length > 0 ? totalPnl / trades.length : 0).toFixed(2)}
                </div>
              </div>
              <ChevronRight className="text-gray-600 group-hover:text-accent-primary transition-colors" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const VerticalStatCard = ({ label, value, icon, color }) => (
  <div className="bg-accent-surface rounded-2xl p-5 border border-accent-border shadow-lg flex items-center gap-4 group hover:bg-gray-800/40 transition-all">
    <div className="p-3 bg-gray-900 rounded-xl text-gray-500 border border-gray-800 group-hover:border-accent-primary/30 transition-colors">
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-0.5">{label}</p>
      <p className={`text-xl font-mono font-black ${color}`}>{value}</p>
    </div>
  </div>
);

export default Dashboard;
