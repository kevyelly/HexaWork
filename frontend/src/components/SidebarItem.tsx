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
    hasNotification?: boolean; 
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
                                                            icon: Icon,
                                                            label,
                                                            active,
                                                            onClick,
                                                            emoji,
                                                            collapsed,
                                                            hasNotification
                                                        }) => (
    <button
        onClick={onClick}
        title={collapsed ? label : undefined}
        className={cn(
            "flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl transition-all duration-200 group relative overflow-hidden",
            active
                ? "bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-600/30"
                : hasNotification
                    ? "bg-red-50/30 hover:bg-red-50 text-zinc-900"
                    : "text-zinc-500 hover:bg-brand-50 hover:text-brand-700"
        )}
    >
        {active && (
            <motion.div
                layoutId="sidebar-active-bg"
                className="absolute inset-0 bg-gradient-to-r from-brand-600 to-violet-500 opacity-100 rounded-2xl"
                style={{ zIndex: -1 }}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
            />
        )}

        <div className="relative flex-shrink-0">
            <Icon
                size={20}
                className={cn(
                    "transition-transform duration-200",
                    active ? "text-white scale-110" : hasNotification ? "text-red-500 scale-110" : "text-zinc-400 group-hover:text-brand-600 group-hover:scale-110"
                )}
            />
            {hasNotification && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-pulse shadow-sm" />
            )}
        </div>

        {!collapsed && (
            <span className={cn(
                "text-sm whitespace-nowrap overflow-hidden flex-1 text-left transition-all",
                active ? "font-bold text-white" : hasNotification ? "font-black text-red-600" : "font-bold"
            )}>
        {label}
      </span>
        )}

        {!collapsed && emoji && <span className="text-base">{emoji}</span>}

        {active && collapsed && (
            <span className="absolute right-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full" />
        )}
    </button>
);