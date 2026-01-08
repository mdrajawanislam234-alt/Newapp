
import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, 
  ListOrdered, 
  BarChart3, 
  BrainCircuit, 
  PlusCircle,
  TrendingUp,
  Settings
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import TradeList from './components/TradeList';
import Analytics from './components/Analytics';
import AIInsights from './components/AIInsights';
import TradeForm from './components/TradeForm';
import { Trade } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'trades' | 'analytics' | 'ai'>('dashboard');
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Load trades from localStorage
  useEffect(() => {
    const savedTrades = localStorage.getItem('alpha_trader_trades');
    if (savedTrades) {
      try {
        setTrades(JSON.parse(savedTrades));
      } catch (e) {
        console.error("Failed to parse trades", e);
      }
    }
  }, []);

  // Save trades to localStorage
  useEffect(() => {
    localStorage.setItem('alpha_trader_trades', JSON.stringify(trades));
  }, [trades]);

  const handleAddTrade = (newTrade: Trade) => {
    setTrades(prev => [newTrade, ...prev]);
    setIsFormOpen(false);
  };

  const handleDeleteTrade = (id: string) => {
    setTrades(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-accent-background overflow-hidden">
      {/* Sidebar - Desktop */}
      <nav className="hidden md:flex flex-col w-64 border-r border-gray-800 bg-accent-surface p-4">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="bg-accent-primary p-2 rounded-lg">
            <TrendingUp size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            AlphaTrader Pro
          </h1>
        </div>

        <div className="flex flex-col gap-2 flex-grow">
          <NavButton 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
          />
          <NavButton 
            active={activeTab === 'trades'} 
            onClick={() => setActiveTab('trades')} 
            icon={<ListOrdered size={20} />} 
            label="Journal" 
          />
          <NavButton 
            active={activeTab === 'analytics'} 
            onClick={() => setActiveTab('analytics')} 
            icon={<BarChart3 size={20} />} 
            label="Analytics" 
          />
          <NavButton 
            active={activeTab === 'ai'} 
            onClick={() => setActiveTab('ai')} 
            icon={<BrainCircuit size={20} />} 
            label="AI Insights" 
          />
        </div>

        <button 
          onClick={() => setIsFormOpen(true)}
          className="mt-4 flex items-center justify-center gap-2 bg-accent-primary hover:bg-opacity-90 transition-all text-white py-3 rounded-xl font-semibold shadow-lg shadow-accent-primary/20"
        >
          <PlusCircle size={20} />
          New Trade
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-accent-surface border-b border-gray-800">
          <div className="flex items-center gap-2">
            <TrendingUp size={20} className="text-accent-primary" />
            <span className="font-bold text-lg">AlphaTrader</span>
          </div>
          <button 
            onClick={() => setIsFormOpen(true)}
            className="p-2 bg-accent-primary rounded-full"
          >
            <PlusCircle size={20} className="text-white" />
          </button>
        </div>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
          {activeTab === 'dashboard' && <Dashboard trades={trades} />}
          {activeTab === 'trades' && <TradeList trades={trades} onDelete={handleDeleteTrade} />}
          {activeTab === 'analytics' && <Analytics trades={trades} />}
          {activeTab === 'ai' && <AIInsights trades={trades} />}
        </div>

        {/* Mobile Nav Bar */}
        <div className="md:hidden grid grid-cols-4 gap-1 p-2 bg-accent-surface border-t border-gray-800 sticky bottom-0">
          <MobileNavButton 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
            icon={<LayoutDashboard size={20} />} 
          />
          <MobileNavButton 
            active={activeTab === 'trades'} 
            onClick={() => setActiveTab('trades')} 
            icon={<ListOrdered size={20} />} 
          />
          <MobileNavButton 
            active={activeTab === 'analytics'} 
            onClick={() => setActiveTab('analytics')} 
            icon={<BarChart3 size={20} />} 
          />
          <MobileNavButton 
            active={activeTab === 'ai'} 
            onClick={() => setActiveTab('ai')} 
            icon={<BrainCircuit size={20} />} 
          />
        </div>
      </main>

      {/* Modal for Trade Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-xl animate-in fade-in zoom-in duration-200">
            <TradeForm 
              onClose={() => setIsFormOpen(false)} 
              onAdd={handleAddTrade} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
      active 
        ? 'bg-accent-primary/15 text-accent-primary' 
        : 'text-gray-400 hover:text-white hover:bg-white/5'
    }`}
  >
    {icon}
    {label}
  </button>
);

const MobileNavButton: React.FC<Omit<NavButtonProps, 'label'>> = ({ active, onClick, icon }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all ${
      active ? 'text-accent-primary' : 'text-gray-500'
    }`}
  >
    {icon}
  </button>
);

export default App;
