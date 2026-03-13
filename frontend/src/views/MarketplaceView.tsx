import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Briefcase, CheckCircle2, X, Loader2, UserCircle, MessageSquare, FileText, UploadCloud, Trash2, Calendar, Video, Coins } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useWallet } from '../lib/WalletContext';
import { ethers } from 'ethers';
import { ESCROW_ABI, ESCROW_BYTECODE } from '../lib/escrowContract';

interface Job { id: string; employer_address: string; title: string; description: string; budget: string; tags: string[]; status: string; created_at: string; milestones_json?: any[]; contract_address?: string; }
interface Application { id: string; job_id: string; freelancer_address: string; cover_letter: string; resume_url?: string; status: string; created_at: string; meeting_date?: string; meeting_link?: string; jobs?: Job; }

export const MarketplaceView: React.FC = () => {
    const { walletAddress } = useWallet();
    const location = useLocation();
    const navigate = useNavigate();

    const [userRole, setUserRole] = useState<'freelancer' | 'employer' | null>(null);
    const [activeTab, setActiveTab] = useState<'browse' | 'my-jobs' | 'my-apps'>((location.state as any)?.tab || 'browse');

    const [jobs, setJobs] = useState<Job[]>([]);
    const [myApplications, setMyApplications] = useState<Application[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);

    const [interviewDate, setInterviewDate] = useState('');
    const [interviewTime, setInterviewTime] = useState('');
    const [selectedApplicant, setSelectedApplicant] = useState<Application | null>(null);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [jobApplicants, setJobApplicants] = useState<Application[]>([]);

    const [newJob, setNewJob] = useState({ title: '', description: '', tags: '', milestones: [{ title: '', amount: '', duration_days: '7' }] });
    const [coverLetter, setCoverLetter] = useState('');
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if ((location.state as any)?.tab) setActiveTab((location.state as any).tab);
        if ((location.state as any)?.autoOpenReview && jobs.length > 0) {
            const jobToReview = jobs.find(j => j.id === (location.state as any).autoOpenReview);
            if (jobToReview) { openReviewModal(jobToReview); window.history.replaceState({}, document.title); }
        }
    }, [location.state, jobs]);

    const fetchData = async () => {
        setIsLoading(true);
        const { data: jobsData, error: jobsErr } = await supabase.from('jobs').select('*').order('created_at', { ascending: false });
        if (jobsErr) console.error("Jobs fetch error:", jobsErr);
        if (jobsData) setJobs(jobsData);

        if (walletAddress) {
            const lowerWallet = walletAddress.toLowerCase();
            const { data: userData, error: userErr } = await supabase.from('users').select('role').eq('wallet_address', lowerWallet).single();

            if (userData) {
                setUserRole(userData.role);
                if (userData.role === 'employer' && !(location.state as any)?.tab) {
                    setActiveTab('my-jobs');
                }
            }
            if (userErr) console.error("User role fetch error:", userErr);

            const { data: appsData, error: appsErr } = await supabase.from('applications').select('*, jobs(*)').eq('freelancer_address', lowerWallet);
            if (appsData) setMyApplications(appsData);
            if (appsErr) console.error("Applications fetch error:", appsErr);
        }
        setIsLoading(false);
    };

    useEffect(() => { fetchData(); }, [walletAddress]);

    const handlePostJob = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!walletAddress) return alert("Connect wallet first!");
        setIsProcessing(true);
        try {
            const tagsArray = newJob.tags.split(',').map(t => t.trim()).filter(t => t);
            const totalBudget = newJob.milestones.reduce((sum, ms) => sum + Number(ms.amount || 0), 0);

            const { error } = await supabase.from('jobs').insert([{
                employer_address: walletAddress.toLowerCase(), title: newJob.title, description: newJob.description,
                budget: `${totalBudget} PAS`, tags: tagsArray, milestones_json: newJob.milestones
            }]);

            if (error) throw new Error("DB Error (Post Job): " + error.message);

            setIsPostModalOpen(false);
            setNewJob({ title: '', description: '', tags: '', milestones: [{ title: '', amount: '', duration_days: '7' }] });
            fetchData();
        } catch (err: any) {
            console.error(err);
            alert(err.message);
        } finally { setIsProcessing(false); }
    };

    const handleApply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!walletAddress || !selectedJob) return;
        setIsProcessing(true);
        try {
            let resumeUrl = null;
            if (resumeFile) {
                const filePath = `resumes/${Date.now()}_${resumeFile.name}`;
                const { error: uploadError } = await supabase.storage.from('project-files').upload(filePath, resumeFile);
                if (uploadError) throw new Error("Upload Error: " + uploadError.message);
                resumeUrl = supabase.storage.from('project-files').getPublicUrl(filePath).data.publicUrl;
            }

            const { error: appError } = await supabase.from('applications').insert([{ job_id: selectedJob.id, freelancer_address: walletAddress.toLowerCase(), cover_letter: coverLetter, resume_url: resumeUrl, status: 'pending' }]);
            if (appError) throw new Error("DB Error (Apply): " + appError.message);

            const { error: notifError } = await supabase.from('notifications').insert([{ room_id: `job_${selectedJob.id}`, wallet_address: selectedJob.employer_address.toLowerCase(), content: `New Application: A freelancer applied to "${selectedJob.title}".` }]);
            if (notifError) console.error("Notification failed:", notifError.message);

            setIsApplyModalOpen(false); setCoverLetter(''); setResumeFile(null);
            fetchData(); alert("Application submitted!");
        } catch (err: any) {
            console.error(err);
            alert(err.message);
        } finally { setIsProcessing(false); }
    };

    const openReviewModal = async (job: Job) => {
        setSelectedJob(job);
        setIsReviewModalOpen(true);
        const { data, error } = await supabase.from('applications').select('*').eq('job_id', job.id);
        if (error) alert("Error loading applicants: " + error.message);
        if (data) setJobApplicants(data);
    };

    const handleScheduleInterview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedApplicant || !interviewDate || !interviewTime) return;
        setIsProcessing(true);
        try {
            const meetingLink = `https://zoom.us/j/${Math.floor(100000000 + Math.random() * 900000000)}?pwd=localtestmock`;
            const formattedDateTime = `${interviewDate} at ${interviewTime}`;

            const { error } = await supabase.from('applications').update({ status: 'interviewing', meeting_date: formattedDateTime, meeting_link: meetingLink }).eq('id', selectedApplicant.id);
            if (error) throw new Error("DB Error (Schedule): " + error.message);

            await supabase.from('notifications').insert([{
                room_id: `job_${selectedJob?.id}`, wallet_address: selectedApplicant.freelancer_address.toLowerCase(),
                content: `Interview Scheduled! The employer wants to meet on ${formattedDateTime}. Check your My Applications tab for the link.`
            }]);

            const { data } = await supabase.from('applications').select('*').eq('job_id', selectedJob?.id);
            if (data) setJobApplicants(data);

            setIsInterviewModalOpen(false); setInterviewDate(''); setInterviewTime('');
            alert("Interview scheduled successfully!");
        } catch (err: any) {
            console.error(err);
            alert(err.message);
        } finally { setIsProcessing(false); }
    };

    const handleAcceptApplicant = async (appId: string, freelancerAddr: string, jobToAccept: Job) => {
        setIsProcessing(true);
        try {
            if (!window.ethereum) throw new Error("Wallet not connected.");
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            const checksummedFreelancer = ethers.getAddress(freelancerAddr);

            const milestoneAmountsInWei = jobToAccept.milestones_json!.map((m: any) => ethers.parseEther(m.amount?.toString() || "0"));
            const durationDaysArray = jobToAccept.milestones_json!.map((m: any) => parseInt(m.duration_days?.toString() || "7"));
            const totalWei = milestoneAmountsInWei.reduce((a: any, b: any) => a + b, 0n);

            if (totalWei === 0n) throw new Error("Cannot deploy a contract with 0 budget.");

            const factory = new ethers.ContractFactory(ESCROW_ABI, ESCROW_BYTECODE, signer);

            const contract = await factory.deploy(checksummedFreelancer, milestoneAmountsInWei, durationDaysArray, { value: totalWei, gasLimit: 3000000 });
            await contract.waitForDeployment();
            const contractAddress = await contract.getAddress();

            const { error: jobErr } = await supabase.from('jobs').update({ status: 'in-progress', contract_address: contractAddress }).eq('id', jobToAccept.id);
            if (jobErr) throw new Error("DB Error (Job Update): " + jobErr.message);

            const { error: appErr } = await supabase.from('applications').update({ status: 'pending_stake' }).eq('id', appId);
            if (appErr) throw new Error("DB Error (App Update): " + appErr.message);

            const { error: notifErr } = await supabase.from('notifications').insert([{
                room_id: `job_${jobToAccept.id}`,
                wallet_address: freelancerAddr.toLowerCase(),
                content: `You are Hired! The employer has funded the Escrow. Please go to your Applications tab to stake your 5% and unlock the workspace.`
            }]);

            if (notifErr) alert(`WARNING: Contract succeeded, but Notification failed to send: ${notifErr.message}`);

            setIsReviewModalOpen(false);
            fetchData();
            navigate('/chat');
        } catch (err: any) {
            console.error(err);
            alert(`Failed to hire: ${err.reason || err.message}`);
        } finally { setIsProcessing(false); }
    };

    const handleFreelancerStake = async (app: Application) => {
        setIsProcessing(true);
        try {
            if (!window.ethereum) throw new Error("Wallet not connected.");
            if (!app.jobs?.contract_address) throw new Error("Escrow contract not found.");

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const checksummedContractAddr = ethers.getAddress(app.jobs.contract_address);
            const contract = new ethers.Contract(checksummedContractAddr, ESCROW_ABI, signer);

            const stakeAmount = await contract.freelancerStake();
            const tx = await contract.stakeFreelancer({ value: stakeAmount, gasLimit: 300000 });
            await tx.wait();

            const roomId = [app.jobs.employer_address.toLowerCase(), walletAddress!.toLowerCase()].sort().join('_');

            if (app.jobs?.milestones_json && app.jobs.milestones_json.length > 0) {
                const msToInsert = app.jobs.milestones_json.map((m: any) => {
                    const days = parseInt(m.duration_days) || 7;
                    const dueDate = new Date(Date.now() + days * 86400000).toISOString();
                    return { project_id: roomId, title: m.title, amount: m.amount, duration_days: m.duration_days, status: 'pending', due_date: dueDate };
                });
                await supabase.from('project_milestones').insert(msToInsert);
            }

            await supabase.from('applications').update({ status: 'accepted' }).eq('id', app.id);

            const { error: msgErr } = await supabase.from('messages').insert([{
                content: `[System] Contract Finalized! Contract Address: ${app.jobs.contract_address}`,
                sender_address: app.jobs.employer_address.toLowerCase(),
                receiver_address: walletAddress!.toLowerCase()
            }]);

            if (msgErr) throw new Error("Chat Initialization Failed: " + msgErr.message);

            await supabase.from('notifications').insert([{
                room_id: roomId,
                wallet_address: app.jobs.employer_address.toLowerCase(),
                content: `The freelancer has staked their 5%. The workspace is now active!`
            }]);

            navigate('/chat');
        } catch (err: any) {
            console.error(err);
            alert(`Action failed: ${err.message}`);
        } finally { setIsProcessing(false); }
    };

    const displayJobs = activeTab === 'browse'
        ? jobs.filter(j => j.status === 'open' && j.employer_address.toLowerCase() !== walletAddress?.toLowerCase())
        : jobs.filter(j => j.employer_address.toLowerCase() === walletAddress?.toLowerCase());

    return (
        <div className="p-4 md:p-6 space-y-8 relative">
            <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight">Marketplace</h1>
                    <p className="text-zinc-500 font-medium">Discover projects or find the perfect freelancer.</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <div className="flex bg-zinc-100 p-1 rounded-2xl">
                        {userRole === 'freelancer' && <button onClick={() => setActiveTab('browse')} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'browse' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500'}`}>Browse</button>}
                        {userRole === 'employer' && <button onClick={() => setActiveTab('my-jobs')} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'my-jobs' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500'}`}>My Posted Jobs</button>}
                        {userRole === 'freelancer' && <button onClick={() => setActiveTab('my-apps')} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'my-apps' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500'}`}>My Applications</button>}
                    </div>
                    {userRole === 'employer' && (
                        <button onClick={() => setIsPostModalOpen(true)} className="bg-brand-600 text-white px-6 py-2.5 rounded-2xl font-black shadow-xl shadow-brand-600/20 hover:bg-brand-700 transition-all flex items-center gap-2">
                            <Plus size={18} /> Post Job
                        </button>
                    )}
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-600" size={40} /></div>
            ) : activeTab === 'my-apps' && userRole === 'freelancer' ? (
                <div className="space-y-4">
                    {myApplications.length === 0 ? (
                        <div className="text-center py-10 text-zinc-500 font-medium border-2 border-dashed border-zinc-200 rounded-3xl">You have not applied to any jobs yet.</div>
                    ) : (
                        myApplications.map(app => (
                            <div key={app.id} className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <h3 className="font-black text-lg">{app.jobs?.title}</h3>
                                    <p className="text-sm text-zinc-500">Applied on: {new Date(app.created_at).toLocaleDateString()}</p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase ${app.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' : app.status === 'pending_stake' ? 'bg-amber-100 text-amber-700' : app.status === 'interviewing' ? 'bg-blue-100 text-blue-700' : 'bg-zinc-100 text-zinc-500'}`}>
                                        {app.status === 'pending_stake' ? 'Hired - Stake Required' : app.status}
                                    </span>

                                    {app.status === 'interviewing' && app.meeting_date && (
                                        <div className="flex flex-col items-end">
                                            <p className="text-[10px] font-bold text-zinc-500 mb-1 flex items-center gap-1"><Calendar size={12}/> {app.meeting_date}</p>
                                            <a href={app.meeting_link} target="_blank" rel="noopener noreferrer" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-black flex items-center gap-2 hover:bg-blue-700"><Video size={14}/> Join Interview</a>
                                        </div>
                                    )}

                                    {app.status === 'pending_stake' && (
                                        <button onClick={() => handleFreelancerStake(app)} disabled={isProcessing} className="p-3 bg-amber-500 text-white font-black rounded-xl hover:bg-amber-600 transition-all text-xs flex items-center gap-2 shadow-md">
                                            {isProcessing ? <Loader2 className="animate-spin" size={16}/> : <Coins size={16} />} Stake 5% to Begin
                                        </button>
                                    )}

                                    {app.status === 'accepted' && (
                                        <button onClick={() => navigate('/chat')} className="p-3 bg-brand-50 text-brand-600 rounded-xl hover:bg-brand-600 hover:text-white transition-all"><MessageSquare size={18} /></button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                    {displayJobs.length === 0 ? (
                        <div className="col-span-full text-center py-10 text-zinc-500 font-medium border-2 border-dashed border-zinc-200 rounded-3xl">No jobs found.</div>
                    ) : (
                        displayJobs.map((job, i) => (
                            <motion.div key={job.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group relative overflow-hidden flex flex-col">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
                                <div className="flex justify-between items-start mb-6 relative z-10">
                                    <div className="w-14 h-14 bg-zinc-50 rounded-2xl flex items-center justify-center group-hover:bg-brand-100 transition-colors"><Briefcase className="text-zinc-400 group-hover:text-brand-600" size={28} /></div>
                                    <span className="text-[10px] font-black text-brand-600 bg-brand-50 px-3 py-1.5 rounded-full uppercase tracking-widest">{job.status}</span>
                                </div>
                                <h3 className="font-black text-zinc-900 text-xl group-hover:text-brand-600 transition-colors mb-3 leading-tight">{job.title}</h3>
                                <p className="text-zinc-500 text-sm font-medium line-clamp-2 mb-6 flex-1">{job.description}</p>
                                <div className="flex flex-wrap gap-2 mb-8 relative z-10">
                                    {job.tags.map(tag => (<span key={tag} className="text-[10px] font-black uppercase tracking-wider text-zinc-500 bg-zinc-50 px-3 py-1 rounded-lg">{tag}</span>))}
                                </div>
                                <div className="pt-6 border-t border-zinc-50 flex justify-between items-center relative z-10">
                                    <div><p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-1">Budget</p><p className="text-zinc-900 font-black text-lg">{job.budget}</p></div>

                                    {activeTab === 'browse' ? (
                                        job.employer_address.toLowerCase() === walletAddress?.toLowerCase() ? (
                                            <button disabled className="bg-zinc-100 text-zinc-400 px-4 py-2 rounded-xl font-black text-xs cursor-not-allowed border border-zinc-200">Your Post</button>
                                        ) : userRole === 'employer' ? null : myApplications.some(app => app.job_id === job.id) ? (
                                            <button disabled className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl font-black text-xs cursor-not-allowed flex items-center gap-1 border border-emerald-100">
                                                <CheckCircle2 size={14}/> Applied
                                            </button>
                                        ) : (
                                            <button onClick={() => { setSelectedJob(job); setIsApplyModalOpen(true); }} className="bg-brand-50 text-brand-600 px-4 py-2 rounded-xl font-black text-xs hover:bg-brand-600 hover:text-white transition-all">Apply Now</button>
                                        )
                                    ) : (
                                        <button onClick={() => openReviewModal(job)} className="bg-zinc-900 text-white px-4 py-2 rounded-xl font-black text-xs hover:bg-zinc-800 transition-all">View Applicants</button>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            )}

            {isInterviewModalOpen && selectedApplicant && (
                <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl">
                        <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-black">Schedule Interview</h3><button onClick={() => setIsInterviewModalOpen(false)}><X size={20} /></button></div>
                        <p className="text-sm text-zinc-500 mb-6">Set a date and time to meet the freelancer before finalizing the contract.</p>
                        <form onSubmit={handleScheduleInterview} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-zinc-900 mb-2 block">Date</label>
                                <input type="date" value={interviewDate} onChange={e => setInterviewDate(e.target.value)} className="w-full p-4 border rounded-xl" required />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-zinc-900 mb-2 block">Time</label>
                                <input type="time" value={interviewTime} onChange={e => setInterviewTime(e.target.value)} className="w-full p-4 border rounded-xl" required />
                            </div>
                            <button type="submit" disabled={isProcessing} className="w-full py-4 bg-blue-600 text-white rounded-xl font-black uppercase mt-4 flex justify-center gap-2 items-center">
                                {isProcessing ? <Loader2 className="animate-spin" /> : <><Video size={18}/> Generate Meeting Link</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {isPostModalOpen && (
                <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl">
                        <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-black">Post a New Job</h3><button onClick={() => setIsPostModalOpen(false)}><X size={20} /></button></div>
                        <form onSubmit={handlePostJob} className="space-y-4">
                            <input type="text" value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} placeholder="Job Title" className="w-full p-4 border rounded-xl" required />
                            <textarea value={newJob.description} onChange={e => setNewJob({...newJob, description: e.target.value})} placeholder="Detailed Description..." className="w-full h-32 p-4 border rounded-xl resize-none" required />
                            <input type="text" value={newJob.tags} onChange={e => setNewJob({...newJob, tags: e.target.value})} placeholder="Tags (comma separated)" className="w-full p-4 border rounded-xl" required />

                            <div className="border-t border-zinc-100 pt-6 mt-6">
                                <div className="flex justify-between items-center mb-4">
                                    <div><h4 className="font-black text-sm text-zinc-900">Project Milestones</h4><p className="text-[10px] text-zinc-500">Break your project down into paid deliverables.</p></div>
                                    <button type="button" onClick={() => setNewJob({...newJob, milestones: [...newJob.milestones, {title: '', amount: '', duration_days: '7'}]})} className="text-xs font-bold text-brand-600 flex items-center gap-1 hover:text-brand-700 bg-brand-50 px-3 py-1.5 rounded-lg"><Plus size={14} /> Add Milestone</button>
                                </div>
                                <div className="space-y-3">
                                    {newJob.milestones.map((ms, index) => (
                                        <div key={index} className="flex gap-2 items-center bg-zinc-50 p-2 rounded-xl border border-zinc-100">
                                            <span className="text-xs font-black text-zinc-400 pl-2">{index + 1}.</span>
                                            <input type="text" value={ms.title} onChange={e => { const u = [...newJob.milestones]; u[index].title = e.target.value; setNewJob({...newJob, milestones: u}); }} placeholder="e.g. UI Wireframes" className="flex-1 p-3 border rounded-lg text-sm bg-white" required />
                                            <input type="number" step="0.01" value={ms.amount} onChange={e => { const u = [...newJob.milestones]; u[index].amount = e.target.value; setNewJob({...newJob, milestones: u}); }} placeholder="PAS Amount" className="w-24 p-3 border rounded-lg text-sm bg-white" required />
                                            <input type="number" value={ms.duration_days} onChange={e => { const u = [...newJob.milestones]; u[index].duration_days = e.target.value; setNewJob({...newJob, milestones: u}); }} placeholder="Days" className="w-20 p-3 border rounded-lg text-sm bg-white" required />
                                            {index > 0 && <button type="button" onClick={() => { const u = [...newJob.milestones]; u.splice(index, 1); setNewJob({...newJob, milestones: u}); }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <button type="submit" disabled={isProcessing} className="w-full py-4 bg-brand-600 text-white rounded-xl font-black uppercase mt-4 shadow-xl">
                                {isProcessing ? <Loader2 className="animate-spin mx-auto" /> : `Publish Job for ${newJob.milestones.reduce((sum, ms) => sum + Number(ms.amount || 0), 0)} PAS`}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {isReviewModalOpen && selectedJob && (
                <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
                        <div className="p-6 border-b flex justify-between items-center shrink-0"><h3 className="text-xl font-black">Applicants</h3><button onClick={() => setIsReviewModalOpen(false)}><X size={20} /></button></div>
                        <div className="p-6 overflow-y-auto space-y-4 flex-1">
                            {jobApplicants.length === 0 ? <p className="text-center text-zinc-400 py-10 border-2 border-dashed border-zinc-200 rounded-3xl">No applicants yet.</p> : jobApplicants.map(app => (
                                <div key={app.id} className="border border-zinc-200 rounded-2xl p-5">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex gap-3 items-center">
                                            <UserCircle size={32} className="text-zinc-400" />
                                            <div><p className="text-xs font-mono font-bold text-zinc-900">{app.freelancer_address}</p><p className="text-[10px] text-zinc-500">Applied {new Date(app.created_at).toLocaleDateString()}</p></div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {app.status === 'pending' && (
                                                <button onClick={() => { setSelectedApplicant(app); setIsInterviewModalOpen(true); }} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase hover:bg-blue-100 transition-all flex items-center gap-1"><Video size={14}/> Interview</button>
                                            )}
                                            {app.status === 'interviewing' && (
                                                <button
                                                    onClick={() => handleAcceptApplicant(app.id, app.freelancer_address, selectedJob)}
                                                    disabled={isProcessing}
                                                    className="px-4 py-2 bg-brand-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-brand-700 transition-all shadow-md flex items-center gap-2"
                                                >
                                                    {isProcessing ? (
                                                        <><Loader2 size={14} className="animate-spin" /> Deploying Contract...</>
                                                    ) : (
                                                        "Accept & Hire"
                                                    )}
                                                </button>
                                            )}
                                            {app.status === 'pending_stake' && (
                                                <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-black uppercase rounded-full flex items-center gap-1"><Loader2 size={12} className="animate-spin"/> Waiting on Stake</span>
                                            )}
                                            {app.status === 'accepted' && (
                                                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase rounded-full flex items-center gap-1"><CheckCircle2 size={12}/> Hired</span>
                                            )}
                                        </div>
                                    </div>

                                    {app.status === 'interviewing' && app.meeting_date && (
                                        <div className="mb-4 bg-blue-50 border border-blue-100 p-3 rounded-xl flex justify-between items-center">
                                            <div className="flex items-center gap-2 text-blue-800 text-xs font-bold"><Calendar size={14}/> {app.meeting_date}</div>
                                            <a href={app.meeting_link} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase bg-white px-3 py-1.5 rounded-lg text-blue-600 border border-blue-200 hover:bg-blue-600 hover:text-white transition-all">Start Call</a>
                                        </div>
                                    )}

                                    <div className="bg-zinc-50 p-4 rounded-xl text-sm text-zinc-700 whitespace-pre-wrap">
                                        {app.cover_letter}
                                        {app.resume_url && (
                                            <a href={app.resume_url} target="_blank" rel="noopener noreferrer" className="mt-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand-600 bg-brand-50 px-4 py-2 rounded-lg w-fit hover:bg-brand-100 transition-all border border-brand-100"><FileText size={16} /> View Resume</a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {isApplyModalOpen && selectedJob && (
                <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] w-full max-w-lg p-8 shadow-2xl">
                        <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-black">Apply to Job</h3><button onClick={() => setIsApplyModalOpen(false)}><X size={20} /></button></div>
                        <div className="p-4 bg-zinc-50 rounded-xl mb-6"><p className="font-bold text-sm">{selectedJob.title}</p><p className="text-xs text-zinc-500 mt-1">Budget: {selectedJob.budget}</p></div>
                        <form onSubmit={handleApply} className="space-y-4">
                            <textarea value={coverLetter} onChange={e => setCoverLetter(e.target.value)} placeholder="Write your proposal here. Why are you the best fit?" className="w-full h-40 p-4 border rounded-xl resize-none outline-none focus:border-brand-500" required />
                            <div className="p-4 border-2 border-dashed border-zinc-200 rounded-xl flex flex-col items-center gap-2">
                                <UploadCloud className="text-zinc-400" />
                                <p className="text-xs font-bold text-zinc-500">Upload Resume / Portfolio (Optional)</p>
                                <input type="file" onChange={e => setResumeFile(e.target.files?.[0] || null)} className="text-xs w-full ml-10" accept=".pdf,.doc,.docx,.png,.jpg" />
                            </div>
                            <button type="submit" disabled={isProcessing} className="w-full py-4 bg-zinc-900 text-white rounded-xl font-black uppercase">{isProcessing ? <Loader2 className="animate-spin mx-auto" /> : "Submit Application"}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};