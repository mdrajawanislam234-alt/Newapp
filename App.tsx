
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  BarChart2, 
  BrainCircuit, 
  PlusCircle,
  TrendingUp,
  Menu,
  ChevronLeft,
  X,
  Settings,
  Trash2,
  RefreshCcw
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import TradeList from './components/TradeList';
import Analytics from './components/Analytics';
import AIInsights from './components/AIInsights';
import TradeForm from './components/TradeForm';
import { Trade } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'journal' | 'reports' | 'ai'>('dashboard');
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [tradeToEdit, setTradeToEdit] = useState<Trade | null>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getLocalDate = (daysOffset: number = 0) => {
    const d = new Date();
    d.setDate(d.getDate() - daysOffset);
    return d.toISOString().split('T')[0];
  };

  const sampleTrades: Trade[] = [
    { id: '1', symbol: 'BTCUSDT', type: 'LONG', entryPrice: 65000, exitPrice: 67200, quantity: 0.1, pnl: 220, date: getLocalDate(0), setup: 'Breakout', timeframe: '1H', stopLoss: 64000, takeProfit: 68000, notes: 'Clean breakout of 65k level.' },
    { id: '2', symbol: 'ETHUSDT', type: 'SHORT', entryPrice: 3500, exitPrice: 3410, quantity: 2, pnl: 180, date: getLocalDate(1), setup: 'Mean Reversion', timeframe: '15m', stopLoss: 3550, takeProfit: 3300, notes: 'Rejected at local resistance.' }
  ];

  useEffect(() => {
    const isInitialized = localStorage.getItem('alpha_trader_initialized');
    const savedTrades = localStorage.getItem('alpha_trader_trades');

    if (!isInitialized) {
      setTrades(sampleTrades);
      localStorage.setItem('alpha_trader_trades', JSON.stringify(sampleTrades));
      localStorage.setItem('alpha_trader_initialized', 'true');
    } else if (savedTrades) {
      try {
        setTrades(JSON.parse(savedTrades));
      } catch (e) {
        console.error("Storage corruption detected", e);
      }
    }
  }, []);

  useEffect(() => {
    const isInitialized = localStorage.getItem('alpha_trader_initialized');
    if (isInitialized) {
      localStorage.setItem('alpha_trader_trades', JSON.stringify(trades));
    }
  }, [trades]);

  const handleAddTrade = (newTrade: Trade) => {
    setTrades(prev => [newTrade, ...prev]);
    setIsFormOpen(false);
  };

  const handleUpdateTrade = (updatedTrade: Trade) => {
    setTrades(prev => prev.map(t => t.id === updatedTrade.id ? updatedTrade : t));
    setIsFormOpen(false);
    setTradeToEdit(null);
  };

  const handleEditClick = (trade: Trade) => {
    setTradeToEdit(trade);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setTradeToEdit(null);
  };

  const handleDeleteTrade = (id: string) => {
    if (window.confirm("Permanent deletion cannot be undone. Proceed?")) {
      setTrades(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleResetData = () => {
    if (window.confirm("This will wipe your entire journal and restore sample data. Confirm?")) {
      localStorage.removeItem('alpha_trader_initialized');
      window.location.reload();
    }
  };

  const handleClearAll = () => {
     if (window.confirm("Warning: This will delete ALL trades permanently. Are you sure?")) {
      setTrades([]);
    }
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, tab: 'dashboard' as const },
    { id: 'journal', label: 'Journal', icon: <BookOpen size={20} />, tab: 'journal' as const },
    { id: 'reports', label: 'Reports', icon: <BarChart2 size={20} />, tab: 'reports' as const },
    { id: 'ai', label: 'AI Coach', icon: <BrainCircuit size={20} />, tab: 'ai' as const },
  ];

  return (
    <div className="flex h-screen h-[100dvh] w-full bg-accent-background text-gray-100 overflow-hidden font-sans fixed inset-0">
      <nav className={`hidden md:flex flex-col border-r border-accent-border bg-accent-surface/30 backdrop-blur-xl transition-all duration-500 ease-in-out relative z-[60] ${isSidebarExpanded ? 'w-64' : 'w-24'}`}>
        <div className="flex items-center justify-between p-7 mb-4">
          <div className={`flex items-center gap-4 overflow-hidden transition-all duration-500 ${!isSidebarExpanded ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>
            <div className="bg-accent-primary p-2.5 rounded-xl shadow-xl shadow-accent-primary/20 shrink-0">
              <TrendingUp size={20} className="text-white" />
            </div>
            <h1 className="text-lg font-black tracking-tighter whitespace-nowrap uppercase">Alpha</h1>
          </div>
          <button onClick={() => setIsSidebarExpanded(!isSidebarExpanded)} className={`p-2.5 hover:bg-white/10 rounded-xl text-gray-500 transition-all ${!isSidebarExpanded && 'mx-auto'}`}>
            {isSidebarExpanded ? <ChevronLeft size={18} /> : <Menu size={18} />}
          </button>
        </div>
        
        <div className="flex flex-col gap-1.5 px-4 flex-grow">
          {navigationItems.map((item) => (
            <NavButton key={item.id} active={activeTab === item.tab} onClick={() => setActiveTab(item.tab)} icon={item.icon} label={item.label} expanded={isSidebarExpanded} />
          ))}
        </div>

        <div className="px-4 space-y-2 pb-6 border-t border-white/5 pt-6">
           <NavButton active={false} onClick={handleResetData} icon={<RefreshCcw size={20} className="text-orange-500" />} label="Restore Samples" expanded={isSidebarExpanded} />
           <NavButton active={false} onClick={handleClearAll} icon={<Trash2 size={20} className="text-accent-loss" />} label="Wipe Data" expanded={isSidebarExpanded} />
           <div className="mt-4">
            <button onClick={() => setIsFormOpen(true)} className={`flex items-center justify-center gap-2 bg-white hover:bg-gray-100 transition-all text-black py-4 rounded-2xl font-black shadow-2xl active:scale-95 w-full ${!isSidebarExpanded && 'p-0 h-14 rounded-2xl'}`} title="Log Execution">
              <PlusCircle size={22} />
              {isSidebarExpanded && <span className="uppercase text-xs tracking-widest">Add Execution</span>}
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        <div className="md:hidden flex items-center justify-between p-5 bg-accent-surface/80 backdrop-blur-md border-b border-accent-border sticky top-0 z-50">
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2.5 bg-gray-900 border border-accent-border rounded-xl text-gray-400 shadow-lg"><Menu size={22} /></button>
          <div className="flex items-center gap-3">
             <div className="w-1.5 h-1.5 rounded-full bg-accent-win animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
             <span className="font-black tracking-tighter text-white uppercase text-sm">{activeTab}</span>
          </div>
          <button onClick={() => setIsFormOpen(true)} className="p-2.5 bg-accent-primary rounded-xl text-white shadow-xl shadow-accent-primary/40"><PlusCircle size={22} /></button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain custom-scrollbar p-6 md:p-10 bg-gradient-to-tr from-accent-background via-accent-background to-gray-900/10">
          <div className="max-w-[1600px] mx-auto">
            <div className="animate-in fade-in slide-in-from-bottom-3 duration-700 ease-out">
              {activeTab === 'dashboard' && <Dashboard trades={trades} />}
              {activeTab === 'journal' && <TradeList trades={trades} onDelete={handleDeleteTrade} onEdit={handleEditClick} />}
              {activeTab === 'reports' && <Analytics trades={trades} />}
              {activeTab === 'ai' && <AIInsights trades={trades} />}
            </div>
          </div>
        </div>
      </main>

      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="relative w-full max-w-2xl animate-in zoom-in-95 duration-200">
            <TradeForm onClose={handleCloseForm} onAdd={handleAddTrade} onUpdate={handleUpdateTrade} tradeToEdit={tradeToEdit} />
          </div>
        </div>
      )}

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[120] md:hidden">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
           <aside className="absolute left-0 top-0 bottom-0 w-80 bg-accent-surface border-r border-accent-border flex flex-col p-6">
              <div className="flex items-center justify-between mb-10">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent-primary rounded-xl"><TrendingUp size={24} /></div>
                    <span className="font-black text-xl uppercase tracking-tighter">Alpha</span>
                 </div>
                 <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-500"><X size={24} /></button>
              </div>
              <div className="space-y-2 flex-1">
                {navigationItems.map(item => (
                  <button key={item.id} onClick={() => { setActiveTab(item.tab); setIsMobileMenuOpen(false); }} className={`flex items-center gap-4 w-full p-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${activeTab === item.tab ? 'bg-accent-primary text-white shadow-xl shadow-accent-primary/20' : 'text-gray-500 hover:text-white'}`}>
                    {item.icon} {item.label}
                  </button>
                ))}
              </div>
              <div className="pt-6 border-t border-white/5 space-y-4">
                <button onClick={handleResetData} className="w-full flex items-center gap-4 p-4 text-orange-500 font-bold uppercase text-xs tracking-widest">
                  <RefreshCcw size={18} /> Restore Samples
                </button>
                <button onClick={handleClearAll} className="w-full flex items-center gap-4 p-4 text-accent-loss font-bold uppercase text-xs tracking-widest">
                  <Trash2 size={18} /> Wipe All Data
                </button>
              </div>
           </aside>
        </div>
      )}
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label, expanded }: any) => (
  <button onClick={onClick} className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group relative ${active ? 'bg-accent-primary text-white shadow-xl shadow-accent-primary/30' : 'text-gray-500 hover:text-white hover:bg-white/5 border border-transparent'}`}>
    <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110 group-hover:text-accent-primary'}`}>{icon}</div>
    <span className={`font-black text-[10px] tracking-[0.2em] uppercase whitespace-nowrap transition-all duration-300 overflow-hidden ${expanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>{label}</span>
  </button>
);

export default App;
