import React, { useEffect, useState, useRef } from 'react';
import { Search, Bell, Menu, Wallet, LogOut, Copy, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../lib/WalletContext';
import { supabase } from '../lib/supabase';
import { View } from '../types';

interface HeaderProps {
    currentView: View | string;
    onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onMenuClick }) => {
    // Combined Hooks
    const { walletAddress, connectWallet, disconnectWallet } = useWallet();
    const navigate = useNavigate();
    const [fullName, setFullName] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    // Notification State
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);

    // Fetch the user's name from Supabase whenever the wallet connects
    useEffect(() => {
        if (!walletAddress) return;

        const fetchUser = async () => {
            const { data } = await supabase
                .from('users')
                .select('full_name')
                .eq('wallet_address', walletAddress.toLowerCase())
                .single();

            if (data) {
                setFullName(data.full_name);
            }
        };

        fetchUser();
    }, [walletAddress]);

    // Global Notifications Fetch & Real-time Subscription
    useEffect(() => {
        if (!walletAddress) return;

        const lowerWallet = walletAddress.toLowerCase();

        const fetchNotifications = async () => {
            const { data } = await supabase
                .from('notifications')
                .select('*')
                .eq('wallet_address', lowerWallet)
                .order('created_at', { ascending: false });

            if (data) setNotifications(data);
        };

        fetchNotifications();

        // Listen for new notifications globally
        const channel = supabase.channel('global_header_notifs')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `wallet_address=eq.${lowerWallet}`
            }, (payload) => {
                setNotifications(prev => [payload.new, ...prev]);
            })
            .on('postgres_changes', {
                event: 'DELETE',
                schema: 'public',
                table: 'notifications',
                filter: `wallet_address=eq.${lowerWallet}`
            }, (payload) => {
                setNotifications(prev => prev.filter(n => n.id !== payload.old.id));
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [walletAddress]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setIsNotifOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const dismissNotification = async (id: string) => {
        // Optimistic UI update
        setNotifications(prev => prev.filter(n => n.id !== id));
        // Delete from database
        await supabase.from('notifications').delete().eq('id', id);
    };

    const formatAddress = (addr: string) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';

    const handleCopy = () => {
        if (walletAddress) {
            navigator.clipboard.writeText(walletAddress);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // Format the view name for the top left title
    const displayTitle = currentView === 'jobmarket' ? 'Marketplace' : currentView;

    return (
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-zinc-100 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
            <div className="flex items-center gap-4">
                <button onClick={onMenuClick} className="lg:hidden p-2 hover:bg-zinc-100 rounded-xl transition-colors">
                    <Menu size={20} />
                </button>
                <h2 className="text-xl font-black text-zinc-900 capitalize hidden sm:block tracking-tight">
                    {displayTitle}
                </h2>
            </div>

            <div className="flex items-center gap-4">
                {/* Notification Bell Dropdown */}
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => setIsNotifOpen(!isNotifOpen)}
                        className={`relative p-2.5 rounded-2xl transition-all ${
                            isNotifOpen
                                ? 'bg-brand-50 text-brand-600'
                                : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-500'
                        }`}
                    >
                        <Bell size={18} />
                        {notifications.length > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                        )}
                    </button>

                    {/* Dropdown Menu */}
                    {isNotifOpen && (
                        <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-zinc-200 shadow-2xl rounded-2xl overflow-hidden z-50">
                            <div className="p-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                                <h3 className="text-sm font-black text-zinc-900">Notifications</h3>
                                <span className="text-[10px] font-bold text-zinc-500 bg-zinc-200 px-2 py-1 rounded-md">{notifications.length} New</span>
                            </div>
                            <div className="max-h-[400px] overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center text-zinc-400 font-medium text-sm">
                                        You are all caught up!
                                    </div>
                                ) : (
                                    <div className="divide-y divide-zinc-50">
                                        {notifications.map(notif => (
                                            <div key={notif.id} className="p-4 hover:bg-zinc-50 transition-colors relative group">
                                                <button
                                                    onClick={() => dismissNotification(notif.id)}
                                                    className="absolute top-3 right-3 text-zinc-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 bg-white rounded-full p-0.5"
                                                    title="Dismiss"
                                                >
                                                    <X size={14} />
                                                </button>
                                                <p className="text-xs text-zinc-700 font-medium leading-relaxed pr-6">
                                                    {notif.content}
                                                </p>
                                                <p className="text-[9px] text-zinc-400 font-bold mt-2 uppercase tracking-widest">
                                                    {new Date(notif.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {walletAddress ? (
                    <div className="flex items-center gap-3 pl-4 border-l border-zinc-100">
                        <div className="flex items-center gap-3 p-1.5 pr-4 bg-zinc-50 rounded-2xl border border-zinc-100 hover:border-brand-200 transition-colors">
                            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-violet-500 rounded-xl shadow-sm shadow-brand-600/20 flex-shrink-0" />
                            <div className="flex flex-col justify-center text-left">
                                <span className="text-sm font-black text-zinc-900 leading-tight tracking-tight">
                                    {fullName || 'Unregistered'}
                                </span>
                                <div
                                    onClick={handleCopy}
                                    className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-zinc-400 hover:text-brand-600 cursor-pointer transition-colors mt-0.5 group"
                                    title="Copy Wallet Address"
                                >
                                    {formatAddress(walletAddress)}
                                    {copied ? (
                                        <Check size={11} className="text-emerald-500" />
                                    ) : (
                                        <Copy size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Your Logout Button */}
                        <button 
                            onClick={() => {
                                disconnectWallet();
                                navigate('/');
                            }}
                            className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                            title="Disconnect Wallet"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => {}}
                        className="px-5 py-2.5 bg-gradient-to-r from-brand-600 to-violet-600 text-white font-black rounded-2xl text-sm shadow-lg shadow-brand-600/30 hover:scale-105 transition-all"
                    >
                        Connect Wallet
                    </button>
                )}
            </div>
        </header>
    );
};