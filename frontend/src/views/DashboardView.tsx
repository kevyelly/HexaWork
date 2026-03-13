import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, User, Clock, Calendar as CalendarIcon, FileText, CheckCircle, Loader2, Video } from 'lucide-react';
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
    const [activeProjects, setActiveProjects] = useState<any[]>([]);
    const [upcomingMeetings, setUpcomingMeetings] = useState<any[]>([]);

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

        if (data) {
            setProfile(data);
            await fetchDashboardData(data.role, lowerWallet);
        } else {
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

        const { error } = await supabase.from('users').insert([newProfile]);

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
            const [ongoing, pending, completed, projectsRes, meetingsRes] = await Promise.all([
                supabase.from('applications').select('*', { count: 'exact' }).eq('freelancer_address', wallet).eq('status', 'accepted'),
                supabase.from('applications').select('*', { count: 'exact' }).eq('freelancer_address', wallet).in('status', ['pending', 'interviewing']),
                supabase.from('applications').select('*', { count: 'exact' }).eq('freelancer_address', wallet).eq('status', 'completed'),
                supabase.from('applications').select('*, jobs(*)').eq('freelancer_address', wallet).eq('status', 'accepted').limit(5),
                supabase.from('applications').select('*, jobs(title)').eq('freelancer_address', wallet).eq('status', 'interviewing')
            ]);

            setStats({ stat1: ongoing.count || 0, stat2: pending.count || 0, stat3: completed.count || 0 });
            if (projectsRes.data) setActiveProjects(projectsRes.data);
            if (meetingsRes.data) setUpcomingMeetings(meetingsRes.data.filter(m => m.meeting_date));

        } else {
            const jobsRes = await supabase.from('jobs').select('id').eq('employer_address', wallet);
            const jobIds = jobsRes.data ? jobsRes.data.map(j => j.id) : [];

            let appsToReviewCount = 0;
            let fetchedMeetings: any[] = [];

            if (jobIds.length > 0) {
                const [appsRes, meetingsRes] = await Promise.all([
                    supabase.from('applications').select('*', { count: 'exact' }).in('job_id', jobIds).eq('status', 'pending'),
                    supabase.from('applications').select('*, jobs(title)').in('job_id', jobIds).eq('status', 'interviewing')
                ]);
                appsToReviewCount = appsRes.count || 0;
                if (meetingsRes.data) fetchedMeetings = meetingsRes.data.filter(m => m.meeting_date);
            }

            const [posted, ongoing, projectsRes] = await Promise.all([
                supabase.from('jobs').select('*', { count: 'exact' }).eq('employer_address', wallet),
                supabase.from('jobs').select('*', { count: 'exact' }).eq('employer_address', wallet).eq('status', 'in-progress'),
                supabase.from('jobs').select('*').eq('employer_address', wallet).eq('status', 'in-progress').limit(5)
            ]);

            setStats({ stat1: posted.count || 0, stat2: ongoing.count || 0, stat3: appsToReviewCount });
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
                            <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight">Welcome back, {profile.full_name}!</h1>
                            <p className="text-zinc-500 font-medium">Here is what is happening with your account today.</p>
                        </div>
                        <div className="px-4 py-2 bg-zinc-100 text-zinc-600 rounded-xl font-bold text-sm uppercase tracking-widest border border-zinc-200">
                            {profile.role === 'freelancer' ? 'Freelancer Mode' : 'Employer Mode'}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {profile.role === 'freelancer' ? (
                            <>
                                <StatCard label="Ongoing Jobs" value={stats.stat1} icon={Briefcase} color="text-brand-600" bg="bg-brand-50" onClick={() => navigate('/dashboard/summary/ongoing')} />
                                <StatCard label="Pending Apps" value={stats.stat2} icon={Clock} color="text-indigo-600" bg="bg-indigo-50" onClick={() => navigate('/dashboard/summary/pending')} />
                                <StatCard label="Completed Jobs" value={stats.stat3} icon={CheckCircle} color="text-emerald-600" bg="bg-emerald-50" onClick={() => navigate('/dashboard/summary/completed')} />
                            </>
                        ) : (
                            <>
                                {/* Changed: Jobs Posted bypasses summary completely */}
                                <StatCard label="Jobs Posted" value={stats.stat1} icon={FileText} color="text-brand-600" bg="bg-brand-50" onClick={() => navigate('/jobmarket', { state: { tab: 'my-jobs' } })} />
                                <StatCard label="Ongoing Jobs" value={stats.stat2} icon={Briefcase} color="text-indigo-600" bg="bg-indigo-50" onClick={() => navigate('/dashboard/summary/ongoing')} />
                                <StatCard label="Apps to Review" value={stats.stat3} icon={User} color="text-amber-600" bg="bg-amber-50" onClick={() => navigate('/dashboard/summary/review')} />
                            </>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white rounded-[2rem] border border-zinc-200 shadow-sm overflow-hidden">
                            <div className="p-6 md:p-8 border-b border-zinc-100 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-zinc-900">Active Projects</h3>
                            </div>
                            <div className="divide-y divide-zinc-100">
                                {activeProjects.length === 0 ? (
                                    <p className="p-8 text-center text-zinc-400 font-medium">No active projects right now.</p>
                                ) : (
                                    activeProjects.map((project, i) => (
                                        <div key={i} onClick={() => navigate('/chat')} className="p-6 md:p-8 hover:bg-zinc-50 transition-all cursor-pointer group">
                                            <div className="flex justify-between items-center mb-3">
                                                <h4 className="text-lg font-bold text-zinc-900 group-hover:text-brand-600 transition-colors">{profile.role === 'freelancer' ? project.jobs?.title : project.title}</h4>
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
                                                <h4 className="font-bold text-zinc-900">{meeting.jobs?.title}</h4>
                                                <p className="text-sm font-medium text-blue-600 flex items-center gap-1 mt-1"><Clock size={14} /> {meeting.meeting_date}</p>
                                            </div>
                                            <a
                                                href={meeting.meeting_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-3 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                title="Join Video Call"
                                            >
                                                <Video size={20} />
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            )}
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