import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Wallet, MessageSquare, FileText, CheckCircle2, Circle, Paperclip, X, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useWallet } from '../lib/WalletContext';

interface Message { id: string; content: string; sender_address: string; receiver_address: string; created_at: string; }
interface ChatHistory { walletAddress: string; lastMessage: string; time: string; timestamp: number; }
interface Milestone { id: string; title: string; status: string; due_date: string; }
interface ProjectFile { id: string; file_name: string; file_size: string; file_url?: string; }

export const ProjectChatView: React.FC = () => {
    const { walletAddress } = useWallet();
    const [messages, setMessages] = useState<Message[]>([]);
    const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
    const [activeChatWallet, setActiveChatWallet] = useState<string>('');
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const [isAddingChat, setIsAddingChat] = useState(false);
    const [newWalletInput, setNewWalletInput] = useState('');
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            if (file.type.startsWith('image/')) {
                setFilePreview(URL.createObjectURL(file));
            } else {
                setFilePreview('file');
            }
        }
    };

    const clearFileSelection = () => {
        setSelectedFile(null);
        setFilePreview(null);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!newMessage.trim() && !selectedFile) || !walletAddress || !activeChatWallet) return;

        const roomId = getRoomId();
        const content = newMessage.trim() || `Sent a file: ${selectedFile?.name}`;

        const tempId = Math.random().toString();
        const optimisticMsg: Message = {
            id: tempId,
            content,
            sender_address: walletAddress,
            receiver_address: activeChatWallet,
            created_at: new Date().toISOString()
        };

        setMessages(prev => [...prev, optimisticMsg]);
        setNewMessage('');
        clearFileSelection();
        setTimeout(scrollToBottom, 10);

        try {
            if (selectedFile) {
                setIsUploading(true);
                const filePath = `${roomId}/${Date.now()}.${selectedFile.name.split('.').pop()}`;
                const { error: uploadErr } = await supabase.storage.from('project-files').upload(filePath, selectedFile);
                if (uploadErr) throw uploadErr;

                const { data: { publicUrl } } = supabase.storage.from('project-files').getPublicUrl(filePath);
                await supabase.from('project_files').insert([{
                    project_id: roomId,
                    file_name: selectedFile.name,
                    file_size: `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`,
                    file_url: publicUrl
                }]);
            }

            const { error } = await supabase.from('messages').insert([{
                content,
                sender_address: walletAddress,
                receiver_address: activeChatWallet
            }]);
            if (error) throw error;
        } catch (error) {
            setMessages(prev => prev.filter(m => m.id !== tempId));
            console.error(error);
        } finally {
            setIsUploading(false);
        }
    };

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
                            lastMessage: msg.content,
                            time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            timestamp: new Date(msg.created_at).getTime()
                        });
                    }
                });
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
            const [msgRes, milRes, filRes] = await Promise.all([
                supabase.from('messages').select('*').or(`and(sender_address.eq.${walletAddress},receiver_address.eq.${activeChatWallet}),and(sender_address.eq.${activeChatWallet},receiver_address.eq.${walletAddress})`).order('created_at', { ascending: true }),
                supabase.from('project_milestones').select('*').eq('project_id', roomId).order('created_at', { ascending: true }),
                supabase.from('project_files').select('*').eq('project_id', roomId)
            ]);
            if (msgRes.data) setMessages(msgRes.data);
            if (milRes.data) setMilestones(milRes.data);
            if (filRes.data) setFiles(filRes.data);
            setIsLoading(false);
            setTimeout(scrollToBottom, 100);
        };
        fetchData();
        const channel = supabase.channel(`room:${roomId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, fetchData)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'project_milestones' }, fetchData)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'project_files' }, fetchData)
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [walletAddress, activeChatWallet]);

    const progress = milestones.length > 0 ? Math.round((milestones.filter(m => m.status === 'completed').length / milestones.length) * 100) : 0;

    return (
        <div className="flex h-[calc(100vh-80px)] bg-white overflow-hidden border-t border-zinc-100">
            <div className="hidden lg:flex flex-col w-72 border-r border-zinc-100 bg-zinc-50/30">
                <div className="p-4 border-b border-zinc-100 bg-white flex justify-between items-center">
                    <span className="font-black text-zinc-900">Inbox</span>
                    <button onClick={() => setIsAddingChat(!isAddingChat)} className="p-1.5 hover:bg-zinc-100 rounded-lg text-brand-600 transition-colors"><Plus size={18} /></button>
                </div>
                {isAddingChat && (
                    <div className="p-4 border-b border-zinc-100 bg-white shadow-inner">
                        <form onSubmit={(e) => { e.preventDefault(); if (newWalletInput.startsWith('0x')) { setActiveChatWallet(newWalletInput); setNewWalletInput(''); setIsAddingChat(false); } }} className="space-y-2">
                            <input type="text" value={newWalletInput} onChange={(e) => setNewWalletInput(e.target.value)} placeholder="0x..." className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-lg outline-none font-mono" />
                            <button type="submit" className="w-full py-2 bg-zinc-900 text-white text-[10px] font-black rounded-lg uppercase tracking-widest">Start Chat</button>
                        </form>
                    </div>
                )}
                <div className="flex-1 overflow-y-auto">
                    {chatHistory.map(chat => (
                        <button key={chat.walletAddress} onClick={() => setActiveChatWallet(chat.walletAddress)} className={`w-full p-4 text-left border-b border-zinc-100/50 ${activeChatWallet === chat.walletAddress ? 'bg-white border-l-4 border-l-brand-500 shadow-sm' : 'hover:bg-zinc-100/50'}`}>
                            <p className="text-xs font-mono font-bold text-zinc-900">{formatAddress(chat.walletAddress)}</p>
                            <p className="text-[11px] text-zinc-500 truncate mt-1">{chat.lastMessage}</p>
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 flex flex-col bg-white min-w-0">
                <div className="p-4 border-b border-zinc-100 bg-white/80 backdrop-blur-md sticky top-0 z-10 font-mono font-bold text-zinc-900">{formatAddress(activeChatWallet) || 'Select a chat'}</div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-zinc-50/20">
                    {isLoading ? <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-zinc-300" /></div> :
                        messages.map(msg => (
                            <div key={msg.id} className={`flex ${msg.sender_address === walletAddress ? 'justify-end' : 'justify-start'}`}>
                                <div className={`p-4 rounded-3xl max-w-[80%] ${msg.sender_address === walletAddress ? 'bg-brand-600 text-white rounded-tr-sm shadow-lg' : 'bg-white border border-zinc-200 text-zinc-800 rounded-tl-sm shadow-sm'}`}>
                                    <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                                </div>
                            </div>
                        ))
                    }
                    <div ref={messagesEndRef} />
                </div>
                {filePreview && (
                    <div className="px-6 py-2 bg-zinc-50 border-t border-zinc-100 flex items-center gap-4">
                        <div className="relative w-16 h-16 bg-white border border-zinc-200 rounded-xl flex items-center justify-center overflow-hidden">
                            {filePreview === 'file' ? <FileText size={24} className="text-zinc-400" /> : <img src={filePreview} alt="preview" className="object-cover w-full h-full" />}
                            <button onClick={clearFileSelection} className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl-lg"><X size={12} /></button>
                        </div>
                        <p className="text-xs font-bold text-zinc-500 truncate">{selectedFile?.name}</p>
                    </div>
                )}
                <div className="p-4 bg-white border-t border-zinc-100">
                    <form onSubmit={handleSendMessage} className="flex gap-2 max-w-4xl mx-auto items-end">
                        <label className="p-3 bg-zinc-100 text-zinc-500 rounded-full hover:bg-zinc-200 cursor-pointer mb-1 transition-all flex items-center justify-center">
                            <Paperclip size={18} />
                            <input type="file" className="hidden" onChange={handleFileChange} disabled={isUploading || !activeChatWallet} />
                        </label>
                        <textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." disabled={!activeChatWallet || isUploading} rows={1} className="flex-1 px-6 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:bg-white focus:border-brand-500 outline-none transition-all shadow-inner resize-none" />
                        <button type="submit" disabled={isUploading} className="p-3 bg-brand-600 text-white rounded-full hover:bg-brand-700 shadow-lg mb-1 disabled:opacity-50">
                            {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                        </button>
                    </form>
                </div>
            </div>

            <div className="hidden xl:flex flex-col w-80 border-l border-zinc-100 bg-white overflow-y-auto p-6 space-y-8">
                <h2 className="text-xl font-black text-zinc-900">Project Hub 🎯</h2>
                <div className="bg-white border border-zinc-100 rounded-[2rem] p-6 shadow-sm">
                    <h3 className="text-sm font-black text-zinc-900">Progress</h3>
                    <div className="h-3 w-full bg-zinc-100 rounded-full overflow-hidden my-3"><div className="h-full bg-brand-500 transition-all duration-700 rounded-full" style={{ width: `${progress}%` }} /></div>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest"><span className="text-zinc-400">Status</span><span className="text-brand-600">{progress}%</span></div>
                </div>
                <div className="space-y-4">
                    <h3 className="text-sm font-black text-zinc-900">Milestones ✨</h3>
                    {milestones.map(m => (
                        <div key={m.id} className="flex gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${m.status === 'completed' ? 'bg-brand-100 text-brand-600' : 'bg-zinc-50 text-zinc-300'}`}>{m.status === 'completed' ? <CheckCircle2 size={16} /> : <Circle size={16} />}</div>
                            <div><p className="text-xs font-black text-zinc-900">{m.title}</p><p className="text-[10px] font-bold text-zinc-400">{m.due_date}</p></div>
                        </div>
                    ))}
                </div>
                <div className="space-y-4">
                    <h3 className="text-sm font-black text-zinc-900">Shared Files 📁</h3>
                    {files.map(f => (
                        <a key={f.id} href={f.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 border border-zinc-100 rounded-2xl hover:bg-zinc-50 transition-all group">
                            <FileText size={18} className="text-zinc-400 group-hover:text-brand-600" />
                            <div className="min-w-0"><p className="text-[11px] font-black text-zinc-800 truncate">{f.file_name}</p><p className="text-[9px] font-bold text-zinc-400">{f.file_size}</p></div>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
};