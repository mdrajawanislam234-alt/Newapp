
export type TradeType = 'LONG' | 'SHORT';
export type TradeStatus = 'WIN' | 'LOSS' | 'BREAKEVEN';

export interface Trade {
  id: string;
  symbol: string;
  type: TradeType;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  date: string;
  notes: string;
  setup: string;
  timeframe: string;
  riskAmount?: number;
  targetPrice?: number;
  rrRatio?: number;
}

export interface TradingStats {
  totalTrades: number;
  winRate: number;
  totalPnl: number;
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  maxDrawdown: number;
}
