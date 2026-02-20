import React from 'react';
import { motion } from 'motion/react';
import { PROJECTS, MILESTONES } from '../constants';
import { CreditCard, Briefcase, Shield, User, Clock, Calendar as CalendarIcon, ChevronRight } from 'lucide-react';
import { cn } from '../utils';

export const DashboardView: React.FC = () => (
  <div className="p-4 md:p-6 space-y-8">
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight">Welcome back, John! 👋</h1>
        <p className="text-zinc-500 font-medium">You've got 3 milestones to crush today. Let's do this!</p>
      </div>
      <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-zinc-200 shadow-sm w-full sm:w-auto">
        <button className="flex-1 sm:flex-none px-4 py-2 bg-brand-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-brand-500/20">Freelancer</button>
        <button className="flex-1 sm:flex-none px-4 py-2 text-zinc-500 font-bold text-sm hover:bg-zinc-50 rounded-xl">Client</button>
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {[
        { label: 'Total Earnings', value: '$12,450.00', change: '+12%', icon: CreditCard, color: 'text-brand-600', bg: 'bg-brand-50', emoji: '💰' },
        { label: 'Active Projects', value: '8', change: '+2', icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-50', emoji: '🚀' },
        { label: 'Success Rate', value: '98.5%', change: '+0.5%', icon: Shield, color: 'text-violet-600', bg: 'bg-violet-50', emoji: '✨' },
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
          <h3 className="text-2xl md:text-3xl font-black text-zinc-900 mt-1">{stat.value}</h3>
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
          {PROJECTS.map((project) => (
            <div key={project.id} className="p-6 md:p-8 hover:bg-zinc-50 transition-all cursor-pointer group">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-lg font-bold text-zinc-900 group-hover:text-brand-600 transition-colors">{project.title}</h4>
                <span className="text-sm font-black text-zinc-900 bg-zinc-100 px-3 py-1 rounded-full">{project.budget}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-zinc-500 font-medium mb-5">
                <span className="flex items-center gap-1.5"><User size={14} /> {project.client}</span>
                <span className="w-1.5 h-1.5 bg-zinc-300 rounded-full"></span>
                <span className="flex items-center gap-1.5"><Clock size={14} /> {project.status}</span>
              </div>
              <div className="relative">
                <div className="w-full bg-zinc-100 h-3 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${project.progress}%` }}
                    className="bg-brand-500 h-full rounded-full shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                  />
                </div>
                <span className="absolute -top-6 right-0 text-[10px] font-black text-brand-600 uppercase tracking-widest">{project.progress}% Done</span>
              </div>
            </div>
          ))}
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
