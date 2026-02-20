import React from 'react';
import { User, Shield, Bell, CreditCard, Users, Plus } from 'lucide-react';
import { cn } from '../utils';

export const SettingsView: React.FC = () => (
  <div className="p-4 md:p-6 space-y-10">
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight">Settings ⚙️</h1>
        <p className="text-zinc-500 font-medium">Manage your profile, security, and preferences.</p>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      <div className="lg:col-span-1 space-y-2 md:space-y-4">
        {[
          { icon: User, label: 'Profile Information', active: true, emoji: '👤' },
          { icon: Shield, label: 'Security & Password', active: false, emoji: '🔐' },
          { icon: Bell, label: 'Notifications', active: false, emoji: '🔔' },
          { icon: CreditCard, label: 'Billing & Payments', active: false, emoji: '💳' },
          { icon: Users, label: 'Team Settings', active: false, emoji: '👥' },
        ].map((item, i) => (
          <button 
            key={i}
            className={cn(
              "w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300",
              item.active ? "bg-white border border-zinc-100 shadow-lg text-brand-600 font-black" : "text-zinc-500 hover:bg-white hover:shadow-md font-bold"
            )}
          >
            <item.icon size={20} className={item.active ? "text-brand-500" : "text-zinc-400"} />
            <span className="flex-1 text-left">{item.label}</span>
            <span className="text-lg">{item.emoji}</span>
          </button>
        ))}
      </div>

      <div className="lg:col-span-2 space-y-8">
        <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm p-6 md:p-10">
          <h3 className="text-xl font-black text-zinc-900 mb-8">Profile Details ✨</h3>
          <div className="space-y-10">
            <div className="flex flex-col sm:flex-row items-center gap-6 md:gap-8 text-center sm:text-left">
              <div className="relative group">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2.5rem] bg-zinc-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-2xl group-hover:rotate-3 transition-transform">
                  <img src="https://picsum.photos/seed/JohnDoe/200/200" alt="" referrerPolicy="no-referrer" />
                </div>
                <button className="absolute -bottom-2 -right-2 p-2 md:p-3 bg-brand-600 text-white rounded-2xl border-4 border-white shadow-xl hover:bg-brand-700 transition-all hover:scale-110">
                  <Plus size={18} />
                </button>
              </div>
              <div>
                <h4 className="text-xl md:text-2xl font-black text-zinc-900">John Doe 👋</h4>
                <p className="text-zinc-500 font-bold text-sm md:text-base">Full Stack Developer • San Francisco, CA</p>
                <div className="mt-3 flex justify-center sm:justify-start gap-2">
                  <span className="bg-brand-50 text-brand-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Pro Member</span>
                  <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Verified</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">First Name</label>
                <input type="text" defaultValue="John" className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl outline-none focus:bg-white focus:border-brand-500 transition-all font-medium shadow-inner" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Last Name</label>
                <input type="text" defaultValue="Doe" className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl outline-none focus:bg-white focus:border-brand-500 transition-all font-medium shadow-inner" />
              </div>
              <div className="space-y-3 md:col-span-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Email Address</label>
                <input type="email" defaultValue="john.doe@example.com" className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl outline-none focus:bg-white focus:border-brand-500 transition-all font-medium shadow-inner" />
              </div>
              <div className="space-y-3 md:col-span-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Bio ✍️</label>
                <textarea rows={4} defaultValue="Passionate developer with 8+ years of experience in building scalable web applications. Focused on React, Node.js, and AI integrations." className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl outline-none focus:bg-white focus:border-brand-500 transition-all font-medium resize-none shadow-inner leading-relaxed" />
              </div>
            </div>
            
            <div className="pt-6 flex flex-col sm:flex-row justify-end gap-4">
              <button className="px-8 py-4 text-zinc-400 font-black hover:text-zinc-600 transition-all">Cancel</button>
              <button className="px-10 py-4 bg-brand-600 text-white font-black rounded-2xl shadow-2xl shadow-brand-600/30 hover:bg-brand-700 transition-all hover:scale-105 active:scale-95">Save Changes ✨</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
