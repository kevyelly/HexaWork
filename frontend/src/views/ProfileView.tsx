import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { User, Briefcase, Mail, DollarSign, Loader2, Save, CheckCircle2, Camera } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useWallet } from '../lib/WalletContext';

export const ProfileView: React.FC = () => {
    const { walletAddress } = useWallet();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    
    const [profile, setProfile] = useState({
        full_name: '',
        title: '',
        bio: '',
        hourly_rate: '',
        avatar_url: '',
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!walletAddress) { setIsLoading(false); return; }
            setIsLoading(true);
            try {
                const { data } = await supabase
                    .from('users')
                    .select('*')
                    .eq('wallet_address', walletAddress.toLowerCase())
                    .single();
                
                if (data) {
                    setProfile({
                        full_name: data.full_name || '',
                        title: data.title || '',
                        bio: data.bio || '',
                        hourly_rate: data.hourly_rate || '',
                        avatar_url: data.avatar_url || '',
                    });
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [walletAddress]);

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0 || !walletAddress) return;
        
        const file = e.target.files[0];
        setIsLoading(true); // Re-using loading state for spinner on upload
        
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${walletAddress.toLowerCase()}_${Math.random()}.${fileExt}`;
            
            // Upload to Supabase Storage
            const { error: uploadError, data } = await supabase.storage
                .from('avatars')
                .upload(fileName, file, { upsert: true });
                
            if (uploadError) throw uploadError;
            
            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(data.path);
                
            // Update local state (it will be saved to db when hitting 'Save')
            setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
            
        } catch (error: any) {
            console.error("Error uploading avatar:", error);
            alert(`Upload failed: ${error.message || 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!walletAddress) return;
        setIsSaving(true);
        setIsSuccess(false);
        try {
            const { error } = await supabase
                .from('users')
                .update({
                    full_name: profile.full_name,
                    title: profile.title,
                    bio: profile.bio,
                    hourly_rate: profile.hourly_rate,
                    avatar_url: profile.avatar_url,
                })
                .eq('wallet_address', walletAddress.toLowerCase());
                
            if (error) throw error;
            setIsSuccess(true);
            setTimeout(() => setIsSuccess(false), 3000);
        } catch (error) {
            console.error("Error saving profile:", error);
            alert("Failed to save profile.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-brand-600" size={40} /></div>;
    }

    return (
        <div className="p-4 md:p-6 space-y-8 max-w-4xl mx-auto">
            <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight">Your Profile</h1>
                <p className="text-zinc-500 font-medium">Manage your personal details and professional portfolio.</p>
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2rem] border border-zinc-200 shadow-sm overflow-hidden"
            >
                <div className="p-8 md:p-12 border-b border-zinc-100 flex flex-col md:flex-row items-center gap-8 bg-zinc-50/50">
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="relative w-24 h-24 md:w-32 md:h-32 rounded-full cursor-pointer group flex-shrink-0"
                    >
                        {profile.avatar_url ? (
                            <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover rounded-full shadow-inner border-4 border-white" />
                        ) : (
                            <div className="w-full h-full bg-brand-100 rounded-full flex items-center justify-center text-brand-600 text-4xl font-black shadow-inner border-4 border-white">
                                {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : 'F'}
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                            <Camera className="text-white" size={28} />
                        </div>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleAvatarUpload} 
                            accept="image/*" 
                            className="hidden" 
                        />
                    </div>
                    
                    <div className="text-center md:text-left">
                        <h2 className="text-2xl font-black text-zinc-900">{profile.full_name || 'Anonymous User'}</h2>
                        <p className="text-brand-600 font-bold mt-1">{profile.title || 'Web3 Enthuasiast'}</p>
                        <p className="text-xs font-mono font-bold text-zinc-400 mt-2 bg-white px-3 py-1.5 rounded-lg border border-zinc-200 inline-block">
                            {walletAddress ? `${walletAddress.slice(0, 10)}...${walletAddress.slice(-8)}` : 'Not Connected'}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSave} className="p-8 md:p-12 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                <input 
                                    name="full_name"
                                    value={profile.full_name}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                    className="w-full pl-11 pr-4 py-4 bg-zinc-50 border border-zinc-100 rounded-xl outline-none focus:bg-white focus:border-brand-500 transition-all font-bold text-zinc-900 shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Professional Title</label>
                            <div className="relative">
                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                <input 
                                    name="title"
                                    value={profile.title}
                                    onChange={handleChange}
                                    placeholder="e.g. Smart Contract Developer"
                                    className="w-full pl-11 pr-4 py-4 bg-zinc-50 border border-zinc-100 rounded-xl outline-none focus:bg-white focus:border-brand-500 transition-all font-bold text-zinc-900 shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">About Me (Bio)</label>
                            <textarea 
                                name="bio"
                                value={profile.bio}
                                onChange={handleChange}
                                placeholder="Write a short summary about your experience..."
                                className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-xl outline-none focus:bg-white focus:border-brand-500 transition-all font-bold text-zinc-900 shadow-inner min-h-[120px] resize-y"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Hourly Rate (PAS)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                <input 
                                    name="hourly_rate"
                                    value={profile.hourly_rate}
                                    onChange={handleChange}
                                    placeholder="e.g. 50"
                                    className="w-full pl-11 pr-4 py-4 bg-zinc-50 border border-zinc-100 rounded-xl outline-none focus:bg-white focus:border-brand-500 transition-all font-bold text-zinc-900 shadow-inner"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-zinc-100 flex items-center justify-end gap-4">
                        {isSuccess && <span className="text-emerald-600 font-bold text-sm flex items-center gap-1"><CheckCircle2 size={16} /> Saved Successfully!</span>}
                        <button 
                            type="submit" 
                            disabled={isSaving}
                            className="bg-brand-600 text-white px-8 py-4 rounded-xl font-black tracking-wide shadow-lg shadow-brand-500/20 hover:bg-brand-700 transition-all active:scale-95 flex items-center gap-2"
                        >
                            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            SAVE CHANGES
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};
