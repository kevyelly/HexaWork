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

function AppContent() {
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    if (location.pathname === "/") {
        return <LandingPageView onNavigate={(view) => navigate(`/${view}`)} />;
    }

    const navItems = [
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
        <div className="min-h-screen bg-zinc-50 flex overflow-x-hidden">
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-40 bg-white border-r border-zinc-200 transition-all duration-300 hidden lg:flex flex-col",
                    sidebarOpen ? "w-64" : "w-20",
                )}
            >
                <div className="h-20 flex items-center px-6 border-b border-zinc-100">
                    <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                        F
                    </div>
                    {sidebarOpen && (
                        <span className="ml-3 font-bold text-xl tracking-tight">
                            Escrow
                        </span>
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
                        className="flex items-center gap-3 w-full px-4 py-3 text-zinc-500 hover:bg-zinc-100 rounded-xl transition-all"
                    >
                        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                        {sidebarOpen && (
                            <span className="font-medium">Collapse</span>
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
                            <div className="h-20 flex items-center justify-between px-6 border-b border-zinc-100">
                                <div className="flex items-center">
                                    <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold">
                                        F
                                    </div>
                                    <span className="ml-3 font-bold text-xl tracking-tight">
                                        Escrow
                                    </span>
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
                            <Route
                                path="/dashboard"
                                element={<DashboardView />}
                            />
                            <Route
                                path="/dashboard/summary/:type"
                                element={<DashboardSummaryView />}
                            />
                            <Route
                                path="/jobmarket"
                                element={<MarketplaceView />}
                            />
                            <Route path="/chat" element={<ProjectChatView />} />
                            <Route path="/calendar" element={<CalendarView />} />
                            <Route path="/profile" element={<ProfileView />} />

                            <Route
                                path="*"
                                element={<Navigate to="/dashboard" replace />}
                            />
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