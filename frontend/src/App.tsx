import React, { useState, useEffect } from "react";
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    useLocation,
    useNavigate,
} from "react-router-dom";
import { WalletProvider, useWallet } from "./lib/WalletContext";
import { supabase } from "./lib/supabase";
import {
    LayoutDashboard,
    Briefcase,
    MessageSquare,
    Menu,
    X,
    Calendar,
    UserCircle,
    ShieldAlert
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

const ADMIN_WALLETS = [
    "0xbeE339Aa5d7af6758164F5739a2c98EB6f16a3AB",
    "0x832d9D4D866A33205e5FE43aF9C15608431759C0",
    "0x342f52294501135f2148840366271f59598739EA"
];

function AppContent() {
    const location = useLocation();
    const navigate = useNavigate();
    const { walletAddress } = useWallet();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

    const isAdmin = walletAddress && ADMIN_WALLETS.map(w => w.toLowerCase()).includes(walletAddress.toLowerCase());

    useEffect(() => {
        if (!walletAddress) {
            setHasUnreadMessages(false);
            return;
        }

        const lowerWallet = walletAddress.toLowerCase();

        const checkUnread = async () => {
            try {
                let isUnread = false;

                const { data: msgs } = await supabase
                    .from('messages')
                    .select('id')
                    .eq('receiver_address', lowerWallet)
                    .or('is_read.eq.false,is_read.is.null')
                    .limit(1);

                if (msgs && msgs.length > 0) isUnread = true;

                if (!isUnread) {
                    const { data: notifs } = await supabase
                        .from('notifications')
                        .select('id')
                        .eq('wallet_address', lowerWallet)
                        .limit(1);

                    if (notifs && notifs.length > 0) isUnread = true;
                }

                // ADMIN DYNAMIC QUEUE CHECK
                if (isAdmin && !isUnread) {
                    const { data: disputes } = await supabase
                        .from('appeals')
                        .select('id, claimed_by, claimed_at')
                        .in('status', ['pending', 'escalated']);

                    if (disputes && disputes.length > 0) {
                        const now = new Date().getTime();
                        const twoHours = 2 * 60 * 60 * 1000;

                        // Show dot if there is an unclaimed dispute, one claimed by ME, or a timed-out one.
                        const hasAvailable = disputes.some(d =>
                            !d.claimed_by ||
                            d.claimed_by.toLowerCase() === lowerWallet ||
                            (d.claimed_at && now - new Date(d.claimed_at).getTime() > twoHours)
                        );

                        if (hasAvailable) isUnread = true;
                    }
                }

                setHasUnreadMessages(isUnread);
            } catch (error) {
                console.error("Failed to fetch notification status:", error);
            }
        };

        checkUnread();

        const intervalId = setInterval(checkUnread, 3000);

        const channel = supabase.channel('global_nav_tracker')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, checkUnread)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, checkUnread)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'appeals' }, checkUnread)
            .subscribe();

        return () => {
            clearInterval(intervalId);
            supabase.removeChannel(channel);
        };
    }, [walletAddress, isAdmin]);

    if (location.pathname === "/") {
        return <LandingPageView onNavigate={(view) => {
            if (view === 'dashboard' && isAdmin) {
                navigate('/admin');
            } else {
                navigate(`/${view}`);
            }
        }} />;
    }

    const navItems = isAdmin
        ? [
            { path: "/admin", icon: ShieldAlert, label: "Admin Dashboard" },
            { path: "/chat", icon: MessageSquare, label: "Dispute Chats" },
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
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                {isAdmin ? "Platform Admin" : "Freelance Platform"}
                            </span>
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
                            hasNotification={item.path === "/chat" ? hasUnreadMessages : false}
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
                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                            {isAdmin ? "Platform Admin" : "Freelance Platform"}
                                        </span>
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
                                        hasNotification={item.path === "/chat" ? hasUnreadMessages : false}
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