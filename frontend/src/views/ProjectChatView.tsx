import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Send, Loader2, MessageSquare, FileText, CheckCircle2, Paperclip, X, Plus, ShieldCheck, Coins, UploadCloud, UserCircle, Bot, Calendar, Clock, AlertCircle, Bell, Timer } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useWallet } from '../lib/WalletContext';
import { ethers } from 'ethers';

import { ESCROW_ABI, ESCROW_BYTECODE } from '../lib/escrowContract';

const ADMIN_WALLETS = [
    "0xbeE339Aa5d7af6758164F5739a2c98EB6f16a3AB",
    "0x832d9D4D866A33205e5FE43aF9C15608431759C0",
    "0x342f52294501135f2148840366271f59598739EA"
];

interface Message { id: string; content: string; sender_address: string; receiver_address: string; created_at: string; room_id?: string; is_read?: boolean; }
interface Notification { id: string; content: string; wallet_address: string; room_id: string; created_at: string; }

interface ChatHistory { 
    roomId: string; 
    walletAddress: string; 
    name: string; 
    avatarUrl?: string; 
    lastMessage: string; 
    time: string; 
    timestamp: number; 
    jobTitle?: string; 
    hasNotification?: boolean; 
}

interface Milestone {
    id: string;
    project_id: string;
    title: string;
    status: 'pending' | 'submitted' | 'approved' | 'rejected' | 'appealed' | 'escalated';
    due_date: string;
    amount?: string;
    duration_days?: string;
    notes?: string;
    file_url?: string;
    created_at: string;
    ai_verdict?: string;
    appeal_start_time?: string;
}

interface ProjectFile { id: string; file_name: string; file_size: string; file_url?: string; }

