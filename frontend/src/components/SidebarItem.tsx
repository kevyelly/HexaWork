import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../utils';

interface SidebarItemProps {
  icon: any;
  label: string;
  active: boolean;
  onClick: () => void;
  emoji?: string;
  collapsed?: boolean;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({ 
  icon: Icon, 
  label, 
  active, 
  onClick,
  emoji,
  collapsed
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
    {!collapsed && <span className="font-black whitespace-nowrap overflow-hidden flex-1 text-left">{label}</span>}
    {!collapsed && emoji && <span className="text-lg">{emoji}</span>}
    {active && (
      <motion.div 
        layoutId="active-pill"
        className="absolute left-0 w-1.5 h-8 bg-white rounded-full ml-1.5"
      />
    )}
  </button>
);
