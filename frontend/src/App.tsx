import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  MessageSquare, 
  Users, 
  Settings as SettingsIcon, 
  Gavel, 
  Home,
  Bell,
  Search,
  Plus,
  Menu,
  X,
  ChevronRight,
  User,
  LogOut,
  CreditCard,
  Shield,
  HelpCircle,
  Send,
  Paperclip,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Video,
  Mic,
  Calendar as CalendarIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utility ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
type View = 'landing' | 'dashboard' | 'marketplace' | 'project-chat' | 'team' | 'settings' | 'disputes';

// --- Mock Data ---
const PROJECTS = [
  { id: 1, title: 'E-commerce Platform Redesign', client: 'TechFlow Inc.', budget: '$4,500', status: 'In Progress', progress: 65 },
  { id: 2, title: 'AI Content Generator API', client: 'Nexus AI', budget: '$2,800', status: 'Milestone 2', progress: 40 },
  { id: 3, title: 'Mobile App UX Audit', client: 'GreenGrowth', budget: '$1,200', status: 'Completed', progress: 100 },
];

// --- Components ---

const SidebarItem = ({ 
  icon: Icon, 
  label, 
  active, 
  onClick,
  emoji
}: { 
  icon: any, 
  label: string, 
  active: boolean, 
  onClick: () => void,
  emoji?: string
}) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 w-full px-5 py-4 rounded-[1.5rem] transition-all duration-300 group relative",
      active 
        ? "bg-brand-600 text-white shadow-2xl shadow-brand-600/30 scale-[1.02]" 
        : "text-zinc-500 hover:bg-brand-50 hover:text-brand-600 font-bold"
    )}
  >
    <Icon size={20} className={cn(active ? "text-white" : "text-zinc-400 group-hover:text-brand-500")} />
    {label && <span className="font-black whitespace-nowrap overflow-hidden flex-1 text-left">{label}</span>}
    {label && emoji && <span className="text-lg">{emoji}</span>}
    {active && (
      <motion.div 
        layoutId="active-pill"
        className="absolute left-0 w-1.5 h-8 bg-white rounded-full ml-1.5"
      />
    )}
  </button>
);

const Header = ({ currentView }: { currentView: View }) => (
  <header className="h-20 border-b border-zinc-100 bg-white/80 backdrop-blur-xl sticky top-0 z-30 px-8 flex items-center justify-between">
    <div className="flex items-center gap-4">
      <h2 className="text-xl font-black text-zinc-900 capitalize tracking-tight">
        {currentView.replace('-', ' ')} {
          currentView === 'dashboard' ? '🏠' :
          currentView === 'marketplace' ? '🌟' :
          currentView === 'project-chat' ? '💬' :
          currentView === 'team' ? '🤝' :
          currentView === 'disputes' ? '🛡️' :
          currentView === 'settings' ? '⚙️' : ''
        }
      </h2>
    </div>
    
    <div className="flex items-center gap-6">
      <div className="relative hidden md:block">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
        <input 
          type="text" 
          placeholder="Search for anything..." 
          className="pl-12 pr-6 py-3 bg-zinc-50 border border-zinc-100 focus:bg-white focus:border-brand-500 rounded-[1.25rem] text-sm w-72 transition-all outline-none font-medium shadow-inner"
        />
      </div>
      
      <button className="p-3 text-zinc-400 hover:bg-zinc-50 hover:text-brand-600 rounded-2xl relative transition-all">
        <Bell size={22} />
        <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm"></span>
      </button>
      
      <div className="h-10 w-px bg-zinc-100 mx-1"></div>
      
      <button className="flex items-center gap-3 p-1.5 pr-4 hover:bg-zinc-50 rounded-2xl transition-all group">
        <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center text-brand-700 font-black text-xs shadow-sm group-hover:rotate-6 transition-transform">
          JD
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-xs font-black text-zinc-900 leading-none">John Doe</p>
          <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest mt-1">Pro Plan ⚡</p>
        </div>
      </button>
    </div>
  </header>
);

// --- Views ---

