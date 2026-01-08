
import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { Trade } from '../types';

interface AnalyticsProps {
  trades: Trade[];
}

const Analytics: React.FC<AnalyticsProps> = ({ trades }) => {
  if (trades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-20">
        <div className="p-8 bg-accent-surface rounded-full border border-accent-border mb-6">
          <BarChart2 className="text-gray-600" size={48} />
        </div>
        <h2 className="text-2xl font-bold mb-2">Insufficient Report Data</h2>
        <p className="text-gray-500 max-w-sm">
          Execute and log at least 5 trades to unlock institutional-grade performance reporting and statistical distribution charts.
        </p>
      </div>
    );
  }

  // Equity Curve calculation
  const sortedTrades = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  let runningTotal = 0;
  const equityData = sortedTrades.map(t => {
    runningTotal += t.pnl;
    return {
      date: new Date(t.date).toLocaleDateString(),
      equity: runningTotal
    };
  });

  // Win/Loss distribution
  const winCount = trades.filter(t => t.pnl > 0).length;
  const lossCount = trades.filter(t => t.pnl <= 0).length;
  const pieData = [
    { name: 'Wins', value: winCount },
    { name: 'Losses', value: lossCount }
  ];
  const COLORS = ['#10b981', '#ef4444'];

  // P&L by Setup
  const setups: Record<string, number> = {};
  trades.forEach(t => {
    const setup = t.setup || 'Other';
    setups[setup] = (setups[setup] || 0) + t.pnl;
  });
  const setupData = Object.entries(setups).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header>
        <h2 className="text-4xl font-black tracking-tight mb-2">Performance Reports</h2>
        <p className="text-gray-400 font-medium">Quantifying your execution edge with precision data.</p>
      </header>

      {/* Equity Curve */}
      <div className="bg-accent-surface p-8 rounded-3xl border border-accent-border shadow-sm">
        <h3 className="text-xl font-black mb-8 flex items-center gap-2">
          <div className="w-1.5 h-6 bg-accent-primary rounded-full"></div>
          Cumulative Equity Growth
        </h3>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={equityData}>
              <defs>
                <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#4b5563" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false} 
                tick={{ fontWeight: 600 }}
              />
              <YAxis 
                stroke="#4b5563" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(val) => `$${val}`} 
                tick={{ fontWeight: 600 }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)' }}
                itemStyle={{ color: '#6366f1', fontWeight: 'bold' }}
              />
              <Area 
                type="monotone" 
                dataKey="equity" 
                stroke="#6366f1" 
                strokeWidth={4}
                fillOpacity={1} 
                fill="url(#colorEquity)" 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Win/Loss Ratio */}
        <div className="bg-accent-surface p-8 rounded-3xl border border-accent-border shadow-sm">
          <h3 className="text-xl font-black mb-8 flex items-center gap-2">
            <div className="w-1.5 h-6 bg-accent-win rounded-full"></div>
            Win/Loss Distribution
          </h3>
          <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '16px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-10 mt-6">
            <div className="flex flex-col items-center">
              <span className="text-accent-win text-2xl font-black">{winCount}</span>
              <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Wins</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-accent-loss text-2xl font-black">{lossCount}</span>
              <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Losses</span>
            </div>
          </div>
        </div>

        {/* P&L By Strategy */}
        <div className="bg-accent-surface p-8 rounded-3xl border border-accent-border shadow-sm">
          <h3 className="text-xl font-black mb-8 flex items-center gap-2">
            <div className="w-1.5 h-6 bg-purple-500 rounded-full"></div>
            P&L by Strategy
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={setupData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
                <XAxis type="number" stroke="#4b5563" fontSize={11} tickLine={false} axisLine={false} tick={{ fontWeight: 600 }} />
                <YAxis dataKey="name" type="category" stroke="#f3f4f6" fontSize={11} width={100} tickLine={false} axisLine={false} tick={{ fontWeight: 600 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '16px' }}
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={24}>
                  {setupData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.value >= 0 ? '#10b981' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

import { BarChart2 } from 'lucide-react';

export default Analytics;
