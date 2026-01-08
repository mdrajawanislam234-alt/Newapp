
import React, { useState } from 'react';
import { Trade } from '../types';
import { Search, Trash2, TrendingUp, TrendingDown, Clock, Pencil, ShieldCheck, Target, Zap, BarChart2, ChevronDown, ChevronUp } from 'lucide-react';
import TradeChart from './TradeChart';

interface TradeListProps {
  trades: Trade[];
  onDelete: (id: string) => void;
  onEdit: (trade: Trade) => void;
}

const TradeList: React.FC<TradeListProps> = ({ trades, onDelete, onEdit }) => {
  const [search, setSearch] = useState('');
  const [expandedChartId, setExpandedChartId] = useState<string | null>(null);

  const filteredTrades = trades.filter(t => 
    t.symbol.toLowerCase().includes(search.toLowerCase()) ||
    t.setup.toLowerCase().includes(search.toLowerCase())
  );

  const calculateRR = (trade: Trade) => {
    if (!trade.stopLoss || !trade.takeProfit) return 'N/A';
    const risk = Math.abs(trade.entryPrice - trade.stopLoss);
    const reward = Math.abs(trade.takeProfit - trade.entryPrice);
    if (risk === 0) return '∞';
    return `1:${(reward / risk).toFixed(1)}`;
  };

  const toggleChart = (id: string) => {
    setExpandedChartId(expandedChartId === id ? null : id);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter">Execution Journal</h2>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Institutional Transparency Protocol</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
          <input 
            className="w-full bg-accent-surface border border-accent-border rounded-2xl pl-12 pr-4 py-4 text-sm font-bold placeholder:text-gray-700 focus:outline-none focus:ring-2 focus:ring-accent-primary transition-all" 
            placeholder="FILTER TICKER OR STRATEGY..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
      </div>
      <div className="space-y-4">
        {filteredTrades.length === 0 ? (
          <div className="text-center py-32 glass-card rounded-3xl border-dashed border-2 border-white/5">
             <BarChart2 className="text-gray-800 mx-auto mb-4" size={48} />
             <p className="text-gray-600 font-black uppercase text-xs tracking-[0.2em]">No Synchronized Records</p>
          </div>
        ) : (
          filteredTrades.map(trade => (
            <div key={trade.id} className="glass-card rounded-3xl border border-white/5 hover:border-white/10 transition-all overflow-hidden flex flex-col relative">
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 z-10 ${trade.pnl >= 0 ? 'bg-accent-win' : 'bg-accent-loss'}`}></div>
              
              <div className="p-6 flex flex-col lg:flex-row items-center gap-8 relative">
                <div className="flex items-center gap-5 w-full lg:w-1/4">
                  <div className={`p-4 rounded-2xl shrink-0 ${trade.pnl >= 0 ? 'bg-accent-win/10 text-accent-win' : 'bg-accent-loss/10 text-accent-loss'}`}>
                    {trade.type === 'LONG' ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                  </div>
                  <div>
                    <div className="font-black text-2xl tracking-tighter uppercase">{trade.symbol}</div>
                    <div className="flex items-center gap-2 text-[9px] font-black text-gray-500 uppercase tracking-widest mt-1">
                      <Clock size={12} /> {trade.date}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 flex-1 w-full border-l border-white/5 lg:pl-8">
                  <StatItem label="Entry" value={`$${trade.entryPrice.toLocaleString()}`} />
                  <StatItem label="SL" value={trade.stopLoss ? `$${trade.stopLoss.toLocaleString()}` : '---'} color="text-accent-loss" />
                  <StatItem label="TP" value={trade.takeProfit ? `$${trade.takeProfit.toLocaleString()}` : '---'} color="text-accent-win" />
                  <div className="flex flex-col">
                     <span className="text-[9px] font-black text-gray-600 uppercase mb-1 flex items-center gap-1.5"><Zap size={10} className="text-accent-primary" /> R:R</span>
                     <span className="text-sm font-bold text-accent-primary font-mono bg-accent-primary/10 px-2 py-0.5 rounded-lg w-fit">{calculateRR(trade)}</span>
                  </div>
                  <div className="flex flex-col hidden md:flex">
                     <span className="text-[9px] font-black text-gray-600 uppercase mb-1">Setup</span>
                     <span className="text-xs font-bold text-gray-300 uppercase tracking-widest truncate">{trade.setup}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between lg:justify-end gap-6 w-full lg:w-auto min-w-[200px] border-l border-white/5 lg:pl-8">
                  <div className="text-right">
                    <div className={`text-2xl font-black tracking-tighter font-mono ${trade.pnl >= 0 ? 'text-accent-win' : 'text-accent-loss'}`}>
                      {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em]">P&L REALIZED</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => toggleChart(trade.id)} 
                      className={`p-3 rounded-xl transition-all ${expandedChartId === trade.id ? 'bg-accent-primary text-white' : 'text-gray-700 hover:text-accent-primary hover:bg-accent-primary/10'}`}
                      title="Analyze Chart"
                    >
                      <BarChart2 size={18} />
                    </button>
                    <button onClick={() => onEdit(trade)} className="p-3 text-gray-700 hover:text-accent-primary hover:bg-accent-primary/10 rounded-xl transition-all"><Pencil size={18} /></button>
                    <button onClick={() => onDelete(trade.id)} className="p-3 text-gray-700 hover:text-accent-loss hover:bg-accent-loss/10 rounded-xl transition-all"><Trash2 size={18} /></button>
                  </div>
                </div>
              </div>

              {expandedChartId === trade.id && (
                <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-300">
                  <TradeChart trade={trade} />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const StatItem = ({ label, value, color = 'text-gray-100' }: any) => (
  <div className="flex flex-col">
    <span className="text-[9px] font-black text-gray-600 uppercase mb-1">{label}</span>
    <span className={`text-sm font-bold font-mono ${color}`}>{value}</span>
  </div>
);

export default TradeList;
