import React from 'react';
import { motion } from 'motion/react';
import { Plus, ChevronRight } from 'lucide-react';
import { TEAM_MEMBERS } from '../constants';
import { cn } from '../utils';

export const TeamManagementView: React.FC = () => (
  <div className="p-4 md:p-6 space-y-10">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight">Your Dream Team 🤝</h1>
        <p className="text-zinc-500 font-medium">Collaborate with the best talent from around the globe.</p>
      </div>
      <button className="w-full md:w-auto bg-zinc-900 text-white px-8 py-3 rounded-2xl font-black hover:bg-brand-600 transition-all shadow-xl shadow-zinc-900/10 flex items-center justify-center gap-2 hover:scale-105 active:scale-95">
        <Plus size={20} />
        Add Member
      </button>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
      {TEAM_MEMBERS.map((member, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm text-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group"
        >
          <div className="relative w-20 h-20 md:w-24 md:h-24 mx-auto mb-6">
            <div className="absolute inset-0 bg-brand-500/10 rounded-full blur-xl group-hover:blur-2xl transition-all"></div>
            <img src={`https://picsum.photos/seed/${member.name}/200/200`} alt="" className="relative rounded-[2rem] border-4 border-white shadow-xl group-hover:rotate-3 transition-transform" referrerPolicy="no-referrer" />
            <div className={cn(
              "absolute -bottom-1 -right-1 w-5 h-5 md:w-6 md:h-6 rounded-full border-4 border-white shadow-md",
              member.status === 'Active' ? "bg-green-500" : member.status === 'In Call' ? "bg-blue-500" : "bg-zinc-300"
            )}></div>
          </div>
          <h3 className="text-lg font-black text-zinc-900 mb-1">{member.name}</h3>
          <p className="text-sm text-zinc-500 font-bold mb-6">{member.role} {member.emoji}</p>
          
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-zinc-50">
            <div>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Tasks</p>
              <p className="text-lg font-black text-zinc-900">{member.tasks}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Rating</p>
              <p className="text-lg font-black text-zinc-900">⭐ {member.rating}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>

    <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden">
      <div className="p-6 md:p-8 border-b border-zinc-50 flex justify-between items-center">
        <h3 className="text-xl font-black text-zinc-900">Recent Activity ⚡</h3>
        <button className="text-sm font-black text-brand-600 hover:bg-brand-50 px-4 py-2 rounded-xl transition-all">View All</button>
      </div>
      <div className="divide-y divide-zinc-50">
        {[
          { user: 'Sarah Chen', action: 'merged a pull request', project: 'AI Generator API', time: '12m ago', icon: '🚀' },
          { user: 'Alex Rivera', action: 'uploaded new assets', project: 'E-commerce Redesign', time: '1h ago', icon: '🎨' },
          { user: 'Marcus Bell', action: 'reported 3 bugs', project: 'Mobile App Audit', time: '3h ago', icon: '🐞' },
        ].map((act, i) => (
          <div key={i} className="p-4 md:p-6 flex items-center gap-4 md:gap-6 hover:bg-zinc-50 transition-all group cursor-pointer">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-zinc-100 flex items-center justify-center overflow-hidden shadow-sm group-hover:scale-110 transition-transform">
              <img src={`https://picsum.photos/seed/${act.user}/100/100`} alt="" referrerPolicy="no-referrer" />
            </div>
            <div className="flex-1">
              <p className="text-sm md:text-base text-zinc-900 font-medium">
                <span className="font-black">{act.user}</span> {act.action} in <span className="font-black text-brand-600">{act.project}</span> {act.icon}
              </p>
              <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mt-1">{act.time}</p>
            </div>
            <ChevronRight className="text-zinc-200 group-hover:text-brand-500 transition-colors" size={20} />
          </div>
        ))}
      </div>
    </div>
  </div>
);