export const ProjectChatView: React.FC = () => {
    const { walletAddress } = useWallet();
    const location = useLocation();
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);

    const [activeRoomId, setActiveRoomId] = useState<string>('');
    const [activeChatWallet, setActiveChatWallet] = useState<string>('');
    const activeRoomIdRef = useRef<string>('');

    useEffect(() => { activeRoomIdRef.current = activeRoomId; }, [activeRoomId]);

    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const [userRole, setUserRole] = useState<'employer' | 'freelancer' | 'admin' | 'viewer'>('viewer');
    const [hasFreelancerStaked, setHasFreelancerStaked] = useState(false);
    const [isContractCancelled, setIsContractCancelled] = useState(false);
    const [isProjectCompleted, setIsProjectCompleted] = useState(false);

    const [isFundModalOpen, setIsFundModalOpen] = useState(false);
    const [isSubmitMilestoneOpen, setIsSubmitMilestoneOpen] = useState(false);
    const [isReviewMilestoneOpen, setIsReviewMilestoneOpen] = useState(false);
    const [isAppealModalOpen, setIsAppealModalOpen] = useState(false);
    const [appealReason, setAppealReason] = useState('');

    const [activeMilestone, setActiveMilestone] = useState<Milestone | null>(null);

    const [msNotes, setMsNotes] = useState('');
    const [msFile, setMsFile] = useState<File | null>(null);
    const [isProcessingMilestone, setIsProcessingMilestone] = useState(false);

    const [isTriggeringAI, setIsTriggeringAI] = useState(false);
    const [aiVerdict, setAiVerdict] = useState<{status: string, reasoning: string} | null>(null);

    const [deployedContractAddress, setDeployedContractAddress] = useState<string | null>(null);
    const [isStaking, setIsStaking] = useState(false);

    const [isAddingChat, setIsAddingChat] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);

    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [files, setFiles] = useState<ProjectFile[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [now, setNow] = useState(Date.now());

    const isAiApproved = (verdict?: string) => {
        if (!verdict) return false;
        const v = verdict.toUpperCase().trim();
        return v === 'RELEASE' || v === 'PASSED';
    };

    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    const formatAddress = (addr: string) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';

    const getRoomId = () => activeRoomId || '';

    const dismissNotification = async (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
        await supabase.from('notifications').delete().eq('id', id);
    };

    useEffect(() => {
        const identifyRole = async () => {
            if (!window.ethereum || !walletAddress || !deployedContractAddress) return;
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const contract = new ethers.Contract(deployedContractAddress, ESCROW_ABI, provider);

                const [employerAddr, freelancerAddr, isFunded, isCancelled] = await Promise.all([
                    contract.employer(),
                    contract.freelancer(),
                    contract.freelancerFunded(),
                    contract.contractCancelled()
                ]);

                const lowerWallet = walletAddress.toLowerCase();
                const isUserAdmin = ADMIN_WALLETS.map(a => a.toLowerCase()).includes(lowerWallet);

                if (lowerWallet === employerAddr.toLowerCase()) setUserRole('employer');
                else if (lowerWallet === freelancerAddr.toLowerCase()) setUserRole('freelancer');
                else if (isUserAdmin) setUserRole('admin');
                else setUserRole('viewer');

                setHasFreelancerStaked(isFunded);
                setIsContractCancelled(isCancelled);
            } catch (e) {
                console.error("Blockchain Read Error:", e);
            }
        };
        identifyRole();
    }, [deployedContractAddress, walletAddress]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            if (file.type.startsWith('image/')) setFilePreview(URL.createObjectURL(file));
            else setFilePreview('file');
        }
    };

    const clearFileSelection = () => { setSelectedFile(null); setFilePreview(null); };

    const handleFreelancerStake = async () => {
        if (!window.ethereum || !deployedContractAddress || !walletAddress) return;
        try {
            setIsStaking(true);
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(deployedContractAddress, ESCROW_ABI, signer);

            const stakeAmount = await contract.freelancerStake();
            const tx = await contract.stakeFreelancer({ value: stakeAmount, gasLimit: 300000 });
            await tx.wait(1);

            setHasFreelancerStaked(true);

            await supabase.from('notifications').insert([
                { room_id: getRoomId(), wallet_address: activeChatWallet.toLowerCase(), content: `The freelancer has successfully staked their 5%. Work can now begin.` },
                { room_id: getRoomId(), wallet_address: walletAddress.toLowerCase(), content: `You have staked your 5%. You can now submit milestones.` }
            ]);

            alert("Stake successful. You can now start submitting work.");
        } catch (error: any) { alert("Stake failed: " + error.message); } finally { setIsStaking(false); }
    };

    const handleClaimRefund = async () => {
        if (!window.ethereum || !deployedContractAddress) return;
        if (!window.confirm("Are you sure you want to cancel the contract and claim your refund? This will permanently close the project.")) return;

        setIsProcessingMilestone(true);
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(deployedContractAddress, ESCROW_ABI, signer);

            const tx = await contract.claimRefund();
            await tx.wait(1);

            const roomId = getRoomId();

            await supabase.from('jobs').update({ status: 'cancelled' }).eq('id', roomId);
            await supabase.from('applications').update({ status: 'cancelled' }).eq('job_id', roomId).eq('freelancer_address', activeChatWallet.toLowerCase());

            await supabase.from('messages').insert([{
                content: `[System] Contract Cancelled`,
                sender_address: walletAddress!.toLowerCase(),
                receiver_address: activeChatWallet.toLowerCase(),
                room_id: roomId,
                is_read: false
            }]);

            setIsContractCancelled(true);

            await supabase.from('notifications').insert([
                { room_id: roomId, wallet_address: activeChatWallet.toLowerCase(), content: `Employer claimed a refund due to a missed deadline. Project closed.` }
            ]);

            alert("Refund successful. Remaining funds are back in your wallet.");

            setChatHistory(prev => {
                const updated = prev.filter(c => c.roomId !== roomId);
                if (updated.length > 0) {
                    setActiveRoomId(updated[0].roomId);
                    setActiveChatWallet(updated[0].walletAddress);
                } else {
                    setActiveRoomId('');
                    setActiveChatWallet('');
                }
                return updated;
            });

        } catch (error: any) { alert("Refund failed: " + error.message); } finally { setIsProcessingMilestone(false); }
    };

    const handleMilestoneSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeMilestone || !msNotes) return;

        if (!msNotes || msNotes.trim() === "") {
            alert("Please describe what you completed in the notes field before submitting.");
            return;
        }

        setIsProcessingMilestone(true);
        try {
            let publicUrl = null;
            if (msFile) {
                const filePath = `${getRoomId()}/milestones/${Date.now()}_${msFile.name}`;
                await supabase.storage.from('project-files').upload(filePath, msFile);
                const { data } = supabase.storage.from('project-files').getPublicUrl(filePath);
                publicUrl = data.publicUrl;

                await supabase.from('project_files').insert([{
                    project_id: getRoomId(),
                    file_name: msFile.name,
                    file_size: `${(msFile.size / (1024 * 1024)).toFixed(2)} MB`,
                    file_url: publicUrl
                }]);
            }

            await supabase.from('project_milestones').update({
                status: 'submitted',
                notes: msNotes,
                file_url: publicUrl,
                ai_verdict: null
            }).eq('id', activeMilestone.id);

            setMilestones(prev => prev.map(m => m.id === activeMilestone.id ? {
                ...m,
                status: 'submitted',
                notes: msNotes,
                file_url: publicUrl || m.file_url,
                ai_verdict: undefined
            } : m));

            setIsSubmitMilestoneOpen(false);
            setMsNotes('');
            setMsFile(null);
            setAiVerdict(null);

            await supabase.from('notifications').insert([
                { room_id: getRoomId(), wallet_address: activeChatWallet.toLowerCase(), content: `Action Required: Freelancer submitted delivery for '${activeMilestone.title}'. Please review.` }
            ]);
            alert("Work submitted successfully.");
        } catch (error: any) { alert(`Submit failed: ${error.message}`); } finally { setIsProcessingMilestone(false); }
    };

    const handleTriggerAIAudit = async () => {
        if (!activeMilestone || !activeMilestone.file_url) return alert("Missing required info to audit.");
        setIsTriggeringAI(true);
        try {
            const fileResponse = await fetch(activeMilestone.file_url);
            const fileBlob = await fileResponse.blob();
            const fileName = activeMilestone.file_url.split('/').pop() || 'submission.zip';

            const formData = new FormData();
            formData.append('milestone_requirements', `Verify completion for milestone: ${activeMilestone.title}`);
            formData.append('client_dispute_reason', "Automated audit.");
            formData.append('project_zip', fileBlob, fileName);

            const aiResponse = await fetch('http://127.0.0.1:8000/dispute/resolve', { method: 'POST', body: formData });
            const aiResult = await aiResponse.json();

            setAiVerdict({ status: aiResult.status, reasoning: aiResult.reasoning });

            await supabase.from('project_milestones').update({ ai_verdict: aiResult.status }).eq('id', activeMilestone.id);
            setMilestones(prev => prev.map(m => m.id === activeMilestone.id ? { ...m, ai_verdict: aiResult.status } : m));

            await supabase.from('notifications').insert([
                { room_id: getRoomId(), wallet_address: activeChatWallet.toLowerCase(), content: `Code Audit Complete: The AI voted to ${aiResult.status} your submission for '${activeMilestone.title}'.` }
            ]);

        } catch (error: any) { alert(`Audit Error: ${error.message}`); } finally { setIsTriggeringAI(false); }
    };

    const handleMilestoneReview = async (status: 'approved' | 'rejected') => {
        if (!activeMilestone || !window.ethereum || !deployedContractAddress) return;
        setIsProcessingMilestone(true);
        try {
            if (status === 'approved') {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                const contract = new ethers.Contract(deployedContractAddress, ESCROW_ABI, signer);
                const tx = await contract.approveMilestone();
                await tx.wait(1);
            }

            await supabase.from('project_milestones').update({ status }).eq('id', activeMilestone.id);
            setMilestones(prev => prev.map(m => m.id === activeMilestone.id ? { ...m, status } : m));

            setIsReviewMilestoneOpen(false);
            setAiVerdict(null);

            await supabase.from('notifications').insert([
                { room_id: getRoomId(), wallet_address: activeChatWallet.toLowerCase(), content: status === 'approved' ? `Milestone '${activeMilestone.title}' Approved. Funds have been released.` : `Milestone '${activeMilestone.title}' was rejected by the employer.` }
            ]);

            alert(status === 'approved' ? "Funds released successfully." : "Milestone rejected. Freelancer has been notified.");
        } catch (error: any) { alert("Review action failed: " + error.message); } finally { setIsProcessingMilestone(false); }
    };

    const handleStartAppeal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeMilestone) return;
        if (!appealReason || appealReason.trim() === "") {
            alert("Please provide a reason for your appeal.");
            return;
        }

        setIsProcessingMilestone(true);
        try {
            const appealTime = new Date().toISOString();

            await supabase.from('project_milestones').update({ status: 'appealed', appeal_start_time: appealTime }).eq('id', activeMilestone.id);
            setMilestones(prev => prev.map(m => m.id === activeMilestone.id ? { ...m, status: 'appealed', appeal_start_time: appealTime } : m));

            // Insert into appeals table
            await supabase.from('appeals').insert([{
                milestone_id: activeMilestone.id,
                project_id: getRoomId(),
                freelancer_address: activeChatWallet.toLowerCase(),
                ai_status: activeMilestone.ai_verdict || 'none',
                ai_reasoning: 'AI verdict was requested by the employer and contested by the freelancer.',
                freelancer_reason: appealReason,
                status: 'pending'
            }]);

            const notificationsPayload = [
                {
                    room_id: getRoomId(),
                    wallet_address: activeChatWallet.toLowerCase(),
                    content: `Appeal Initiated for '${activeMilestone.title}'. Reason: "${appealReason}". You have 24 hours to review.`
                }
            ];

            ADMIN_WALLETS.forEach(adminWallet => {
                notificationsPayload.push({
                    room_id: getRoomId(),
                    wallet_address: adminWallet.toLowerCase(),
                    content: `[ADMIN ALERT] Appeal initiated for '${activeMilestone.title}'. Reason: "${appealReason}". Admin chat access has been granted.`
                });
            });

            await supabase.from('notifications').insert(notificationsPayload);

            setIsAppealModalOpen(false);
            setAppealReason('');
            setIsReviewMilestoneOpen(false);
            alert("Appeal sent as a notification. The employer has 24 hours to review.");
        } catch (error: any) { alert(`Appeal Failed: ${error.message}`); } finally { setIsProcessingMilestone(false); }
    };

    const handleEscalateToAdmin = async () => {
        if (!activeMilestone) return;
        if (!window.confirm("Decline the appeal and send this directly to the Admin for resolution?")) return;
        setIsProcessingMilestone(true);
        try {
            await supabase.from('project_milestones').update({ status: 'escalated' }).eq('id', activeMilestone.id);
            setMilestones(prev => prev.map(m => m.id === activeMilestone.id ? { ...m, status: 'escalated' } : m));
            setIsReviewMilestoneOpen(false);

            const notificationsPayload = [];
            ADMIN_WALLETS.forEach(adminWallet => {
                notificationsPayload.push({
                    room_id: getRoomId(),
                    wallet_address: adminWallet.toLowerCase(),
                    content: `[URGENT ACTION REQUIRED] The employer manually escalated the dispute for milestone '${activeMilestone.title}'. Final Admin resolution is needed.`
                });
            });

            await supabase.from('notifications').insert(notificationsPayload);

            alert("Dispute escalated to Admin.");
        } catch (error: any) { alert(`Escalation Failed: ${error.message}`); } finally { setIsProcessingMilestone(false); }
    };

    const handleAdminOverrideApprove = async () => {
        if (!activeMilestone || !window.ethereum || !deployedContractAddress) return;
        if (!window.confirm("ADMIN: Override and force-approve this milestone? This will also complete and close the project.")) return;
        setIsProcessingMilestone(true);
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(deployedContractAddress, ESCROW_ABI, signer);
            const tx = await contract.approveMilestone();
            await tx.wait(1);

            await supabase.from('project_milestones').update({ status: 'approved' }).eq('id', activeMilestone.id);
            setMilestones(prev => prev.map(m => m.id === activeMilestone.id ? { ...m, status: 'approved' } : m));

            const roomId = getRoomId();

            await supabase.from('jobs').update({ status: 'completed' }).eq('id', roomId);
            await supabase.from('applications').update({ status: 'completed' }).eq('job_id', roomId).eq('status', 'accepted');

            await supabase.from('messages').insert([{
                content: `[System] Project Completed by Admin`,
                sender_address: walletAddress!.toLowerCase(),
                receiver_address: activeChatWallet.toLowerCase(),
                room_id: roomId,
                is_read: false
            }]);

            const { data: jobData } = await supabase.from('jobs').select('employer_address').eq('id', roomId).single();
            const { data: appData } = await supabase.from('applications').select('freelancer_address').eq('job_id', roomId).eq('status', 'completed').single();

            if (jobData && appData) {
                await supabase.from('notifications').insert([
                    { room_id: roomId, wallet_address: jobData.employer_address, content: `[ADMIN ACTION] Milestone approved. This project and chat have been forcefully closed by the Administrator.` },
                    { room_id: roomId, wallet_address: appData.freelancer_address, content: `[ADMIN ACTION] Milestone approved. This project and chat have been forcefully closed by the Administrator.` }
                ]);
            }

            setIsProjectCompleted(true);
            setIsReviewMilestoneOpen(false);
            setActiveMilestone(null);

            setChatHistory(prev => {
                const updated = prev.filter(c => c.roomId !== roomId);
                if (updated.length > 0) {
                    setActiveRoomId(updated[0].roomId);
                    setActiveChatWallet(updated[0].walletAddress);
                } else { setActiveRoomId(''); setActiveChatWallet(''); }
                return updated;
            });

            alert("Admin Override: Milestone approved, funds released, and project closed.");
        } catch (error: any) { alert(`Admin Override Failed: ${error.message}`); } finally { setIsProcessingMilestone(false); }
    };

    const handleAdminOverrideRefund = async () => {
        if (!window.ethereum || !deployedContractAddress) return;
        if (!window.confirm("ADMIN: Override and force-refund the employer? This cancels the contract.")) return;
        setIsProcessingMilestone(true);
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(deployedContractAddress, ESCROW_ABI, signer);
            const tx = await contract.adminOverrideRefund();
            await tx.wait(1);

            const roomId = getRoomId();

            await supabase.from('jobs').update({ status: 'cancelled' }).eq('id', roomId);
            await supabase.from('applications').update({ status: 'cancelled' }).eq('job_id', roomId).eq('status', 'accepted');

            await supabase.from('messages').insert([{
                content: `[System] Contract Cancelled by Admin`,
                sender_address: walletAddress!.toLowerCase(),
                receiver_address: activeChatWallet.toLowerCase(),
                room_id: roomId,
                is_read: false
            }]);

            const { data: jobData } = await supabase.from('jobs').select('employer_address').eq('id', roomId).single();
            const { data: appData } = await supabase.from('applications').select('freelancer_address').eq('job_id', roomId).eq('status', 'cancelled').single();

            if (jobData && appData) {
                await supabase.from('notifications').insert([
                    { room_id: roomId, wallet_address: jobData.employer_address, content: `[ADMIN ACTION] This contract was forcefully cancelled and refunded. Chat is closed.` },
                    { room_id: roomId, wallet_address: appData.freelancer_address, content: `[ADMIN ACTION] This contract was forcefully cancelled and refunded. Chat is closed.` }
                ]);
            }

            setIsContractCancelled(true);
            setIsReviewMilestoneOpen(false);
            setActiveMilestone(null);

            alert("Admin Override: Contract cancelled and funds refunded to employer.");

            setChatHistory(prev => {
                const updated = prev.filter(c => c.roomId !== roomId);
                if (updated.length > 0) {
                    setActiveRoomId(updated[0].roomId);
                    setActiveChatWallet(updated[0].walletAddress);
                } else { setActiveRoomId(''); setActiveChatWallet(''); }
                return updated;
            });

        } catch (error: any) { alert(`Admin Refund Failed: ${error.message}`); } finally { setIsProcessingMilestone(false); }
    };

    const handleCompleteProject = async () => {
        const isAdmin = userRole === 'admin';
        if (!window.confirm(isAdmin ? "ADMIN: Force close this project and shut down the chat for both parties?" : "Are you sure you want to complete the project and close the chat?")) return;

        setIsProcessingMilestone(true);
        try {
            const roomId = getRoomId();

            await supabase.from('jobs').update({ status: 'completed' }).eq('id', roomId);
            await supabase.from('applications').update({ status: 'completed' }).eq('job_id', roomId).eq('status', 'accepted');

            const systemMsg = isAdmin ? `[System] Project Completed by Admin` : `[System] Project Completed`;

            await supabase.from('messages').insert([{
                content: systemMsg,
                sender_address: walletAddress!.toLowerCase(),
                receiver_address: activeChatWallet.toLowerCase(),
                room_id: roomId,
                is_read: false
            }]);

            if (isAdmin) {
                const { data: jobData } = await supabase.from('jobs').select('employer_address').eq('id', roomId).single();
                const { data: appData } = await supabase.from('applications').select('freelancer_address').eq('job_id', roomId).eq('status', 'completed').single();

                if (jobData && appData) {
                    await supabase.from('notifications').insert([
                        { room_id: roomId, wallet_address: jobData.employer_address, content: `[ADMIN ACTION] This project and chat have been forcefully closed by the Administrator.` },
                        { room_id: roomId, wallet_address: appData.freelancer_address, content: `[ADMIN ACTION] This project and chat have been forcefully closed by the Administrator.` }
                    ]);
                }
            } else {
                await supabase.from('notifications').insert([{
                    room_id: roomId,
                    wallet_address: activeChatWallet.toLowerCase(),
                    content: `Project completed. Thank you for your hard work. The employer has officially closed this contract.`
                }]);
            }

            setIsProjectCompleted(true);
            setChatHistory(prev => {
                const updated = prev.filter(c => c.roomId !== roomId);
                if (updated.length > 0) {
                    setActiveRoomId(updated[0].roomId);
                    setActiveChatWallet(updated[0].walletAddress);
                } else { setActiveRoomId(''); setActiveChatWallet(''); }
                return updated;
            });

        } catch (error) { alert("Failed to complete project."); } finally { setIsProcessingMilestone(false); }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeRoomId) return alert("There are no chats registered.");
        if ((!newMessage.trim() && !selectedFile) || !walletAddress) return;
        const roomId = getRoomId();
        const content = newMessage.trim() || `Sent a file: ${selectedFile?.name}`;
        try {
            if (selectedFile) {
                setIsUploading(true);
                const filePath = `${roomId}/${Date.now()}.${selectedFile.name.split('.').pop()}`;
                await supabase.storage.from('project-files').upload(filePath, selectedFile);
                const { data: { publicUrl } } = supabase.storage.from('project-files').getPublicUrl(filePath);

                await supabase.from('project_files').insert([{ project_id: roomId, file_name: selectedFile.name, file_size: `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`, file_url: publicUrl }]);
                await supabase.from('messages').insert([{ content: `${content}\n${publicUrl}`, sender_address: walletAddress.toLowerCase(), receiver_address: activeChatWallet.toLowerCase(), room_id: roomId, is_read: false }]);
            } else {
                await supabase.from('messages').insert([{ content, sender_address: walletAddress.toLowerCase(), receiver_address: activeChatWallet.toLowerCase(), room_id: roomId, is_read: false }]);
            }
            setNewMessage(''); clearFileSelection();
        } catch (error) { console.error(error); } finally { setIsUploading(false); }
    };

    // HISTORY FETCH & INTERNAL SIDEBAR SCANNER
    useEffect(() => {
        if (!walletAddress) return;
        const lowerWallet = walletAddress.toLowerCase();

        const fetchHistory = async () => {
            const isAdminUser = ADMIN_WALLETS.map(w => w.toLowerCase()).includes(lowerWallet);

            // Fetch unread messages
            const { data: unreadMsgs } = await supabase
                .from('messages')
                .select('room_id')
                .eq('receiver_address', lowerWallet)
                .or('is_read.eq.false,is_read.is.null');

            // Fetch active system alerts
            const { data: userNotifs } = await supabase
                .from('notifications')
                .select('room_id')
                .eq('wallet_address', lowerWallet);

            let roomsWithUnread = new Set([
                ...(unreadMsgs?.map(m => m.room_id) || []),
                ...(userNotifs?.map(n => n.room_id) || [])
            ]);

            let allMessages: Message[] = [];
            
            const { data: directMsgs } = await supabase
                .from('messages')
                .select('*')
                .or(`sender_address.eq.${lowerWallet},receiver_address.eq.${lowerWallet}`)
                .order('created_at', { ascending: false });
            
            if (directMsgs) allMessages.push(...directMsgs);

            if (isAdminUser) {
                const { data: appealedMilestones } = await supabase
                    .from('project_milestones')
                    .select('project_id')
                    .in('status', ['appealed', 'escalated']);

                if (appealedMilestones && appealedMilestones.length > 0) {
                    const appealedProjectIds = Array.from(new Set(appealedMilestones.map(m => m.project_id)));
                    appealedProjectIds.forEach(id => roomsWithUnread.add(id));
                    
                    const { data: appealedMsgs } = await supabase
                        .from('messages')
                        .select('*')
                        .in('room_id', appealedProjectIds)
                        .order('created_at', { ascending: false });
                        
                    if (appealedMsgs) allMessages.push(...appealedMsgs);
                }
            }

            const uniqueMsgsObj: { [key: string]: Message } = {};
            allMessages.forEach(m => uniqueMsgsObj[m.id!] = m);
            const data = Object.values(uniqueMsgsObj).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

            if (data) {
                const historyMap = new Map<string, ChatHistory>();
                const closedRooms = new Set<string>();

                data.forEach((msg: Message) => {
                    const rId = msg.room_id || [msg.sender_address.toLowerCase(), msg.receiver_address.toLowerCase()].sort().join('_');
                    if (msg.content.includes("[System] Project Completed") || msg.content.includes("[System] Contract Cancelled")) { closedRooms.add(rId); }
                });

                data.forEach((msg: Message) => {
                    const sender = msg.sender_address.toLowerCase();
                    const receiver = msg.receiver_address.toLowerCase();

                    let other = sender === lowerWallet ? receiver : sender;
                    if (isAdminUser && sender !== lowerWallet && receiver !== lowerWallet) {
                        other = sender;
                    }

                    const rId = msg.room_id || [sender, receiver].sort().join('_');

                    if (closedRooms.has(rId)) return;

                    if (!historyMap.has(rId)) {
                        historyMap.set(rId, {
                            roomId: rId,
                            walletAddress: other,
                            name: formatAddress(other),
                            lastMessage: msg.content.startsWith('[System]') ? "System Event Logged" : msg.content,
                            time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            timestamp: new Date(msg.created_at).getTime(),
                            hasNotification: roomsWithUnread.has(rId)
                        });
                    }
                });

                const uniqueWallets = Array.from(new Set(Array.from(historyMap.values()).map(h => h.walletAddress)));
                const uniqueRoomIds = Array.from(historyMap.keys());

                if (uniqueWallets.length > 0) {
                    const { data: usersData } = await supabase.from('users').select('wallet_address, full_name, avatar_url').in('wallet_address', uniqueWallets);
                    if (usersData) {
                        usersData.forEach(user => {
                            historyMap.forEach(chat => {
                                if (chat.walletAddress === user.wallet_address.toLowerCase()) {
                                    chat.name = user.full_name || formatAddress(user.wallet_address);
                                    chat.avatarUrl = user.avatar_url;
                                }
                            });
                        });
                    }
                }

                if (uniqueRoomIds.length > 0) {
                    const { data: jobsData } = await supabase.from('jobs').select('id, title').in('id', uniqueRoomIds);
                    if (jobsData) {
                        jobsData.forEach(job => { if (historyMap.has(job.id)) { historyMap.get(job.id)!.jobTitle = job.title; } });
                    }
                }

                const arr = Array.from(historyMap.values()).sort((a, b) => b.timestamp - a.timestamp);
                setChatHistory(arr);

                const currentActiveId = activeRoomIdRef.current;
                
                if (!currentActiveId || (currentActiveId && closedRooms.has(currentActiveId))) {
                    if (arr.length > 0) {
                        setActiveRoomId(arr[0].roomId);
                        setActiveChatWallet(arr[0].walletAddress);
                    } else {
                        setActiveRoomId('');
                        setActiveChatWallet('');
                    }
                }
            }
        };

        fetchHistory();

        // Use polling to guarantee sidebar dots update even if realtime drops
        const intervalId = setInterval(fetchHistory, 3000);

        const sidebarChannel = supabase.channel('internal_sidebar_sync')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => fetchHistory())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'project_milestones' }, () => fetchHistory())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => fetchHistory())
            .subscribe();

        return () => {
            clearInterval(intervalId);
            supabase.removeChannel(sidebarChannel);
        };
    }, [walletAddress, activeRoomId]);

    // Handle new chat initiation from URL parameter (Admin panel -> Mail button)
    useEffect(() => {
        const initNewChat = async () => {
            const queryParams = new URLSearchParams(location.search);
            const newChatWallet = queryParams.get('newchat');
            
            if (newChatWallet && walletAddress) {
                const lowerWallet = walletAddress.toLowerCase();
                const lowerNewChat = newChatWallet.toLowerCase();
                
                if (lowerWallet !== lowerNewChat) {
                    const rId = [lowerWallet, lowerNewChat].sort().join('_');
                    
                    activeRoomIdRef.current = rId;
                    setActiveRoomId(rId);
                    setActiveChatWallet(lowerNewChat);
                    
                    // Clear the query parameter so refreshing doesn't trigger it again
                    navigate('/chat', { replace: true });

                    // Formalize in DB so global fetches pick it up
                    try {
                        const { data } = await supabase.from('messages').select('id').eq('room_id', rId).limit(1);
                        if (!data || data.length === 0) {
                            await supabase.from('messages').insert([{
                                content: `[System] Direct message conversation started.`,
                                sender_address: lowerWallet,
                                receiver_address: lowerNewChat,
                                room_id: rId
                            }]);
                        }
                    } catch (e) {
                         console.error("Failed to formalize new chat:", e);
                    }

                    // Ensure it appears in the sidebar history immediately
                    setChatHistory(prev => {
                        const exists = prev.some(c => c.roomId === rId);
                        if (!exists) {
                            return [{
                                roomId: rId,
                                walletAddress: lowerNewChat,
                                name: formatAddress(lowerNewChat),
                                lastMessage: 'Started Direct Message',
                                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                timestamp: Date.now(),
                                jobTitle: "Direct Message",
                                hasNotification: false
                            }, ...prev];
                        }
                        return prev;
                    });
                }
            }
        };
        initNewChat();
    }, [location.search, walletAddress, navigate]);

    // LOAD ACTIVE CHAT & AUTO-MARK AS READ
    useEffect(() => {
        if (!walletAddress || !activeRoomId || !activeChatWallet) return;
        const roomId = activeRoomId;
        const lowerWallet = walletAddress.toLowerCase();
        const lowerActiveChat = activeChatWallet.toLowerCase();

        const fetchData = async () => {
            setIsLoading(true);

            const isAdminUser = ADMIN_WALLETS.map(w => w.toLowerCase()).includes(lowerWallet);

            // INSTANT READ FIX: Mark all arriving messages in this room as read immediately
            if (!isAdminUser) {
                await supabase.from('messages')
                    .update({ is_read: true })
                    .eq('room_id', roomId)
                    .eq('receiver_address', lowerWallet)
                    .or('is_read.eq.false,is_read.is.null');
            }

            const msgQuery = roomId.includes('_')
                ? supabase.from('messages').select('*').or(`room_id.eq.${roomId},and(room_id.is.null,and(sender_address.in.("${lowerWallet}","${lowerActiveChat}"),receiver_address.in.("${lowerWallet}","${lowerActiveChat}")))`).order('created_at', { ascending: true })
                : supabase.from('messages').select('*').eq('room_id', roomId).order('created_at', { ascending: true });

            const msgQueryTarget = isAdminUser
                ? supabase.from('messages').select('*').eq('room_id', roomId).order('created_at', { ascending: true })
                : msgQuery;

            const [msgRes, filRes, milRes, notifRes] = await Promise.all([
                msgQueryTarget,
                supabase.from('project_files').select('*').eq('project_id', roomId),
                supabase.from('project_milestones').select('*').eq('project_id', roomId).order('due_date', { ascending: true }),
                supabase.from('notifications').select('*').eq('room_id', roomId).eq('wallet_address', lowerWallet).order('created_at', { ascending: false })
            ]);

            if (msgRes.data) {
                setMessages(msgRes.data);
                const contractMsg = msgRes.data.find((m: any) => m.content.includes("Contract Address: 0x"));
                let foundAddress = null;

                if (contractMsg) {
                    const match = contractMsg.content.match(/0x[a-fA-F0-9]{40}/);
                    if (match) { foundAddress = match[0]; setDeployedContractAddress(foundAddress); }
                }

                const completedMsg = msgRes.data.find((m: any) => m.content.includes("[System] Project Completed") || m.content.includes("[System] Contract Cancelled"));
                if (completedMsg) {
                    if (completedMsg.content.includes("Completed")) setIsProjectCompleted(true);
                    if (completedMsg.content.includes("Cancelled")) setIsContractCancelled(true);
                } else { setIsProjectCompleted(false); setIsContractCancelled(false); }
            }

            if (filRes.data) setFiles(filRes.data);
            if (milRes.data) setMilestones(milRes.data);
            if (notifRes.data) setNotifications(notifRes.data);
            setIsLoading(false);
            setTimeout(scrollToBottom, 100);
        };

        fetchData();

        // This causes the component to re-run fetchData (and the read-receipt update) when a new message arrives while watching the chat.
        const channelMsg = supabase.channel(`room_msg:${roomId}`).on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, fetchData).subscribe();
        const channelMil = supabase.channel(`room_mil:${roomId}`).on('postgres_changes', { event: '*', schema: 'public', table: 'project_milestones' }, fetchData).subscribe();
        const channelNot = supabase.channel(`room_not:${roomId}`).on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, fetchData).subscribe();

        return () => { supabase.removeChannel(channelMsg); supabase.removeChannel(channelMil); supabase.removeChannel(channelNot); };
    }, [walletAddress, activeRoomId, activeChatWallet, userRole]);

    const renderMessageContent = (content: string) => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const parts = content.split(urlRegex);
        return parts.map((part, i) => {
            if (part.match(urlRegex)) {
                return (<a key={i} href={part} target="_blank" rel="noopener noreferrer" className="mt-3 w-fit bg-black/10 hover:bg-black/20 border border-black/10 rounded-xl px-4 py-2 flex items-center justify-center gap-2 text-xs font-black transition-all"><FileText size={16} /> View Attached File</a>);
            }
            return <span key={i}>{part}</span>;
        });
    };

    const progress = milestones.length > 0 ? Math.round((milestones.filter(m => m.status === 'approved').length / milestones.length) * 100) : 0;

    const activeChatDetails = chatHistory.find(c => c.roomId === activeRoomId);
    const activeChatName = activeChatDetails?.name || formatAddress(activeChatWallet);

    return (
        <div className="flex h-[calc(100vh-80px)] bg-white overflow-hidden border-t border-zinc-100 relative">

            {isAppealModalOpen && activeMilestone && (
                <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black">Submit an Appeal</h3>
                            <button onClick={() => setIsAppealModalOpen(false)}><X size={20} /></button>
                        </div>
                        <p className="text-sm text-zinc-500 mb-6">The AI recommended approval, but the employer rejected it. Explain why your work meets the requirements. This will notify the Admin and start a 24-hour countdown.</p>
                        <form onSubmit={handleStartAppeal} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-zinc-900 mb-2 block">Reason for Appeal</label>
                                <textarea
                                    value={appealReason}
                                    onChange={e => setAppealReason(e.target.value)}
                                    placeholder="State your case..."
                                    className="w-full h-32 p-4 border rounded-xl resize-none outline-none focus:border-amber-500 bg-zinc-50"
                                    required
                                />
                            </div>
                            <button type="submit" disabled={isProcessingMilestone} className="w-full py-4 bg-amber-500 text-white rounded-xl font-black uppercase mt-4 flex justify-center gap-2 items-center hover:bg-amber-600 shadow-lg transition-all">
                                {isProcessingMilestone ? <Loader2 className="animate-spin" /> : "Send Appeal"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {isSubmitMilestoneOpen && activeMilestone && (
                <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] w-full max-w-md p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-black">Submit Work Off-Chain</h3><button onClick={() => setIsSubmitMilestoneOpen(false)}><X size={20} /></button></div>
                        <form onSubmit={handleMilestoneSubmit} className="space-y-4">
                            <p className="text-sm font-bold text-zinc-600 mb-2">Milestone: {activeMilestone.title}</p>
                            <textarea value={msNotes} onChange={e => setMsNotes(e.target.value)} placeholder="What did you complete?" className="w-full h-24 p-4 bg-zinc-50 border rounded-xl resize-none outline-none focus:border-brand-500" required />
                            <div className="p-4 border-2 border-dashed border-zinc-200 rounded-xl flex flex-col items-center gap-2">
                                <UploadCloud className="text-zinc-400" />
                                <input type="file" onChange={e => setMsFile(e.target.files?.[0] || null)} className="text-xs ml-10" />
                            </div>
                            <button type="submit" disabled={isProcessingMilestone} className="w-full py-4 bg-brand-600 text-white rounded-xl font-black uppercase">{isProcessingMilestone ? <Loader2 className="animate-spin mx-auto" /> : "Send Update"}</button>
                        </form>
                    </div>
                </div>
            )}

            {isReviewMilestoneOpen && activeMilestone && (
                <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                            <div><h3 className="text-xl font-black text-zinc-900">Review Delivery</h3><p className="text-xs font-bold text-zinc-500 mt-1">Milestone: {activeMilestone.title}</p></div>
                            <button onClick={() => { setIsReviewMilestoneOpen(false); setAiVerdict(null); }} className="p-2 hover:bg-zinc-200 rounded-full transition-all"><X size={20} /></button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-6">
                            <div className="flex justify-between items-center bg-zinc-50 p-4 rounded-2xl border border-zinc-100"><span className="text-xs font-black text-zinc-500 uppercase tracking-widest">Payout Amount</span><span className="text-lg font-black text-brand-600">{activeMilestone.amount} PAS</span></div>
                            <div><p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-2">Freelancer Notes</p><div className="p-4 bg-zinc-50 rounded-xl text-sm border border-zinc-100 whitespace-pre-wrap text-zinc-700">{activeMilestone.notes || "No notes provided."}</div></div>
                            {activeMilestone.file_url && (
                                <a href={activeMilestone.file_url} target="_blank" rel="noopener noreferrer" className="w-full py-4 bg-zinc-100 text-zinc-900 rounded-xl font-black uppercase text-xs flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all border border-zinc-200"><FileText size={16} /> Open Submitted File</a>
                            )}
                            
                            {userRole === 'employer' && activeMilestone.status === 'submitted' && (
                                <div className="border-t border-zinc-100 pt-6">
                                    <h4 className="text-sm font-black text-zinc-900 mb-3 flex items-center gap-2"><Bot size={18} className="text-brand-600" /> AI Agent Guide</h4>
                                    {!aiVerdict && !activeMilestone.ai_verdict ? (
                                        <div className="bg-indigo-50/50 border border-indigo-100 p-5 rounded-2xl text-center"><p className="text-xs text-indigo-900/70 mb-4 font-medium">Unsure if the code meets the requirements? Let the AI auditor verify the delivery before you release the funds.</p><button onClick={handleTriggerAIAudit} disabled={isTriggeringAI} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-black uppercase text-xs flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all">{isTriggeringAI ? <Loader2 className="animate-spin" /> : "Run Automated Code Audit"}</button></div>
                                    ) : (
                                        <div className={`p-5 rounded-2xl border ${isAiApproved(aiVerdict?.status) || isAiApproved(activeMilestone.ai_verdict) ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${isAiApproved(aiVerdict?.status) || isAiApproved(activeMilestone.ai_verdict) ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800'}`}>
                                                    Recommendation: {isAiApproved(aiVerdict?.status) || isAiApproved(activeMilestone.ai_verdict) ? 'APPROVE' : 'DISPUTE'}
                                                </span>
                                            </div>
                                            <p className="text-sm font-medium text-zinc-800 leading-relaxed mb-4">{aiVerdict?.reasoning || "AI evaluation complete."}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeMilestone.status === 'appealed' && activeMilestone.appeal_start_time && (
                                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col items-center">
                                    <Timer className="text-amber-500 mb-2" size={24} />
                                    <span className="text-xs font-black uppercase text-amber-600 tracking-widest">24-Hour Appeal Window Active</span>
                                    {(() => {
                                        const endTime = new Date(activeMilestone.appeal_start_time!).getTime() + 24 * 60 * 60 * 1000;
                                        const isDone = now > endTime;
                                        if (isDone) return <span className="text-sm font-bold text-red-500 mt-1">Appeal Period Expired. Admin intervention required.</span>;
                                        const diff = endTime - now;
                                        const h = Math.floor(diff / (1000 * 60 * 60));
                                        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                                        return <span className="text-sm font-bold text-amber-800 mt-1">{h}h {m}m remaining for Employer to review</span>;
                                    })()}
                                </div>
                            )}

                            {activeMilestone.status === 'escalated' && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex flex-col items-center">
                                    <AlertCircle className="text-red-500 mb-2" size={24} />
                                    <span className="text-xs font-black uppercase text-red-600 tracking-widest">Escalated to Admin</span>
                                    <span className="text-sm font-bold text-red-800 mt-1 text-center">The employer explicitly declined the appeal. Admin review is pending.</span>
                                </div>
                            )}
                        </div>

                        {userRole === 'admin' ? (
                            <div className="p-6 bg-amber-50 border-t border-amber-200">
                                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest text-center mb-3">Admin Dispute Resolution</p>
                                <div className="flex gap-3">
                                    <button onClick={handleAdminOverrideRefund} disabled={isProcessingMilestone} className="flex-1 py-4 bg-red-600 text-white rounded-xl font-black uppercase text-xs hover:bg-red-700 transition-all">Force Refund to Employer</button>
                                    <button onClick={handleAdminOverrideApprove} disabled={isProcessingMilestone} className="flex-1 py-4 bg-emerald-600 text-white rounded-xl font-black uppercase text-xs hover:bg-emerald-700 transition-all">Force Release to Freelancer</button>
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 bg-zinc-50 border-t border-zinc-100 flex flex-col gap-3">

                                {userRole === 'employer' && activeMilestone.status === 'submitted' && (
                                    <>
                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Employer Decision</p>
                                        <div className="flex gap-3">
                                            <button onClick={() => handleMilestoneReview('rejected')} disabled={isProcessingMilestone} className="flex-1 py-4 border-2 border-red-200 text-red-600 rounded-xl font-black uppercase text-xs hover:bg-red-50 hover:border-red-300 transition-all">Reject</button>
                                            <button onClick={() => handleMilestoneReview('approved')} disabled={isProcessingMilestone} className="flex-[2] py-4 bg-emerald-500 text-white rounded-xl font-black uppercase text-xs hover:bg-emerald-600 shadow-lg shadow-emerald-200 transition-all">Approve & Pay</button>
                                        </div>
                                    </>
                                )}

                                {userRole === 'employer' && activeMilestone.status === 'appealed' && (
                                    <>
                                        <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest text-center">Appeal Actions</p>
                                        <div className="flex gap-3">
                                            <button onClick={handleEscalateToAdmin} disabled={isProcessingMilestone} className="flex-1 py-4 border-2 border-red-200 text-red-600 rounded-xl font-black uppercase text-xs hover:bg-red-50 hover:border-red-300 transition-all">Decline & Escalate</button>
                                            <button onClick={() => handleMilestoneReview('approved')} disabled={isProcessingMilestone} className="flex-[2] py-4 bg-emerald-500 text-white rounded-xl font-black uppercase text-xs hover:bg-emerald-600 shadow-lg shadow-emerald-200 transition-all">Approve & Pay</button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="hidden lg:flex flex-col w-72 border-r bg-zinc-50/30">
                <div className="p-4 border-b bg-white flex justify-between items-center"><span className="font-black text-zinc-900 text-sm">Inbox</span><button onClick={() => setIsAddingChat(!isAddingChat)} className="p-1.5 hover:bg-zinc-100 rounded-lg text-brand-600"><Plus size={18} /></button></div>
                <div className="flex-1 overflow-y-auto">
                    {chatHistory.length === 0 ? (
                        <div className="p-8 flex flex-col items-center text-center text-zinc-400 mt-10">
                            <MessageSquare size={32} className="mb-3 opacity-20" />
                            <p className="text-xs font-bold">No active projects</p>
                            <p className="text-[10px] mt-1">When you stake or fund an escrow, the chat will appear here.</p>
                        </div>
                    ) : (
                        chatHistory.map(chat => {
                            const isActive = activeRoomId === chat.roomId;
                            const initials = chat.name.slice(0, 2).toUpperCase();
                            return (
                                <button key={chat.roomId} onClick={() => { setActiveRoomId(chat.roomId); setActiveChatWallet(chat.walletAddress); }}
                                    className={`w-full px-4 py-3.5 text-left flex items-center gap-3 transition-all relative ${
                                        isActive ? 'bg-brand-50 border-l-[3px] border-l-brand-500' : 'border-l-[3px] border-l-transparent hover:bg-zinc-50'
                                    }`}>
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black flex-shrink-0 overflow-hidden shadow-inner border border-zinc-200/50 ${
                                        isActive ? 'bg-brand-600 text-white border-brand-500' : 'bg-zinc-100 text-zinc-500'
                                    }`}>
                                        {chat.avatarUrl ? (
                                            <img src={chat.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            initials
                                        )}
                                    </div>
                                    {chat.hasNotification && (
                                        <span className="absolute left-10 top-2.5 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <p className={`text-xs font-black truncate ${isActive ? 'text-brand-700' : 'text-zinc-900'}`}>{chat.jobTitle || "Project Chat"}</p>
                                            <span className="text-[9px] text-zinc-400 font-medium ml-2 flex-shrink-0">{chat.time}</span>
                                        </div>
                                        <p className="text-[10px] font-bold text-zinc-500 truncate">{chat.name}</p>
                                        <p className="text-[10px] text-zinc-400 truncate mt-0.5">{chat.lastMessage}</p>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>

            <div className="flex-1 flex flex-col bg-white min-w-0 relative">
                {!activeRoomId ? (
                    <div className="flex-1 flex flex-col items-center justify-center bg-zinc-50/30 text-zinc-400">
                        <MessageSquare size={48} className="mb-4 opacity-20" />
                        <p className="font-bold text-zinc-500">No chat selected</p>
                        <p className="text-xs mt-2">Select an active project from the sidebar to start collaborating.</p>
                    </div>
                ) : (
                    <>
                        <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-white/90 backdrop-blur-md sticky top-0 z-10 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-brand-100 flex items-center justify-center text-sm font-black text-brand-700 flex-shrink-0 overflow-hidden shadow-inner border border-brand-200">
                                    {activeChatDetails?.avatarUrl ? (
                                        <img src={activeChatDetails.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                                    ) : (
                                         activeChatName.slice(0,2).toUpperCase()
                                    )}
                                </div>
                                <div>
                                    <p className="font-black text-zinc-900 text-sm leading-tight">{activeChatDetails?.jobTitle || "Project Chat"}</p>
                                    <p className="text-[10px] text-emerald-500 font-bold">● Active Project with {activeChatName}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-3" style={{ backgroundImage: 'radial-gradient(#e4e4e7 1px, transparent 1px)', backgroundSize: '24px 24px', backgroundColor: '#fafafa' }}>
                            {messages.filter(msg => !msg.content.startsWith('[System]')).map((msg, index, arr) => {
                                const isMine = msg.sender_address.toLowerCase() === walletAddress?.toLowerCase();
                                const isConsecutive = index > 0 && arr[index - 1].sender_address.toLowerCase() === msg.sender_address.toLowerCase();
                                return (
                                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                        {!isMine && (
                                            <div className="w-8 h-8 rounded-full bg-zinc-200 mr-2 flex-shrink-0 overflow-hidden flex items-center justify-center font-black text-[9px] text-zinc-500 border border-zinc-300">
                                                {activeChatDetails?.avatarUrl && !isConsecutive ? (
                                                    <img src={activeChatDetails.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                                ) : isConsecutive ? (
                                                    <span className="opacity-0">.</span>
                                                ) : (
                                                    activeChatName.charAt(0).toUpperCase()
                                                )}
                                            </div>
                                        )}
                                        <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-[70%]`}>
                                            {!isMine && !isConsecutive && (
                                                <span className="text-[10px] font-bold text-zinc-400 ml-1 mb-1">{activeChatName}</span>
                                            )}
                                            <div className={`px-4 py-3 rounded-[1.25rem] shadow-sm leading-relaxed ${
                                                isMine
                                                    ? 'bg-brand-600 text-white rounded-br-sm shadow-brand-500/10'
                                                    : 'bg-white border border-zinc-100 text-zinc-800 rounded-bl-sm'
                                            }`}>
                                                <div className="text-sm whitespace-pre-wrap break-words break-all">
                                                    {renderMessageContent(msg.content)}
                                                </div>
                                            </div>
                                            <span className="text-[9px] font-medium text-zinc-400 mt-1 mx-2">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {filePreview && !isProjectCompleted && !isContractCancelled && (
                            <div className="px-6 py-2 bg-zinc-50 border-t border-zinc-100 flex items-center gap-4">
                                <div className="relative w-12 h-12 bg-white border border-zinc-200 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {filePreview === 'file' ? <FileText size={20} className="text-zinc-400" /> : <img src={filePreview} alt="preview" className="object-cover w-full h-full" />}
                                    <button onClick={clearFileSelection} className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl-lg"><X size={10} /></button>
                                </div>
                                <p className="text-[10px] font-bold text-zinc-500 truncate flex-1">{selectedFile?.name}</p>
                            </div>
                        )}

                        {(isProjectCompleted || isContractCancelled) ? (
                            <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-center">
                                <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest">
                                    {isProjectCompleted ? "Project Completed. Chat Closed." : "Contract Cancelled. Chat Closed."}
                                </p>
                            </div>
                        ) : (
                            <div className="p-4 bg-white border-t border-zinc-100">
                                <form onSubmit={handleSendMessage} className="flex gap-2 max-w-4xl mx-auto items-end">
                                    <label className="p-3 bg-zinc-100 rounded-full cursor-pointer hover:bg-zinc-200 transition-all flex-shrink-0"><Paperclip size={18} /><input type="file" className="hidden" onChange={handleFileChange} disabled={isUploading || !activeRoomId} /></label>
                                    <textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="flex-1 p-3 bg-zinc-50 border border-zinc-200 rounded-2xl resize-none outline-none focus:bg-white focus:border-brand-500 transition-all shadow-inner" rows={1} />
                                    <button type="submit" disabled={isUploading} className="p-3 bg-brand-600 text-white rounded-full hover:bg-brand-700 shadow-lg transition-all flex-shrink-0">{isUploading ? <Loader2 className="animate-spin" /> : <Send size={18} />}</button>
                                </form>
                            </div>
                        )}
                    </>
                )}
            </div>

            {activeRoomId && (
                <div className="hidden xl:flex flex-col w-96 border-l bg-white p-6 space-y-8 overflow-y-auto">
                    {notifications.length > 0 && (
                        <div className="space-y-3 mb-6">
                            <h3 className="text-sm font-black text-zinc-900 flex items-center gap-2"><Bell size={16} className="text-brand-600" /> Recent Alerts</h3>
                            {notifications.map(n => (
                                <div key={n.id} className="relative bg-blue-50/80 border border-blue-100 p-4 rounded-2xl pr-8 shadow-sm group">
                                    <button onClick={() => dismissNotification(n.id)} className="absolute top-3 right-3 text-blue-300 hover:text-blue-600 transition-all opacity-0 group-hover:opacity-100"><X size={14}/></button>
                                    <p className="text-xs text-blue-900 font-medium leading-relaxed">{n.content}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    <h2 className="text-xl font-black text-zinc-900">Project Hub</h2>

                    <div className="bg-brand-50 border border-brand-100 rounded-[2rem] p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4"><ShieldCheck className="text-brand-600" size={20} /><h3 className="text-sm font-black text-brand-900">Smart Escrow</h3></div>
                        {!deployedContractAddress ? (
                            <>
                                {userRole === 'employer' ? (
                                    <p className="text-[10px] text-center font-bold text-zinc-400 uppercase tracking-widest">Awaiting Employer Funding</p>
                                ) : (
                                    <p className="text-[10px] text-center font-bold text-zinc-400 uppercase tracking-widest">Awaiting Employer Funding</p>
                                )}
                            </>
                        ) : isContractCancelled ? (
                            <div className="bg-red-50 text-red-700 p-3 rounded-xl border border-red-200 flex flex-col items-center justify-center gap-1">
                                <AlertCircle size={16} />
                                <span className="text-[10px] font-black uppercase">Contract Cancelled & Refunded</span>
                            </div>
                        ) : isProjectCompleted ? (
                            <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl border border-emerald-100 flex flex-col items-center justify-center gap-1">
                                <CheckCircle2 size={16} />
                                <span className="text-[10px] font-black uppercase">Project Successfully Completed</span>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {userRole === 'admin' && (
                                    <div className="bg-amber-100 text-amber-800 p-3 rounded-xl border border-amber-200 flex flex-col items-center justify-center gap-1">
                                        <AlertCircle size={16} /><span className="text-[10px] font-black uppercase">Admin Panel Access</span>
                                    </div>
                                )}
                                {userRole === 'freelancer' && (
                                    <>
                                        {!hasFreelancerStaked ? (
                                            <button onClick={handleFreelancerStake} disabled={isStaking} className="w-full py-3 bg-amber-500 text-white rounded-xl text-xs font-black uppercase shadow-lg hover:bg-amber-600 transition-all animate-pulse">
                                                {isStaking ? <Loader2 className="animate-spin mx-auto" /> : "Stake 5% Security Deposit"}
                                            </button>
                                        ) : (
                                            <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl border border-emerald-100 flex items-center justify-center gap-2"><CheckCircle2 size={16} /><span className="text-[10px] font-black uppercase">Funds Staked</span></div>
                                        )}
                                    </>
                                )}
                                {userRole === 'employer' && (
                                    <>
                                        <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl border border-emerald-100 flex flex-col items-center justify-center gap-1">
                                            <CheckCircle2 size={16} /><span className="text-[10px] font-black uppercase">Escrow Locked</span><span className="text-[9px] font-mono break-all">{formatAddress(deployedContractAddress)}</span>
                                        </div>

                                        {(() => {
                                            const pendingMilestone = milestones.find(m => m.status !== 'approved');
                                            if (!pendingMilestone) return null;

                                            const deadlineTime = new Date(pendingMilestone.due_date).getTime();
                                            const isFiveDaysLate = Date.now() > deadlineTime + (5 * 24 * 60 * 60 * 1000);

                                            if (hasFreelancerStaked && !isFiveDaysLate) return null;

                                            return (
                                                <div className="mt-4 border-t border-zinc-100 pt-4">
                                                    {!hasFreelancerStaked ? (
                                                        <button onClick={handleClaimRefund} disabled={isProcessingMilestone} className="w-full py-2 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-red-700 transition-all">Cancel (No Stake Yet)</button>
                                                    ) : (
                                                        <button onClick={handleClaimRefund} disabled={isProcessingMilestone} className="w-full py-2 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-red-700 transition-all shadow-md animate-pulse">Claim Late Refund</button>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-black text-zinc-900 flex items-center gap-2"><Calendar size={16} className="text-brand-600"/> Milestones</h3>

                        <div className="space-y-3">
                            {milestones.length === 0 && <p className="text-[10px] text-zinc-400 text-center py-4 border-2 border-dashed border-zinc-100 rounded-2xl">No milestones set</p>}
                            {milestones.map((m, index) => {
                                const isAttentionNeeded = (userRole === 'employer' && (m.status === 'submitted' || m.status === 'appealed')) ||
                                    (userRole === 'freelancer' && m.status === 'rejected') ||
                                    (userRole === 'admin' && (m.status === 'appealed' || m.status === 'escalated'));

                                return (
                                    <div key={m.id} className={`p-4 border rounded-2xl transition-all ${m.status === 'approved' ? 'bg-emerald-50 border-emerald-100' : isAttentionNeeded && !isContractCancelled && !isProjectCompleted ? 'bg-amber-50 border-amber-300 shadow-md animate-pulse' : 'bg-white border-zinc-200'}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="text-xs font-black text-zinc-900 leading-tight">{index + 1}. {m.title}</p>
                                            {m.status === 'pending' && <span className="text-[9px] font-bold px-2 py-1 bg-zinc-100 text-zinc-500 rounded-full flex items-center gap-1"><Clock size={10}/> Pending</span>}
                                            {m.status === 'submitted' && <span className="text-[9px] font-bold px-2 py-1 bg-blue-50 text-blue-600 rounded-full">Review</span>}
                                            {m.status === 'approved' && <span className="text-[9px] font-bold px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full flex items-center gap-1"><CheckCircle2 size={10}/> Done</span>}
                                            {m.status === 'rejected' && <span className="text-[9px] font-bold px-2 py-1 bg-red-50 text-red-600 rounded-full flex items-center gap-1"><AlertCircle size={10}/> Revise</span>}
                                            {m.status === 'appealed' && <span className="text-[9px] font-bold px-2 py-1 bg-amber-100 text-amber-700 rounded-full flex items-center gap-1"><Timer size={10}/> Appealed</span>}
                                            {m.status === 'escalated' && <span className="text-[9px] font-bold px-2 py-1 bg-red-100 text-red-700 rounded-full flex items-center gap-1"><AlertCircle size={10}/> Admin</span>}
                                        </div>
                                        <div className="flex justify-between items-center mb-3">
                                            <p className="text-[10px] text-zinc-500">Due: {new Date(m.due_date).toLocaleDateString()}</p>
                                            <span className="text-[10px] font-black text-brand-600">{m.amount} PAS</span>
                                        </div>

                                        {userRole === 'freelancer' && m.status === 'pending' && !isContractCancelled && !isProjectCompleted && (
                                            <button onClick={() => { setActiveMilestone(m); setIsSubmitMilestoneOpen(true); }} disabled={!hasFreelancerStaked} className="w-full py-2 bg-zinc-900 text-white rounded-xl text-[10px] font-black uppercase hover:bg-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                                {!hasFreelancerStaked ? "Stake 5% to Unlock" : "Submit Work"}
                                            </button>
                                        )}

                                        {userRole === 'freelancer' && m.status === 'rejected' && !isContractCancelled && !isProjectCompleted && (
                                            <div className="flex gap-2">
                                                <button onClick={() => { setActiveMilestone(m); setIsSubmitMilestoneOpen(true); }} className="flex-1 py-2 border-2 border-zinc-200 text-zinc-700 rounded-xl text-[10px] font-black uppercase hover:bg-zinc-50 transition-all">
                                                    Resubmit Work
                                                </button>
                                                {isAiApproved(m.ai_verdict) && (
                                                    <button onClick={() => { setActiveMilestone(m); setIsAppealModalOpen(true); }} className="flex-1 py-2 bg-amber-500 text-white rounded-xl text-[10px] font-black uppercase hover:bg-amber-600 transition-all shadow-md animate-pulse">
                                                        Appeal
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        {userRole === 'employer' && (m.status === 'submitted' || m.status === 'appealed') && !isContractCancelled && !isProjectCompleted && (
                                            <button onClick={() => { setActiveMilestone(m); setIsReviewMilestoneOpen(true); }} className="w-full py-2 bg-brand-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-brand-700 transition-all shadow-md">Review Action Needed</button>
                                        )}
                                        {userRole === 'admin' && (m.status === 'appealed' || m.status === 'escalated' || m.status === 'submitted') && !isContractCancelled && !isProjectCompleted && (
                                            <button onClick={() => { setActiveMilestone(m); setIsReviewMilestoneOpen(true); }} className="w-full py-2 bg-amber-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-amber-700 transition-all shadow-md">Admin Resolution Panel</button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {(!isProjectCompleted && !isContractCancelled) && (userRole === 'admin' || (progress === 100 && userRole === 'employer')) && (
                            <div className="pt-4 border-t border-zinc-100 mt-4">
                                <button onClick={handleCompleteProject} disabled={isProcessingMilestone} className={`w-full py-3 text-white rounded-xl text-xs font-black uppercase transition-all shadow-lg ${userRole === 'admin' ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 'bg-zinc-900 hover:bg-zinc-800 shadow-zinc-200'}`}>
                                    {isProcessingMilestone ? <Loader2 className="animate-spin mx-auto" /> : (userRole === 'admin' ? "Force Close Project & Chat" : "Complete Project & Close Chat")}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};