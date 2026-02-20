import React from 'react';
import { motion } from 'motion/react';
import { Plus, Briefcase, ChevronRight } from 'lucide-react';
import { cn } from '../utils';

export const MarketplaceView: React.FC = () => (
  <div className="p-4 md:p-6 space-y-8">
    <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight">Explore Opportunities 🌟</h1>
        <p className="text-zinc-500 font-medium">Discover projects that match your unique skills and passion.</p>
      </div>
      <button className="w-full md:w-auto bg-brand-600 text-white px-8 py-3 rounded-2xl font-black shadow-xl shadow-brand-600/20 hover:bg-brand-700 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
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

    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
          className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group relative overflow-hidden"
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
