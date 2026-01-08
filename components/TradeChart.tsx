
import React, { useEffect, useState } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ReferenceLine, 
  CartesianGrid, 
  Cell
} from 'recharts';
import { Loader2, AlertCircle, ArrowUpRight, ArrowDownRight, Calendar } from 'lucide-react';
import { Trade } from '../types';

interface TradeChartProps {
  trade: Trade;
}

const TradeChart: React.FC<TradeChartProps> = ({ trade }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        // Entry timestamp
        const entryTimestamp = new Date(trade.date).getTime();
        
        /**
         * Bybit V5 API
         * Interval: 'D' for Daily candles
         * Limit: 30 candles to show a month of progression from entry
         */
        const response = await fetch(
          `https://api.bybit.com/v5/market/kline?category=linear&symbol=${trade.symbol}&interval=D&start=${entryTimestamp}&limit=30`
        );
        const result = await response.json();

        if (result.retCode === 0 && result.result.list && result.result.list.length > 0) {
          const klines = result.result.list
            .map((item: any) => {
              const open = parseFloat(item[1]);
              const high = parseFloat(item[2]);
              const low = parseFloat(item[3]);
              const close = parseFloat(item[4]);
              const isUp = close >= open;
              
              return {
                time: new Date(parseInt(item[0])).toLocaleDateString([], { month: 'short', day: 'numeric' }),
                timestamp: parseInt(item[0]),
                open,
                high,
                low,
                close,
                // For Recharts Bar body representation
                body: isUp ? [open, close] : [close, open],
                // For the wick
                wick: [low, high],
                color: isUp ? '#10b981' : '#ef4444'
              };
            })
            .reverse();
          setData(klines);
        } else {
          throw new Error("No daily data found starting from this entry date.");
        }
      } catch (err) {
        setError("Daily market sync failed. Ticker might be delisted or invalid.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [trade.symbol, trade.date]);

  if (loading) return (
    <div className="h-64 flex flex-col items-center justify-center bg-gray-900/30 rounded-3xl border border-white/5 animate-pulse">
      <Loader2 className="animate-spin text-accent-primary mb-3" size={28} />
      <span className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Building Daily Candles...</span>
    </div>
  );

  if (error) return (
    <div className="h-64 flex flex-col items-center justify-center bg-accent-loss/5 rounded-3xl border border-accent-loss/10 p-6">
      <AlertCircle className="text-accent-loss mb-3" size={32} />
      <span className="text-[10px] font-black uppercase text-accent-loss tracking-widest text-center">{error}</span>
    </div>
  );

  const isWin = trade.pnl >= 0;

  // Custom Candle Component
  const Candlestick = (props: any) => {
    const { x, y, width, height, low, high, open, close, color } = props;
    if (isNaN(x) || isNaN(y)) return null;
    
    const ratio = height / Math.max(Math.abs(open - close), 0.000001);
    const wickTop = y - (high - Math.max(open, close)) * ratio;
    const wickBottom = y + height + (Math.min(open, close) - low) * ratio;

    return (
      <g>
        <line
          x1={x + width / 2}
          y1={wickTop}
          x2={x + width / 2}
          y2={wickBottom}
          stroke={color}
          strokeWidth={1.5}
        />
        <rect
          x={x}
          y={y}
          width={width}
          height={Math.max(height, 2)} // Ensure body is visible even on flat days
          fill={color}
          rx={1}
        />
      </g>
    );
  };

  return (
    <div className="h-80 w-full bg-gray-950/80 rounded-[2rem] border border-white/5 p-6 relative overflow-hidden">
      <div className="absolute top-6 left-8 z-20 flex items-center gap-4">
        <div>
          <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2">
            <Calendar size={12} /> Daily Execution View
          </h4>
          <div className="flex items-center gap-2 mt-1">
             <span className="text-sm font-black text-white">{trade.symbol}</span>
             <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${isWin ? 'bg-accent-win/20 text-accent-win' : 'bg-accent-loss/20 text-accent-loss'}`}>
                {isWin ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                {isWin ? 'Profit' : 'Loss'}
             </div>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 70, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
          <XAxis 
            dataKey="time" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#4b5563', fontSize: 9, fontWeight: 800 }} 
          />
          <YAxis 
            hide 
            domain={['dataMin - 5', 'dataMax + 5']} 
          />
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const d = payload[0].payload;
                return (
                  <div className="bg-gray-900 border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-xl">
                    <p className="text-[9px] font-black text-accent-primary uppercase mb-2 tracking-widest">{d.time}</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      <p className="text-[10px] text-gray-400 font-bold">O: <span className="text-white">${d.open.toLocaleString()}</span></p>
                      <p className="text-[10px] text-gray-400 font-bold">C: <span className="text-white">${d.close.toLocaleString()}</span></p>
                      <p className="text-[10px] text-gray-400 font-bold">H: <span className="text-accent-win">${d.high.toLocaleString()}</span></p>
                      <p className="text-[10px] text-gray-400 font-bold">L: <span className="text-accent-loss">${d.low.toLocaleString()}</span></p>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          
          <ReferenceLine 
            y={trade.entryPrice} 
            stroke="#6366f1" 
            strokeDasharray="4 4" 
            label={{ position: 'left', value: `ENTRY $${trade.entryPrice}`, fill: '#818cf8', fontSize: 8, fontWeight: 900, dy: -10 }} 
          />
          <ReferenceLine 
            y={trade.exitPrice} 
            stroke={isWin ? '#10b981' : '#ef4444'} 
            strokeDasharray="4 4" 
            label={{ position: 'right', value: `EXIT $${trade.exitPrice}`, fill: isWin ? '#10b981' : '#ef4444', fontSize: 8, fontWeight: 900, dy: 10 }} 
          />

          <Bar
            dataKey="body"
            shape={<Candlestick />}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
                {...entry}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TradeChart;