const DashboardView = () => (
  <div className="p-6 space-y-8">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Welcome back, John! 👋</h1>
        <p className="text-zinc-500 font-medium">You've got 3 milestones to crush today. Let's do this!</p>
      </div>
      <div className="hidden sm:flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-zinc-200 shadow-sm">
        <button className="px-4 py-2 bg-brand-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-brand-500/20">Freelancer</button>
        <button className="px-4 py-2 text-zinc-500 font-bold text-sm hover:bg-zinc-50 rounded-xl">Client</button>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          <h3 className="text-3xl font-black text-zinc-900 mt-1">{stat.value}</h3>
        </motion.div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white rounded-[2rem] border border-zinc-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-zinc-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-zinc-900">Your Active Projects 📂</h3>
          <button className="text-brand-600 text-sm font-bold hover:bg-brand-50 px-4 py-2 rounded-xl transition-all">View All</button>
        </div>
        <div className="divide-y divide-zinc-100">
          {PROJECTS.map((project) => (
            <div key={project.id} className="p-8 hover:bg-zinc-50 transition-all cursor-pointer group">
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

      <div className="bg-white rounded-[2rem] border border-zinc-200 shadow-sm p-8">
        <h3 className="text-xl font-bold text-zinc-900 mb-8">Upcoming Milestones 🗓️</h3>
        <div className="space-y-8">
          {[
            { date: 'Oct 24', title: 'Final UI Mockups', project: 'E-commerce Redesign', time: '10:00 AM', color: 'bg-brand-100 text-brand-600' },
            { date: 'Oct 26', title: 'API Documentation', project: 'AI Generator', time: '02:30 PM', color: 'bg-blue-100 text-blue-600' },
            { date: 'Oct 28', title: 'Client Feedback Call', project: 'UX Audit', time: '04:00 PM', color: 'bg-orange-100 text-orange-600' },
          ].map((m, i) => (
            <div key={i} className="flex gap-6 group cursor-pointer">
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

const MarketplaceView = () => (
  <div className="p-6 space-y-8">
    <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Explore Opportunities 🌟</h1>
        <p className="text-zinc-500 font-medium">Discover projects that match your unique skills and passion.</p>
      </div>
      <button className="bg-brand-600 text-white px-8 py-3 rounded-2xl font-black shadow-xl shadow-brand-600/20 hover:bg-brand-700 transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
        <Plus size={20} />
        Post a Job
      </button>
    </div>

    <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
      {['All Gigs 🌈', 'Design 🎨', 'Development 💻', 'Writing ✍️', 'Marketing 📈', 'AI/ML 🤖'].map((cat, i) => (
        <button 
          key={cat}
          className={cn(
            "px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border-2",
            i === 0 ? "bg-zinc-900 border-zinc-900 text-white shadow-lg" : "bg-white border-zinc-100 text-zinc-500 hover:border-brand-200 hover:text-brand-600"
          )}
        >
          {cat}
        </button>
      ))}
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
          className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500 opacity-50"></div>
          
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="w-14 h-14 bg-zinc-50 rounded-2xl flex items-center justify-center group-hover:bg-brand-100 transition-colors">
              <Briefcase className="text-zinc-400 group-hover:text-brand-600" size={28} />
            </div>
            <span className="text-[10px] font-black text-brand-600 bg-brand-50 px-3 py-1.5 rounded-full uppercase tracking-widest">
              Fixed Price 💎
            </span>
          </div>
          
          <h3 className="font-black text-zinc-900 text-xl group-hover:text-brand-600 transition-colors mb-3 leading-tight">
            Senior React Developer for Fintech Dashboard
          </h3>
          <p className="text-zinc-500 text-sm font-medium line-clamp-2 mb-6 leading-relaxed">
            We are looking for an experienced React developer to build a complex financial dashboard with real-time data visualization...
          </p>
          
          <div className="flex flex-wrap gap-2 mb-8 relative z-10">
            {['React', 'TypeScript', 'Tailwind', 'D3.js'].map(tag => (
              <span key={tag} className="text-[10px] font-black uppercase tracking-wider text-zinc-400 bg-zinc-50 px-3 py-1 rounded-lg group-hover:bg-white group-hover:text-brand-500 transition-colors">
                {tag}
              </span>
            ))}
          </div>
          
          <div className="pt-6 border-t border-zinc-50 flex justify-between items-center relative z-10">
            <div>
              <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-1">Budget Range</p>
              <p className="text-zinc-900 font-black text-lg">$3,500 - $5,000</p>
            </div>
            <button className="bg-brand-50 text-brand-600 p-3 rounded-2xl group-hover:bg-brand-600 group-hover:text-white transition-all shadow-sm">
              <ChevronRight size={20} />
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

const ProjectChatView = () => (
  <div className="flex h-[calc(100vh-64px)] bg-white overflow-hidden">
    {/* Chat List */}
    <div className="w-80 border-r border-zinc-100 bg-zinc-50/50 flex flex-col">
      <div className="p-6">
        <h2 className="text-xl font-black text-zinc-900 mb-4">Messages 💬</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
          <input 
            type="text" 
            placeholder="Find a conversation..." 
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm outline-none focus:border-brand-500 transition-all shadow-sm"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-3 space-y-2">
        {[
          { name: 'TechFlow Inc.', lastMsg: 'The new designs look great! 😍', time: '2m', active: true, unread: 2 },
          { name: 'Nexus AI', lastMsg: 'Can we schedule a call? 📞', time: '1h', active: false, unread: 0 },
          { name: 'GreenGrowth', lastMsg: 'Payment released for M1 💸', time: '3h', active: false, unread: 0 },
        ].map((chat, i) => (
          <div key={i} className={cn(
            "p-4 flex gap-3 rounded-2xl cursor-pointer transition-all duration-300", 
            chat.active ? "bg-white shadow-lg border border-zinc-100" : "hover:bg-white/60"
          )}>
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-zinc-200 flex-shrink-0 overflow-hidden shadow-sm">
                <img src={`https://picsum.photos/seed/${chat.name}/100/100`} alt="" referrerPolicy="no-referrer" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-zinc-900 truncate text-sm">{chat.name}</h4>
                <span className="text-[10px] text-zinc-400 font-black">{chat.time}</span>
              </div>
              <p className={cn("text-xs truncate font-medium", chat.unread > 0 ? "text-zinc-900" : "text-zinc-500")}>{chat.lastMsg}</p>
            </div>
            {chat.unread > 0 && (
              <div className="w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center text-[10px] text-white font-black shadow-lg shadow-brand-500/30">
                {chat.unread}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>

    {/* Chat Area */}
    <div className="flex-1 flex flex-col bg-white">
      <div className="h-20 border-b border-zinc-100 px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-zinc-200 overflow-hidden shadow-sm">
            <img src="https://picsum.photos/seed/TechFlow/100/100" alt="" referrerPolicy="no-referrer" />
          </div>
          <div>
            <h3 className="font-black text-zinc-900">TechFlow Inc. 🚀</h3>
            <p className="text-[10px] text-brand-600 font-black uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse"></span> Active Now
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-3 text-zinc-400 hover:bg-zinc-50 hover:text-brand-600 rounded-2xl transition-all"><Video size={20} /></button>
          <button className="p-3 text-zinc-400 hover:bg-zinc-50 hover:text-brand-600 rounded-2xl transition-all"><Mic size={20} /></button>
          <button className="p-3 text-zinc-400 hover:bg-zinc-50 hover:text-brand-600 rounded-2xl transition-all"><MoreHorizontal size={20} /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#F9FAFB]/50">
        <div className="flex justify-center">
          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest bg-white border border-zinc-100 px-4 py-1.5 rounded-full shadow-sm">Today</span>
        </div>
        
        <div className="flex gap-4 max-w-2xl">
          <div className="w-10 h-10 rounded-2xl bg-zinc-200 flex-shrink-0 overflow-hidden mt-1 shadow-sm">
            <img src="https://picsum.photos/seed/TechFlow/100/100" alt="" referrerPolicy="no-referrer" />
          </div>
          <div className="space-y-2">
            <div className="bg-white p-5 rounded-3xl rounded-tl-none border border-zinc-100 shadow-sm">
              <p className="text-sm text-zinc-700 font-medium leading-relaxed">Hi John! We've reviewed the latest dashboard mockups. The data visualization part is exactly what we were looking for. 😍</p>
            </div>
            <div className="bg-white p-5 rounded-3xl rounded-tl-none border border-zinc-100 shadow-sm">
              <p className="text-sm text-zinc-700 font-medium leading-relaxed">Can you also add the export to PDF functionality in the next milestone? 📄</p>
            </div>
            <span className="text-[10px] text-zinc-400 font-black ml-2">10:42 AM</span>
          </div>
        </div>

        <div className="flex gap-4 max-w-2xl ml-auto flex-row-reverse">
          <div className="w-10 h-10 rounded-2xl bg-brand-500 flex-shrink-0 flex items-center justify-center text-white font-black text-xs mt-1 shadow-lg shadow-brand-500/20">
            JD
          </div>
          <div className="space-y-2 flex flex-col items-end">
            <div className="bg-brand-600 p-5 rounded-3xl rounded-tr-none shadow-xl shadow-brand-600/20">
              <p className="text-sm text-white font-medium leading-relaxed">Absolutely! I'll include the PDF export feature in Milestone 3. I've already started working on the library integration. 🛠️</p>
            </div>
            <span className="text-[10px] text-zinc-400 font-black mr-2 flex items-center gap-1">10:45 AM • <CheckCircle2 size={10} className="text-brand-500" /> Read</span>
          </div>
        </div>
      </div>

      <div className="p-6 bg-white border-t border-zinc-100">
        <div className="max-w-4xl mx-auto flex items-end gap-4">
          <button className="p-3.5 text-zinc-400 hover:bg-zinc-50 hover:text-brand-600 rounded-2xl transition-all"><Paperclip size={22} /></button>
          <div className="flex-1 relative">
            <textarea 
              placeholder="Write a friendly message..." 
              rows={1}
              className="w-full pl-5 pr-14 py-4 bg-zinc-50 border border-zinc-100 rounded-[1.5rem] text-sm font-medium outline-none focus:bg-white focus:border-brand-500 transition-all resize-none shadow-inner"
            />
            <button className="absolute right-2.5 bottom-2.5 p-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20 active:scale-90">
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* Project Info Sidebar */}
    <div className="w-80 border-l border-zinc-100 bg-zinc-50/30 p-8 space-y-10 overflow-y-auto hidden xl:block">
      <div>
        <h3 className="text-lg font-black text-zinc-900 mb-6">Project Hub 🎯</h3>
        <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm">
          <h4 className="font-black text-zinc-900 text-sm mb-1">E-commerce Redesign</h4>
          <p className="text-xs text-brand-600 font-black uppercase tracking-widest mb-5">Milestone 2 of 4</p>
          <div className="w-full bg-zinc-100 h-2.5 rounded-full overflow-hidden mb-3">
            <div className="bg-brand-500 h-full w-1/2 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.3)]"></div>
          </div>
          <div className="flex justify-between text-[10px] font-black text-zinc-400 uppercase tracking-widest">
            <span>Progress</span>
            <span className="text-brand-600">50%</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-black text-zinc-900 mb-6">Milestones ✨</h3>
        <div className="space-y-6">
          {[
            { title: 'Initial Research', status: 'completed', date: 'Oct 12' },
            { title: 'UI/UX Design', status: 'active', date: 'Oct 28' },
            { title: 'Frontend Dev', status: 'pending', date: 'Nov 15' },
          ].map((m, i) => (
            <div key={i} className="flex gap-4 group cursor-pointer">
              <div className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 transition-transform group-hover:scale-110 shadow-sm",
                m.status === 'completed' ? "bg-brand-100 text-brand-600" : 
                m.status === 'active' ? "bg-blue-100 text-blue-600" : "bg-zinc-100 text-zinc-400"
              )}>
                {m.status === 'completed' ? <CheckCircle2 size={16} /> : 
                 m.status === 'active' ? <Clock size={16} /> : <AlertCircle size={16} />}
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-900 group-hover:text-brand-600 transition-colors">{m.title}</h4>
                <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">{m.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-black text-zinc-900 mb-6">Shared Files 📂</h3>
        <div className="space-y-3">
          {[
            { name: 'branding_guide.pdf', size: '2.4 MB', type: 'pdf' },
            { name: 'dashboard_v2.fig', size: '12.8 MB', type: 'figma' },
            { name: 'contract_signed.pdf', size: '1.1 MB', type: 'pdf' },
          ].map((f, i) => (
            <div key={i} className="p-4 bg-white border border-zinc-100 rounded-2xl flex items-center gap-4 hover:shadow-md hover:border-brand-200 cursor-pointer transition-all group">
              <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-400 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                <FileText size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-zinc-900 truncate group-hover:text-brand-600 transition-colors">{f.name}</p>
                <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">{f.size}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const TeamManagementView = () => (
  <div className="p-6 space-y-10">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Your Dream Team 🤝</h1>
        <p className="text-zinc-500 font-medium">Collaborate with the best talent from around the globe.</p>
      </div>
      <button className="bg-zinc-900 text-white px-8 py-3 rounded-2xl font-black hover:bg-brand-600 transition-all shadow-xl shadow-zinc-900/10 flex items-center gap-2 hover:scale-105 active:scale-95">
        <Plus size={20} />
        Add Member
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {[
        { name: 'Alex Rivera', role: 'UI Designer', status: 'Active', tasks: 12, rating: 4.9, emoji: '🎨' },
        { name: 'Sarah Chen', role: 'Backend Dev', status: 'In Call', tasks: 8, rating: 5.0, emoji: '💻' },
        { name: 'Marcus Bell', role: 'QA Engineer', status: 'Away', tasks: 15, rating: 4.8, emoji: '🐞' },
        { name: 'Elena Vance', role: 'Project Manager', status: 'Active', tasks: 5, rating: 4.9, emoji: '📅' },
      ].map((member, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm text-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group"
        >
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 bg-brand-500/10 rounded-full blur-xl group-hover:blur-2xl transition-all"></div>
            <img src={`https://picsum.photos/seed/${member.name}/200/200`} alt="" className="relative rounded-[2rem] border-4 border-white shadow-xl group-hover:rotate-3 transition-transform" referrerPolicy="no-referrer" />
            <div className={cn(
              "absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white shadow-md",
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
      <div className="p-8 border-b border-zinc-50 flex justify-between items-center">
        <h3 className="text-xl font-black text-zinc-900">Recent Activity ⚡</h3>
        <button className="text-sm font-black text-brand-600 hover:bg-brand-50 px-4 py-2 rounded-xl transition-all">View All</button>
      </div>
      <div className="divide-y divide-zinc-50">
        {[
          { user: 'Sarah Chen', action: 'merged a pull request', project: 'AI Generator API', time: '12m ago', icon: '🚀' },
          { user: 'Alex Rivera', action: 'uploaded new assets', project: 'E-commerce Redesign', time: '1h ago', icon: '🎨' },
          { user: 'Marcus Bell', action: 'reported 3 bugs', project: 'Mobile App Audit', time: '3h ago', icon: '🐞' },
        ].map((act, i) => (
          <div key={i} className="p-6 flex items-center gap-6 hover:bg-zinc-50 transition-all group cursor-pointer">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center overflow-hidden shadow-sm group-hover:scale-110 transition-transform">
              <img src={`https://picsum.photos/seed/${act.user}/100/100`} alt="" referrerPolicy="no-referrer" />
            </div>
            <div className="flex-1">
              <p className="text-zinc-900 font-medium">
                <span className="font-black">{act.user}</span> {act.action} in <span className="font-black text-brand-600">{act.project}</span> {act.icon}
              </p>
              <p className="text-xs text-zinc-400 font-black uppercase tracking-widest mt-1">{act.time}</p>
            </div>
            <ChevronRight className="text-zinc-200 group-hover:text-brand-500 transition-colors" size={20} />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const DisputesView = () => (
  <div className="p-6 space-y-10">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Resolution Center 🛡️</h1>
        <p className="text-zinc-500 font-medium">Fair and fast mediation powered by AI and community experts.</p>
      </div>
      <div className="flex gap-3">
        <span className="bg-red-50 text-red-600 px-4 py-2 rounded-2xl text-xs font-black border border-red-100 shadow-sm flex items-center gap-2">
          <AlertCircle size={16} /> 2 Active Cases
        </span>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-500">
          <div className="p-8 bg-zinc-900 text-white flex justify-between items-center">
            <div>
              <h3 className="text-xl font-black">Case #8821 - Scope Creep Dispute</h3>
              <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">TechFlow Inc. vs John Doe</p>
            </div>
            <div className="bg-brand-500 text-white px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-500/20 animate-pulse">
              Mediation in Progress
            </div>
          </div>
          <div className="p-8 space-y-8">
            <div className="p-6 bg-zinc-50 rounded-3xl border border-zinc-100">
              <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">The Conflict 📝</h4>
              <p className="text-zinc-700 font-medium leading-relaxed">Client requested 3 additional revisions beyond the agreed contract limit. Freelancer is requesting additional payment of $450.</p>
            </div>
            
            <div className="space-y-6">
              <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">AI Analysis Report 🤖</h4>
              <div className="p-6 bg-brand-50 rounded-[2rem] border border-brand-100 flex gap-6">
                <div className="w-14 h-14 bg-brand-500 rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-brand-500/20">
                  <Shield size={28} />
                </div>
                <div className="flex-1">
                  <p className="text-brand-900 font-black mb-3">Based on the smart contract terms and chat history:</p>
                  <ul className="text-sm text-brand-800 space-y-3 font-medium">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-brand-500 mt-0.5 flex-shrink-0" />
                      Contract explicitly states "Maximum 2 revisions per milestone".
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-brand-500 mt-0.5 flex-shrink-0" />
                      Chat logs show client requested a "complete overhaul" of the header on Oct 15th.
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-brand-500 mt-0.5 flex-shrink-0" />
                      Freelancer provided 2 revisions prior to this request.
                    </li>
                  </ul>
                  <div className="mt-8 p-5 bg-white rounded-2xl border border-brand-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 bg-brand-500 text-white rounded-bl-xl font-black text-[8px] uppercase tracking-widest">Recommendation</div>
                    <p className="text-xs font-black text-brand-900 mb-2 uppercase tracking-widest">Proposed Resolution:</p>
                    <p className="text-sm text-brand-700 font-medium leading-relaxed">Release <span className="font-black text-brand-900">80% of the disputed amount ($360)</span> to the freelancer as the request clearly falls outside original scope.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="p-8 border-t border-zinc-50 flex flex-col sm:flex-row gap-4">
            <button className="flex-1 bg-brand-600 text-white py-4 rounded-2xl font-black hover:bg-brand-700 transition-all shadow-xl shadow-brand-600/20 hover:scale-[1.02] active:scale-95">Accept AI Proposal ✅</button>
            <button className="flex-1 bg-white border-2 border-zinc-100 text-zinc-700 py-4 rounded-2xl font-black hover:bg-zinc-50 transition-all hover:border-zinc-200">Escalate to Human Admin 👤</button>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm p-8">
          <h3 className="text-lg font-black text-zinc-900 mb-6">Case History 📜</h3>
          <div className="space-y-4">
            {[
              { id: '#7712', status: 'Resolved', outcome: 'Freelancer Paid', emoji: '🎉' },
              { id: '#6540', status: 'Resolved', outcome: 'Refund Issued', emoji: '↩️' },
              { id: '#5521', status: 'Dismissed', outcome: 'No Violation', emoji: '✅' },
            ].map((h, i) => (
              <div key={i} className="flex justify-between items-center p-4 border border-zinc-50 rounded-2xl hover:bg-zinc-50 transition-all cursor-pointer group">
                <div>
                  <p className="text-xs font-black text-zinc-900 group-hover:text-brand-600 transition-colors">{h.id} {h.emoji}</p>
                  <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mt-1">{h.outcome}</p>
                </div>
                <span className="text-[10px] font-black text-brand-600 bg-brand-50 px-3 py-1.5 rounded-full">{h.status}</span>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-3 text-zinc-400 font-black text-xs uppercase tracking-widest hover:text-brand-600 transition-colors">View All History</button>
        </div>
        
        <div className="bg-brand-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-brand-600/30 relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
          <h3 className="text-xl font-black mb-4 relative z-10">Need Help? 🆘</h3>
          <p className="text-sm text-brand-100 font-medium mb-6 relative z-10 leading-relaxed">Our support team is available 24/7 to help you resolve any issues or answer questions.</p>
          <button className="w-full py-4 bg-white text-brand-600 rounded-2xl font-black hover:bg-brand-50 transition-all relative z-10 shadow-lg">Contact Support</button>
        </div>
      </div>
    </div>
  </div>
);

const SettingsView = () => (
  <div className="p-6 space-y-10">
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Settings ⚙️</h1>
        <p className="text-zinc-500 font-medium">Manage your profile, security, and preferences.</p>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      <div className="lg:col-span-1 space-y-4">
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
        <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm p-10">
          <h3 className="text-xl font-black text-zinc-900 mb-8">Profile Details ✨</h3>
          <div className="space-y-10">
            <div className="flex items-center gap-8">
              <div className="relative group">
                <div className="w-32 h-32 rounded-[2.5rem] bg-zinc-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-2xl group-hover:rotate-3 transition-transform">
                  <img src="https://picsum.photos/seed/JohnDoe/200/200" alt="" referrerPolicy="no-referrer" />
                </div>
                <button className="absolute -bottom-2 -right-2 p-3 bg-brand-600 text-white rounded-2xl border-4 border-white shadow-xl hover:bg-brand-700 transition-all hover:scale-110">
                  <Plus size={18} />
                </button>
              </div>
              <div>
                <h4 className="text-2xl font-black text-zinc-900">John Doe 👋</h4>
                <p className="text-zinc-500 font-bold">Full Stack Developer • San Francisco, CA</p>
                <div className="mt-3 flex gap-2">
                  <span className="bg-brand-50 text-brand-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Pro Member</span>
                  <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Verified</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
            
            <div className="pt-6 flex justify-end gap-4">
              <button className="px-8 py-4 text-zinc-400 font-black hover:text-zinc-600 transition-all">Cancel</button>
              <button className="px-10 py-4 bg-brand-600 text-white font-black rounded-2xl shadow-2xl shadow-brand-600/30 hover:bg-brand-700 transition-all hover:scale-105 active:scale-95">Save Changes ✨</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const LandingPageView = ({ onStart }: { onStart: () => void }) => (
  <div className="min-h-screen bg-white selection:bg-brand-100 selection:text-brand-900">
    {/* Nav */}
    <nav className="h-24 px-8 flex items-center justify-between max-w-7xl mx-auto">
      <div className="flex items-center gap-3 group cursor-pointer">
        <div className="w-12 h-12 bg-brand-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-brand-600/20 group-hover:rotate-12 transition-transform">F</div>
        <span className="font-black text-3xl tracking-tighter text-zinc-900">Escrow</span>
      </div>
      <div className="hidden lg:flex items-center gap-10 text-sm font-bold text-zinc-500">
        <a href="#" className="hover:text-brand-600 transition-colors">Marketplace</a>
        <a href="#" className="hover:text-brand-600 transition-colors">How it Works</a>
        <a href="#" className="hover:text-brand-600 transition-colors">Success Stories</a>
        <a href="#" className="hover:text-brand-600 transition-colors">Pricing</a>
      </div>
      <div className="flex items-center gap-6">
        <button onClick={onStart} className="text-zinc-900 font-black hover:text-brand-600 transition-colors">Log In</button>
        <button onClick={onStart} className="bg-zinc-900 text-white px-8 py-3.5 rounded-2xl font-black hover:bg-brand-600 transition-all shadow-2xl shadow-zinc-900/20 hover:scale-105 active:scale-95">Get Started 🚀</button>
      </div>
    </nav>

    {/* Hero */}
    <section className="px-8 pt-24 pb-40 max-w-7xl mx-auto text-center relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-600 px-5 py-2 rounded-full text-xs font-black border border-brand-100 mb-8 uppercase tracking-widest shadow-sm">
          <span>✨</span> The Future of Freelancing
        </div>
        <h1 className="text-6xl md:text-8xl font-black text-zinc-900 tracking-tighter mb-10 leading-[0.95]">
          Work with <span className="text-brand-600">Confidence.</span> <br />
          Get Paid <span className="text-zinc-300 italic">Instantly.</span>
        </h1>
        <p className="text-xl md:text-2xl text-zinc-500 max-w-3xl mx-auto mb-14 font-medium leading-relaxed">
          The world's friendliest freelance marketplace with built-in <span className="text-zinc-900 font-bold">Smart Escrow</span> and AI mediation. No more chasing payments. 💸
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <button onClick={onStart} className="w-full sm:w-auto bg-brand-600 text-white px-12 py-5 rounded-2xl font-black text-xl shadow-2xl shadow-brand-600/30 hover:bg-brand-700 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3">
            Hire Top Talent <ChevronRight size={24} />
          </button>
          <button onClick={onStart} className="w-full sm:w-auto bg-white border-4 border-zinc-100 text-zinc-900 px-12 py-5 rounded-2xl font-black text-xl hover:border-brand-200 transition-all hover:scale-105 active:scale-95">
            Find Your Next Gig
          </button>
        </div>
      </motion.div>

      {/* Floating Elements for Fun */}
      <div className="absolute top-1/4 left-10 hidden xl:block">
        <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 4, repeat: Infinity }} className="bg-white p-4 rounded-2xl shadow-2xl border border-zinc-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">💰</div>
          <div className="text-left"><p className="text-[10px] font-black text-zinc-400 uppercase">Payment Received</p><p className="font-black text-zinc-900">$4,500.00</p></div>
        </motion.div>
      </div>
      <div className="absolute bottom-1/4 right-10 hidden xl:block">
        <motion.div animate={{ y: [0, 20, 0] }} transition={{ duration: 5, repeat: Infinity }} className="bg-white p-4 rounded-2xl shadow-2xl border border-zinc-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-600">🤝</div>
          <div className="text-left"><p className="text-[10px] font-black text-zinc-400 uppercase">New Contract</p><p className="font-black text-zinc-900">TechFlow Inc.</p></div>
        </motion.div>
      </div>
    </section>
  </div>
);

// --- Main App ---

export default function App() {
  const [currentView, setCurrentView] = useState<View>('landing');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (currentView === 'landing') {
    return <LandingPageView onStart={() => setCurrentView('dashboard')} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardView />;
      case 'marketplace': return <MarketplaceView />;
      case 'project-chat': return <ProjectChatView />;
      case 'team': return <TeamManagementView />;
      case 'disputes': return <DisputesView />;
      case 'settings': return <SettingsView />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-40 bg-white border-r border-zinc-200 transition-all duration-300",
          sidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="h-16 flex items-center px-6 border-b border-zinc-100">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
            F
          </div>
          {sidebarOpen && <span className="ml-3 font-bold text-xl tracking-tight">Escrow</span>}
        </div>

        <nav className="p-4 space-y-2">
          <SidebarItem 
            icon={LayoutDashboard} 
            label={sidebarOpen ? "Dashboard" : ""} 
            active={currentView === 'dashboard'} 
            onClick={() => setCurrentView('dashboard')} 
            emoji="🏠"
          />
          <SidebarItem 
            icon={Briefcase} 
            label={sidebarOpen ? "Marketplace" : ""} 
            active={currentView === 'marketplace'} 
            onClick={() => setCurrentView('marketplace')} 
            emoji="🌟"
          />
          <SidebarItem 
            icon={MessageSquare} 
            label={sidebarOpen ? "Messages" : ""} 
            active={currentView === 'project-chat'} 
            onClick={() => setCurrentView('project-chat')} 
            emoji="💬"
          />
          <SidebarItem 
            icon={Users} 
            label={sidebarOpen ? "Team" : ""} 
            active={currentView === 'team'} 
            onClick={() => setCurrentView('team')} 
            emoji="🤝"
          />
          <SidebarItem 
            icon={Gavel} 
            label={sidebarOpen ? "Disputes" : ""} 
            active={currentView === 'disputes'} 
            onClick={() => setCurrentView('disputes')} 
            emoji="🛡️"
          />
          
          <div className="pt-8 pb-4">
            <p className={cn("text-[10px] font-black text-zinc-400 uppercase tracking-widest px-5 mb-3", !sidebarOpen && "hidden")}>
              System
            </p>
            <SidebarItem 
              icon={SettingsIcon} 
              label={sidebarOpen ? "Settings" : ""} 
              active={currentView === 'settings'} 
              onClick={() => setCurrentView('settings')} 
              emoji="⚙️"
            />
            <SidebarItem 
              icon={HelpCircle} 
              label={sidebarOpen ? "Support" : ""} 
              active={false} 
              onClick={() => {}} 
              emoji="🆘"
            />
          </div>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-zinc-100">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center gap-3 w-full px-4 py-3 text-zinc-500 hover:bg-zinc-100 rounded-xl transition-all"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            {sidebarOpen && <span className="font-medium whitespace-nowrap overflow-hidden">Collapse Menu</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main 
        className={cn(
          "flex-1 transition-all duration-300",
          sidebarOpen ? "ml-64" : "ml-20"
        )}
      >
        <Header currentView={currentView} />
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
