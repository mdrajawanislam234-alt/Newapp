
import React, { useState } from 'react';
import { X, Save, TrendingUp, TrendingDown, DollarSign, Target, ShieldAlert } from 'lucide-react';
import { Trade, TradeType } from '../types';

interface TradeFormProps {
  onClose: () => void;
  onAdd: (trade: Trade) => void;
}

const TradeForm: React.FC<TradeFormProps> = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    symbol: '',
    type: 'LONG' as TradeType,
    entryPrice: '',
    exitPrice: '',
    quantity: '',
    date: new Date().toISOString().split('T')[0],
    timeframe: '1H',
    setup: '',
    notes: '',
    riskAmount: '',
    targetPrice: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const entry = parseFloat(formData.entryPrice);
    const exit = parseFloat(formData.exitPrice);
    const qty = parseFloat(formData.quantity);
    const risk = parseFloat(formData.riskAmount) || 0;
    const target = parseFloat(formData.targetPrice) || 0;
    
    const pnl = formData.type === 'LONG' 
      ? (exit - entry) * qty 
      : (entry - exit) * qty;

    const newTrade: Trade = {
      id: crypto.randomUUID(),
      symbol: formData.symbol.toUpperCase(),
      type: formData.type,
      entryPrice: entry,
      exitPrice: exit,
      quantity: qty,
      pnl: pnl,
      date: formData.date,
      timeframe: formData.timeframe,
      setup: formData.setup,
      notes: formData.notes,
      riskAmount: risk,
      targetPrice: target
    };

    onAdd(newTrade);
  };

  return (
    <div className="bg-accent-surface rounded-3xl border border-accent-border overflow-hidden shadow-2xl ring-1 ring-white/10">
      <div className="flex items-center justify-between p-8 border-b border-accent-border bg-gray-900/50">
        <div>
          <h3 className="text-2xl font-black tracking-tight text-white">Log Execution</h3>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Institutional Record Keeping</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl text-gray-500 transition-colors">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Asset Ticker</label>
            <div className="relative">
               <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
               <input 
                required
                className="w-full bg-gray-900 border border-accent-border rounded-2xl pl-12 pr-4 py-4 text-white font-bold focus:outline-none focus:ring-2 focus:ring-accent-primary transition-all placeholder:text-gray-700"
                placeholder="e.g. BTCUSD"
                value={formData.symbol}
                onChange={e => setFormData({...formData, symbol: e.target.value})}
              />
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Trade Direction</label>
            <div className="grid grid-cols-2 gap-4">
              <DirectionButton 
                active={formData.type === 'LONG'} 
                onClick={() => setFormData({...formData, type: 'LONG'})}
                label="LONG"
                icon={<TrendingUp size={18} />}
                color="bg-accent-win text-black"
              />
              <DirectionButton 
                active={formData.type === 'SHORT'} 
                onClick={() => setFormData({...formData, type: 'SHORT'})}
                label="SHORT"
                icon={<TrendingDown size={18} />}
                color="bg-accent-loss text-black"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <InputGroup 
            label="Entry Price" 
            placeholder="0.00" 
            value={formData.entryPrice} 
            onChange={v => setFormData({...formData, entryPrice: v})}
          />
          <InputGroup 
            label="Exit Price" 
            placeholder="0.00" 
            value={formData.exitPrice} 
            onChange={v => setFormData({...formData, exitPrice: v})}
          />
          <InputGroup 
            label="Position Size" 
            placeholder="Qty" 
            value={formData.quantity} 
            onChange={v => setFormData({...formData, quantity: v})}
          />
           <InputGroup 
            label="Risk ($)" 
            placeholder="Optional" 
            value={formData.riskAmount} 
            onChange={v => setFormData({...formData, riskAmount: v})}
            icon={<ShieldAlert size={14} className="text-gray-600" />}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Entry Date</label>
            <input 
              type="date" required
              className="w-full bg-gray-900 border border-accent-border rounded-2xl px-5 py-4 text-white font-medium focus:outline-none focus:ring-2 focus:ring-accent-primary"
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})}
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Setup Strategy</label>
            <select 
              className="w-full bg-gray-900 border border-accent-border rounded-2xl px-5 py-4 text-white font-medium focus:outline-none focus:ring-2 focus:ring-accent-primary appearance-none cursor-pointer"
              value={formData.setup}
              onChange={e => setFormData({...formData, setup: e.target.value})}
            >
              <option value="">Manual/Discretionary</option>
              <option value="Breakout">Breakout</option>
              <option value="Mean Reversion">Mean Reversion</option>
              <option value="Supply/Demand">Supply & Demand</option>
              <option value="FVG Fill">FVG / Imbalance</option>
              <option value="Scalp">High Frequency Scalp</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Execution Notes</label>
          <textarea 
            rows={4}
            className="w-full bg-gray-900 border border-accent-border rounded-2xl px-5 py-4 text-white font-medium focus:outline-none focus:ring-2 focus:ring-accent-primary resize-none placeholder:text-gray-700"
            placeholder="Record psychology, mistakes, and post-trade review..."
            value={formData.notes}
            onChange={e => setFormData({...formData, notes: e.target.value})}
          />
        </div>

        <button 
          type="submit"
          className="w-full flex items-center justify-center gap-3 bg-white text-black py-5 rounded-2xl font-black text-lg hover:bg-gray-200 transition-all shadow-xl active:scale-95"
        >
          <Save size={22} />
          Confirm Execution
        </button>
      </form>
    </div>
  );
};

// Added explicit types for DirectionButton component props
interface DirectionButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const DirectionButton: React.FC<DirectionButtonProps> = ({ active, onClick, label, icon, color }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm transition-all ${
      active ? color : 'bg-gray-900 text-gray-500 border border-accent-border hover:border-gray-700'
    }`}
  >
    {icon}
    {label}
  </button>
);

// Added explicit types for InputGroup component props and marked icon as optional
interface InputGroupProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
}

const InputGroup: React.FC<InputGroupProps> = ({ label, placeholder, value, onChange, icon }) => (
  <div className="space-y-3">
    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
      {icon}
      {label}
    </label>
    <input 
      type="number" step="any" required={label !== 'Risk ($)'}
      className="w-full bg-gray-900 border border-accent-border rounded-2xl px-5 py-4 text-white font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary"
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  </div>
);

export default TradeForm;
