import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Loader2, Briefcase, FileText, User, Clock, CheckCircle, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useWallet } from '../lib/WalletContext';

export const DashboardSummaryView: React.FC = () => {
    const { type } = useParams<{ type: string }>();
    const navigate = useNavigate();
    const { walletAddress } = useWallet();

    const [isLoading, setIsLoading] = useState(true);
    const [items, setItems] = useState<any[]>([]);
    const [role, setRole] = useState<'freelancer' | 'employer' | null>(null);

    useEffect(() => {
        if (walletAddress && type) {
            fetchSummaryData();
        }
    }, [walletAddress, type]);

    const fetchSummaryData = async () => {
        setIsLoading(true);
        const lowerWallet = walletAddress!.toLowerCase();

        const { data: user } = await supabase.from('users').select('role').eq('wallet_address', lowerWallet).single();
        if (!user) {
            navigate('/dashboard');
            return;
        }

        setRole(user.role);

        if (user.role === 'freelancer') {
            if (type === 'ongoing') {
                const { data } = await supabase.from('applications').select('*, jobs(*)').eq('freelancer_address', lowerWallet).eq('status', 'accepted');
                setItems(data || []);
            } else if (type === 'pending') {
                const { data } = await supabase.from('applications').select('*, jobs(*)').eq('freelancer_address', lowerWallet).in('status', ['pending', 'interviewing']);
                setItems(data || []);
            } else if (type === 'completed') {
                const { data } = await supabase.from('applications').select('*, jobs(*)').eq('freelancer_address', lowerWallet).eq('status', 'completed');
                setItems(data || []);
            }
        } else {
            if (type === 'posted') {
                const { data } = await supabase.from('jobs').select('*').eq('employer_address', lowerWallet);
                setItems(data || []);
            } else if (type === 'ongoing') {
                const { data } = await supabase.from('jobs').select('*').eq('employer_address', lowerWallet).eq('status', 'in-progress');
                setItems(data || []);
            } else if (type === 'review') {
                const jobsRes = await supabase.from('jobs').select('id, title').eq('employer_address', lowerWallet);
                const jobIds = jobsRes.data ? jobsRes.data.map(j => j.id) : [];
                if (jobIds.length > 0) {
                    const { data } = await supabase.from('applications').select('*, jobs(*)').in('job_id', jobIds).eq('status', 'pending');
                    setItems(data || []);
                } else {
                    setItems([]);
                }
            }
        }
        setIsLoading(false);
    };

    const handleItemClick = (item: any) => {
        if (type === 'ongoing') {
            navigate('/chat');
        } else if (type === 'pending' || type === 'completed') {
            navigate('/jobmarket', { state: { tab: 'my-apps' } });
        } else if (type === 'posted') {
            navigate('/jobmarket', { state: { tab: 'my-jobs' } });
        } else if (type === 'review') {
            // Passes a deep link command to automatically open the Review Applicants modal
            navigate('/jobmarket', { state: { tab: 'my-jobs', autoOpenReview: item.job_id } });
        }
    };

    const getTitle = () => {
        switch(type) {
            case 'ongoing': return 'Ongoing Projects';
            case 'pending': return 'Pending Applications';
            case 'completed': return 'Completed Projects';
            case 'posted': return 'Your Job Postings';
            case 'review': return 'Applications to Review';
            default: return 'Summary';
        }
    };

    const getIcon = () => {
        switch(type) {
            case 'ongoing': return <Briefcase className="text-brand-600" size={24} />;
            case 'pending': return <Clock className="text-indigo-600" size={24} />;
            case 'completed': return <CheckCircle className="text-emerald-600" size={24} />;
            case 'posted': return <FileText className="text-brand-600" size={24} />;
            case 'review': return <User className="text-amber-600" size={24} />;
            default: return <Briefcase className="text-zinc-600" size={24} />;
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-[60vh]"><Loader2 className="animate-spin text-brand-600" size={40} /></div>;
    }

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
            <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors"
            >
                <ArrowLeft size={16} /> Back to Dashboard
            </button>

            <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-white rounded-2xl border border-zinc-200 shadow-sm">
                    {getIcon()}
                </div>
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight">{getTitle()}</h1>
                    <p className="text-zinc-500 font-medium">Select an item below to view full details.</p>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-zinc-200 shadow-sm overflow-hidden">
                {items.length === 0 ? (
                    <div className="p-12 text-center text-zinc-500 font-medium">
                        No items found in this category.
                    </div>
                ) : (
                    <div className="divide-y divide-zinc-100">
                        {items.map((item, index) => {
                            const title = item.jobs ? item.jobs.title : item.title;
                            const status = item.status;
                            const date = new Date(item.created_at).toLocaleDateString();

                            return (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    key={item.id}
                                    onClick={() => handleItemClick(item)}
                                    className="p-6 flex justify-between items-center hover:bg-zinc-50 transition-colors cursor-pointer group"
                                >
                                    <div>
                                        <h3 className="text-lg font-bold text-zinc-900 group-hover:text-brand-600 transition-colors">{title}</h3>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-xs font-black uppercase tracking-widest text-zinc-500 bg-zinc-100 px-2 py-1 rounded-md">{status}</span>
                                            <span className="text-sm font-medium text-zinc-400">Created: {date}</span>
                                        </div>
                                    </div>
                                    <ChevronRight className="text-zinc-300 group-hover:text-brand-600 transition-colors" size={24} />
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};