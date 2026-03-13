import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, User, Clock, Calendar as CalendarIcon, FileText, CheckCircle, CheckCircle2, AlertTriangle, Loader2, Video, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useWallet } from '../lib/WalletContext';
import { cn } from '../utils';

interface UserProfile {
    wallet_address: string;
    full_name: string;
    role: 'freelancer' | 'employer';
}

export const DashboardView: React.FC = () => {
    const { walletAddress } = useWallet();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Registration State
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [regName, setRegName] = useState('');
    const [regRole, setRegRole] = useState<'freelancer' | 'employer'>('freelancer');
    const [isSaving, setIsSaving] = useState(false);

    // Dynamic Stats & Meetings
    const [stats, setStats] = useState({ stat1: 0, stat2: 0, stat3: 0 });
    const [freelancerMetrics, setFreelancerMetrics] = useState({ activeJobs: 0, pendingApps: 0, interviews: 0, completed: 0 });
    const [employerMetrics, setEmployerMetrics] = useState({ posted: 0, activeJobs: 0, toReview: 0, interviews: 0 });
    const [activeProjects, setActiveProjects] = useState<any[]>([]);
    const [upcomingMeetings, setUpcomingMeetings] = useState<any[]>([]);

    const formatAddress = (address: string) => `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;

    useEffect(() => {
        if (walletAddress) {
            checkAndFetchProfile();
        }
    }, [walletAddress]);

    const checkAndFetchProfile = async () => {
        setIsLoading(true);
        const lowerWallet = walletAddress!.toLowerCase();

        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('wallet_address', lowerWallet)
            .single();

        if (data && data.role) {
            setProfile(data);
            await fetchDashboardData(data.role, lowerWallet);
        } else {
            // Profile exists but is incomplete (e.g. created by WalletContext stub)
            // or profile doesn't exist at all.
            if (data) {
                setProfile(data);
                setRegName(data.full_name || '');
            }
            setIsRegisterModalOpen(true);
            setIsLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!regName.trim() || !walletAddress) return;
        setIsSaving(true);

        const lowerWallet = walletAddress.toLowerCase();
        const newProfile = { wallet_address: lowerWallet, full_name: regName, role: regRole };

        const { error } = await supabase.from('users').upsert([newProfile]);

        if (!error) {
            setProfile(newProfile);
            setIsRegisterModalOpen(false);
            await fetchDashboardData(regRole, lowerWallet);
        } else {
            console.error(error);
            alert("Failed to create profile.");
        }
        setIsSaving(false);
    };

    const fetchDashboardData = async (role: string, wallet: string) => {
        if (role === 'freelancer') {
            const [activeJobs, pendingApps, interviews, completed, projectsRes, meetingsRes] = await Promise.all([
                supabase.from('applications').select('*', { count: 'exact', head: true }).eq('freelancer_address', wallet).eq('status', 'accepted'),
                supabase.from('applications').select('*', { count: 'exact', head: true }).eq('freelancer_address', wallet).eq('status', 'pending'),
                supabase.from('applications').select('*', { count: 'exact', head: true }).eq('freelancer_address', wallet).eq('status', 'interviewing'),
                supabase.from('applications').select('*', { count: 'exact', head: true }).eq('freelancer_address', wallet).eq('status', 'completed'),
                supabase.from('applications').select('*, jobs(*)').eq('freelancer_address', wallet).eq('status', 'accepted').limit(5),
                supabase.from('applications').select('*, jobs(title)').eq('freelancer_address', wallet).eq('status', 'interviewing'),
            ]);
            setStats({ stat1: activeJobs.count || 0, stat2: pendingApps.count || 0, stat3: completed.count || 0 });
            setFreelancerMetrics({
                activeJobs: activeJobs.count || 0,
                pendingApps: pendingApps.count || 0,
                interviews: interviews.count || 0,
                completed: completed.count || 0,
            });
            if (projectsRes.data) setActiveProjects(projectsRes.data);
            if (meetingsRes.data) setUpcomingMeetings(meetingsRes.data.filter((m: any) => m.meeting_date));
        } else {
            // Fetch all employer job IDs first
            const jobsRes = await supabase.from('jobs').select('id').eq('employer_address', wallet);
            const jobIds = jobsRes.data ? jobsRes.data.map((j: any) => j.id) : [];

            let toReviewCount = 0;
            let interviewCount = 0;
            let fetchedMeetings: any[] = [];

            if (jobIds.length > 0) {
                const [appsRes, interviewsRes] = await Promise.all([
                    supabase.from('applications').select('*', { count: 'exact', head: true }).in('job_id', jobIds).eq('status', 'pending'),
                    supabase.from('applications').select('*, jobs(title)').in('job_id', jobIds).eq('status', 'interviewing'),
                ]);
                toReviewCount = appsRes.count || 0;
                interviewCount = interviewsRes.count || 0;
                if (interviewsRes.data) fetchedMeetings = interviewsRes.data.filter((m: any) => m.meeting_date);
            }

            const [posted, ongoingJobs, projectsRes] = await Promise.all([
                supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('employer_address', wallet),
                supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('employer_address', wallet).eq('status', 'in-progress'),
                supabase.from('jobs').select('*').eq('employer_address', wallet).eq('status', 'in-progress').limit(5),
            ]);
            setStats({ stat1: posted.count || 0, stat2: ongoingJobs.count || 0, stat3: toReviewCount });
            setEmployerMetrics({
                posted: posted.count || 0,
                activeJobs: ongoingJobs.count || 0,
                toReview: toReviewCount,
                interviews: interviewCount,
            });
            if (projectsRes.data) setActiveProjects(projectsRes.data);
            setUpcomingMeetings(fetchedMeetings);
        }

        setIsLoading(false);
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-[60vh]"><Loader2 className="animate-spin text-brand-600" size={40} /></div>;
    }

    return (
        <div className="p-4 md:p-6 space-y-8 relative">

            {/* ONBOARDING MODAL */}
            {isRegisterModalOpen && (
                <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl">
                        <h3 className="text-2xl font-black text-zinc-900 mb-2">Welcome to HexaWork</h3>
                        <p className="text-sm text-zinc-500 mb-6">Let's set up your profile before you continue.</p>

                        <form onSubmit={handleRegister} className="space-y-6">
                            <div>
                                <label className="text-xs font-bold text-zinc-900 mb-2 block uppercase tracking-widest">Full Name</label>
                                <input type="text" value={regName} onChange={e => setRegName(e.target.value)} placeholder="John Doe" className="w-full p-4 border border-zinc-200 bg-zinc-50 rounded-xl focus:border-brand-500 outline-none transition-all" required />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-zinc-900 mb-2 block uppercase tracking-widest">I want to...</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button type="button" onClick={() => setRegRole('freelancer')} className={`p-4 border-2 rounded-xl font-bold text-sm flex flex-col items-center gap-2 transition-all ${regRole === 'freelancer' ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-zinc-100 text-zinc-400 hover:bg-zinc-50'}`}>
                                        <Briefcase size={24} /> Work
                                    </button>
                                    <button type="button" onClick={() => setRegRole('employer')} className={`p-4 border-2 rounded-xl font-bold text-sm flex flex-col items-center gap-2 transition-all ${regRole === 'employer' ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-zinc-100 text-zinc-400 hover:bg-zinc-50'}`}>
                                        <User size={24} /> Hire
                                    </button>
                                </div>
                            </div>

                            <button type="submit" disabled={isSaving} className="w-full py-4 bg-zinc-900 text-white rounded-xl font-black uppercase tracking-widest hover:bg-zinc-800 transition-all flex justify-center items-center">
                                {isSaving ? <Loader2 className="animate-spin" /> : "Complete Setup"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {profile && (
                <>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight">Welcome back, {profile.full_name}! 👋</h1>
                            <p className="text-zinc-500 font-medium">Here is what is happening with your account today.</p>
                        </div>
                        <div className="px-4 py-2 bg-zinc-100 text-zinc-600 rounded-xl font-bold text-sm uppercase tracking-widest border border-zinc-200">
                            {profile.role === 'freelancer' ? 'Freelancer Mode' : 'Employer Mode'}
                        </div>
                    </div>

                    {/* Role-specific 4-metric overview */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {(profile.role === 'freelancer' ? [
                            { label: 'Active Jobs',           value: freelancerMetrics.activeJobs,  badge: 'In Progress', icon: Briefcase,     color: 'text-indigo-600',  bg: 'bg-indigo-50',  emoji: '🔒', route: () => navigate('/dashboard/summary/ongoing') },
                            { label: 'Pending Applications',  value: freelancerMetrics.pendingApps, badge: 'Awaiting',    icon: FileText,      color: 'text-amber-600',   bg: 'bg-amber-50',   emoji: '📋', route: () => navigate('/dashboard/summary/pending') },
                            { label: 'Interviews Scheduled',  value: freelancerMetrics.interviews,  badge: 'Upcoming',    icon: CalendarIcon,  color: 'text-brand-600',   bg: 'bg-brand-50',   emoji: '📅', route: () => navigate('/calendar') },
                            { label: 'Completed Jobs',        value: freelancerMetrics.completed,   badge: 'Done',        icon: CheckCircle2,  color: 'text-emerald-600', bg: 'bg-emerald-50', emoji: '✅', route: () => navigate('/dashboard/summary/completed') },
                        ] : [
                            { label: 'Jobs Posted',           value: employerMetrics.posted,     badge: 'Total',       icon: FileText,      color: 'text-brand-600',   bg: 'bg-brand-50',   emoji: '📝', route: () => navigate('/jobmarket', { state: { tab: 'my-jobs' } }) },
                            { label: 'Active Jobs',           value: employerMetrics.activeJobs, badge: 'In Progress', icon: Briefcase,     color: 'text-indigo-600',  bg: 'bg-indigo-50',  emoji: '🔒', route: () => navigate('/dashboard/summary/ongoing') },
                            { label: 'Apps to Review',        value: employerMetrics.toReview,   badge: 'Action Req',  icon: Clock,         color: 'text-amber-600',   bg: 'bg-amber-50',   emoji: '⏳', route: () => navigate('/dashboard/summary/review') },
                            { label: 'Interviews Scheduled',  value: employerMetrics.interviews, badge: 'Upcoming',    icon: CalendarIcon,  color: 'text-emerald-600', bg: 'bg-emerald-50', emoji: '📅', route: () => navigate('/calendar') },
                        ]).map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                onClick={stat.route}
                                className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className={cn('p-4 rounded-2xl transition-transform group-hover:scale-110', stat.bg)}>
                                        <stat.icon className={stat.color} size={28} />
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded-full mb-1">{stat.badge}</span>
                                        <span className="text-xl">{stat.emoji}</span>
                                    </div>
                                </div>
                                <p className="text-zinc-500 text-sm font-bold uppercase tracking-wider">{stat.label}</p>
                                <h3 className="text-2xl md:text-3xl font-black text-zinc-900 mt-1">{stat.value}</h3>
                            </motion.div>
                        ))}
                    </div>



                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white rounded-[2rem] border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
                            <div className="p-6 md:p-8 border-b border-zinc-100 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-zinc-900">Active Projects</h3>
                            </div>
                            <div className="divide-y divide-zinc-100 flex-1">
                                {activeProjects.length === 0 ? (
                                    <p className="p-8 text-center text-zinc-400 font-medium">No active projects right now.</p>
                                ) : (
                                    activeProjects.map((project, i) => (
                                        <div key={i} onClick={() => navigate('/chat')} className="p-6 md:p-8 hover:bg-zinc-50 transition-all cursor-pointer group">
                                            <div className="flex justify-between items-center mb-3">
                                                <h4 className="text-lg font-bold text-zinc-900 group-hover:text-brand-600 transition-colors line-clamp-1">{profile.role === 'freelancer' ? project.jobs?.title : project.title}</h4>
                                                <span className="text-xs font-black uppercase tracking-widest text-brand-600 bg-brand-50 px-3 py-1 rounded-lg">Active</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-zinc-500 font-medium">
                                                <span className="flex items-center gap-1.5"><CalendarIcon size={14} /> Created: {new Date(project.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Calendar & Milestones Update */}
                        <div className="bg-white rounded-[2rem] border border-zinc-200 shadow-sm p-6 md:p-8 flex flex-col">
                            <h3 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-2"><CalendarIcon className="text-brand-600" /> Scheduled Interviews</h3>

                            {upcomingMeetings.length === 0 ? (
                                <div className="flex flex-col items-center justify-center text-center py-10 flex-1">
                                    <Clock size={48} className="text-zinc-300 mb-4" />
                                    <p className="text-zinc-500 max-w-sm">No upcoming interviews scheduled yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-4 overflow-y-auto max-h-[300px] pr-2">
                                    {upcomingMeetings.map((meeting, i) => (
                                        <div key={i} className="p-4 rounded-2xl border border-zinc-100 bg-zinc-50 flex justify-between items-center group hover:border-blue-200 transition-all">
                                            <div>
                                                <h4 className="font-bold text-zinc-900 line-clamp-1">{meeting.jobs?.title}</h4>
                                                <p className="text-sm font-medium text-blue-600 flex items-center gap-1 mt-1"><Clock size={14} /> {meeting.meeting_date}</p>
                                            </div>
                                            <a
                                                href={meeting.meeting_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-3 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm flex-shrink-0 ml-4"
                                                title="Join Video Call"
                                            >
                                                <Video size={20} />
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Restored from HEAD */}
                            <button onClick={() => navigate('/calendar')} className="w-full mt-8 py-4 bg-zinc-100 text-zinc-600 font-bold rounded-2xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-2">
                                <CalendarIcon size={18} />
                                Open Full Calendar
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

const StatCard = ({ label, value, icon: Icon, color, bg, onClick }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        onClick={onClick}
        className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
    >
        <div className="flex justify-between items-start mb-4">
            <div className={cn("p-4 rounded-2xl", bg)}>
                <Icon className={color} size={28} />
            </div>
        </div>
        <p className="text-zinc-500 text-sm font-bold uppercase tracking-wider">{label}</p>
        <h3 className="text-3xl font-black text-zinc-900 mt-1">{value}</h3>
    </motion.div>
);