
import React, { useState } from 'react';
import { Trade } from '../types';
import { Search, Trash2, Tag, Layers, TrendingUp, TrendingDown, Clock } from 'lucide-react';

interface TradeListProps {
  trades: Trade[];
  onDelete: (id: string) => void;
}

const TradeList: React.FC<TradeListProps> = ({ trades, onDelete }) => {
  const [search, setSearch] = useState('');

  const filteredTrades = trades.filter(t => 
    t.symbol.toLowerCase().includes(search.toLowerCase()) ||
    t.setup.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Execution Log</h2>
          <p className="text-gray-400">Review every entry and exit decision with precision.</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            className="w-full bg-accent-surface border border-accent-border rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-accent-primary transition-all text-sm font-medium"
            placeholder="Search by ticker, strategy or notes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredTrades.length === 0 ? (
          <div className="text-center py-32 glass-card rounded-3xl border border-dashed border-gray-800">
            <div className="bg-gray-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-800">
              <Search className="text-gray-600" size={24} />
            </div>
            <p className="text-gray-500 font-medium">No records matching your search query.</p>
          </div>
        ) : (
          filteredTrades.map(trade => (
            <div 
              key={trade.id} 
              className="glass-card rounded-2xl border border-accent-border hover:border-gray-700 transition-all p-5 flex flex-col md:flex-row items-center gap-6 group"
            >
              {/* Left Segment: Asset Info */}
              <div className="flex items-center gap-4 w-full md:w-1/4">
                <div className={`p-3 rounded-2xl ${trade.pnl >= 0 ? 'bg-accent-win/10 text-accent-win' : 'bg-accent-loss/10 text-accent-loss'}`}>
                  {trade.type === 'LONG' ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                </div>
                <div>
                  <div className="font-black text-xl tracking-tighter uppercase">{trade.symbol}</div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    <Clock size={12} />
                    {new Date(trade.date).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Middle Segment: Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 flex-1 w-full">
                <StatItem label="Entry" value={`$${trade.entryPrice.toFixed(2)}`} />
                <StatItem label="Exit" value={`$${trade.exitPrice.toFixed(2)}`} />
                <StatItem label="Size" value={trade.quantity.toString()} />
                <div className="flex flex-col">
                   <span className="text-[10px] font-black text-gray-500 uppercase mb-1">Setup</span>
                   <div className="flex items-center gap-1.5 text-sm font-bold text-gray-300">
                     <Tag size={12} className="text-accent-primary" />
                     {trade.setup || 'Discrete'}
                   </div>
                </div>
              </div>

              {/* Right Segment: P&L and Actions */}
              <div className="flex items-center justify-between md:justify-end gap-8 w-full md:w-auto min-w-[140px]">
                <div className="text-right">
                  <div className={`text-2xl font-mono font-black ${trade.pnl >= 0 ? 'text-accent-win' : 'text-accent-loss'}`}>
                    {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    P&L USD
                  </div>
                </div>
                <button 
                  onClick={() => onDelete(trade.id)}
                  className="p-3 text-gray-600 hover:text-accent-loss hover:bg-accent-loss/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const StatItem = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-[10px] font-black text-gray-500 uppercase mb-1">{label}</span>
    <span className="text-sm font-mono font-bold text-gray-100">{value}</span>
  </div>
);

export default TradeList;
