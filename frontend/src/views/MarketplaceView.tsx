import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Briefcase, CheckCircle2, X, Loader2, UserCircle, MessageSquare, FileText, UploadCloud, Trash2, Calendar, Video, Coins, AlertCircle, Pencil } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useWallet } from '../lib/WalletContext';
import { ethers } from 'ethers';
import { ESCROW_ABI, ESCROW_BYTECODE } from '../lib/escrowContract';

const ADMIN_WALLETS = [
    "0xbeE339Aa5d7af6758164F5739a2c98EB6f16a3AB",
    "0x832d9D4D866A33205e5FE43aF9C15608431759C0",
    "0x342f52294501135f2148840366271f59598739EA"
];

interface Job { id: string; employer_address: string; title: string; description: string; budget: string; tags: string[]; status: string; created_at: string; milestones_json?: any[]; contract_address?: string; experience_level?: string; project_type?: string; deadline?: string; }
interface Application { id: string; job_id: string; freelancer_address: string; cover_letter: string; resume_url?: string; status: string; created_at: string; meeting_date?: string; meeting_link?: string; hired_at?: string; jobs?: Job; }
interface EmployerProfile { full_name?: string; avatar_url?: string; title?: string; }

export const MarketplaceView: React.FC = () => {
    const { walletAddress } = useWallet();
    const location = useLocation();
    const navigate = useNavigate();

    const [userRole, setUserRole] = useState<'freelancer' | 'employer' | null>(null);
    const [activeTab, setActiveTab] = useState<'browse' | 'my-jobs' | 'my-apps'>((location.state as any)?.tab || 'browse');

    const [jobs, setJobs] = useState<Job[]>([]);
    const [myApplications, setMyApplications] = useState<Application[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [employerProfiles, setEmployerProfiles] = useState<Record<string, EmployerProfile>>({});

    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
    const [editJob, setEditJob] = useState({ id: '', title: '', description: '', tags: '', experience_level: 'Mid', project_type: 'One-time', deadline: '', milestones: [{ title: '', requirement: '', amount: '', duration_days: '7' }] });
    const [isWithdrawConfirmOpen, setIsWithdrawConfirmOpen] = useState(false);
    const [appToWithdraw, setAppToWithdraw] = useState<Application | null>(null);

    const [interviewDate, setInterviewDate] = useState('');
    const [interviewTime, setInterviewTime] = useState('');
    const [selectedApplicant, setSelectedApplicant] = useState<Application | null>(null);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [jobApplicants, setJobApplicants] = useState<Application[]>([]);
    const [viewingEmployer, setViewingEmployer] = useState<string | null>(null);

    const [newJob, setNewJob] = useState({ title: '', description: '', tags: '', experience_level: 'Mid', project_type: 'One-time', deadline: '', milestones: [{ title: '', requirement: '', amount: '', duration_days: '7' }] });
    const [coverLetter, setCoverLetter] = useState('');
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

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
        if (jobsData) {
            setJobs(jobsData);
            // Fetch all unique employer profiles for display on job cards
            const uniqueAddresses = Array.from(new Set(jobsData.map((j: Job) => j.employer_address.toLowerCase())));
            if (uniqueAddresses.length > 0) {
                const { data: profilesData } = await supabase
                    .from('users')
                    .select('wallet_address, full_name, avatar_url, title')
                    .in('wallet_address', uniqueAddresses);
                if (profilesData) {
                    const profileMap: Record<string, EmployerProfile> = {};
                    profilesData.forEach((p: any) => { profileMap[p.wallet_address.toLowerCase()] = p; });
                    setEmployerProfiles(profileMap);
                }
            }
        }

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
                budget: `${totalBudget} PAS`, tags: tagsArray, milestones_json: newJob.milestones,
                experience_level: newJob.experience_level, project_type: newJob.project_type,
                deadline: newJob.deadline || null,
            }]);

            if (error) throw new Error("DB Error (Post Job): " + error.message);

            setIsPostModalOpen(false);
            setNewJob({ title: '', description: '', tags: '', experience_level: 'Mid', project_type: 'One-time', deadline: '', milestones: [{ title: '', requirement: '', amount: '', duration_days: '7' }] });
            fetchData();
        } catch (err: any) {
            console.error(err);
            alert(err.message);
        } finally { setIsProcessing(false); }
    };

    const handleEditJob = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        try {
            const tagsArray = editJob.tags.split(',').map(t => t.trim()).filter(t => t);
            const totalBudget = editJob.milestones.reduce((sum, ms) => sum + Number(ms.amount || 0), 0);

            const { error } = await supabase.from('jobs').update({
                title: editJob.title,
                description: editJob.description,
                budget: `${totalBudget} PAS`,
                tags: tagsArray,
                milestones_json: editJob.milestones,
                experience_level: editJob.experience_level,
                project_type: editJob.project_type,
                deadline: editJob.deadline || null,
            }).eq('id', editJob.id);

            if (error) throw new Error('DB Error (Edit Job): ' + error.message);
            setIsEditModalOpen(false);
            fetchData();
        } catch (err: any) {
            console.error(err);
            alert(err.message);
        } finally { setIsProcessing(false); }
    };

    const openEditModal = (job: Job) => {
        setEditJob({
            id: job.id,
            title: job.title,
            description: job.description,
            tags: (job.tags || []).join(', '),
            experience_level: job.experience_level || 'Mid',
            project_type: job.project_type || 'One-time',
            deadline: job.deadline ? job.deadline.split('T')[0] : '',
            milestones: job.milestones_json && job.milestones_json.length > 0
                ? job.milestones_json.map((m: any) => ({ title: m.title || '', requirement: m.requirement || '', amount: m.amount?.toString() || '', duration_days: m.duration_days?.toString() || '7' }))
                : [{ title: '', requirement: '', amount: '', duration_days: '7' }],
        });
        setIsEditModalOpen(true);
    };

    const handleDeleteJob = async () => {
        if (!jobToDelete) return;
        setIsProcessing(true);
        try {
            const { error } = await supabase.from('jobs').delete().eq('id', jobToDelete.id);
            if (error) throw new Error('DB Error (Delete Job): ' + error.message);
            setIsDeleteConfirmOpen(false);
            setJobToDelete(null);
            fetchData();
        } catch (err: any) {
            console.error(err);
            alert(err.message);
        } finally { setIsProcessing(false); }
    };

    const handleWithdrawApplication = async () => {
        if (!appToWithdraw) return;
        setIsProcessing(true);
        try {
            const { error } = await supabase.from('applications').delete().eq('id', appToWithdraw.id);
            if (error) throw new Error('DB Error (Withdraw): ' + error.message);
            setIsWithdrawConfirmOpen(false);
            setAppToWithdraw(null);
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
            const { data: checkJob } = await supabase.from('jobs').select('status').eq('id', selectedJob.id).single();
            if (checkJob?.status !== 'open') {
                alert("Sorry, this project is no longer open for applications.");
                setIsApplyModalOpen(false);
                fetchData();
                return;
            }

            const isAlreadyWorking = myApplications.some(app =>
                app.jobs?.employer_address?.toLowerCase() === selectedJob.employer_address.toLowerCase() &&
                (app.status === 'accepted' || app.status === 'pending_stake')
            );

            if (isAlreadyWorking) {
                alert("You cannot apply to this job because you are already working on an active project for this employer.");
                setIsApplyModalOpen(false);
                return;
            }

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
            const response = await fetch('http://localhost:3001/api/create-meeting', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(`${errData.error}: ${errData.details || 'Unknown reason'}`);
            }

            const data = await response.json();
            const meetingLink = data.join_url;
            const formattedDateTime = `${interviewDate} at ${interviewTime}`;

            const { error } = await supabase.from('applications').update({ status: 'interviewing', meeting_date: formattedDateTime, meeting_link: meetingLink }).eq('id', selectedApplicant.id);
            if (error) throw new Error("DB Error (Schedule): " + error.message);

            await supabase.from('notifications').insert([{
                room_id: `job_${selectedJob?.id}`, wallet_address: selectedApplicant.freelancer_address.toLowerCase(),
                content: `Interview Scheduled! The employer wants to meet on ${formattedDateTime}. Check your My Applications tab for the link.`
            }]);

            const { data: updatedApplicants } = await supabase.from('applications').select('*').eq('job_id', selectedJob?.id);
            if (updatedApplicants) setJobApplicants(updatedApplicants);

            setIsInterviewModalOpen(false);
            setInterviewDate('');
            setInterviewTime('');

            setIsReviewModalOpen(true);
            alert("Interview scheduled successfully!");
        } catch (err: any) {
            console.error(err);
            alert(err.message);
        } finally { setIsProcessing(false); }
    };

    const handleAcceptApplicant = async (appId: string, freelancerAddr: string, jobToAccept: Job) => {
        setIsProcessing(true);
        try {
            const { data: checkJob } = await supabase.from('jobs').select('status').eq('id', jobToAccept.id).single();
            if (checkJob?.status !== 'open') {
                alert("This project is already in progress or cancelled.");
                setIsReviewModalOpen(false);
                fetchData();
                return;
            }

            if (!window.ethereum) throw new Error("Wallet not connected.");
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            const checksummedFreelancer = ethers.getAddress(freelancerAddr);
            const checksummedAdmins = ADMIN_WALLETS.map(addr => ethers.getAddress(addr));

            const milestoneAmountsInWei = jobToAccept.milestones_json!.map((m: any) => ethers.parseEther(m.amount?.toString() || "0"));
            const durationDaysArray = jobToAccept.milestones_json!.map((m: any) => parseInt(m.duration_days?.toString() || "7"));
            const totalWei = milestoneAmountsInWei.reduce((a: any, b: any) => a + b, 0n);

            if (totalWei === 0n) throw new Error("Cannot deploy a contract with 0 budget.");

            const factory = new ethers.ContractFactory(ESCROW_ABI, ESCROW_BYTECODE, signer);

            const contract = await factory.deploy(
                checksummedFreelancer,
                checksummedAdmins,
                milestoneAmountsInWei,
                durationDaysArray,
                { value: totalWei, gasLimit: 3000000 }
            );

            await contract.waitForDeployment();
            const contractAddress = await contract.getAddress();

            const deployTx = contract.deploymentTransaction();
            if (deployTx) {
                const receipt = await deployTx.wait(1);
                if (!receipt || receipt.status === 0) {
                    throw new Error("Transaction reverted or dropped by the network.");
                }
            } else {
                throw new Error("Failed to retrieve deployment transaction.");
            }

            const { error: jobErr } = await supabase.from('jobs').update({ status: 'in-progress', contract_address: contractAddress }).eq('id', jobToAccept.id);
            if (jobErr) throw new Error("DB Error (Job Update): " + jobErr.message);

            const { error: appErr } = await supabase.from('applications').update({ status: 'pending_stake', hired_at: new Date().toISOString() }).eq('id', appId);
            if (appErr) throw new Error("DB Error (App Update): " + appErr.message);

            const { error: notifErr } = await supabase.from('notifications').insert([{
                room_id: `job_${jobToAccept.id}`,
                wallet_address: freelancerAddr.toLowerCase(),
                content: `You are Hired! The employer has funded the Escrow. Please go to your Applications tab to stake your 5% and unlock the workspace.`
            }]);

            if (notifErr) alert(`WARNING: Contract succeeded, but Notification failed to send: ${notifErr.message}`);

            setIsReviewModalOpen(false);
            fetchData();
        } catch (error: any) {
            console.error("Full Error:", error);
            if (error.code === 'CALL_EXCEPTION') {
                alert(`Contract Reverted! Reason: ${error.reason || 'Transaction structurally invalid.'}`);
            } else if (error.code === 'ACTION_REJECTED') {
                alert("You rejected the transaction in MetaMask.");
            } else {
                alert(`Failed to hire: ${error.reason || error.message}`);
            }
        } finally { setIsProcessing(false); }
    };

    const handleClaimRefund = async (app: Application, job: Job) => {
        setIsProcessing(true);
        try {
            if (!window.ethereum) throw new Error("Wallet not connected.");
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(job.contract_address!, ESCROW_ABI, signer);

            const tx = await contract.claimRefund();
            await tx.wait(1);

            await supabase.from('jobs').update({ status: 'cancelled' }).eq('id', job.id);
            await supabase.from('applications').update({ status: 'cancelled' }).eq('id', app.id);

            await supabase.from('messages').insert([{
                content: `[System] Contract Cancelled`,
                sender_address: job.employer_address.toLowerCase(),
                receiver_address: app.freelancer_address.toLowerCase(),
                room_id: job.id
            }]);

            alert("Refund successful. Project has been cancelled due to the freelancer missing the staking window.");
            setIsReviewModalOpen(false);
            fetchData();
        } catch (error: any) {
            console.error("Full Error:", error);
            if (error.code === 'CALL_EXCEPTION') {
                alert(`Refund Reverted! The contract likely does not allow a refund yet, or you are using the wrong wallet.`);
            } else {
                alert(`Refund failed: ${error.reason || error.message}`);
            }
        } finally {
            setIsProcessing(false);
        }
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
            await tx.wait(1);

            const roomId = app.job_id;

            if (app.jobs?.milestones_json && app.jobs.milestones_json.length > 0) {
                const msToInsert = app.jobs.milestones_json.map((m: any) => {
                    const days = parseInt(m.duration_days) || 7;
                    const dueDate = new Date(Date.now() + days * 86400000).toISOString();
                    const titleWithReq = m.requirement ? `${m.title} - Req: ${m.requirement}` : m.title;
                    return { project_id: roomId, title: titleWithReq, amount: m.amount, duration_days: m.duration_days, status: 'pending', due_date: dueDate };
                });
                await supabase.from('project_milestones').insert(msToInsert);
            }

            await supabase.from('applications').update({ status: 'accepted' }).eq('id', app.id);

            const { error: msgErr } = await supabase.from('messages').insert([{
                content: `[System] Contract Finalized! Contract Address: ${app.jobs.contract_address}`,
                sender_address: app.jobs.employer_address.toLowerCase(),
                receiver_address: walletAddress!.toLowerCase(),
                room_id: roomId
            }]);

            if (msgErr) throw new Error("Chat Initialization Failed: " + msgErr.message);

            await supabase.from('notifications').insert([{
                room_id: roomId,
                wallet_address: app.jobs.employer_address.toLowerCase(),
                content: `The freelancer has staked their 5%. The workspace is now active!`
            }]);

            navigate('/chat');
        } catch (error: any) {
            console.error("Full Error:", error);
            if (error.code === 'CALL_EXCEPTION') {
                alert(`Stake Reverted! Make sure you are using the exact wallet address you used to apply, and that you have enough funds.`);
            } else if (error.code === 'ACTION_REJECTED') {
                alert("You rejected the transaction in MetaMask.");
            } else {
                alert(`Stake failed: ${error.message}`);
            }
        } finally { setIsProcessing(false); }
    };

    const displayJobs = activeTab === 'browse'
        ? jobs.filter(j => j.status === 'open' && j.employer_address.toLowerCase() !== walletAddress?.toLowerCase())
        : jobs.filter(j =>
            j.employer_address.toLowerCase() === walletAddress?.toLowerCase() &&
            j.status !== 'completed' &&
            j.status !== 'cancelled'
        );

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
                        myApplications.map(app => {
                            let isExpired = false;
                            let countdown = '';
                            if (app.status === 'pending_stake' && app.hired_at) {
                                const deadline = new Date(app.hired_at).getTime() + 24 * 60 * 60 * 1000;
                                isExpired = now > deadline;
                                if (!isExpired) {
                                    const diff = Math.max(0, deadline - now);
                                    const hours = Math.floor(diff / (1000 * 60 * 60));
                                    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                                    const secs = Math.floor((diff % (1000 * 60)) / 1000);
                                    countdown = `${hours}h ${mins}m ${secs}s`;
                                }
                            }

                            return (
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
                                            <div className="flex flex-col items-end gap-1 mt-2">
                                                {app.hired_at && (
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${isExpired ? 'text-red-500' : 'text-amber-500'}`}>
                                                        {isExpired ? 'Staking Period Expired' : `Time to stake: ${countdown}`}
                                                    </span>
                                                )}
                                                <button onClick={() => handleFreelancerStake(app)} disabled={isProcessing || isExpired} className="p-3 bg-amber-500 text-white font-black rounded-xl hover:bg-amber-600 transition-all text-xs flex items-center gap-2 shadow-md disabled:opacity-50">
                                                    {isProcessing ? <Loader2 className="animate-spin" size={16}/> : <Coins size={16} />} Stake 5% to Begin
                                                </button>
                                            </div>
                                        )}

                                        {app.status === 'accepted' && (
                                            <button onClick={() => navigate('/chat')} className="p-3 bg-brand-50 text-brand-600 rounded-xl hover:bg-brand-600 hover:text-white transition-all"><MessageSquare size={18} /></button>
                                        )}

                                        {/* Withdraw button — only for pending or interviewing */}
                                        {(app.status === 'pending' || app.status === 'interviewing') && (
                                            <button
                                                onClick={() => { setAppToWithdraw(app); setIsWithdrawConfirmOpen(true); }}
                                                className="mt-1 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-red-500 transition-colors"
                                            >
                                                <X size={12} /> Withdraw Application
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                    {displayJobs.length === 0 ? (
                        <div className="col-span-full text-center py-20 bg-zinc-50 rounded-[3rem] border-2 border-dashed border-zinc-200">
                            <p className="text-zinc-500 font-bold">No active projects found.</p>
                            <p className="text-xs text-zinc-400 mt-2">Completed projects are archived and removed from this view.</p>
                        </div>
                    ) : (
                        displayJobs.map((job, i) => {
                            const hasApplied = myApplications.some(app => app.job_id === job.id);
                            const isWorkingForEmployer = myApplications.some(app =>
                                app.jobs?.employer_address?.toLowerCase() === job.employer_address.toLowerCase() &&
                                (app.status === 'accepted' || app.status === 'pending_stake')
                            );

                            return (
                                <motion.div
                                    key={job.id}
                                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                                    onClick={() => {
                                        if (activeTab === 'my-jobs') { openReviewModal(job); }
                                        else { setSelectedJob(job); setIsDetailModalOpen(true); }
                                    }}
                                    className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group relative overflow-hidden flex flex-col"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
                                    <div className="flex justify-between items-start mb-6 relative z-10">
                                        <div className="w-14 h-14 bg-zinc-50 rounded-2xl flex items-center justify-center group-hover:bg-brand-100 transition-colors overflow-hidden">
                                            {(() => {
                                                const profile = employerProfiles[job.employer_address.toLowerCase()];
                                                return profile?.avatar_url
                                                    ? <img src={profile.avatar_url} alt="employer" className="w-full h-full object-cover" />
                                                    : <Briefcase className="text-zinc-400 group-hover:text-brand-600" size={28} />;
                                            })()}
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="text-[10px] font-black text-brand-600 bg-brand-50 px-3 py-1.5 rounded-full uppercase tracking-widest">{job.status}</span>
                                            {job.experience_level && <span className="text-[10px] font-bold text-zinc-400 bg-zinc-50 px-2 py-1 rounded-full">{job.experience_level}</span>}
                                        </div>
                                    </div>
                                    <h3 className="font-black text-zinc-900 text-xl group-hover:text-brand-600 transition-colors mb-3 leading-tight">{job.title}</h3>
                                    {/* Employer info */}
                                    {(() => {
                                        const profile = employerProfiles[job.employer_address.toLowerCase()];
                                        return (
                                            <div className="flex items-center gap-2 mb-3">
                                                <UserCircle size={14} className="text-zinc-400 flex-shrink-0" />
                                                <span className="text-xs font-bold text-zinc-500 truncate">
                                                    {profile?.full_name || `${job.employer_address.slice(0, 6)}...${job.employer_address.slice(-4)}`}
                                                </span>
                                                {profile?.title && <span className="text-[10px] text-zinc-400 truncate">· {profile.title}</span>}
                                            </div>
                                        );
                                    })()}
                                    <p className="text-zinc-500 text-sm font-medium line-clamp-2 mb-4 flex-1">{job.description}</p>
                                    {job.project_type && <p className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded-lg w-fit mb-4">{job.project_type}</p>}
                                    <div className="flex flex-wrap gap-2 mb-6 relative z-10">
                                        {job.tags.map(tag => (<span key={tag} className="text-[10px] font-black uppercase tracking-wider text-zinc-500 bg-zinc-50 px-3 py-1 rounded-lg">{tag}</span>))}
                                    </div>
                                    <div className="pt-5 border-t border-zinc-50 flex justify-between items-center relative z-10">
                                        <div>
                                            <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-1">Budget</p>
                                            <p className="text-zinc-900 font-black text-lg">{job.budget}</p>
                                        </div>
                                        {activeTab === 'browse' ? (
                                            hasApplied ? (
                                                <span className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1 border border-emerald-100"><CheckCircle2 size={14}/> Applied</span>
                                            ) : isWorkingForEmployer ? (
                                                <span className="bg-amber-50 text-amber-600 px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1 border border-amber-100"><AlertCircle size={14}/> Active Contract</span>
                                            ) : (
                                                <span className="bg-brand-50 text-brand-600 px-3 py-1.5 rounded-xl font-black text-xs">View Details →</span>
                                            )
                                        ) : (
                                            <span className="bg-zinc-900 text-white px-3 py-1.5 rounded-xl font-black text-xs">View Applicants</span>
                                        )}
                                    </div>
                                    {/* Edit/Delete actions — only for my-jobs tab and open jobs */}
                                    {activeTab === 'my-jobs' && job.status === 'open' && (
                                        <div className="flex gap-2 mt-4 pt-4 border-t border-zinc-50 relative z-10" onClick={e => e.stopPropagation()}>
                                            <button
                                                onClick={() => openEditModal(job)}
                                                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-zinc-50 hover:bg-brand-50 text-zinc-500 hover:text-brand-600 rounded-xl font-black text-xs uppercase tracking-widest transition-all border border-zinc-100 hover:border-brand-100"
                                            >
                                                <Pencil size={14} /> Edit
                                            </button>
                                            <button
                                                onClick={() => { setJobToDelete(job); setIsDeleteConfirmOpen(true); }}
                                                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-zinc-50 hover:bg-red-50 text-zinc-500 hover:text-red-600 rounded-xl font-black text-xs uppercase tracking-widest transition-all border border-zinc-100 hover:border-red-100"
                                            >
                                                <Trash2 size={14} /> Delete
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })
                    )}
                </div>
            )}

            {isInterviewModalOpen && selectedApplicant && (
                <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black">Schedule Interview</h3>
                            <button onClick={() => {
                                setIsInterviewModalOpen(false);
                                setIsReviewModalOpen(true);
                            }}><X size={20} /></button>
                        </div>
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

            {isDetailModalOpen && selectedJob && (
                <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsDetailModalOpen(false)}>
                    <div className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="p-8 pb-0">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setViewingEmployer(selectedJob.employer_address.toLowerCase())}
                                        className="flex items-center gap-3 hover:bg-zinc-50 rounded-2xl p-2 -m-2 transition-all group/emp cursor-pointer text-left"
                                        title="View employer profile"
                                    >
                                        <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-transparent group-hover/emp:border-brand-300 transition-all">
                                            {(() => {
                                                const profile = employerProfiles[selectedJob.employer_address.toLowerCase()];
                                                return profile?.avatar_url
                                                    ? <img src={profile.avatar_url} alt="employer" className="w-full h-full object-cover" />
                                                    : <Briefcase className="text-brand-600" size={28} />;
                                            })()}
                                        </div>
                                        {(() => {
                                            const profile = employerProfiles[selectedJob.employer_address.toLowerCase()];
                                            return (
                                                <div>
                                                    <p className="font-black text-zinc-900 leading-tight group-hover/emp:text-brand-600 transition-colors">{profile?.full_name || 'Anonymous Employer'}</p>
                                                    {profile?.title && <p className="text-xs text-brand-600 font-bold mt-0.5">{profile.title}</p>}
                                                    <p className="text-[10px] font-mono text-zinc-400 mt-0.5">{selectedJob.employer_address.slice(0,8)}...{selectedJob.employer_address.slice(-6)}</p>
                                                    <p className="text-[10px] text-brand-500 font-bold mt-0.5 opacity-0 group-hover/emp:opacity-100 transition-all">View Profile →</p>
                                                </div>
                                            );
                                        })()}
                                    </button>
                                </div>
                                <button onClick={() => setIsDetailModalOpen(false)} className="p-2 hover:bg-zinc-100 rounded-xl transition-all"><X size={20} /></button>
                            </div>
                            <h2 className="text-2xl font-black text-zinc-900 mb-2">{selectedJob.title}</h2>
                            <div className="flex flex-wrap gap-2 mb-6">
                                {selectedJob.experience_level && <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{selectedJob.experience_level} Level</span>}
                                {selectedJob.project_type && <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">{selectedJob.project_type}</span>}
                                <span className="text-xs font-bold text-zinc-500 bg-zinc-100 px-3 py-1 rounded-full">Remote</span>
                                {selectedJob.deadline && <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">Due {new Date(selectedJob.deadline).toLocaleDateString()}</span>}
                            </div>
                        </div>

                        <div className="px-8 pb-8 space-y-6">
                            <div>
                                <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">Description</h4>
                                <p className="text-zinc-700 text-sm leading-relaxed whitespace-pre-wrap">{selectedJob.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-zinc-50 p-4 rounded-2xl">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Total Budget</p>
                                    <p className="text-xl font-black text-zinc-900">{selectedJob.budget}</p>
                                </div>
                                <div className="bg-zinc-50 p-4 rounded-2xl">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Milestones</p>
                                    <p className="text-xl font-black text-zinc-900">{selectedJob.milestones_json?.length ?? 0}</p>
                                </div>
                            </div>

                            {selectedJob.milestones_json && selectedJob.milestones_json.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3">Payment Milestones</h4>
                                    <div className="space-y-2">
                                        {selectedJob.milestones_json.map((ms: any, i: number) => (
                                            <div key={i} className="flex flex-col gap-2 bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                                                <div className="flex justify-between items-start w-full">
                                                    <div className="flex items-center gap-3">
                                                        <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs font-black flex items-center justify-center shrink-0">{i + 1}</span>
                                                        <span className="text-sm font-bold text-zinc-800 break-words">{ms.title}</span>
                                                    </div>
                                                    <div className="text-right shrink-0 ml-4">
                                                        <p className="text-sm font-black text-zinc-900">{ms.amount} PAS</p>
                                                        <p className="text-[10px] text-zinc-400">{ms.duration_days} days</p>
                                                    </div>
                                                </div>
                                                {ms.requirement && (
                                                    <div className="pl-9 pr-2">
                                                        <p className="text-xs text-zinc-500 font-medium bg-white p-2 rounded-lg border border-zinc-100 break-words"><span className="font-bold text-zinc-700">Requirement:</span> {ms.requirement}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-wrap gap-2">
                                {selectedJob.tags.map(tag => (<span key={tag} className="text-[10px] font-black uppercase tracking-wider text-zinc-500 bg-zinc-100 px-3 py-1.5 rounded-lg">{tag}</span>))}
                            </div>

                            {(() => {
                                const hasApplied = myApplications.some(app => app.job_id === selectedJob.id);
                                const isWorkingForEmployer = myApplications.some(app =>
                                    app.jobs?.employer_address?.toLowerCase() === selectedJob.employer_address.toLowerCase() &&
                                    (app.status === 'accepted' || app.status === 'pending_stake')
                                );

                                if (hasApplied) {
                                    return (
                                        <div className="flex items-center gap-2 justify-center py-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                            <CheckCircle2 className="text-emerald-600" size={20} />
                                            <span className="font-black text-emerald-700">You have already applied to this job</span>
                                        </div>
                                    );
                                }

                                if (isWorkingForEmployer) {
                                    return (
                                        <div className="flex items-center gap-2 justify-center py-4 bg-amber-50 rounded-2xl border border-amber-100">
                                            <AlertCircle className="text-amber-600" size={20} />
                                            <span className="font-black text-amber-700 text-sm">You have an active contract with this employer</span>
                                        </div>
                                    );
                                }

                                if (userRole === 'freelancer') {
                                    return (
                                        <button
                                            onClick={() => { setIsDetailModalOpen(false); setIsApplyModalOpen(true); }}
                                            className="w-full py-4 bg-brand-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-brand-700 transition-all shadow-xl shadow-brand-600/20"
                                        >
                                            Apply Now →
                                        </button>
                                    );
                                }

                                return null;
                            })()}
                        </div>
                    </div>
                </div>
            )}

            {/* Employer Profile Popup */}
            {viewingEmployer && (() => {
                const profile = employerProfiles[viewingEmployer] as any;
                const addr = viewingEmployer;
                return (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setViewingEmployer(null)}>
                        <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden border border-zinc-100" onClick={e => e.stopPropagation()}>
                            {/* Header with avatar */}
                            <div className="p-8 pb-6 border-b border-zinc-100 flex items-start gap-5 bg-gradient-to-br from-brand-50 to-indigo-50/50">
                                <div className="w-20 h-20 rounded-2xl bg-brand-100 flex items-center justify-center text-brand-600 font-black text-2xl shadow-inner overflow-hidden flex-shrink-0 border-2 border-brand-200/50">
                                    {profile?.avatar_url
                                        ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                                        : (profile?.full_name?.charAt(0).toUpperCase() || '?')
                                    }
                                </div>
                                <div className="flex-1 min-w-0 pt-1">
                                    <h2 className="text-xl font-black text-zinc-900 leading-tight mb-1">{profile?.full_name || 'Anonymous Employer'}</h2>
                                    {profile?.title && <p className="text-brand-600 font-bold text-sm mb-2">{profile.title}</p>}
                                    <div className="font-mono text-[10px] font-bold text-zinc-400 bg-white px-3 py-1.5 rounded-xl border border-zinc-200 w-fit truncate max-w-full">
                                        {addr}
                                    </div>
                                </div>
                                <button onClick={() => setViewingEmployer(null)} className="p-2 hover:bg-white/80 rounded-xl flex-shrink-0 transition-all">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Profile body */}
                            <div className="p-8 space-y-5">
                                {profile?.bio && (
                                    <div>
                                        <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">About</h3>
                                        <p className="text-sm font-medium text-zinc-700 leading-relaxed bg-zinc-50 p-4 rounded-2xl border border-zinc-100">{profile.bio}</p>
                                    </div>
                                )}

                                {profile?.hourly_rate && (
                                    <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                                        <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Hourly Rate</h3>
                                        <p className="text-lg font-black text-zinc-900">{profile.hourly_rate} PAS/hr</p>
                                    </div>
                                )}

                                {profile?.skills && profile.skills.length > 0 && (
                                    <div>
                                        <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">Skills</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {profile.skills.map((skill: string, i: number) => (
                                                <span key={i} className="px-3 py-1.5 bg-brand-50 text-brand-700 text-xs font-bold rounded-lg border border-brand-100">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {!profile && (
                                    <p className="text-center text-zinc-400 text-sm font-medium py-4">This employer hasn't set up a full profile yet.</p>
                                )}
                            </div>

                            <div className="p-6 bg-zinc-50 border-t border-zinc-100 flex justify-end">
                                <button onClick={() => setViewingEmployer(null)} className="px-6 py-3 font-bold text-zinc-600 bg-white hover:bg-zinc-100 rounded-xl border border-zinc-200 text-sm transition-colors">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}


            {isPostModalOpen && (
                <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl">
                        <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-black">Post a New Job</h3><button onClick={() => setIsPostModalOpen(false)}><X size={20} /></button></div>
                        <form onSubmit={handlePostJob} className="space-y-4">
                            <input type="text" value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} placeholder="Job Title" className="w-full p-4 border rounded-xl" required />
                            <textarea value={newJob.description} onChange={e => setNewJob({...newJob, description: e.target.value})} placeholder="Detailed Description — explain scope, deliverables, and expectations..." className="w-full h-36 p-4 border rounded-xl resize-none" required />
                            <input type="text" value={newJob.tags} onChange={e => setNewJob({...newJob, tags: e.target.value})} placeholder="Skills / Tags (comma separated, e.g. React, Solidity)" className="w-full p-4 border rounded-xl" required />

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-1 block">Experience Level</label>
                                    <select value={newJob.experience_level} onChange={e => setNewJob({...newJob, experience_level: e.target.value})} className="w-full p-4 border rounded-xl bg-white font-bold text-sm">
                                        <option>Junior</option>
                                        <option>Mid</option>
                                        <option>Senior</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-1 block">Project Type</label>
                                    <select value={newJob.project_type} onChange={e => setNewJob({...newJob, project_type: e.target.value})} className="w-full p-4 border rounded-xl bg-white font-bold text-sm">
                                        <option>One-time</option>
                                        <option>Ongoing</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-1 block">Deadline (optional)</label>
                                    <input type="date" value={newJob.deadline} onChange={e => setNewJob({...newJob, deadline: e.target.value})} className="w-full p-4 border rounded-xl bg-white font-bold text-sm" />
                                </div>
                            </div>

                            <div className="border-t border-zinc-100 pt-6 mt-2">
                                <div className="flex justify-between items-center mb-4">
                                    <div><h4 className="font-black text-sm text-zinc-900">Payment Milestones</h4><p className="text-[10px] text-zinc-500">Break your project into paid deliverables.</p></div>
                                    <button type="button" onClick={() => setNewJob({...newJob, milestones: [...newJob.milestones, {title: '', requirement: '', amount: '', duration_days: '7'}]})} className="text-xs font-bold text-brand-600 flex items-center gap-1 hover:text-brand-700 bg-brand-50 px-3 py-1.5 rounded-lg"><Plus size={14} /> Add Milestone</button>
                                </div>
                                <div className="space-y-3">
                                    {newJob.milestones.map((ms, index) => (
                                        <div key={index} className="flex flex-col gap-2 bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                                            <div className="flex gap-2 items-center">
                                                <span className="text-xs font-black text-zinc-400 pl-1 w-4">{index + 1}.</span>
                                                <input type="text" value={ms.title} onChange={e => { const u = [...newJob.milestones]; u[index].title = e.target.value; setNewJob({...newJob, milestones: u}); }} placeholder="e.g. UI Wireframes" className="flex-1 p-3 border rounded-lg text-sm bg-white" required />
                                                <input type="number" step="0.01" value={ms.amount} onChange={e => { const u = [...newJob.milestones]; u[index].amount = e.target.value; setNewJob({...newJob, milestones: u}); }} placeholder="PAS" className="w-24 p-3 border rounded-lg text-sm bg-white" required />
                                                <div className="flex flex-col">
                                                    <input type="number" value={ms.duration_days} onChange={e => { const u = [...newJob.milestones]; u[index].duration_days = e.target.value; setNewJob({...newJob, milestones: u}); }} placeholder="Days" className="w-20 p-3 border rounded-lg text-sm bg-white" required />
                                                    {index > 0 && <span className="text-[9px] font-bold text-zinc-400 mt-1">Total: {
                                                        newJob.milestones.slice(0, index + 1).reduce((sum, m) => sum + (parseInt(m.duration_days) || 0), 0)
                                                    }d</span>}
                                                </div>
                                                {index > 0 && <button type="button" onClick={() => { const u = [...newJob.milestones]; u.splice(index, 1); setNewJob({...newJob, milestones: u}); }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg shrink-0"><Trash2 size={16} /></button>}
                                            </div>
                                            <div className="pl-7 pr-1">
                                                <textarea value={ms.requirement || ''} onChange={e => { const u = [...newJob.milestones]; u[index].requirement = e.target.value; setNewJob({...newJob, milestones: u}); }} placeholder="Requirement (e.g. Figma link, specific feature, bullet points)" className="w-full p-3 border rounded-lg text-sm bg-white min-h-[80px] resize-y" required />
                                            </div>
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
                                                <button onClick={() => {
                                                    setSelectedApplicant(app);
                                                    setIsReviewModalOpen(false);
                                                    setIsInterviewModalOpen(true);
                                                }} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase hover:bg-blue-100 transition-all flex items-center gap-1"><Video size={14}/> Interview</button>
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
                                                <div className="flex items-center gap-2">
                                                    <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-black uppercase rounded-full flex items-center gap-1"><Loader2 size={12} className="animate-spin"/> Waiting on Stake</span>
                                                    {app.hired_at && Date.now() > new Date(app.hired_at).getTime() + 24 * 60 * 60 * 1000 && (
                                                        <button
                                                            onClick={() => handleClaimRefund(app, selectedJob)}
                                                            disabled={isProcessing}
                                                            className="px-3 py-1 bg-red-600 text-white text-[10px] font-black uppercase rounded-lg hover:bg-red-700 transition-all flex items-center gap-1 shadow-sm"
                                                        >
                                                            {isProcessing ? <Loader2 size={12} className="animate-spin"/> : "Claim Refund (Expired)"}
                                                        </button>
                                                    )}
                                                </div>
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

            {/* ===== EDIT JOB MODAL ===== */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-xl font-black text-zinc-900">Edit Job</h3>
                                <p className="text-xs text-zinc-400 font-medium mt-0.5">Changes will only apply to open jobs with no accepted applicants.</p>
                            </div>
                            <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-zinc-100 rounded-xl transition-all"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleEditJob} className="space-y-4">
                            <input type="text" value={editJob.title} onChange={e => setEditJob({...editJob, title: e.target.value})} placeholder="Job Title" className="w-full p-4 border rounded-xl" required />
                            <textarea value={editJob.description} onChange={e => setEditJob({...editJob, description: e.target.value})} placeholder="Detailed Description..." className="w-full h-36 p-4 border rounded-xl resize-none" required />
                            <input type="text" value={editJob.tags} onChange={e => setEditJob({...editJob, tags: e.target.value})} placeholder="Skills / Tags (comma separated)" className="w-full p-4 border rounded-xl" required />

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-1 block">Experience Level</label>
                                    <select value={editJob.experience_level} onChange={e => setEditJob({...editJob, experience_level: e.target.value})} className="w-full p-4 border rounded-xl bg-white font-bold text-sm">
                                        <option>Junior</option><option>Mid</option><option>Senior</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-1 block">Project Type</label>
                                    <select value={editJob.project_type} onChange={e => setEditJob({...editJob, project_type: e.target.value})} className="w-full p-4 border rounded-xl bg-white font-bold text-sm">
                                        <option>One-time</option><option>Ongoing</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-1 block">Deadline (optional)</label>
                                    <input type="date" value={editJob.deadline} onChange={e => setEditJob({...editJob, deadline: e.target.value})} className="w-full p-4 border rounded-xl bg-white font-bold text-sm" />
                                </div>
                            </div>

                            <div className="border-t border-zinc-100 pt-6 mt-2">
                                <div className="flex justify-between items-center mb-4">
                                    <div><h4 className="font-black text-sm text-zinc-900">Payment Milestones</h4><p className="text-[10px] text-zinc-500">Break your project into paid deliverables.</p></div>
                                    <button type="button" onClick={() => setEditJob({...editJob, milestones: [...editJob.milestones, {title: '', requirement: '', amount: '', duration_days: '7'}]})} className="text-xs font-bold text-brand-600 flex items-center gap-1 hover:text-brand-700 bg-brand-50 px-3 py-1.5 rounded-lg"><Plus size={14} /> Add Milestone</button>
                                </div>
                                <div className="space-y-3">
                                    {editJob.milestones.map((ms, index) => (
                                        <div key={index} className="flex flex-col gap-2 bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                                            <div className="flex gap-2 items-center">
                                                <span className="text-xs font-black text-zinc-400 pl-1 w-4">{index + 1}.</span>
                                                <input type="text" value={ms.title} onChange={e => { const u = [...editJob.milestones]; u[index].title = e.target.value; setEditJob({...editJob, milestones: u}); }} placeholder="e.g. UI Wireframes" className="flex-1 p-3 border rounded-lg text-sm bg-white" required />
                                                <input type="number" step="0.01" value={ms.amount} onChange={e => { const u = [...editJob.milestones]; u[index].amount = e.target.value; setEditJob({...editJob, milestones: u}); }} placeholder="PAS" className="w-24 p-3 border rounded-lg text-sm bg-white" required />
                                                <div className="flex flex-col">
                                                    <input type="number" value={ms.duration_days} onChange={e => { const u = [...editJob.milestones]; u[index].duration_days = e.target.value; setEditJob({...editJob, milestones: u}); }} placeholder="Days" className="w-20 p-3 border rounded-lg text-sm bg-white" required />
                                                    {index > 0 && <span className="text-[9px] font-bold text-zinc-400 mt-1">Total: {
                                                        editJob.milestones.slice(0, index + 1).reduce((sum, m) => sum + (parseInt(m.duration_days) || 0), 0)
                                                    }d</span>}
                                                </div>
                                                {index > 0 && <button type="button" onClick={() => { const u = [...editJob.milestones]; u.splice(index, 1); setEditJob({...editJob, milestones: u}); }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg shrink-0"><Trash2 size={16} /></button>}
                                            </div>
                                            <div className="pl-7 pr-1">
                                                <textarea value={ms.requirement || ''} onChange={e => { const u = [...editJob.milestones]; u[index].requirement = e.target.value; setEditJob({...editJob, milestones: u}); }} placeholder="Requirement (e.g. Figma link, specific feature, bullet points)" className="w-full p-3 border rounded-lg text-sm bg-white min-h-[80px] resize-y" required />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-4 bg-zinc-100 text-zinc-700 rounded-xl font-black uppercase text-sm hover:bg-zinc-200 transition-all">Cancel</button>
                                <button type="submit" disabled={isProcessing} className="flex-1 py-4 bg-brand-600 text-white rounded-xl font-black uppercase text-sm shadow-xl shadow-brand-600/20 hover:bg-brand-700 transition-all disabled:opacity-60">
                                    {isProcessing ? <Loader2 className="animate-spin mx-auto" size={20} /> : `Save Changes`}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isWithdrawConfirmOpen && appToWithdraw && (
                <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl">
                        <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-6">
                            <X className="text-amber-500" size={28} />
                        </div>
                        <h3 className="text-xl font-black text-zinc-900 mb-2">Withdraw Application?</h3>
                        <p className="text-sm text-zinc-500 font-medium mb-2">You are about to withdraw your application for:</p>
                        <p className="text-sm font-black text-zinc-800 bg-zinc-50 px-4 py-3 rounded-xl mb-6 border border-zinc-100">"{appToWithdraw.jobs?.title}"</p>
                        <p className="text-xs text-amber-600 font-bold bg-amber-50 border border-amber-100 px-4 py-3 rounded-xl mb-6">⚠️ Your application will be permanently removed. The employer will no longer be able to see it.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => { setIsWithdrawConfirmOpen(false); setAppToWithdraw(null); }}
                                className="flex-1 py-4 bg-zinc-100 text-zinc-700 rounded-xl font-black uppercase text-sm hover:bg-zinc-200 transition-all"
                            >
                                Keep It
                            </button>
                            <button
                                onClick={handleWithdrawApplication}
                                disabled={isProcessing}
                                className="flex-1 py-4 bg-amber-500 text-white rounded-xl font-black uppercase text-sm shadow-xl shadow-amber-500/20 hover:bg-amber-600 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                                {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <><X size={16} /> Withdraw</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== DELETE CONFIRMATION MODAL ===== */}
            {isDeleteConfirmOpen && jobToDelete && (
                <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl">
                        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
                            <Trash2 className="text-red-500" size={28} />
                        </div>
                        <h3 className="text-xl font-black text-zinc-900 mb-2">Delete Job Posting?</h3>
                        <p className="text-sm text-zinc-500 font-medium mb-2">You are about to permanently delete:</p>
                        <p className="text-sm font-black text-zinc-800 bg-zinc-50 px-4 py-3 rounded-xl mb-6 border border-zinc-100">"{jobToDelete.title}"</p>
                        <p className="text-xs text-red-500 font-bold bg-red-50 border border-red-100 px-4 py-3 rounded-xl mb-6">⚠️ This action cannot be undone. All pending applications for this job will also be removed.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => { setIsDeleteConfirmOpen(false); setJobToDelete(null); }}
                                className="flex-1 py-4 bg-zinc-100 text-zinc-700 rounded-xl font-black uppercase text-sm hover:bg-zinc-200 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteJob}
                                disabled={isProcessing}
                                className="flex-1 py-4 bg-red-600 text-white rounded-xl font-black uppercase text-sm shadow-xl shadow-red-600/20 hover:bg-red-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                                {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <><Trash2 size={16} /> Delete</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};