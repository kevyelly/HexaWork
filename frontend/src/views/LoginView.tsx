import React from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, ChevronRight, Github, Chrome } from 'lucide-react';
import { View } from '../types';

interface LoginViewProps {
  onNavigate: (view: View) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[2.5rem] border border-zinc-200 shadow-2xl p-8 md:p-10"
      >
        <div className="text-center mb-10">
          <div 
            onClick={() => onNavigate('landing')}
            className="w-12 h-12 bg-brand-600 rounded-2xl flex items-center justify-center text-white font-black text-xl mx-auto mb-6 cursor-pointer shadow-lg shadow-brand-600/20 hover:rotate-12 transition-transform"
          >
            F
          </div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Welcome Back</h1>
          <p className="text-zinc-500 font-medium mt-2">Log in to your escrow dashboard</p>
        </div>

        <div className="space-y-4 mb-8">
          <button className="w-full flex items-center justify-center gap-3 py-4 bg-white border-2 border-zinc-100 rounded-2xl font-bold text-zinc-700 hover:bg-zinc-50 hover:border-zinc-200 transition-all">
            <Chrome size={20} className="text-red-500" />
            Continue with Google
          </button>
          <button className="w-full flex items-center justify-center gap-3 py-4 bg-zinc-900 border-2 border-zinc-900 rounded-2xl font-bold text-white hover:bg-zinc-800 transition-all">
            <Github size={20} />
            Continue with GitHub
          </button>
        </div>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-100"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase font-black tracking-widest text-zinc-400">
            <span className="bg-white px-4">Or with email</span>
          </div>
        </div>

        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onNavigate('dashboard'); }}>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input 
                type="email" 
                placeholder="name@company.com"
                className="w-full pl-12 pr-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl outline-none focus:bg-white focus:border-brand-500 transition-all font-medium shadow-inner"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Password</label>
              <a href="#" className="text-[10px] font-black text-brand-600 uppercase tracking-widest hover:underline">Forgot?</a>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input 
                type="password" 
                placeholder="••••••••"
                className="w-full pl-12 pr-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl outline-none focus:bg-white focus:border-brand-500 transition-all font-medium shadow-inner"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-brand-600 text-white py-5 rounded-2xl font-black text-lg shadow-2xl shadow-brand-600/30 hover:bg-brand-700 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
          >
            Sign In <ChevronRight size={20} />
          </button>
        </form>

        <p className="text-center mt-10 text-zinc-500 font-medium text-sm">
          Don't have an account?{' '}
          <button 
            onClick={() => onNavigate('signup')}
            className="text-brand-600 font-black hover:underline"
          >
            Create one for free
          </button>
        </p>
      </motion.div>
    </div>
  );
};
