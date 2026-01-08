
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
      <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
        <div className="p-6 bg-accent-surface rounded-full border border-gray-800">
          <AreaChart className="text-gray-600" size={48} />
        </div>
        <h2 className="text-2xl font-bold">Insufficient Data</h2>
        <p className="text-gray-500 max-w-sm">
          Log at least 5 trades to start generating advanced analytics and performance charts.
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
  const COLORS = ['#00E396', '#FF4560'];

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
        <h2 className="text-3xl font-bold">Performance Analytics</h2>
        <p className="text-gray-400">Deeper insights into your trading edge.</p>
      </header>

      {/* Equity Curve */}
      <div className="bg-accent-surface p-6 rounded-2xl border border-gray-800">
        <h3 className="text-xl font-bold mb-6">Equity Growth Curve</h3>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={equityData}>
              <defs>
                <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="date" stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#161b22', borderColor: '#1f2937', borderRadius: '12px' }}
                itemStyle={{ color: '#8B5CF6', fontWeight: 'bold' }}
              />
              <Area 
                type="monotone" 
                dataKey="equity" 
                stroke="#8B5CF6" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorEquity)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Win/Loss Ratio */}
        <div className="bg-accent-surface p-6 rounded-2xl border border-gray-800">
          <h3 className="text-xl font-bold mb-6">Execution Consistency</h3>
          <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#161b22', borderColor: '#1f2937', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-8 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-accent-win"></div>
              <span className="text-sm text-gray-400">Wins ({winCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-accent-loss"></div>
              <span className="text-sm text-gray-400">Losses ({lossCount})</span>
            </div>
          </div>
        </div>

        {/* P&L By Strategy */}
        <div className="bg-accent-surface p-6 rounded-2xl border border-gray-800">
          <h3 className="text-xl font-bold mb-6">Performance by Strategy</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={setupData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
                <XAxis type="number" stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#4b5563" fontSize={12} width={100} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#161b22', borderColor: '#1f2937', borderRadius: '12px' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {setupData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.value >= 0 ? '#00E396' : '#FF4560'} />
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

export default Analytics;
