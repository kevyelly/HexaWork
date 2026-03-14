import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Search, Mail, ExternalLink, ShieldCheck, Loader2, LineChart, Briefcase, Coins, BarChart3, TrendingUp, Scale, MessageSquareQuote, AlertTriangle, Bot } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { cn } from '../utils';

import { useNavigate } from 'react-router-dom';

interface UserProfile {
    wallet_address: string;
    full_name: string;
    title: string;
    bio: string;
    hourly_rate: string;
    skills: string[];
    avatar_url: string;
    created_at: string;
}

interface Appeal {
    id: string;
    milestone_id: string;
    project_id: string;
    freelancer_address: string;
    ai_status: string;
    ai_reasoning: string;
    freelancer_reason: string;
    status: string;
    admin_feedback?: string;
    created_at: string;
}

export const AdminView: React.FC = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'users' | 'analytics' | 'disputes' | 'settings'>('users');
    
    // Analytics state
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalJobs: 0,
        activeJobs: 0,
        completedJobs: 0,
        totalVolume: 0
    });
    const [isLoadingStats, setIsLoadingStats] = useState(false);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const PAGE_SIZE = 10;
    
    // Modal state
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

    // Appeals state
    const [appeals, setAppeals] = useState<Appeal[]>([]);
    const [isFetchingAppeals, setIsFetchingAppeals] = useState(false);
    const [isResolving, setIsResolving] = useState<string | null>(null);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setCurrentPage(1); // Reset to page 1 on new search
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true);
            try {
                let query = supabase
                    .from('users')
                    .select('*', { count: 'exact' });
                
                if (debouncedSearch) {
                    query = query.or(`full_name.ilike.%${debouncedSearch}%,wallet_address.ilike.%${debouncedSearch}%,title.ilike.%${debouncedSearch}%`);
                }

                const from = (currentPage - 1) * PAGE_SIZE;
                const to = from + PAGE_SIZE - 1;

                const { data, error, count } = await query
                    .range(from, to);
                
                if (error) throw error;
                if (data) setUsers(data);
                if (count !== null) setTotalUsers(count);
            } catch (error) {
                console.error("Error fetching users for admin:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, [currentPage, debouncedSearch]);

    // Fetch Analytics Stats
    useEffect(() => {
        if (activeTab !== 'analytics') return;
        
        const fetchStats = async () => {
            setIsLoadingStats(true);
            try {
                const [usersRes, jobsTotal, jobsActive, jobsCompleted, milestonesRes] = await Promise.all([
                    supabase.from('users').select('*', { count: 'exact', head: true }),
                    supabase.from('jobs').select('*', { count: 'exact', head: true }),
                    supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'open'),
                    supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
                    supabase.from('project_milestones').select('amount')
                ]);

                let volume = 0;
                if (milestonesRes.data) {
                    volume = milestonesRes.data.reduce((acc, curr) => {
                        const val = parseFloat(curr.amount || '0');
                        return acc + (isNaN(val) ? 0 : val);
                    }, 0);
                }

                setStats({
                    totalUsers: usersRes.count || 0,
                    totalJobs: jobsTotal.count || 0,
                    activeJobs: jobsActive.count || 0,
                    completedJobs: jobsCompleted.count || 0,
                    totalVolume: volume
                });
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setIsLoadingStats(false);
            }
        };

        fetchStats();
    }, [activeTab]);

    // Fetch Appeals
    useEffect(() => {
        if (activeTab !== 'disputes') return;

        const fetchAppeals = async () => {
            setIsFetchingAppeals(true);
            try {
                const { data, error } = await supabase
                    .from('appeals')
                    .select('*')
                    .order('created_at', { ascending: false });
                
                if (error) throw error;
                if (data) setAppeals(data);
            } catch (error) {
                console.error("Error fetching appeals:", error);
            } finally {
                setIsFetchingAppeals(false);
            }
        };

        fetchAppeals();
    }, [activeTab]);

    const handleResolveAppeal = async (appealId: string, milestoneId: string, status: 'approved' | 'rejected', feedback: string) => {
        setIsResolving(appealId);
        try {
            // 1. Update project_milestones table
            const { error: msError } = await supabase
                .from('project_milestones')
                .update({ status })
                .eq('id', milestoneId);
            
            if (msError) throw msError;

            // 2. Update appeals table
            const { error: appealError } = await supabase
                .from('appeals')
                .update({ 
                    status: 'resolved',
                    admin_feedback: feedback
                })
                .eq('id', appealId);
            
            if (appealError) throw appealError;

            // 3. Update local state
            setAppeals(prev => prev.map(a => a.id === appealId ? { ...a, status: 'resolved', admin_feedback: feedback } : a));
            alert(`Resolution submitted: Milestone set to ${status}.`);
        } catch (error: any) {
            console.error("Resolution error:", error);
            alert("Failed to resolve appeal: " + error.message);
        } finally {
            setIsResolving(null);
        }
    };

    return (
        <div className="p-4 md:p-6 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-2xl md:text-4xl font-black text-zinc-900 tracking-tight flex items-center gap-3">
                        Admin Control <ShieldCheck className="text-brand-600" size={32} />
                    </h1>
                    <p className="text-zinc-500 font-medium">Manage platform users and oversee system operations.</p>
                </div>
                {activeTab === 'users' && (
                    <div className="bg-white px-6 py-3 rounded-2xl border border-zinc-100 shadow-sm flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600 font-black">
                            {totalUsers}
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest leading-none mb-1">Total Users</p>
                            <p className="text-sm font-black text-zinc-900 leading-none">Registered</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex border-b border-zinc-200 gap-8">
                <button
                    onClick={() => setActiveTab('users')}
                    className={cn(
                        "pb-4 text-sm font-bold transition-all border-b-2 relative",
                        activeTab === 'users' ? "border-brand-600 text-brand-600" : "border-transparent text-zinc-400 hover:text-zinc-600"
                    )}
                >
                    User Management
                </button>
                <button
                    onClick={() => setActiveTab('analytics')}
                    className={cn(
                        "pb-4 text-sm font-bold transition-all border-b-2 relative",
                        activeTab === 'analytics' ? "border-brand-600 text-brand-600" : "border-transparent text-zinc-400 hover:text-zinc-600"
                    )}
                >
                    Analytics Hub
                </button>
                <button
                    onClick={() => setActiveTab('disputes')}
                    className={cn(
                        "pb-4 text-sm font-bold transition-all border-b-2 relative",
                        activeTab === 'disputes' ? "border-brand-600 text-brand-600" : "border-transparent text-zinc-400 hover:text-zinc-600"
                    )}
                >
                    Dispute Center
                </button>
                <button
                    onClick={() => setActiveTab('settings')}
                    className={cn(
                        "pb-4 text-sm font-bold transition-all border-b-2 relative",
                        activeTab === 'settings' ? "border-brand-600 text-brand-600" : "border-transparent text-zinc-400 hover:text-zinc-600"
                    )}
                >
                    System Settings
                </button>
            </div>

            {activeTab === 'users' ? (
                <div className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-xl shadow-brand-500/5 overflow-hidden">
                    <div className="p-6 md:p-8 border-b border-zinc-100 flex flex-col md:flex-row gap-6 justify-between items-center bg-zinc-50/50">
                        <div className="flex items-center gap-3">
                            <Users className="text-zinc-400" size={20} />
                            <h2 className="text-xl font-black text-zinc-900">User Management</h2>
                        </div>
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                            <input 
                                type="text"
                                placeholder="Search by name, wallet, or title..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-white border border-zinc-200 rounded-2xl outline-none focus:border-brand-500 transition-all font-medium text-sm shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        {isLoading ? (
                            <div className="py-20 flex flex-col items-center justify-center gap-4">
                                <Loader2 className="animate-spin text-brand-600" size={40} />
                                <p className="text-zinc-500 font-bold animate-pulse">Loading users...</p>
                            </div>
                        ) : users.length === 0 ? (
                            <div className="py-20 text-center space-y-4">
                                <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mx-auto text-zinc-300">
                                    <Users size={40} />
                                </div>
                                <p className="text-zinc-500 font-bold">No users found matching your search.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100 bg-zinc-50/30">
                                        <th className="px-8 py-5">User</th>
                                        <th className="px-8 py-5">Wallet Address</th>
                                        <th className="px-8 py-5">Role/Status</th>
                                        <th className="px-8 py-5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50">
                                    {users.map((user) => (
                                        <tr key={user.wallet_address} className="hover:bg-zinc-50/50 transition-colors group">
                                            <td className="px-8 py-6 cursor-pointer" onClick={() => setSelectedUser(user)}>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center text-brand-600 font-black text-lg shadow-inner overflow-hidden flex-shrink-0">
                                                        {user.avatar_url ? (
                                                            <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            user.full_name?.charAt(0).toUpperCase() || '?'
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-zinc-900 leading-tight group-hover:text-brand-600 transition-colors">{user.full_name || 'Anonymous User'}</p>
                                                        <p className="text-xs font-bold text-zinc-400 mt-0.5">{user.title || 'Platform Member'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2 font-mono text-xs font-bold text-zinc-500 bg-white px-3 py-2 rounded-lg border border-zinc-100 w-fit group-hover:border-brand-200 transition-colors">
                                                    {user.wallet_address.slice(0, 10)}...{user.wallet_address.slice(-8)}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100 shadow-sm">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                    Active
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button 
                                                        onClick={() => setSelectedUser(user)}
                                                        className="p-3 text-zinc-400 hover:text-brand-600 hover:bg-white rounded-xl border border-transparent hover:border-zinc-200 transition-all shadow-none hover:shadow-sm"
                                                        title="View Profile"
                                                    >
                                                        <ExternalLink size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/chat?newchat=${user.wallet_address}`);
                                                        }}
                                                        className="p-3 text-zinc-400 hover:text-indigo-600 hover:bg-white rounded-xl border border-transparent hover:border-zinc-200 transition-all shadow-none hover:shadow-sm"
                                                        title="Direct Message"
                                                    >
                                                        <Mail size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                    
                    <div className="p-6 border-t border-zinc-100 bg-zinc-50/30 flex justify-between items-center">
                        <p className="text-xs font-bold text-zinc-400">
                            Showing {users.length > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0} to {Math.min(currentPage * PAGE_SIZE, totalUsers)} of {totalUsers} users
                        </p>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1 || isLoading} 
                                className="px-4 py-2 text-xs font-black text-zinc-600 border border-zinc-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-100 transition-colors"
                            >
                                Previous
                            </button>
                            <button 
                                onClick={() => setCurrentPage(p => p + 1)}
                                disabled={currentPage * PAGE_SIZE >= totalUsers || isLoading} 
                                className="px-4 py-2 text-xs font-black text-zinc-600 border border-zinc-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-100 transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            ) : activeTab === 'analytics' ? (
                <div className="space-y-6">
                    {isLoadingStats ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-4 bg-white rounded-[2.5rem] border border-zinc-200">
                            <Loader2 className="animate-spin text-brand-600" size={40} />
                            <p className="text-zinc-500 font-bold animate-pulse">Compiling platform statistics...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Total Volume */}
                            <div className="bg-gradient-to-br from-brand-600 to-indigo-700 p-6 md:p-8 rounded-[2rem] text-white shadow-xl shadow-brand-500/20 col-span-1 md:col-span-2 relative overflow-hidden group">
                                <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
                                <div className="relative z-10 flex justify-between items-start">
                                    <div>
                                        <p className="text-brand-100 font-black uppercase tracking-widest text-xs mb-2">Total Value Locked</p>
                                        <h3 className="text-4xl md:text-5xl font-black mb-1">{stats.totalVolume.toLocaleString()} <span className="text-2xl text-brand-200">PAS</span></h3>
                                        <p className="text-sm text-brand-200 font-medium">Accumulated milestone volume</p>
                                    </div>
                                    <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/20">
                                        <Coins size={28} />
                                    </div>
                                </div>
                            </div>
                            
                            {/* Total Users */}
                            <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                                        <Users size={24} />
                                    </div>
                                    <span className="flex items-center gap-1 text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full"><TrendingUp size={12} /> Live</span>
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-zinc-900 mb-1">{stats.totalUsers.toLocaleString()}</h3>
                                    <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">Registered Protocol Users</p>
                                </div>
                            </div>

                            {/* Job Success Rate */}
                            <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                                        <BarChart3 size={24} />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-zinc-900 mb-1">{stats.totalJobs > 0 ? Math.round((stats.completedJobs / stats.totalJobs) * 100) : 0}%</h3>
                                    <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">Project Success Rate</p>
                                </div>
                            </div>

                            {/* Detailed Breakdown */}
                            <div className="md:col-span-2 lg:col-span-4 bg-white border border-zinc-200 rounded-[2.5rem] overflow-hidden shadow-sm mt-4">
                                <div className="p-6 md:p-8 border-b border-zinc-100 flex items-center gap-3 bg-zinc-50/50">
                                    <Briefcase className="text-zinc-400" size={20} />
                                    <h2 className="text-xl font-black text-zinc-900">Project Distribution Overview</h2>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-zinc-100">
                                    <div className="p-8 text-center hover:bg-zinc-50 transition-colors">
                                        <p className="text-4xl font-black text-zinc-900 mb-2">{stats.totalJobs.toLocaleString()}</p>
                                        <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">Total Jobs Posted</p>
                                    </div>
                                    <div className="p-8 text-center hover:bg-brand-50/50 transition-colors">
                                        <p className="text-4xl font-black text-brand-600 mb-2">{stats.activeJobs.toLocaleString()}</p>
                                        <p className="text-xs font-black text-brand-400 uppercase tracking-widest">Active/Open Projects</p>
                                    </div>
                                    <div className="p-8 text-center hover:bg-emerald-50/50 transition-colors">
                                        <p className="text-4xl font-black text-emerald-600 mb-2">{stats.completedJobs.toLocaleString()}</p>
                                        <p className="text-xs font-black text-emerald-400 uppercase tracking-widest">Completed Contracts</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : activeTab === 'disputes' ? (
                <div className="space-y-6">
                    <div className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-xl shadow-brand-500/5 overflow-hidden">
                        <div className="p-6 md:p-8 border-b border-zinc-100 flex flex-col md:flex-row gap-6 justify-between items-center bg-zinc-50/50">
                            <div className="flex items-center gap-3">
                                <Scale className="text-zinc-400" size={20} />
                                <h2 className="text-xl font-black text-zinc-900">Active Disputes</h2>
                            </div>
                        </div>
                        <div className="p-6 md:p-8 space-y-6">
                            {isFetchingAppeals ? (
                                <div className="py-20 flex flex-col items-center justify-center gap-4">
                                    <Loader2 className="animate-spin text-brand-600" size={40} />
                                    <p className="text-zinc-500 font-bold">Fetching active appeals...</p>
                                </div>
                            ) : appeals.length === 0 ? (
                                <div className="py-20 text-center space-y-4">
                                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                                        <ShieldCheck size={40} />
                                    </div>
                                    <p className="text-zinc-500 font-bold">Victory! No pending appeals to moderate.</p>
                                </div>
                            ) : (
                                appeals.map(appeal => (
                                    <div key={appeal.id} className={cn(
                                        "border rounded-[2rem] overflow-hidden transition-all bg-white",
                                        appeal.status === 'resolved' ? "border-zinc-100 opacity-60" : "border-zinc-200 shadow-sm hover:shadow-lg"
                                    )}>
                                        <div className={cn(
                                            "p-6 border-b flex justify-between items-center",
                                            appeal.status === 'resolved' ? "bg-zinc-50 border-zinc-100" : "bg-red-50/30 border-zinc-100"
                                        )}>
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center",
                                                    appeal.status === 'resolved' ? "bg-zinc-100 text-zinc-400" : "bg-red-100 text-red-600"
                                                )}>
                                                    <AlertTriangle size={20} />
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-zinc-900">Appellate Review: Milestone #{appeal.milestone_id.slice(0,4)}</h3>
                                                    <p className="text-xs font-bold text-zinc-500">Project ID: {appeal.project_id.slice(0,8)}</p>
                                                </div>
                                            </div>
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                                appeal.status === 'resolved' 
                                                    ? "bg-zinc-100 text-zinc-500 border-zinc-200" 
                                                    : "bg-red-100 text-red-700 border-red-200"
                                            )}>
                                                {appeal.status === 'resolved' ? 'Resolved' : 'Review Required'}
                                            </span>
                                        </div>
                                        
                                        <div className="p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                                            <div className="space-y-6">
                                                <div>
                                                    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Freelancer Appeal Reasoning</h4>
                                                    <p className="text-sm text-zinc-700 bg-white p-4 rounded-2xl border border-zinc-100 italic">
                                                        "{appeal.freelancer_reason}"
                                                    </p>
                                                </div>

                                                <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Appellant Address:</p>
                                                    <p className="text-xs font-mono font-bold text-zinc-600 truncate">{appeal.freelancer_address}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-6">
                                                <div className="bg-brand-50 p-6 rounded-3xl border border-brand-100">
                                                    <h4 className="text-[10px] font-black text-brand-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                        <Bot size={14} className="LucideBot" /> AI Intelligence Report
                                                    </h4>
                                                    <p className="text-sm font-bold text-brand-900 mb-4">
                                                        {appeal.ai_reasoning}
                                                    </p>
                                                    <div className="bg-white p-4 rounded-2xl border border-brand-200">
                                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Initial AI Recommendation:</p>
                                                        <p className="text-sm font-black text-brand-700 capitalize">{appeal.ai_status === 'DISPUTE' ? 'Approve Employer Dispute (Reject Milestone)' : 'Release Funds to Freelancer'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {appeal.status !== 'resolved' && (
                                            <div className="p-6 bg-zinc-50 border-t border-zinc-100 flex gap-4 justify-end">
                                                <button 
                                                    disabled={isResolving === appeal.id}
                                                    onClick={() => handleResolveAppeal(appeal.id, appeal.milestone_id, 'approved', 'Admin override: Milestone verified as completed.')}
                                                    className="px-6 py-3 font-black text-emerald-700 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all shadow-sm text-sm"
                                                >
                                                    Override: Pay Freelancer
                                                </button>
                                                <button 
                                                    disabled={isResolving === appeal.id}
                                                    onClick={() => handleResolveAppeal(appeal.id, appeal.milestone_id, 'rejected', 'Admin enforced: AI verdict stands. Refund processed.')}
                                                    className="px-6 py-3 font-black text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-md shadow-red-500/20 text-sm flex items-center gap-2"
                                                >
                                                    {isResolving === appeal.id ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={16} />} 
                                                    Enforce AI (Reject)
                                                </button>
                                            </div>
                                        )}
                                        {appeal.status === 'resolved' && (
                                            <div className="p-6 bg-zinc-50 border-t border-zinc-100">
                                                <p className="text-xs font-bold text-zinc-500">
                                                    <span className="font-black text-zinc-800">Admin Resolution:</span> {appeal.admin_feedback}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="py-20 text-center space-y-4 bg-white rounded-[2.5rem] border border-zinc-200 shadow-xl shadow-brand-500/5">
                    <p className="text-zinc-500 font-bold">System Settings coming soon.</p>
                </div>
            )}
            {/* User Details Modal */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedUser(null)}>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden border border-zinc-100"
                    >
                        {/* Profile Header */}
                        <div className="p-8 pb-6 border-b border-zinc-100 flex items-start gap-6 bg-zinc-50/50">
                            <div className="w-24 h-24 rounded-2xl bg-brand-100 flex items-center justify-center text-brand-600 font-black text-3xl shadow-inner overflow-hidden flex-shrink-0 border border-brand-200/50">
                                {selectedUser.avatar_url ? (
                                    <img src={selectedUser.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    selectedUser.full_name?.charAt(0).toUpperCase() || '?'
                                )}
                            </div>
                            <div className="flex-1 pt-1">
                                <h2 className="text-2xl font-black text-zinc-900 tracking-tight leading-none mb-2">{selectedUser.full_name || 'Anonymous User'}</h2>
                                <p className="text-brand-600 font-bold mb-3">{selectedUser.title || 'Platform Member'}</p>
                                <div className="flex items-center gap-2 font-mono text-xs font-bold text-zinc-500 bg-white px-3 py-2 rounded-xl border border-zinc-200 w-fit cursor-copy hover:border-brand-300 hover:text-brand-600 transition-colors" title="Copy Address">
                                    {selectedUser.wallet_address}
                                </div>
                            </div>
                        </div>

                        {/* Profile Details */}
                        <div className="p-8 space-y-6">
                            <div>
                                <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">Biography</h3>
                                <p className="text-sm font-medium text-zinc-700 leading-relaxed bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                                    {selectedUser.bio || "This user hasn't added a bio yet."}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100 col-span-2">
                                    <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Hourly Rate</h3>
                                    <p className="text-lg font-black text-zinc-900">
                                        {selectedUser.hourly_rate ? `${selectedUser.hourly_rate} PAS/hr` : "Not set"}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">Skills</h3>
                                <div className="flex flex-wrap gap-2">
                                    {selectedUser.skills && selectedUser.skills.length > 0 ? (
                                        selectedUser.skills.map((skill, index) => (
                                            <span key={index} className="px-3 py-1.5 bg-brand-50 text-brand-700 text-xs font-bold rounded-lg border border-brand-100">
                                                {skill}
                                            </span>
                                        ))
                                    ) : (
                                        <p className="text-sm text-zinc-500 font-medium italic">No skills listed</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="p-6 bg-zinc-50 border-t border-zinc-100 flex justify-end gap-3">
                            <button 
                                onClick={() => setSelectedUser(null)} 
                                className="px-6 py-3 font-bold text-zinc-500 hover:bg-zinc-200 bg-zinc-100 rounded-xl transition-colors text-sm"
                            >
                                Close
                            </button>
                            <button 
                                onClick={() => {
                                    setSelectedUser(null);
                                    navigate(`/chat?newchat=${selectedUser.wallet_address}`);
                                }} 
                                className="px-6 py-3 font-black text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-all shadow-md shadow-brand-500/20 flex items-center gap-2 text-sm"
                            >
                                <Mail size={16} /> Direct Message
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};
