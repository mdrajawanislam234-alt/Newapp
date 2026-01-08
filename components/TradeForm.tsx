
import React, { useState, useEffect, useRef } from 'react';
import { X, Save, TrendingUp, TrendingDown, DollarSign, Target, ShieldOff } from 'lucide-react';
import { Trade, TradeType } from '../types';

interface TradeFormProps {
  onClose: () => void;
  onAdd: (trade: Trade) => void;
  onUpdate?: (trade: Trade) => void;
  tradeToEdit?: Trade | null;
}

const TradeForm: React.FC<TradeFormProps> = ({ onClose, onAdd, onUpdate, tradeToEdit }) => {
  const today = new Date().toLocaleDateString('en-CA'); 

  const [formData, setFormData] = useState({
    symbol: '',
    type: 'LONG' as TradeType,
    entryPrice: '',
    exitPrice: '',
    quantity: '',
    date: today,
    timeframe: '1H',
    setup: 'Manual',
    notes: '',
    stopLoss: '',
    takeProfit: ''
  });

  useEffect(() => {
    if (tradeToEdit) {
      setFormData({
        symbol: tradeToEdit.symbol,
        type: tradeToEdit.type,
        entryPrice: tradeToEdit.entryPrice.toString(),
        exitPrice: tradeToEdit.exitPrice.toString(),
        quantity: tradeToEdit.quantity.toString(),
        date: tradeToEdit.date,
        timeframe: tradeToEdit.timeframe,
        setup: tradeToEdit.setup,
        notes: tradeToEdit.notes,
        stopLoss: tradeToEdit.stopLoss?.toString() || '',
        takeProfit: tradeToEdit.takeProfit?.toString() || ''
      });
    }
  }, [tradeToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entry = parseFloat(formData.entryPrice);
    const exit = parseFloat(formData.exitPrice);
    const qty = parseFloat(formData.quantity);
    const pnl = formData.type === 'LONG' ? (exit - entry) * qty : (entry - exit) * qty;

    const tradeData: Trade = {
      id: tradeToEdit ? tradeToEdit.id : crypto.randomUUID(),
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
      stopLoss: formData.stopLoss ? parseFloat(formData.stopLoss) : undefined,
      takeProfit: formData.takeProfit ? parseFloat(formData.takeProfit) : undefined
    };

    if (tradeToEdit && onUpdate) onUpdate(tradeData);
    else onAdd(tradeData);
  };

  return (
    <div className="bg-accent-surface rounded-3xl border border-accent-border overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between p-6 border-b border-accent-border bg-gray-900/50 sticky top-0 z-10 backdrop-blur-md">
        <div>
          <h3 className="text-xl font-black tracking-tight text-white uppercase">{tradeToEdit ? 'Edit Execution' : 'Log Execution'}</h3>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Risk Management Integrated</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl text-gray-500"><X size={20} /></button>
      </div>
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputGroup label="Ticker" placeholder="BTCUSDT" value={formData.symbol} onChange={(v: string) => setFormData({...formData, symbol: v})} />
          <div className="space-y-2">
            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Trade Direction</label>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setFormData({...formData, type: 'LONG'})} className={`py-3 rounded-xl font-black text-xs transition-all ${formData.type === 'LONG' ? 'bg-accent-win text-black' : 'bg-gray-900 text-gray-500 border border-accent-border'}`}>LONG</button>
              <button type="button" onClick={() => setFormData({...formData, type: 'SHORT'})} className={`py-3 rounded-xl font-black text-xs transition-all ${formData.type === 'SHORT' ? 'bg-accent-loss text-black' : 'bg-gray-900 text-gray-500 border border-accent-border'}`}>SHORT</button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <InputGroup label="Entry" type="number" value={formData.entryPrice} onChange={(v: string) => setFormData({...formData, entryPrice: v})} />
          <InputGroup label="Exit" type="number" value={formData.exitPrice} onChange={(v: string) => setFormData({...formData, exitPrice: v})} />
          <InputGroup label="Qty" type="number" value={formData.quantity} onChange={(v: string) => setFormData({...formData, quantity: v})} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-900/40 p-5 rounded-2xl border border-accent-border/50">
          <InputGroup label="Stop Loss (SL)" type="number" icon={<ShieldOff size={12} className="text-accent-loss" />} value={formData.stopLoss} onChange={(v: string) => setFormData({...formData, stopLoss: v})} />
          <InputGroup label="Take Profit (TP)" type="number" icon={<Target size={12} className="text-accent-win" />} value={formData.takeProfit} onChange={(v: string) => setFormData({...formData, takeProfit: v})} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputGroup label="Date" type="date" value={formData.date} onChange={(v: string) => setFormData({...formData, date: v})} />
          <InputGroup label="Setup" type="select" options={['Manual', 'Breakout', 'Mean Reversion', 'FVG Fill', 'Scalp']} value={formData.setup} onChange={(v: string) => setFormData({...formData, setup: v})} />
        </div>
        <div className="space-y-2">
          <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Notes</label>
          <textarea rows={3} className="w-full bg-gray-900 border border-accent-border rounded-xl px-4 py-3 text-white font-medium resize-none" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
        </div>
        <button type="submit" className="w-full flex items-center justify-center gap-2 bg-white text-black py-4 rounded-xl font-black uppercase text-sm hover:bg-gray-200 transition-all active:scale-95 shadow-xl"><Save size={18} /> {tradeToEdit ? 'Update' : 'Log'} Trade</button>
      </form>
    </div>
  );
};

const InputGroup = ({ label, type = 'text', placeholder, value, onChange, icon, options }: any) => (
  <div className="space-y-2">
    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">{icon} {label}</label>
    {type === 'select' ? (
      <select className="w-full bg-gray-900 border border-accent-border rounded-xl px-4 py-3 text-white font-bold" value={value} onChange={e => onChange(e.target.value)}>
        {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    ) : (
      <input type={type} step="any" className="w-full bg-gray-900 border border-accent-border rounded-xl px-4 py-3 text-white font-mono font-bold text-sm" placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
    )}
  </div>
);

export default TradeForm;
