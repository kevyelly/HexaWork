import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { PROJECTS, MILESTONES } from '../constants';
import { CreditCard, Briefcase, Shield, User, Clock, Calendar as CalendarIcon, ChevronRight, CheckCircle2, FileText, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '../utils';
import { useWallet } from '../lib/WalletContext';
import { supabase } from '../lib/supabase';

export const DashboardView: React.FC = () => {
  const { walletAddress } = useWallet();
  const formatAddress = (address: string) => `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  
  interface ActiveProject { id: string; title: string; budget: string; client: string; status: string; progress: number; }
  const [metrics, setMetrics] = useState({ active: 0, approvals: 0, pending: 0, disputes: 0 });
  const [activeProjects, setActiveProjects] = useState<ActiveProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!walletAddress) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      const addrLower = walletAddress.toLowerCase();

      try {
        const { count: employerJobsCount } = await supabase
          .from('jobs')
          .select('*', { count: 'exact', head: true })
          .ilike('employer_address', addrLower)
          .eq('status', 'in-progress');

        const { count: freelancerAppsCount } = await supabase
          .from('applications')
          .select('*', { count: 'exact', head: true })
          .ilike('freelancer_address', addrLower)
          .eq('status', 'accepted');

        const totalActive = (employerJobsCount || 0) + (freelancerAppsCount || 0);

        const { count: approvalsCount } = await supabase
          .from('project_milestones')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'submitted')
          .ilike('project_id', `%${addrLower}%`);

        const { count: freelancerPendingCount } = await supabase
          .from('applications')
          .select('*', { count: 'exact', head: true })
          .ilike('freelancer_address', addrLower)
          .eq('status', 'pending');

        const { data: myJobs } = await supabase
          .from('jobs')
          .select('id')
          .ilike('employer_address', addrLower);
          
        let employerPendingCount = 0;
        if (myJobs && myJobs.length > 0) {
          const jobIds = myJobs.map(j => j.id);
          const { count } = await supabase
            .from('applications')
            .select('*', { count: 'exact', head: true })
            .in('job_id', jobIds)
            .eq('status', 'pending');
          employerPendingCount = count || 0;
        }
        
        const totalPendingApps = (freelancerPendingCount || 0) + employerPendingCount;

        const { count: disputesCount } = await supabase
          .from('project_milestones')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'rejected')
          .ilike('project_id', `%${addrLower}%`);

        setMetrics({
          active: totalActive,
          approvals: approvalsCount || 0,
          pending: totalPendingApps,
          disputes: disputesCount || 0
        });

        // Fetch Active Projects Details
        const activeProjectsList: ActiveProject[] = [];

        // 1. Fetch Employer Jobs
        const { data: employerJobs } = await supabase.from('jobs').select('*').ilike('employer_address', addrLower).eq('status', 'in-progress');
        if (employerJobs) {
          for (const job of employerJobs) {
            const { data: freelancerApp } = await supabase.from('applications').select('freelancer_address').eq('job_id', job.id).eq('status', 'accepted').single();
            const flAddress = freelancerApp ? freelancerApp.freelancer_address : 'Unknown';
            const roomId = [addrLower, (flAddress as string).toLowerCase()].sort().join('_');
            
            const { data: milestones } = await supabase.from('project_milestones').select('status').eq('project_id', roomId);
            const total = milestones && milestones.length > 0 ? milestones.length : 1;
            const completed = milestones ? milestones.filter(m => m.status === 'approved').length : 0;
            const progress = Math.round((completed / total) * 100);

            activeProjectsList.push({ id: job.id, title: job.title, budget: job.budget, client: `Freelancer: ${formatAddress(flAddress as string)}`, status: 'Development', progress });
          }
        }

        // 2. Fetch Freelancer Jobs
        const { data: freelancerApps } = await supabase.from('applications').select('*, jobs(*)').ilike('freelancer_address', addrLower).eq('status', 'accepted');
        if (freelancerApps) {
          for (const app of freelancerApps) {
            const job = app.jobs as any;
            if (!job) continue;
            const roomId = [addrLower, job.employer_address.toLowerCase()].sort().join('_');
            
            const { data: milestones } = await supabase.from('project_milestones').select('status').eq('project_id', roomId);
            const total = milestones && milestones.length > 0 ? milestones.length : 1;
            const completed = milestones ? milestones.filter(m => m.status === 'approved').length : 0;
            const progress = Math.round((completed / total) * 100);

            activeProjectsList.push({ id: job.id, title: job.title, budget: job.budget, client: `Client: ${formatAddress(job.employer_address)}`, status: 'In Progress', progress });
          }
        }

        setActiveProjects(activeProjectsList);

      } catch (err) {
        console.error("Error fetching metrics:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
    // Setting up realtime subscription for updates could be added here later if needed
  }, [walletAddress]);

  return (
  <div className="p-4 md:p-6 space-y-8">
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight">
          Welcome back{walletAddress ? `, ${formatAddress(walletAddress)}` : ''}! 👋
        </h1>
        <p className="text-zinc-500 font-medium">You've got 3 milestones to crush today. Let's do this!</p>
      </div>
      <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-zinc-200 shadow-sm w-full sm:w-auto">
        <button className="flex-1 sm:flex-none px-4 py-2 bg-brand-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-brand-500/20">Freelancer</button>
        <button className="flex-1 sm:flex-none px-4 py-2 text-zinc-500 font-bold text-sm hover:bg-zinc-50 rounded-xl">Client</button>
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {[
        { label: 'Active Escrows', value: metrics.active.toString(), change: 'In Progress', icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-50', emoji: '🔒' },
        { label: 'Pending Approvals', value: metrics.approvals.toString(), change: 'Action Req', icon: CheckCircle2, color: 'text-amber-600', bg: 'bg-amber-50', emoji: '⏳' },
        { label: 'Pending Applications', value: metrics.pending.toString(), change: 'Marketplace', icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50', emoji: '📋' },
        { label: 'Recent Disputes', value: metrics.disputes.toString(), change: 'All Good', icon: AlertTriangle, color: 'text-zinc-400', bg: 'bg-zinc-100', emoji: '⚖️' },
      ].map((stat, i) => (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          key={stat.label} 
          className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className={cn("p-4 rounded-2xl transition-transform group-hover:scale-110", stat.bg)}>
              <stat.icon className={stat.color} size={28} />
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded-full mb-1">
                {stat.change}
              </span>
              <span className="text-xl">{stat.emoji}</span>
            </div>
          </div>
          <p className="text-zinc-500 text-sm font-bold uppercase tracking-wider">{stat.label}</p>
          <h3 className="text-2xl md:text-3xl font-black text-zinc-900 mt-1">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-zinc-400 mt-2" /> : stat.value}
          </h3>
        </motion.div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white rounded-[2rem] border border-zinc-200 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-zinc-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-zinc-900">Your Active Projects 📂</h3>
          <button className="text-brand-600 text-sm font-bold hover:bg-brand-50 px-4 py-2 rounded-xl transition-all">View All</button>
        </div>
        <div className="divide-y divide-zinc-100">
          {isLoading ? (
            <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-brand-600" size={32} /></div>
          ) : activeProjects.length === 0 ? (
            <div className="p-10 text-center text-zinc-500 font-bold">No active projects found! Head to the Marketplace to start working.</div>
          ) : (
            activeProjects.map((project) => (
              <div key={project.id} className="p-6 md:p-8 hover:bg-zinc-50 transition-all cursor-pointer group">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-lg font-bold text-zinc-900 group-hover:text-brand-600 transition-colors line-clamp-1 flex-1 pr-4">{project.title}</h4>
                  <span className="text-sm border border-zinc-200 shadow-sm font-black text-zinc-900 bg-white px-3 py-1 rounded-full whitespace-nowrap">{project.budget}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-zinc-500 font-medium mb-5">
                  <span className="flex items-center gap-1.5 bg-zinc-100 px-2 py-1 rounded-md"><User size={12} /> {project.client}</span>
                  <span className="w-1.5 h-1.5 bg-zinc-300 rounded-full hidden sm:block"></span>
                  <span className="flex items-center gap-1.5 font-bold tracking-wide uppercase text-[10px]"><Clock size={12} /> {project.status}</span>
                </div>
                <div className="relative">
                  <div className="w-full bg-zinc-100 h-2.5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${project.progress}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="bg-brand-500 h-full rounded-full shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                    />
                  </div>
                  <span className="absolute -top-6 right-0 text-[10px] font-black text-brand-600 uppercase tracking-widest">{project.progress}% Done</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-zinc-200 shadow-sm p-6 md:p-8">
        <h3 className="text-xl font-bold text-zinc-900 mb-8">Upcoming Milestones 🗓️</h3>
        <div className="space-y-8">
          {MILESTONES.map((m, i) => (
            <div key={i} className="flex gap-4 md:gap-6 group cursor-pointer">
              <div className={cn("flex-shrink-0 w-14 h-14 rounded-2xl flex flex-col items-center justify-center transition-transform group-hover:scale-110 shadow-sm", m.color)}>
                <span className="text-[10px] uppercase font-black opacity-70">{m.date.split(' ')[0]}</span>
                <span className="text-xl font-black leading-none">{m.date.split(' ')[1]}</span>
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-bold text-zinc-900 group-hover:text-brand-600 transition-colors">{m.title}</h4>
                <p className="text-sm text-zinc-500 font-medium">{m.project} • {m.time}</p>
              </div>
              <ChevronRight className="text-zinc-300 group-hover:text-brand-500 transition-colors self-center" size={20} />
            </div>
          ))}
        </div>
        <button className="w-full mt-8 py-4 bg-zinc-100 text-zinc-600 font-bold rounded-2xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-2">
          <CalendarIcon size={18} />
          Open Full Calendar
        </button>
      </div>
    </div>
  </div>
  );
};
