
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
  X
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
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const toggleSidebar = () => setIsSidebarExpanded(!isSidebarExpanded);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={22} />, tab: 'dashboard' as const },
    { id: 'journal', label: 'Journal', icon: <BookOpen size={22} />, tab: 'journal' as const },
    { id: 'reports', label: 'Reports', icon: <BarChart2 size={22} />, tab: 'reports' as const },
    { id: 'ai', label: 'AI Coach', icon: <BrainCircuit size={22} />, tab: 'ai' as const },
  ];

  const handleNavClick = (tab: 'dashboard' | 'journal' | 'reports' | 'ai') => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-accent-background text-gray-100 overflow-hidden font-sans">
      {/* Sidebar - Desktop */}
      <nav 
        className={`hidden md:flex flex-col border-r border-accent-border bg-accent-surface transition-all duration-300 ease-in-out relative ${
          isSidebarExpanded ? 'w-64' : 'w-20'
        }`}
      >
        <div className="flex items-center justify-between p-6 mb-4">
          <div className={`flex items-center gap-3 overflow-hidden transition-opacity duration-300 ${!isSidebarExpanded ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>
            <div className="bg-accent-primary p-2 rounded-xl shadow-lg shadow-accent-primary/20 shrink-0">
              <TrendingUp size={20} className="text-white" />
            </div>
            <h1 className="text-lg font-black tracking-tight whitespace-nowrap">AlphaTrader</h1>
          </div>
          <button 
            onClick={toggleSidebar}
            className={`p-2 hover:bg-white/10 rounded-lg text-gray-400 transition-all ${!isSidebarExpanded && 'mx-auto'}`}
          >
            {isSidebarExpanded ? <ChevronLeft size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <div className="flex flex-col gap-1 px-3 flex-grow">
          {navigationItems.map((item) => (
            <NavButton 
              key={item.id}
              active={activeTab === item.tab} 
              onClick={() => handleNavClick(item.tab)} 
              icon={item.icon} 
              label={item.label} 
              expanded={isSidebarExpanded}
            />
          ))}
        </div>

        <div className="p-3 mb-6">
          <button 
            onClick={() => setIsFormOpen(true)}
            className={`flex items-center justify-center gap-2 bg-white hover:bg-gray-200 transition-all text-black py-3.5 rounded-2xl font-black shadow-xl active:scale-95 w-full ${!isSidebarExpanded && 'p-0 h-12 rounded-xl'}`}
            title="Log Trade"
          >
            <PlusCircle size={22} />
            {isSidebarExpanded && "Log Trade"}
          </button>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm md:hidden transition-opacity duration-300"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Mobile Side Drawer */}
      <aside 
        className={`fixed top-0 left-0 bottom-0 z-[70] w-72 bg-accent-surface border-r border-accent-border transition-transform duration-300 ease-in-out md:hidden flex flex-col ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-accent-border">
          <div className="flex items-center gap-3">
            <div className="bg-accent-primary p-2 rounded-xl">
              <TrendingUp size={20} className="text-white" />
            </div>
            <span className="font-black text-lg">AlphaTrader</span>
          </div>
          <button onClick={toggleMobileMenu} className="p-2 hover:bg-white/5 rounded-lg text-gray-500">
            <X size={24} />
          </button>
        </div>
        
        <div className="flex-1 px-4 py-6 space-y-2">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.tab)}
              className={`flex items-center gap-4 w-full px-4 py-4 rounded-2xl font-bold transition-all ${
                activeTab === item.tab 
                  ? 'bg-accent-primary text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          <button 
            onClick={() => { setIsFormOpen(true); setIsMobileMenuOpen(false); }}
            className="w-full bg-white text-black py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-xl"
          >
            <PlusCircle size={20} />
            Add Trade
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        {/* Mobile Header Bar */}
        <div className="md:hidden flex items-center justify-between p-4 bg-accent-surface/80 backdrop-blur-md border-b border-accent-border sticky top-0 z-50">
          <button onClick={toggleMobileMenu} className="p-2 hover:bg-white/5 rounded-lg text-gray-400">
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-accent-primary w-2 h-2 rounded-full animate-pulse"></div>
            <span className="font-black tracking-tight text-white uppercase text-sm">Alpha Hub</span>
          </div>
          <button 
            onClick={() => setIsFormOpen(true)}
            className="p-2.5 bg-accent-primary rounded-xl text-white shadow-lg shadow-accent-primary/20"
          >
            <PlusCircle size={20} />
          </button>
        </div>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 md:p-10">
          <div className="max-w-7xl mx-auto">
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              {activeTab === 'dashboard' && <Dashboard trades={trades} />}
              {activeTab === 'journal' && <TradeList trades={trades} onDelete={handleDeleteTrade} />}
              {activeTab === 'reports' && <Analytics trades={trades} />}
              {activeTab === 'ai' && <AIInsights trades={trades} />}
            </div>
          </div>
        </div>
      </main>

      {/* Modal for Trade Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-in fade-in duration-300">
          <div className="relative w-full max-w-2xl animate-in zoom-in-95 duration-200">
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
  expanded: boolean;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, label, expanded }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group relative ${
      active 
        ? 'bg-accent-primary text-white shadow-xl shadow-accent-primary/30' 
        : 'text-gray-500 hover:text-white hover:bg-white/5'
    }`}
    title={!expanded ? label : undefined}
  >
    <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110 group-hover:text-accent-primary'}`}>
      {icon}
    </div>
    <span className={`font-black text-sm tracking-wide whitespace-nowrap transition-all duration-300 overflow-hidden ${
      expanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'
    }`}>
      {label}
    </span>
    {!expanded && (
      <div className="absolute left-full ml-4 px-4 py-2 bg-gray-800 text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-[80] shadow-2xl border border-white/10 translate-x-[-10px] group-hover:translate-x-0">
        {label}
      </div>
    )}
  </button>
);

export default App;
