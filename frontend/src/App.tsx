import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { WalletProvider } from './lib/WalletContext';
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
import { View } from './types';
import { motion, AnimatePresence } from 'motion/react';
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
import { LoginView } from './views/LoginView';
import { SignUpView } from './views/SignUpView';

function AppContent() {
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    if (location.pathname === '/') {
        return <LandingPageView onNavigate={(view) => navigate(`/${view}`)} />;
    }
    if (location.pathname === '/login') {
        return <LoginView onNavigate={(view) => navigate(`/${view}`)} />;
    }
    if (location.pathname === '/signup') {
        return <SignUpView onNavigate={(view) => navigate(`/${view}`)} />;
    }

    const navItems = [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/jobmarket', icon: Briefcase, label: 'Marketplace' },
        { path: '/chat', icon: MessageSquare, label: 'Messages' },
        { path: '/team', icon: Users, label: 'Team' },
        { path: '/disputes', icon: Gavel, label: 'Disputes' },
    ];

    const systemItems = [
        { path: '/settings', icon: SettingsIcon, label: 'Settings' },
        { path: '/support', icon: HelpCircle, label: 'Support' },
    ];

    const handleNavClick = (path: string) => {
        navigate(path);
        setMobileMenuOpen(false);
    };

    return (
        <div className="min-h-screen bg-zinc-50 flex overflow-x-hidden">
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
                            key={item.path}
                            icon={item.icon}
                            label={item.label}
                            active={location.pathname === item.path}
                            onClick={() => handleNavClick(item.path)}
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
                                key={item.path}
                                icon={item.icon}
                                label={item.label}
                                active={location.pathname === item.path}
                                onClick={() => handleNavClick(item.path)}
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
                                        key={item.path}
                                        icon={item.icon}
                                        label={item.label}
                                        active={location.pathname === item.path}
                                        onClick={() => handleNavClick(item.path)}
                                    />
                                ))}
                                <div className="pt-8 pb-4">
                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-5 mb-3">System</p>
                                    {systemItems.map(item => (
                                        <SidebarItem
                                            key={item.path}
                                            icon={item.icon}
                                            label={item.label}
                                            active={location.pathname === item.path}
                                            onClick={() => handleNavClick(item.path)}
                                        />
                                    ))}
                                </div>
                            </nav>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            <main
                className={cn(
                    "flex-1 transition-all duration-300 min-w-0",
                    sidebarOpen ? "lg:ml-64" : "lg:ml-20"
                )}
            >
                <Header
                    currentView={(location.pathname.replace('/', '') || 'landing') as View}
                    onMenuClick={() => setMobileMenuOpen(true)}
                />
                <div className="max-w-7xl mx-auto">
                    <AnimatePresence mode="wait">
                        <Routes location={location} key={location.pathname}>
                            <Route path="/dashboard" element={<DashboardView />} />
                            <Route path="/jobmarket" element={<MarketplaceView />} />
                            <Route path="/chat" element={<ProjectChatView />} />
                            <Route path="/team" element={<TeamManagementView />} />
                            <Route path="/disputes" element={<DisputesView />} />
                            <Route path="/settings" element={<SettingsView />} />

                            <Route path="*" element={<Navigate to="/dashboard" replace />} />
                        </Routes>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}

export default function App() {
    return (
        <WalletProvider>
            <BrowserRouter>
                <AppContent />
            </BrowserRouter>
        </WalletProvider>
    );
}