import React from 'react';
import { Search, Bell, Menu } from 'lucide-react';
import { View } from '../types';

interface HeaderProps {
  currentView: View;
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onMenuClick }) => (
  <header className="h-20 border-b border-zinc-100 bg-white/80 backdrop-blur-xl sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between">
    <div className="flex items-center gap-4">
      <button 
        onClick={onMenuClick}
        className="p-2 hover:bg-zinc-100 rounded-xl lg:hidden"
      >
        <Menu size={24} />
      </button>
      <h2 className="text-lg md:text-xl font-black text-zinc-900 capitalize tracking-tight">
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
    
    <div className="flex items-center gap-3 md:gap-6">
      <div className="relative hidden md:block">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
        <input 
          type="text" 
          placeholder="Search for anything..." 
          className="pl-12 pr-6 py-3 bg-zinc-50 border border-zinc-100 focus:bg-white focus:border-brand-500 rounded-[1.25rem] text-sm w-48 lg:w-72 transition-all outline-none font-medium shadow-inner"
        />
      </div>
      
      <button className="p-2 md:p-3 text-zinc-400 hover:bg-zinc-50 hover:text-brand-600 rounded-2xl relative transition-all">
        <Bell size={22} />
        <span className="absolute top-2 right-2 md:top-3 md:right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm"></span>
      </button>
      
      <div className="h-10 w-px bg-zinc-100 mx-1 hidden sm:block"></div>
      
      <button className="flex items-center gap-3 p-1.5 pr-2 md:pr-4 hover:bg-zinc-50 rounded-2xl transition-all group">
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-brand-100 flex items-center justify-center text-brand-700 font-black text-xs shadow-sm group-hover:rotate-6 transition-transform">
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
