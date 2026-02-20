import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  MessageSquare, 
  Users, 
  Settings as SettingsIcon, 
  Gavel, 
  Menu,
  X,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { View } from './types';
import { cn } from './utils';
import { SidebarItem } from './components/SidebarItem';
import { Header } from './components/Header';
import { DashboardView } from './views/DashboardView';
import { MarketplaceView } from './views/MarketplaceView';
import { ProjectChatView } from './views/ProjectChatView';
import { TeamManagementView } from './views/TeamManagementView';
import { DisputesView } from './views/DisputesView';
import { SettingsView } from './views/SettingsView';
import { LandingPageView } from './views/LandingPageView';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('landing');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (currentView === 'landing') {
    return <LandingPageView onStart={() => setCurrentView('dashboard')} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardView />;
      case 'marketplace': return <MarketplaceView />;
      case 'project-chat': return <ProjectChatView />;
      case 'team': return <TeamManagementView />;
      case 'disputes': return <DisputesView />;
      case 'settings': return <SettingsView />;
      default: return null;
    }
  };

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', emoji: '🏠' },
    { id: 'marketplace', icon: Briefcase, label: 'Marketplace', emoji: '🌟' },
    { id: 'project-chat', icon: MessageSquare, label: 'Messages', emoji: '💬' },
    { id: 'team', icon: Users, label: 'Team', emoji: '🤝' },
    { id: 'disputes', icon: Gavel, label: 'Disputes', emoji: '🛡️' },
  ];

  const systemItems = [
    { id: 'settings', icon: SettingsIcon, label: 'Settings', emoji: '⚙️' },
    { id: 'support', icon: HelpCircle, label: 'Support', emoji: '🆘' },
  ];

  const handleNavClick = (viewId: string) => {
    setCurrentView(viewId as View);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex overflow-x-hidden">
      {/* Sidebar - Desktop */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-40 bg-white border-r border-zinc-200 transition-all duration-300 hidden lg:flex flex-col",
          sidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="h-20 flex items-center px-6 border-b border-zinc-100">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
            F
          </div>
          {sidebarOpen && <span className="ml-3 font-bold text-xl tracking-tight">Escrow</span>}
        </div>

        <nav className="p-4 space-y-2 flex-1">
          {navItems.map(item => (
            <SidebarItem 
              key={item.id}
              icon={item.icon} 
              label={item.label} 
              active={currentView === item.id} 
              onClick={() => handleNavClick(item.id)} 
              emoji={item.emoji}
              collapsed={!sidebarOpen}
            />
          ))}
          
          <div className="pt-8 pb-4">
            {sidebarOpen && (
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-5 mb-3">
                System
              </p>
            )}
            {systemItems.map(item => (
              <SidebarItem 
                key={item.id}
                icon={item.icon} 
                label={item.label} 
                active={currentView === item.id} 
                onClick={() => handleNavClick(item.id)} 
                emoji={item.emoji}
                collapsed={!sidebarOpen}
              />
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-zinc-100">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center gap-3 w-full px-4 py-3 text-zinc-500 hover:bg-zinc-100 rounded-xl transition-all"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            {sidebarOpen && <span className="font-medium">Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-white z-[60] lg:hidden flex flex-col shadow-2xl"
            >
              <div className="h-20 flex items-center justify-between px-6 border-b border-zinc-100">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold">F</div>
                  <span className="ml-3 font-bold text-xl tracking-tight">Escrow</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-zinc-100 rounded-xl">
                  <X size={20} />
                </button>
              </div>
              <nav className="p-4 space-y-2 flex-1">
                {navItems.map(item => (
                  <SidebarItem 
                    key={item.id}
                    icon={item.icon} 
                    label={item.label} 
                    active={currentView === item.id} 
                    onClick={() => handleNavClick(item.id)} 
                    emoji={item.emoji}
                  />
                ))}
                <div className="pt-8 pb-4">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-5 mb-3">System</p>
                  {systemItems.map(item => (
                    <SidebarItem 
                      key={item.id}
                      icon={item.icon} 
                      label={item.label} 
                      active={currentView === item.id} 
                      onClick={() => handleNavClick(item.id)} 
                      emoji={item.emoji}
                    />
                  ))}
                </div>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main 
        className={cn(
          "flex-1 transition-all duration-300 min-w-0",
          sidebarOpen ? "lg:ml-64" : "lg:ml-20"
        )}
      >
        <Header currentView={currentView} onMenuClick={() => setMobileMenuOpen(true)} />
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
