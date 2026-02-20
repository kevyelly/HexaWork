import React from 'react';
import { Search, Video, Mic, MoreHorizontal, Paperclip, Send, CheckCircle2, Clock, AlertCircle, FileText } from 'lucide-react';
import { cn } from '../utils';

export const ProjectChatView: React.FC = () => (
  <div className="flex h-[calc(100vh-80px)] bg-white overflow-hidden relative">
    {/* Chat List */}
    <div className="w-full md:w-80 border-r border-zinc-100 bg-zinc-50/50 flex flex-col absolute inset-0 md:relative z-20 bg-white md:bg-transparent transition-transform md:translate-x-0 -translate-x-full">
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
      <div className="h-20 border-b border-zinc-100 px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-zinc-200 overflow-hidden shadow-sm">
            <img src="https://picsum.photos/seed/TechFlow/100/100" alt="" referrerPolicy="no-referrer" />
          </div>
          <div>
            <h3 className="font-black text-zinc-900 text-sm md:text-base">TechFlow Inc. 🚀</h3>
            <p className="text-[10px] text-brand-600 font-black uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse"></span> Active Now
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 md:gap-3">
          <button className="p-2 md:p-3 text-zinc-400 hover:bg-zinc-50 hover:text-brand-600 rounded-2xl transition-all"><Video size={20} /></button>
          <button className="p-2 md:p-3 text-zinc-400 hover:bg-zinc-50 hover:text-brand-600 rounded-2xl transition-all"><Mic size={20} /></button>
          <button className="p-2 md:p-3 text-zinc-400 hover:bg-zinc-50 hover:text-brand-600 rounded-2xl transition-all"><MoreHorizontal size={20} /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 bg-[#F9FAFB]/50">
        <div className="flex justify-center">
          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest bg-white border border-zinc-100 px-4 py-1.5 rounded-full shadow-sm">Today</span>
        </div>
        
        <div className="flex gap-4 max-w-2xl">
          <div className="w-10 h-10 rounded-2xl bg-zinc-200 flex-shrink-0 overflow-hidden mt-1 shadow-sm">
            <img src="https://picsum.photos/seed/TechFlow/100/100" alt="" referrerPolicy="no-referrer" />
          </div>
          <div className="space-y-2">
            <div className="bg-white p-4 md:p-5 rounded-3xl rounded-tl-none border border-zinc-100 shadow-sm">
              <p className="text-sm text-zinc-700 font-medium leading-relaxed">Hi John! We've reviewed the latest dashboard mockups. The data visualization part is exactly what we were looking for. 😍</p>
            </div>
            <div className="bg-white p-4 md:p-5 rounded-3xl rounded-tl-none border border-zinc-100 shadow-sm">
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
            <div className="bg-brand-600 p-4 md:p-5 rounded-3xl rounded-tr-none shadow-xl shadow-brand-600/20">
              <p className="text-sm text-white font-medium leading-relaxed">Absolutely! I'll include the PDF export feature in Milestone 3. I've already started working on the library integration. 🛠️</p>
            </div>
            <span className="text-[10px] text-zinc-400 font-black mr-2 flex items-center gap-1">10:45 AM • <CheckCircle2 size={10} className="text-brand-500" /> Read</span>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 bg-white border-t border-zinc-100">
        <div className="max-w-4xl mx-auto flex items-end gap-2 md:gap-4">
          <button className="p-2 md:p-3.5 text-zinc-400 hover:bg-zinc-50 hover:text-brand-600 rounded-2xl transition-all"><Paperclip size={22} /></button>
          <div className="flex-1 relative">
            <textarea 
              placeholder="Write a friendly message..." 
              rows={1}
              className="w-full pl-4 pr-12 md:pl-5 md:pr-14 py-3 md:py-4 bg-zinc-50 border border-zinc-100 rounded-[1.5rem] text-sm font-medium outline-none focus:bg-white focus:border-brand-500 transition-all resize-none shadow-inner"
            />
            <button className="absolute right-2 bottom-2 md:right-2.5 md:bottom-2.5 p-2 md:p-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20 active:scale-90">
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
