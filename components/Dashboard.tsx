
import React, { useState, useMemo } from 'react';
import { Trade } from '../types';
import { 
  Activity, 
  TrendingUp, 
  ChevronLeft,
  ChevronRight, 
  Info,
  Flame,
  Target,
  Zap,
  BarChart3,
  Calendar as CalendarIcon
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  Radar,
  BarChart,
  Bar,
  Cell,
  LabelList
} from 'recharts';

interface DashboardProps {
  trades: Trade[];
}

const Dashboard: React.FC<DashboardProps> = ({ trades }) => {
  const [viewDate, setViewDate] = useState(new Date());

  const totalPnl = useMemo(() => trades.reduce((acc, t) => acc + t.pnl, 0), [trades]);
  const winCount = useMemo(() => trades.filter(t => t.pnl > 0).length, [trades]);
  const winRate = useMemo(() => trades.length > 0 ? (winCount / trades.length) * 100 : 0, [trades, winCount]);
  
  const winningTrades = useMemo(() => trades.filter(t => t.pnl > 0), [trades]);
  const losingTrades = useMemo(() => trades.filter(t => t.pnl < 0), [trades]);
  
  const avgWin = useMemo(() => winningTrades.length > 0 ? winningTrades.reduce((acc, t) => acc + t.pnl, 0) / winningTrades.length : 0, [winningTrades]);
  const avgLoss = useMemo(() => losingTrades.length > 0 ? Math.abs(losingTrades.reduce((acc, t) => acc + t.pnl, 0) / losingTrades.length) : 1, [losingTrades]);
  const avgRR = useMemo(() => avgWin / (avgLoss || 1), [avgWin, avgLoss]);

  const equityCurve = useMemo(() => {
    const sorted = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let runningPnl = 0;
    return sorted.map(t => {
      runningPnl += t.pnl;
      return { 
        name: new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
        value: runningPnl 
      };
    });
  }, [trades]);

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

  const currentMonth = viewDate.getMonth();
  const currentYear = viewDate.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const monthName = viewDate.toLocaleString('default', { month: 'long' });

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Dashboard</h1>
          <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mt-1.5">Institutional Edge Engine</p>
        </div>
      </div>

      <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-3 pb-2 -mx-2 px-2">
        <MetricItem label="Total P&L" value={`$${totalPnl.toLocaleString()}`} color="text-white" bg="bg-accent-primary/10" icon={<TrendingUp size={14} className="text-accent-primary" />} />
        <MetricItem label="Win Rate" value={`${winRate.toFixed(1)}%`} color="text-accent-win" bg="bg-accent-win/10" icon={<Zap size={14} className="text-accent-win" />} />
        <MetricItem label="Avg R:R" value={`1:${avgRR.toFixed(1)}`} color="text-orange-400" bg="bg-orange-400/10" icon={<Flame size={14} className="text-orange-400" />} />
      </div>

      <div className="glass-card rounded-[2rem] p-8 border border-white/5 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-accent-primary/10 blur-[100px] pointer-events-none rounded-full"></div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Activity size={14} className="text-accent-primary" />
              Institutional Equity Path
            </h3>
            <p className="text-[9px] text-gray-600 font-bold uppercase mt-1">Real-time Balance Projection</p>
          </div>
        </div>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={equityCurve} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="equityGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="50%" stopColor="#6366f1" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="5 5" stroke="#ffffff05" vertical={false} />
              <XAxis dataKey="name" hide />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 800 }} tickFormatter={(v) => `$${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={4} fill="url(#equityGlow)" animationDuration={2000} dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0, fill: '#fff' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card rounded-[2rem] p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2"><BarChart3 size={14} className="text-accent-primary" /> Daily P&L Labels</h3>
          </div>
          <div className="h-[200px] w-full">
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
        <div className="glass-card rounded-[2rem] p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <button onClick={() => setViewDate(new Date(currentYear, currentMonth - 1, 1))} className="p-2 hover:bg-white/5 rounded-lg text-gray-500"><ChevronLeft size={16} /></button>
              <span className="text-[11px] font-black text-white uppercase tracking-tighter">{monthName} {currentYear}</span>
              <button onClick={() => setViewDate(new Date(currentYear, currentMonth + 1, 1))} className="p-2 hover:bg-white/5 rounded-lg text-gray-500"><ChevronRight size={16} /></button>
            </div>
            <h3 className="text-[9px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-1"><CalendarIcon size={10} /> Heatmap</h3>
          </div>
          <div className="grid grid-cols-7 gap-1.5 text-center mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <span key={d} className="text-[8px] font-black text-gray-700">{d}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} className="aspect-square opacity-0"></div>)}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const dayNum = i + 1;
              const targetDateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayTrades = trades.filter(t => t.date === targetDateStr);
              const dayPnl = dayTrades.reduce((sum, t) => sum + t.pnl, 0);
              const count = dayTrades.length;
              return (
                <div key={dayNum} className={`aspect-square rounded-lg flex items-center justify-center border transition-all ${count > 0 ? (dayPnl > 0 ? 'bg-accent-win/20 border-accent-win/40 text-accent-win' : 'bg-accent-loss/20 border-accent-loss/40 text-accent-loss') : 'bg-gray-900/40 border-white/5 text-gray-800'}`}>
                  <span className="text-[9px] font-black">{dayNum}</span>
                </div>
              );
            })}
          </div>
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
