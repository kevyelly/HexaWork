import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar as CalendarIcon, Clock, CheckCircle2, AlertCircle, Loader2, ChevronRight, ChevronLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useWallet } from '../lib/WalletContext';
import { cn } from '../utils';

interface Milestone {
    id: string;
    project_id: string;
    title: string;
    status: string;
    due_date: string;
    amount: string;
}

export const CalendarView: React.FC = () => {
    const { walletAddress } = useWallet();
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    useEffect(() => {
        const fetchMilestones = async () => {
            if (!walletAddress) {
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            try {
                const { data } = await supabase
                    .from('project_milestones')
                    .select('*')
                    .ilike('project_id', `%${walletAddress.toLowerCase()}%`)
                    .order('due_date', { ascending: true });

                if (data) setMilestones(data);
            } catch (err) {
                console.error("Error fetching calendar milestones:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMilestones();
    }, [walletAddress]);

    const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));

    // Group milestones by date-string
    const grouped = milestones.reduce((acc, m) => {
        const dateKey = new Date(m.due_date).toDateString();
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(m);
        return acc;
    }, {} as Record<string, Milestone[]>);

    // Get days for current month
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
        
        const daysArray = [];
        for (let i = 0; i < firstDayIndex; i++) {
            daysArray.push(null);
        }
        for (let i = 1; i <= days; i++) {
            daysArray.push(new Date(year, month, i));
        }
        return daysArray;
    };

    const calendarDays = getDaysInMonth(currentMonth);

    const isToday = (date: Date) => {
        const today = new Date();
        return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    };

    return (
        <div className="p-4 md:p-6 space-y-8">
            <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight">Calendar</h1>
                    <p className="text-zinc-500 font-medium">Keep track of your upcoming deadlines and deliveries.</p>
                </div>
                <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-zinc-200 shadow-sm">
                    <button onClick={prevMonth} className="p-2 hover:bg-zinc-100 rounded-xl transition-all"><ChevronLeft size={20} /></button>
                    <span className="font-black text-zinc-900 w-32 text-center">
                        {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </span>
                    <button onClick={nextMonth} className="p-2 hover:bg-zinc-100 rounded-xl transition-all"><ChevronRight size={20} /></button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left: Custom Calendar Grid */}
                <div className="lg:w-2/3 bg-white rounded-[2rem] border border-zinc-200 shadow-sm p-6 md:p-8">
                    <div className="grid grid-cols-7 gap-2 mb-4 text-center">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <span key={day} className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">{day}</span>
                        ))}
                    </div>
                    
                    {isLoading ? (
                        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-600" size={40} /></div>
                    ) : (
                        <div className="grid grid-cols-7 gap-2">
                            {calendarDays.map((date, i) => {
                                if (!date) return <div key={`empty-${i}`} className="h-24 md:h-32 rounded-2xl bg-zinc-50/50"></div>;
                                
                                const dateKey = date.toDateString();
                                const dayMilestones = grouped[dateKey] || [];
                                const isCurrent = isToday(date);
                                
                                return (
                                    <div 
                                        key={date.toISOString()} 
                                        className={cn(
                                            "h-24 md:h-32 rounded-2xl p-2 md:p-3 border flex flex-col transition-all overflow-hidden",
                                            isCurrent ? "border-brand-500 bg-brand-50 shadow-md shadow-brand-500/20" : "border-zinc-100 bg-white hover:border-brand-300 hover:shadow-sm"
                                        )}
                                    >
                                        <span className={cn(
                                            "text-xs md:text-sm font-black w-6 h-6 flex items-center justify-center rounded-full mb-1",
                                            isCurrent ? "bg-brand-600 text-white" : "text-zinc-600"
                                        )}>
                                            {date.getDate()}
                                        </span>
                                        
                                        <div className="flex-1 overflow-y-auto space-y-1 mt-1 custom-scrollbar">
                                            {dayMilestones.map((m, idx) => (
                                                <div key={idx} className={cn(
                                                    "text-[9px] md:text-[10px] font-bold p-1.5 rounded-lg line-clamp-2 leading-tight",
                                                    m.status === 'approved' ? "bg-emerald-100 text-emerald-800" :
                                                    m.status === 'submitted' ? "bg-blue-100 text-blue-800" :
                                                    m.status === 'rejected' ? "bg-red-100 text-red-800" :
                                                    "bg-brand-100 text-brand-800"
                                                )}>
                                                    • {m.title}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Right: Upcoming List */}
                <div className="lg:w-1/3 bg-white rounded-[2rem] border border-zinc-200 shadow-sm overflow-hidden flex flex-col h-[800px]">
                    <div className="p-6 md:p-8 border-b border-zinc-100 flex items-center gap-3">
                        <CalendarIcon className="text-brand-600" size={24} />
                        <h3 className="text-xl font-bold text-zinc-900">Agenda</h3>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-4 bg-zinc-50/30">
                        {isLoading ? (
                            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-brand-600" size={32} /></div>
                        ) : milestones.length === 0 ? (
                            <div className="text-center text-zinc-500 font-bold py-10">No upcoming milestones found!</div>
                        ) : (
                            milestones.map((m) => (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    key={m.id} 
                                    className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm flex flex-col gap-3 group hover:border-brand-300 transition-colors cursor-pointer"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2">
                                            <span className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600 font-black">
                                                {new Date(m.due_date).getDate()}
                                            </span>
                                            <div>
                                                <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">{new Date(m.due_date).toLocaleString('default', { month: 'short' })}</p>
                                                <p className="text-xs font-bold text-brand-600">{m.amount} PAS</p>
                                            </div>
                                        </div>
                                        
                                        <span className={cn(
                                            "text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-1 uppercase tracking-widest",
                                            m.status === 'approved' ? "bg-emerald-100 text-emerald-700" :
                                            m.status === 'submitted' ? "bg-blue-100 text-blue-700" :
                                            m.status === 'rejected' ? "bg-red-100 text-red-700" :
                                            "bg-zinc-100 text-zinc-500"
                                        )}>
                                            {m.status === 'approved' ? <CheckCircle2 size={10} /> :
                                            m.status === 'rejected' ? <AlertCircle size={10} /> : <Clock size={10} />}
                                            {m.status}
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-zinc-900 leading-tight group-hover:text-brand-600 transition-colors">{m.title}</h4>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
