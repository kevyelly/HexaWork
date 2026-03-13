import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, MessageSquare, FileText, CheckCircle2, Paperclip, X, Plus, ShieldCheck, Coins, UploadCloud, UserCircle, Bot, Calendar, Clock, AlertCircle, Bell } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useWallet } from '../lib/WalletContext';
import { ethers } from 'ethers';

import { ESCROW_ABI, ESCROW_BYTECODE } from '../lib/escrowContract';

interface Message { id: string; content: string; sender_address: string; receiver_address: string; created_at: string; }
interface Notification { id: string; content: string; wallet_address: string; room_id: string; created_at: string; }
interface ChatHistory { walletAddress: string; name: string; lastMessage: string; time: string; timestamp: number; }
interface Milestone { id: string; project_id: string; title: string; status: 'pending' | 'submitted' | 'approved' | 'rejected'; due_date: string; amount?: string; duration_days?: string; notes?: string; file_url?: string; created_at: string; }
interface ProjectFile { id: string; file_name: string; file_size: string; file_url?: string; }

export const ProjectChatView: React.FC = () => {
    const { walletAddress } = useWallet();
    const [messages, setMessages] = useState<Message[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
    const [activeChatWallet, setActiveChatWallet] = useState<string>('');
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const [userRole, setUserRole] = useState<'employer' | 'freelancer' | 'viewer'>('viewer');
    const [hasFreelancerStaked, setHasFreelancerStaked] = useState(false);
    const [isContractCancelled, setIsContractCancelled] = useState(false);
    const [isProjectCompleted, setIsProjectCompleted] = useState(false);

    const [isFundModalOpen, setIsFundModalOpen] = useState(false);
    const [isSubmitMilestoneOpen, setIsSubmitMilestoneOpen] = useState(false);
    const [isReviewMilestoneOpen, setIsReviewMilestoneOpen] = useState(false);
    const [activeMilestone, setActiveMilestone] = useState<Milestone | null>(null);

    const [msNotes, setMsNotes] = useState('');
    const [msFile, setMsFile] = useState<File | null>(null);
    const [isProcessingMilestone, setIsProcessingMilestone] = useState(false);

    const [isTriggeringAI, setIsTriggeringAI] = useState(false);
    const [aiVerdict, setAiVerdict] = useState<{status: string, reasoning: string} | null>(null);

    const [isDeploying, setIsDeploying] = useState(false);
    const [deployedContractAddress, setDeployedContractAddress] = useState<string | null>(null);
    const [isStaking, setIsStaking] = useState(false);

    const [isAddingChat, setIsAddingChat] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);

    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [files, setFiles] = useState<ProjectFile[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    const formatAddress = (addr: string) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';

    const getRoomId = () => {
        if (!walletAddress || !activeChatWallet) return '';
        return [walletAddress.toLowerCase(), activeChatWallet.toLowerCase()].sort().join('_');
    };

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
                    contract.employer(), contract.freelancer(), contract.freelancerFunded(), contract.contractCancelled()
                ]);
                if (walletAddress.toLowerCase() === employerAddr.toLowerCase()) setUserRole('employer');
                else if (walletAddress.toLowerCase() === freelancerAddr.toLowerCase()) setUserRole('freelancer');
                else setUserRole('viewer');

                setHasFreelancerStaked(isFunded);
                setIsContractCancelled(isCancelled);
            } catch (e) { console.error(e); }
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

    const handleDeployEscrow = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!window.ethereum || !activeChatWallet) return;
        if (milestones.length === 0) return alert("You must define milestones before funding the escrow.");

        try {
            setIsDeploying(true);
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            const milestoneAmountsInWei = milestones.map(m => ethers.parseEther(m.amount?.toString() || "0"));
            const durationDaysArray = milestones.map(m => parseInt(m.duration_days?.toString() || "7"));
            const totalWei = milestoneAmountsInWei.reduce((a, b) => a + b, 0n);

            const factory = new ethers.ContractFactory(ESCROW_ABI, ESCROW_BYTECODE, signer);
            const contract = await factory.deploy(activeChatWallet, milestoneAmountsInWei, durationDaysArray, { value: totalWei, gasLimit: 3000000 });

            await contract.waitForDeployment();
            const address = await contract.getAddress();
            setDeployedContractAddress(address);
            setIsFundModalOpen(false);

            await supabase.from('messages').insert([{ content: `[System] Escrow Funded! Contract Address: ${address}`, sender_address: walletAddress, receiver_address: activeChatWallet }]);

            await supabase.from('notifications').insert([
                { room_id: getRoomId(), wallet_address: walletAddress, content: `Escrow successfully funded with ${ethers.formatEther(totalWei)} PAS. Contract is now active.` },
                { room_id: getRoomId(), wallet_address: activeChatWallet, content: `Escrow Funded by Employer. You must now stake your 5% security deposit to begin working.` }
            ]);
        } catch (error) { console.error(error); alert("Deployment failed."); } finally { setIsDeploying(false); }
    };

    const handleFreelancerStake = async () => {
        if (!window.ethereum || !deployedContractAddress) return;
        try {
            setIsStaking(true);
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(deployedContractAddress, ESCROW_ABI, signer);
            const stakeAmount = await contract.freelancerStake();
            const tx = await contract.stakeFreelancer({ value: stakeAmount, gasLimit: 300000 });
            await tx.wait();

            setHasFreelancerStaked(true);

            await supabase.from('notifications').insert([
                { room_id: getRoomId(), wallet_address: activeChatWallet, content: `The freelancer has successfully staked their 5%. Work can now begin.` },
                { room_id: getRoomId(), wallet_address: walletAddress, content: `You have staked your 5%. You can now submit milestones.` }
            ]);

            alert("Stake successful. You can now start submitting work.");
        } catch (error: any) { console.error(error); alert("Stake failed."); } finally { setIsStaking(false); }
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
            await tx.wait();

            setIsContractCancelled(true);

            await supabase.from('notifications').insert([
                { room_id: getRoomId(), wallet_address: activeChatWallet, content: `Employer claimed a refund due to a missed deadline. Project closed.` }
            ]);

            alert("Refund successful. Remaining funds are back in your wallet.");
        } catch (error: any) {
            console.error(error);
            alert(`Refund failed: ${error.reason || error.message}`);
        } finally { setIsProcessingMilestone(false); }
    };

    const handleMilestoneSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeMilestone || !msNotes) return;
        setIsProcessingMilestone(true);
        try {
            let publicUrl = null;
            if (msFile) {
                const filePath = `${getRoomId()}/milestones/${Date.now()}_${msFile.name}`;
                const { error: uploadError } = await supabase.storage.from('project-files').upload(filePath, msFile);
                if (uploadError) throw uploadError;
                const { data } = supabase.storage.from('project-files').getPublicUrl(filePath);
                publicUrl = data.publicUrl;

                await supabase.from('project_files').insert([{
                    project_id: getRoomId(),
                    file_name: msFile.name,
                    file_size: `${(msFile.size / (1024 * 1024)).toFixed(2)} MB`,
                    file_url: publicUrl
                }]);
            }

            const { error: updateError } = await supabase.from('project_milestones').update({
                status: 'submitted',
                notes: msNotes,
                file_url: publicUrl
            }).eq('id', activeMilestone.id);
            if (updateError) throw updateError;

            setMilestones(prev => prev.map(m => m.id === activeMilestone.id ? { ...m, status: 'submitted', notes: msNotes, file_url: publicUrl || m.file_url } : m));
            setIsSubmitMilestoneOpen(false); setMsNotes(''); setMsFile(null);

            await supabase.from('notifications').insert([
                { room_id: getRoomId(), wallet_address: activeChatWallet, content: `Action Required: Freelancer submitted delivery for '${activeMilestone.title}'. Please review.` }
            ]);

            alert("Work submitted successfully.");
        } catch (error: any) {
            console.error(error);
            alert(`Submit failed: ${error.message}`);
        } finally { setIsProcessingMilestone(false); }
    };

    const handleTriggerAIAudit = async () => {
        if (!activeMilestone || !activeMilestone.file_url) return alert("No file attached to audit.");
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
                await tx.wait();
            }

            const { error: updateError } = await supabase.from('project_milestones').update({ status }).eq('id', activeMilestone.id);
            if (updateError) throw updateError;
            setMilestones(prev => prev.map(m => m.id === activeMilestone.id ? { ...m, status } : m));

            setIsReviewMilestoneOpen(false);
            setAiVerdict(null);

            await supabase.from('notifications').insert([
                { room_id: getRoomId(), wallet_address: activeChatWallet, content: status === 'approved' ? `Milestone '${activeMilestone.title}' Approved. Funds have been released.` : `Milestone '${activeMilestone.title}' Disputed. Please check your dashboard to revise.` }
            ]);

            alert(status === 'approved' ? "Funds released successfully." : "Milestone disputed. Freelancer has been notified.");
        } catch (error: any) {
            console.error(error);
            alert(`Review action failed: ${error.reason || error.message}`);
        } finally { setIsProcessingMilestone(false); }
    };

    const handleCompleteProject = async () => {
        if (!window.confirm("Are you sure you want to complete the project and close the chat?")) return;
        setIsProcessingMilestone(true);
        try {
            await supabase.from('messages').insert([{
                content: `[System] Project Completed`,
                sender_address: walletAddress,
                receiver_address: activeChatWallet
            }]);

            await supabase.from('notifications').insert([{
                room_id: getRoomId(),
                wallet_address: activeChatWallet,
                content: `Project completed. Thank you for your hard work. The employer has officially closed this contract.`
            }]);

            setIsProjectCompleted(true);
        } catch (error) {
            console.error(error);
            alert("Failed to complete project.");
        } finally { setIsProcessingMilestone(false); }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeChatWallet) return alert("There are no chats registered.");
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
                await supabase.from('messages').insert([{ content: `${content}\n${publicUrl}`, sender_address: walletAddress, receiver_address: activeChatWallet }]);
            } else {
                await supabase.from('messages').insert([{ content, sender_address: walletAddress, receiver_address: activeChatWallet }]);
            }
            setNewMessage(''); clearFileSelection();
        } catch (error) { console.error(error); } finally { setIsUploading(false); }
    };

    // UPDATED: Fetch user profiles along with the chat history
    useEffect(() => {
        if (!walletAddress) return;
        const fetchHistory = async () => {
            const { data } = await supabase.from('messages').select('*').or(`sender_address.eq.${walletAddress},receiver_address.eq.${walletAddress}`).order('created_at', { ascending: false });
            if (data) {
                const historyMap = new Map<string, ChatHistory>();

                data.forEach((msg: Message) => {
                    const other = msg.sender_address === walletAddress ? msg.receiver_address : msg.sender_address;
                    if (!historyMap.has(other)) {
                        historyMap.set(other, {
                            walletAddress: other,
                            name: formatAddress(other),
                            lastMessage: msg.content.startsWith('[System]') ? "System Event Logged" : msg.content,
                            time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            timestamp: new Date(msg.created_at).getTime()
                        });
                    }
                });

                const uniqueWallets = Array.from(historyMap.keys());

                if (uniqueWallets.length > 0) {
                    const { data: usersData } = await supabase.from('users').select('wallet_address, full_name').in('wallet_address', uniqueWallets);
                    if (usersData) {
                        usersData.forEach(user => {
                            const chat = historyMap.get(user.wallet_address);
                            if (chat) {
                                chat.name = user.full_name || formatAddress(user.wallet_address);
                            }
                        });
                    }
                }

                const arr = Array.from(historyMap.values()).sort((a, b) => b.timestamp - a.timestamp);
                setChatHistory(arr);
                if (arr.length > 0 && !activeChatWallet) setActiveChatWallet(arr[0].walletAddress);
            }
        };
        fetchHistory();
    }, [walletAddress]);

    useEffect(() => {
        if (!walletAddress || !activeChatWallet) return;
        const roomId = getRoomId();

        const fetchData = async () => {
            setIsLoading(true);
            const [msgRes, filRes, milRes, notifRes] = await Promise.all([
                supabase.from('messages').select('*').or(`and(sender_address.eq.${walletAddress},receiver_address.eq.${activeChatWallet}),and(sender_address.eq.${activeChatWallet},receiver_address.eq.${walletAddress})`).order('created_at', { ascending: true }),
                supabase.from('project_files').select('*').eq('project_id', roomId),
                supabase.from('project_milestones').select('*').eq('project_id', roomId).order('due_date', { ascending: true }),
                supabase.from('notifications').select('*').eq('room_id', roomId).eq('wallet_address', walletAddress).order('created_at', { ascending: false })
            ]);

            if (msgRes.data) {
                setMessages(msgRes.data);
                const contractMsg = msgRes.data.find((m: any) => m.content.includes("Contract Address: 0x"));
                let foundAddress = null;

                if (contractMsg) {
                    const match = contractMsg.content.match(/0x[a-fA-F0-9]{40}/);
                    if (match) {
                        foundAddress = match[0];
                        setDeployedContractAddress(foundAddress);
                    }
                }

                if (!foundAddress) {
                    const acceptMsg = msgRes.data.find((m: any) => m.content.includes("[System] Contract Finalized!"));
                    if (acceptMsg) {
                        setUserRole(walletAddress.toLowerCase() === acceptMsg.sender_address.toLowerCase() ? 'employer' : 'freelancer');
                    }
                }

                const completedMsg = msgRes.data.find((m: any) => m.content === "[System] Project Completed");
                setIsProjectCompleted(!!completedMsg);
            }

            if (filRes.data) setFiles(filRes.data);
            if (milRes.data) setMilestones(milRes.data);
            if (notifRes.data) setNotifications(notifRes.data);
            setIsLoading(false);
            setTimeout(scrollToBottom, 100);
        };

        fetchData();
        const channelMsg = supabase.channel(`room_msg:${roomId}`).on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, fetchData).subscribe();
        const channelMil = supabase.channel(`room_mil:${roomId}`).on('postgres_changes', { event: '*', schema: 'public', table: 'project_milestones' }, fetchData).subscribe();
        const channelNot = supabase.channel(`room_not:${roomId}`).on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, fetchData).subscribe();
        return () => { supabase.removeChannel(channelMsg); supabase.removeChannel(channelMil); supabase.removeChannel(channelNot); };
    }, [walletAddress, activeChatWallet]);

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

    const activeChatDetails = chatHistory.find(c => c.walletAddress === activeChatWallet);
    const activeChatName = activeChatDetails?.name || formatAddress(activeChatWallet) || 'Select a chat';

    return (
        <div className="flex h-[calc(100vh-80px)] bg-white overflow-hidden border-t border-zinc-100 relative">
            {isFundModalOpen && (
                <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl text-center">
                        <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-black">Deploy Escrow</h3><button onClick={() => setIsFundModalOpen(false)}><X size={20} /></button></div>
                        <Coins size={40} className="text-brand-600 mx-auto mb-4" />
                        <p className="text-sm text-zinc-600 mb-6">You are about to lock funds into the Polkadot Hub EVM contract for the defined milestones.</p>
                        <button onClick={handleDeployEscrow} disabled={isDeploying} className="w-full py-4 bg-brand-600 text-white rounded-xl font-black uppercase">{isDeploying ? <Loader2 className="animate-spin mx-auto" /> : "Deploy & Fund Escrow"}</button>
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
                            <div className="border-t border-zinc-100 pt-6">
                                <h4 className="text-sm font-black text-zinc-900 mb-3 flex items-center gap-2"><Bot size={18} className="text-brand-600" /> AI Agent Guide</h4>
                                {!aiVerdict ? (
                                    <div className="bg-indigo-50/50 border border-indigo-100 p-5 rounded-2xl text-center"><p className="text-xs text-indigo-900/70 mb-4 font-medium">Unsure if the code meets the requirements? Let the AI auditor verify the delivery before you release the funds.</p><button onClick={handleTriggerAIAudit} disabled={isTriggeringAI} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-black uppercase text-xs flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all">{isTriggeringAI ? <Loader2 className="animate-spin" /> : "Run Automated Code Audit"}</button></div>
                                ) : (
                                    <div className={`p-5 rounded-2xl border ${aiVerdict.status === 'RELEASE' ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}><div className="flex items-center gap-2 mb-2"><span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${aiVerdict.status === 'RELEASE' ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800'}`}>Recommendation: {aiVerdict.status === 'RELEASE' ? 'APPROVE' : 'DISPUTE'}</span></div><p className="text-sm font-medium text-zinc-800 leading-relaxed mb-4">{aiVerdict.reasoning}</p><p className="text-[10px] text-zinc-500 font-bold">* This is an automated suggestion. You have the final decision.</p></div>
                                )}
                            </div>
                        </div>
                        <div className="p-6 bg-zinc-50 border-t border-zinc-100">
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center mb-3">Final Employer Decision</p>
                            <div className="flex gap-3">
                                <button onClick={() => handleMilestoneReview('rejected')} disabled={isProcessingMilestone} className="flex-1 py-4 border-2 border-red-200 text-red-600 rounded-xl font-black uppercase text-xs hover:bg-red-50 hover:border-red-300 transition-all">Reject & Dispute</button>
                                <button onClick={() => handleMilestoneReview('approved')} disabled={isProcessingMilestone} className="flex-[2] py-4 bg-emerald-500 text-white rounded-xl font-black uppercase text-xs hover:bg-emerald-600 shadow-lg shadow-emerald-200 transition-all">Approve & Pay</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="hidden lg:flex flex-col w-72 border-r bg-zinc-50/30">
                <div className="p-4 border-b bg-white flex justify-between items-center"><span className="font-black text-zinc-900 text-sm">Inbox</span><button onClick={() => setIsAddingChat(!isAddingChat)} className="p-1.5 hover:bg-zinc-100 rounded-lg text-brand-600"><Plus size={18} /></button></div>
                <div className="flex-1 overflow-y-auto">
                    {chatHistory.map(chat => (
                        <button key={chat.walletAddress} onClick={() => setActiveChatWallet(chat.walletAddress)} className={`w-full p-4 text-left border-b flex items-center gap-3 ${activeChatWallet === chat.walletAddress ? 'bg-white border-l-4 border-l-brand-500 shadow-sm' : 'hover:bg-zinc-100/50'}`}>
                            <UserCircle className="text-zinc-400 flex-shrink-0" size={24} />
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-black text-zinc-900 truncate">{chat.name}</p>
                                <p className="text-[10px] text-zinc-400 truncate mt-1">{chat.lastMessage}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 flex flex-col bg-white min-w-0 relative">
                <div className="p-4 border-b font-black flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10">
                    <span className="text-zinc-900">{activeChatName}</span>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-zinc-50/20">
                    {messages.filter(msg => !msg.content.startsWith('[System]')).map(msg => (
                        <div key={msg.id} className={`flex ${msg.sender_address === walletAddress ? 'justify-end' : 'justify-start'}`}>
                            <div className={`p-4 rounded-3xl max-w-[80%] overflow-hidden ${msg.sender_address === walletAddress ? 'bg-brand-600 text-white rounded-tr-sm shadow-lg' : 'bg-white border text-zinc-800 rounded-tl-sm shadow-sm'}`}>
                                <div className="text-sm whitespace-pre-wrap break-words break-all leading-relaxed">
                                    {renderMessageContent(msg.content)}
                                </div>
                            </div>
                        </div>
                    ))}
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
                            <label className="p-3 bg-zinc-100 rounded-full cursor-pointer hover:bg-zinc-200 transition-all flex-shrink-0"><Paperclip size={18} /><input type="file" className="hidden" onChange={handleFileChange} disabled={isUploading || !activeChatWallet} /></label>
                            <textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="flex-1 p-3 bg-zinc-50 border border-zinc-200 rounded-2xl resize-none outline-none focus:bg-white focus:border-brand-500 transition-all shadow-inner" rows={1} />
                            <button type="submit" disabled={isUploading} className="p-3 bg-brand-600 text-white rounded-full hover:bg-brand-700 shadow-lg transition-all flex-shrink-0">{isUploading ? <Loader2 className="animate-spin" /> : <Send size={18} />}</button>
                        </form>
                    </div>
                )}
            </div>

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
                                <button onClick={() => setIsFundModalOpen(true)} className="w-full py-3 bg-zinc-900 text-white rounded-xl text-xs font-black uppercase shadow-lg hover:bg-zinc-800 transition-all"><Coins size={16} className="inline mr-2" /> Fund Contract</button>
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
                            const isAttentionNeeded = (userRole === 'employer' && m.status === 'submitted') || (userRole === 'freelancer' && m.status === 'rejected');

                            return (
                                <div key={m.id} className={`p-4 border rounded-2xl transition-all ${m.status === 'approved' ? 'bg-emerald-50 border-emerald-100' : isAttentionNeeded && !isContractCancelled && !isProjectCompleted ? 'bg-amber-50 border-amber-300 shadow-md animate-pulse' : 'bg-white border-zinc-200'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-xs font-black text-zinc-900 leading-tight">{index + 1}. {m.title}</p>
                                        {m.status === 'pending' && <span className="text-[9px] font-bold px-2 py-1 bg-zinc-100 text-zinc-500 rounded-full flex items-center gap-1"><Clock size={10}/> Pending</span>}
                                        {m.status === 'submitted' && <span className="text-[9px] font-bold px-2 py-1 bg-blue-50 text-blue-600 rounded-full">Review</span>}
                                        {m.status === 'approved' && <span className="text-[9px] font-bold px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full flex items-center gap-1"><CheckCircle2 size={10}/> Done</span>}
                                        {m.status === 'rejected' && <span className="text-[9px] font-bold px-2 py-1 bg-red-50 text-red-600 rounded-full flex items-center gap-1"><AlertCircle size={10}/> Revise</span>}
                                    </div>
                                    <div className="flex justify-between items-center mb-3">
                                        <p className="text-[10px] text-zinc-500">Due: {new Date(m.due_date).toLocaleDateString()}</p>
                                        <span className="text-[10px] font-black text-brand-600">{m.amount} PAS</span>
                                    </div>

                                    {userRole === 'freelancer' && (m.status === 'pending' || m.status === 'rejected') && !isContractCancelled && !isProjectCompleted && (
                                        <button onClick={() => { setActiveMilestone(m); setIsSubmitMilestoneOpen(true); }} disabled={!hasFreelancerStaked} className="w-full py-2 bg-zinc-900 text-white rounded-xl text-[10px] font-black uppercase hover:bg-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                            {!hasFreelancerStaked ? "Stake 5% to Unlock" : "Submit Work"}
                                        </button>
                                    )}
                                    {userRole === 'employer' && m.status === 'submitted' && !isContractCancelled && !isProjectCompleted && (
                                        <button onClick={() => { setActiveMilestone(m); setIsReviewMilestoneOpen(true); }} className="w-full py-2 bg-brand-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-brand-700 transition-all shadow-md">Review Action Needed</button>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {progress === 100 && !isProjectCompleted && userRole === 'employer' && (
                        <div className="pt-4 border-t border-zinc-100 mt-4">
                            <button onClick={handleCompleteProject} disabled={isProcessingMilestone} className="w-full py-3 bg-zinc-900 text-white rounded-xl text-xs font-black uppercase hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200">
                                {isProcessingMilestone ? <Loader2 className="animate-spin mx-auto" /> : "Complete Project & Close Chat"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};