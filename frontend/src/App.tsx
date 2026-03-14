import React, { useState } from "react";
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    useLocation,
    useNavigate,
} from "react-router-dom";
import { WalletProvider } from "./lib/WalletContext";
import {
    LayoutDashboard,
    Briefcase,
    MessageSquare,
    Menu,
    X,
    HelpCircle,
    Calendar,
    UserCircle
} from "lucide-react";
import { View } from "./types";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "./utils";
import { SidebarItem } from "./components/SidebarItem";
import { Header } from "./components/Header";
import { DashboardView } from "./views/DashboardView";
import { DashboardSummaryView } from "./views/DashboardSummaryView";
import { MarketplaceView } from "./views/MarketplaceView";
import { ProjectChatView } from "./views/ProjectChatView";
import { CalendarView } from "./views/CalendarView";
import { ProfileView } from "./views/ProfileView";
import { LandingPageView } from "./views/LandingPageView";
import { AdminView } from "./views/AdminView";
import { useWallet } from "./lib/WalletContext";
import { ShieldAlert } from "lucide-react";

function AppContent() {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAdmin, walletAddress } = useWallet();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    if (location.pathname === "/") {
        return <LandingPageView onNavigate={(view) => navigate(`/${view}`)} />;
    }

    const navItems = isAdmin 
        ? [
            { path: "/admin", icon: ShieldAlert, label: "Admin Panel" },
            { path: "/chat", icon: MessageSquare, label: "Messages" },
          ]
        : [
            { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
            { path: "/jobmarket", icon: Briefcase, label: "Marketplace" },
            { path: "/chat", icon: MessageSquare, label: "Messages" },
            { path: "/calendar", icon: Calendar, label: "Calendar" },
            { path: "/profile", icon: UserCircle, label: "Profile" },
        ];

    const handleNavClick = (path: string) => {
        navigate(path);
        setMobileMenuOpen(false);
    };

    const isDashboardActive = location.pathname === "/dashboard" || location.pathname.startsWith("/dashboard/summary");

    return (
        <div className="min-h-screen bg-[#f8f7ff] flex overflow-x-hidden">
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-40 bg-white border-r border-zinc-100 transition-all duration-300 hidden lg:flex flex-col shadow-sm",
                    sidebarOpen ? "w-64" : "w-20",
                )}
            >
                <div className="h-20 flex items-center px-4 border-b border-zinc-100">
                    <div className="w-9 h-9 bg-gradient-to-br from-brand-600 to-violet-500 rounded-xl flex items-center justify-center text-white font-black text-base flex-shrink-0 shadow-lg shadow-brand-600/30">
                        H
                    </div>
                    {sidebarOpen && (
                        <div className="ml-3 overflow-hidden">
                            <span className="font-black text-lg tracking-tight text-zinc-900 block leading-tight">
                                HexaWork
                            </span>
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Freelance Platform</span>
                        </div>
                    )}
                </div>

                <nav className="p-4 space-y-2 flex-1">
                    {navItems.map((item) => (
                        <SidebarItem
                            key={item.path}
                            icon={item.icon}
                            label={item.label}
                            active={item.path === "/dashboard" ? isDashboardActive : location.pathname === item.path}
                            onClick={() => handleNavClick(item.path)}
                            collapsed={!sidebarOpen}
                        />
                    ))}
                </nav>

                <div className="p-4 border-t border-zinc-100">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="flex items-center gap-3 w-full px-4 py-3 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 rounded-2xl transition-all text-sm font-bold"
                    >
                        {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
                        {sidebarOpen && (
                            <span>Collapse</span>
                        )}
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
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{
                                type: "spring",
                                damping: 25,
                                stiffness: 200,
                            }}
                            className="fixed inset-y-0 left-0 w-72 bg-white z-[60] lg:hidden flex flex-col shadow-2xl"
                        >
                            <div className="h-20 flex items-center justify-between px-5 border-b border-zinc-100">
                                <div className="flex items-center">
                                    <div className="w-9 h-9 bg-gradient-to-br from-brand-600 to-violet-500 rounded-xl flex items-center justify-center text-white font-black text-base shadow-lg shadow-brand-600/30">
                                        H
                                    </div>
                                    <div className="ml-3">
                                        <span className="font-black text-lg tracking-tight text-zinc-900 block leading-tight">HexaWork</span>
                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Freelance Platform</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="p-2 hover:bg-zinc-100 rounded-xl"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <nav className="p-4 space-y-2 flex-1">
                                {navItems.map((item) => (
                                    <SidebarItem
                                        key={item.path}
                                        icon={item.icon}
                                        label={item.label}
                                        active={item.path === "/dashboard" ? isDashboardActive : location.pathname === item.path}
                                        onClick={() =>
                                            handleNavClick(item.path)
                                        }
                                    />
                                ))}
                            </nav>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            <main
                className={cn(
                    "flex-1 transition-all duration-300 min-w-0",
                    sidebarOpen ? "lg:ml-64" : "lg:ml-20",
                )}
            >
                <Header
                    currentView={
                        (location.pathname.split("/")[1] ||
                            "landing") as View
                    }
                    onMenuClick={() => setMobileMenuOpen(true)}
                />
                <div className="max-w-7xl mx-auto">
                    <AnimatePresence mode="wait">
                        <Routes location={location} key={location.pathname}>
                            {!walletAddress ? (
                                <Route path="*" element={<Navigate to="/" replace />} />
                            ) : isAdmin ? (
                                <>
                                    <Route path="/admin" element={<AdminView />} />
                                    <Route path="/chat" element={<ProjectChatView />} />
                                    <Route path="*" element={<Navigate to="/admin" replace />} />
                                </>
                            ) : (
                                <>
                                    <Route path="/dashboard" element={<DashboardView />} />
                                    <Route path="/dashboard/summary/:type" element={<DashboardSummaryView />} />
                                    <Route path="/jobmarket" element={<MarketplaceView />} />
                                    <Route path="/chat" element={<ProjectChatView />} />
                                    <Route path="/calendar" element={<CalendarView />} />
                                    <Route path="/profile" element={<ProfileView />} />
                                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                                </>
                            )}
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