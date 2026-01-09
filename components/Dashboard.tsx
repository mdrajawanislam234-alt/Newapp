
import React, { useState, useMemo, useEffect } from 'react';
import { Trade, BybitConfig } from '../types';
import { fetchBybitBalance } from '../services/bybit';
import { 
  Activity, 
  TrendingUp, 
  ChevronLeft,
  ChevronRight, 
  Flame,
  Zap,
  BarChart3,
  Calendar as CalendarIcon,
  Wallet,
  Unlink,
  Link,
  RefreshCw,
  Eye,
  EyeOff,
  ShieldCheck,
  Target,
  ArrowRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  BarChart,
  Bar,
  Cell,
  LabelList
} from 'recharts';

interface DashboardProps {
  trades: Trade[];
}

type Timeframe = '30d' | '90d' | 'all';

const Dashboard: React.FC<DashboardProps> = ({ trades }) => {
  const [viewDate, setViewDate] = useState(new Date());
  const [equityTimeframe, setEquityTimeframe] = useState<Timeframe>('all');
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  
  // Bybit States
  const [bybitConfig, setBybitConfig] = useState<BybitConfig>(() => {
    const saved = localStorage.getItem('alpha_bybit_config');
    return saved ? JSON.parse(saved) : { apiKey: '', apiSecret: '', isConnected: false };
  });
  const [liveBalance, setLiveBalance] = useState<number | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  // General Stats
  const totalPnl = useMemo(() => trades.reduce((acc, t) => acc + t.pnl, 0), [trades]);
  const winCount = useMemo(() => trades.filter(t => t.pnl > 0).length, [trades]);
  const winRate = useMemo(() => trades.length > 0 ? (winCount / trades.length) * 100 : 0, [trades, winCount]);
  const winningTrades = useMemo(() => trades.filter(t => t.pnl > 0), [trades]);
  const losingTrades = useMemo(() => trades.filter(t => t.pnl < 0), [trades]);
  const avgWin = useMemo(() => winningTrades.length > 0 ? winningTrades.reduce((acc, t) => acc + t.pnl, 0) / winningTrades.length : 0, [winningTrades]);
  const avgLoss = useMemo(() => losingTrades.length > 0 ? Math.abs(losingTrades.reduce((acc, t) => acc + t.pnl, 0) / losingTrades.length) : 1, [losingTrades]);
  const avgRR = useMemo(() => avgWin / (avgLoss || 1), [avgWin, avgLoss]);

  // Calendar Logic
  const currentMonth = viewDate.getMonth();
  const currentYear = viewDate.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const monthName = viewDate.toLocaleString('default', { month: 'long' });

  const monthTrades = useMemo(() => {
    return trades.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
  }, [trades, currentMonth, currentYear]);

  const monthStats = useMemo(() => {
    const pnl = monthTrades.reduce((acc, t) => acc + t.pnl, 0);
    const wins = monthTrades.filter(t => t.pnl > 0).length;
    const rate = monthTrades.length > 0 ? (wins / monthTrades.length) * 100 : 0;
    return { pnl, rate };
  }, [monthTrades]);

  // Calculate Heatmap Intensities
  const maxDayPnl = useMemo(() => {
    const dailyTotals: Record<string, number> = {};
    monthTrades.forEach(t => { dailyTotals[t.date] = (dailyTotals[t.date] || 0) + Math.abs(t.pnl); });
    return Math.max(...Object.values(dailyTotals), 100);
  }, [monthTrades]);

  // Equity Curve
  const equityCurve = useMemo(() => {
    let filteredTrades = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    if (equityTimeframe !== 'all') {
      const days = equityTimeframe === '30d' ? 30 : 90;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      filteredTrades = filteredTrades.filter(t => new Date(t.date) >= cutoffDate);
    }
    let runningPnl = 0;
    return filteredTrades.map(t => {
      runningPnl += t.pnl;
      return { 
        name: new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
        value: runningPnl 
      };
    });
  }, [trades, equityTimeframe]);

  const dailyPnlData = useMemo(() => {
    const map: Record<string, number> = {};
    trades.forEach(t => { map[t.date] = (map[t.date] || 0) + t.pnl; });
    return Object.entries(map)
      .map(([date, value]) => ({ 
        date: new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }), 
        timestamp: new Date(date).getTime(),
        value: Math.round(value)
      }))
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-15);
  }, [trades]);

  useEffect(() => {
    if (bybitConfig.isConnected) {
      handleSyncBalance();
    }
  }, []);

  const handleSyncBalance = async () => {
    if (!bybitConfig.apiKey) return;
    setIsSyncing(true);
    try {
      const balance = await fetchBybitBalance(bybitConfig);
      setLiveBalance(balance);
    } catch (e) {
      alert("Failed to sync with Bybit. Check your API credentials.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveConfig = () => {
    const newConfig = { ...bybitConfig, isConnected: true };
    setBybitConfig(newConfig);
    localStorage.setItem('alpha_bybit_config', JSON.stringify(newConfig));
    setShowConfig(false);
    handleSyncBalance();
  };

  const handleDisconnect = () => {
    const newConfig = { apiKey: '', apiSecret: '', isConnected: false };
    setBybitConfig(newConfig);
    setLiveBalance(null);
    localStorage.removeItem('alpha_bybit_config');
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-950 border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-md">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{payload[0].payload.name}</p>
          <p className={`text-sm font-black ${payload[0].value >= 0 ? 'text-accent-win' : 'text-accent-loss'}`}>
            ${payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Dashboard</h1>
          <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mt-1.5">Institutional Edge Engine</p>
        </div>

        <div className="flex items-center gap-3">
          {bybitConfig.isConnected ? (
            <div className="flex items-center gap-2 bg-accent-win/10 px-4 py-2 rounded-xl border border-accent-win/20">
              <div className="w-2 h-2 rounded-full bg-accent-win animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
              <span className="text-[10px] font-black text-accent-win uppercase tracking-widest">Bybit Linked</span>
              <button onClick={() => setShowConfig(true)} className="ml-2 p-1 hover:text-white transition-colors text-accent-win/60"><Wallet size={14} /></button>
            </div>
          ) : (
            <button onClick={() => setShowConfig(true)} className="flex items-center gap-2 bg-gray-900 border border-white/5 px-4 py-2 rounded-xl text-gray-400 hover:text-white transition-all">
              <Link size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">Link Bybit API</span>
            </button>
          )}
        </div>
      </div>

      {/* Modal Connection UI */}
      {showConfig && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md p-8 rounded-[2.5rem] border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tighter">Exchange Link</h2>
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">Shielded API Layer</p>
              </div>
              <button onClick={() => setShowConfig(false)} className="text-gray-500 hover:text-white">✕</button>
            </div>
            <div className="space-y-4">
              <input type="text" value={bybitConfig.apiKey} onChange={(e) => setBybitConfig({...bybitConfig, apiKey: e.target.value})} className="w-full bg-gray-900 border border-white/5 rounded-xl px-4 py-3 text-sm font-mono text-white focus:border-accent-primary outline-none" placeholder="API Key" />
              <div className="relative">
                <input type={showSecret ? "text" : "password"} value={bybitConfig.apiSecret} onChange={(e) => setBybitConfig({...bybitConfig, apiSecret: e.target.value})} className="w-full bg-gray-900 border border-white/5 rounded-xl px-4 py-3 text-sm font-mono text-white focus:border-accent-primary outline-none" placeholder="API Secret" />
                <button onClick={() => setShowSecret(!showSecret)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">{showSecret ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
              <button onClick={handleSaveConfig} className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-200 shadow-xl">Confirm Connection</button>
            </div>
          </div>
        </div>
      )}

      {/* Top Metrics Bar */}
      <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-3 pb-2 -mx-2 px-2">
        <MetricItem label="Total P&L" value={`$${totalPnl.toLocaleString()}`} color="text-white" bg="bg-accent-primary/10" icon={<TrendingUp size={14} className="text-accent-primary" />} />
        <MetricItem label="Win Rate" value={`${winRate.toFixed(1)}%`} color="text-accent-win" bg="bg-accent-win/10" icon={<Zap size={14} className="text-accent-win" />} />
        <MetricItem label="Avg R:R" value={`1:${avgRR.toFixed(1)}`} color="text-orange-400" bg="bg-orange-400/10" icon={<Flame size={14} className="text-orange-400" />} />
        {bybitConfig.isConnected && (
          <div className="min-w-[140px] glass-card rounded-2xl p-5 flex flex-col gap-1 border-b-2 border-accent-primary/40 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Bybit Equity</span>
              <button onClick={handleSyncBalance} disabled={isSyncing} className={`p-1 text-gray-500 hover:text-white ${isSyncing ? 'animate-spin' : ''}`}><RefreshCw size={12} /></button>
            </div>
            <div className={`text-2xl font-black tracking-tighter text-white truncate`}>
              {liveBalance !== null ? `$${liveBalance.toLocaleString(undefined, { maximumFractionDigits: 1 })}` : '---'}
            </div>
          </div>
        )}
      </div>

      {/* Equity Chart */}
      <div className="glass-card rounded-[2rem] p-8 border border-white/5 shadow-2xl overflow-hidden relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
          <div>
            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Activity size={14} className="text-accent-primary" /> Equity Growth
            </h3>
          </div>
          <div className="flex p-1 bg-gray-900/50 rounded-xl border border-white/5 self-start">
            {(['30d', '90d', 'all'] as Timeframe[]).map((tf) => (
              <button key={tf} onClick={() => setEquityTimeframe(tf)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${equityTimeframe === tf ? 'bg-accent-primary text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}>{tf}</button>
            ))}
          </div>
        </div>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={equityCurve} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs><linearGradient id="eqGlow" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} /><stop offset="100%" stopColor="#6366f1" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="5 5" stroke="#ffffff05" vertical={false} />
              <XAxis dataKey="name" hide />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 800 }} tickFormatter={(v) => `$${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={4} fill="url(#eqGlow)" animationDuration={1000} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily P&L Labels */}
        <div className="glass-card rounded-[2rem] p-6 h-fit">
          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-8"><BarChart3 size={14} className="text-accent-primary" /> Daily P&L Labels</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyPnlData} margin={{ top: 25, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: '#4b5563', fontSize: 8, fontWeight: 900 }} axisLine={false} tickLine={false} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="value" position="top" formatter={(val: number) => `${val >= 0 ? '+' : ''}$${val}`} style={{ fill: '#9ca3af', fontSize: '9px', fontWeight: '800' }} />
                  {dailyPnlData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.value >= 0 ? '#10b981' : '#ef4444'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Enhanced Analytics Heatmap */}
        <div className="glass-card rounded-[2rem] p-6 relative overflow-hidden flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={() => setViewDate(new Date(currentYear, currentMonth - 1, 1))} className="p-2 hover:bg-white/5 rounded-lg text-gray-500"><ChevronLeft size={16} /></button>
              <div className="text-center min-w-[120px]">
                <span className="text-[11px] font-black text-white uppercase tracking-tighter block leading-none">{monthName} {currentYear}</span>
                <span className={`text-[8px] font-black uppercase mt-1 ${monthStats.pnl >= 0 ? 'text-accent-win' : 'text-accent-loss'}`}>
                  {monthStats.pnl >= 0 ? '+' : ''}${Math.abs(Math.round(monthStats.pnl)).toLocaleString()} MTD
                </span>
              </div>
              <button onClick={() => setViewDate(new Date(currentYear, currentMonth + 1, 1))} className="p-2 hover:bg-white/5 rounded-lg text-gray-500"><ChevronRight size={16} /></button>
            </div>
            <div className="px-3 py-1.5 bg-white/5 rounded-xl border border-white/5">
              <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest block mb-0.5">Win Rate</span>
              <span className="text-[10px] font-black text-white">{monthStats.rate.toFixed(1)}%</span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-center">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <span key={d} className="text-[8px] font-black text-gray-700">{d}</span>)}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} className="aspect-square opacity-0"></div>)}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const dayNum = i + 1;
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayTrades = trades.filter(t => t.date === dateStr);
              const dayPnl = dayTrades.reduce((sum, t) => sum + t.pnl, 0);
              const trdCount = dayTrades.length;
              const isSelected = selectedDay === dateStr;

              // Intensity Logic
              const intensity = trdCount > 0 ? Math.max(0.15, Math.min(0.9, Math.abs(dayPnl) / maxDayPnl)) : 0;
              const bgColor = trdCount > 0 
                ? (dayPnl >= 0 ? `rgba(16, 185, 129, ${intensity})` : `rgba(239, 68, 68, ${intensity})`)
                : 'transparent';

              return (
                <button 
                  key={dayNum}
                  onClick={() => setSelectedDay(isSelected ? null : dateStr)}
                  className={`relative aspect-square rounded-lg flex flex-col items-center justify-center border transition-all overflow-hidden group
                    ${trdCount > 0 ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-default'}
                    ${isSelected ? 'ring-2 ring-accent-primary ring-offset-2 ring-offset-black z-10 scale-105' : 'border-white/5'}`}
                  style={{ backgroundColor: bgColor }}
                >
                  <span className={`absolute top-1 left-1.5 text-[7px] font-black transition-opacity ${trdCount > 0 ? 'opacity-90' : 'opacity-20'}`}>{dayNum}</span>
                  {trdCount > 0 && (
                    <div className="flex flex-col items-center justify-center px-1">
                      <span className="text-[8px] font-black text-white drop-shadow-md truncate max-w-full">
                        ${Math.abs(Math.round(dayPnl))}
                      </span>
                    </div>
                  )}
                  {/* Tooltip hint on hover */}
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
              );
            })}
          </div>

          {/* Day Selection Details (Dynamic Panel) */}
          {selectedDay && (
            <div className="mt-4 p-4 bg-gray-900/50 rounded-2xl border border-accent-primary/20 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-accent-primary/20 rounded-lg text-accent-primary"><Target size={12} /></div>
                  <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Details for {new Date(selectedDay).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</h4>
                </div>
                <button onClick={() => setSelectedDay(null)} className="text-[8px] font-black text-gray-500 uppercase hover:text-white">Close</button>
              </div>
              <div className="space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar">
                {trades.filter(t => t.date === selectedDay).map(t => (
                  <div key={t.id} className="flex items-center justify-between p-2.5 bg-black/40 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${t.pnl >= 0 ? 'bg-accent-win/20 text-accent-win' : 'bg-accent-loss/20 text-accent-loss'}`}>{t.type}</span>
                      <span className="text-[11px] font-black text-white">{t.symbol}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[9px] font-black text-gray-500">{t.setup}</span>
                      <span className={`text-[11px] font-black ${t.pnl >= 0 ? 'text-accent-win' : 'text-accent-loss'}`}>{t.pnl >= 0 ? '+' : ''}${Math.round(t.pnl)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MetricItem = ({ label, value, color, bg, icon }: any) => (
  <div className={`min-w-[140px] glass-card rounded-2xl p-5 flex flex-col gap-1 border-b-2 ${bg.replace('/10', '/40')}`}>
    <div className="flex items-center justify-between mb-2">
      <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
      {icon}
    </div>
    <div className={`text-2xl font-black tracking-tighter ${color}`}>{value}</div>
  </div>
);

export default Dashboard;
