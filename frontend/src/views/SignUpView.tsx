import React from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, User, ChevronRight, Github, Chrome, ShieldCheck } from 'lucide-react';
import { View } from '../types';

interface SignUpViewProps {
  onNavigate: (view: View) => void;
}

export const SignUpView: React.FC<SignUpViewProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl bg-white rounded-[3rem] border border-zinc-200 shadow-2xl p-8 md:p-12"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <div 
              onClick={() => onNavigate('landing')}
              className="w-12 h-12 bg-brand-600 rounded-2xl flex items-center justify-center text-white font-black text-xl mb-8 cursor-pointer shadow-lg shadow-brand-600/20 hover:rotate-12 transition-transform"
            >
              F
            </div>
            <h1 className="text-4xl font-black text-zinc-900 tracking-tight leading-tight mb-4">Join the <span className="text-brand-600">Future</span> of Work.</h1>
            <p className="text-zinc-500 font-medium mb-8">Create your account and start working with smart escrow protection today.</p>
            
            <div className="space-y-6">
              {[
                { icon: ShieldCheck, title: 'Smart Escrow', desc: 'Secure payments held in trust.' },
                { icon: User, title: 'Top Talent', desc: 'Work with the best in the industry.' }
              ].map((feature, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600 flex-shrink-0">
                    <feature.icon size={20} />
                  </div>
                  <div>
                    <h4 className="font-black text-zinc-900 text-sm">{feature.title}</h4>
                    <p className="text-xs text-zinc-500 font-medium">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 py-3 bg-white border border-zinc-200 rounded-xl font-bold text-xs text-zinc-700 hover:bg-zinc-50 transition-all">
                <Chrome size={16} className="text-red-500" /> Google
              </button>
              <button className="flex items-center justify-center gap-2 py-3 bg-zinc-900 rounded-xl font-bold text-xs text-white hover:bg-zinc-800 transition-all">
                <Github size={16} /> GitHub
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-100"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest text-zinc-400">
                <span className="bg-white px-4">Or email</span>
              </div>
            </div>

            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onNavigate('dashboard'); }}>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="John Doe"
                    className="w-full pl-11 pr-4 py-3.5 bg-zinc-50 border border-zinc-100 rounded-xl outline-none focus:bg-white focus:border-brand-500 transition-all text-sm font-medium shadow-inner"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                  <input 
                    type="email" 
                    placeholder="name@company.com"
                    className="w-full pl-11 pr-4 py-3.5 bg-zinc-50 border border-zinc-100 rounded-xl outline-none focus:bg-white focus:border-brand-500 transition-all text-sm font-medium shadow-inner"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3.5 bg-zinc-50 border border-zinc-100 rounded-xl outline-none focus:bg-white focus:border-brand-500 transition-all text-sm font-medium shadow-inner"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-brand-600 text-white py-4 rounded-xl font-black shadow-xl shadow-brand-600/20 hover:bg-brand-700 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
              >
                Create Account <ChevronRight size={18} />
              </button>
            </form>

            <p className="text-center text-zinc-500 font-medium text-xs">
              Already have an account?{' '}
              <button 
                onClick={() => onNavigate('login')}
                className="text-brand-600 font-black hover:underline"
              >
                Log in
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
