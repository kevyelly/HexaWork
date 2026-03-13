import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Shield, Zap, Users, Star } from 'lucide-react';
import { View } from '../types';
import { useWallet } from '../lib/WalletContext';

interface LandingPageViewProps {
  onNavigate: (view: View) => void;
}

const features = [
  { icon: Shield, title: 'Smart Escrow', desc: 'Funds locked in a blockchain contract. No risk, no trust issues.', color: 'bg-violet-50 text-violet-600' },
  { icon: Zap,    title: 'Instant Payouts', desc: 'Milestone approved? Funds released in seconds — not days.', color: 'bg-amber-50 text-amber-600' },
  { icon: Users,  title: 'AI Mediation', desc: 'Disputes resolved fairly by AI with on-chain evidence.', color: 'bg-emerald-50 text-emerald-600' },
];

export const LandingPageView: React.FC<LandingPageViewProps> = ({ onNavigate }) => {
  const { connectWallet, walletAddress } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (walletAddress && isConnecting) {
      onNavigate('dashboard');
    }
  }, [walletAddress, isConnecting, onNavigate]);

  const handleConnect = async () => {
    if (walletAddress) {
      onNavigate('dashboard');
    } else {
      setIsConnecting(true);
      await connectWallet();
    }
  };

  return (
    <div className="min-h-screen bg-white selection:bg-brand-100 selection:text-brand-900 overflow-x-hidden">

      {/* ── NAV ── */}
      <nav className="h-20 px-6 md:px-12 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-600 to-violet-500 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-brand-600/30">
            H
          </div>
          <span className="font-black text-2xl tracking-tight text-zinc-900">HexaWork</span>
        </div>
        <div className="hidden lg:flex items-center gap-8 text-sm font-bold text-zinc-400">
          <a href="#features" className="hover:text-brand-600 transition-colors">Features</a>
          <a href="#how" className="hover:text-brand-600 transition-colors">How it Works</a>
        </div>
        <button
          onClick={handleConnect}
          className="bg-zinc-900 text-white px-6 py-2.5 rounded-2xl font-black hover:bg-brand-600 transition-all shadow-xl shadow-zinc-900/20 hover:scale-105 active:scale-95 text-sm"
        >
          {walletAddress ? 'Dashboard →' : 'Connect Wallet'}
        </button>
      </nav>

      {/* ── HERO ── */}
      <section className="relative px-6 md:px-12 pt-20 md:pt-32 pb-24 max-w-7xl mx-auto text-center overflow-hidden">

        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-br from-brand-100 via-violet-100 to-indigo-50 rounded-full blur-3xl opacity-60" />
        <div className="pointer-events-none absolute top-10 -left-20 w-64 h-64 bg-brand-200 rounded-full blur-3xl opacity-20" />
        <div className="pointer-events-none absolute top-20 -right-20 w-64 h-64 bg-violet-200 rounded-full blur-3xl opacity-20" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative z-10"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 px-5 py-2 rounded-full text-xs font-black border border-brand-100 mb-10 uppercase tracking-widest shadow-sm">
            <Star size={12} className="fill-brand-600 text-brand-600" />
            Blockchain-Powered Freelancing
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-black text-zinc-900 tracking-tighter mb-8 leading-[1.05]">
            Work with{' '}
            <span className="bg-gradient-to-r from-brand-600 to-violet-500 bg-clip-text text-transparent">
              Confidence.
            </span>
            <br className="hidden md:block" />
            Get Paid{' '}
            <span className="text-zinc-300 italic font-black">Instantly.</span>
          </h1>

          <p className="text-lg md:text-xl text-zinc-500 max-w-2xl mx-auto mb-12 leading-relaxed">
            HexaWork is the world's friendliest freelance marketplace with built-in{' '}
            <span className="text-zinc-900 font-bold">Smart Escrow</span> — protecting both sides of every deal.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleConnect}
              className="group w-full sm:w-auto bg-gradient-to-r from-brand-600 to-violet-600 text-white px-10 py-4 rounded-2xl font-black text-lg shadow-2xl shadow-brand-600/30 hover:shadow-brand-600/50 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
            >
              {walletAddress ? 'Go to Dashboard' : 'Get Started Free'}
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => onNavigate('jobmarket' as View)}
              className="w-full sm:w-auto bg-white border-2 border-zinc-100 text-zinc-700 px-10 py-4 rounded-2xl font-black text-lg hover:border-brand-200 hover:text-brand-700 transition-all hover:scale-105 active:scale-95"
            >
              Browse Jobs
            </button>
          </div>

          {/* Social proof */}
          <p className="mt-8 text-sm text-zinc-400 font-bold">
            🔒 Secured by blockchain escrow &nbsp;·&nbsp; ⚡ Instant milestone payouts
          </p>
        </motion.div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="px-6 md:px-12 pb-32 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i + 0.3, duration: 0.5, ease: 'easeOut' }}
              className="bg-white p-8 rounded-[2rem] border border-zinc-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${f.color} group-hover:scale-110 transition-transform`}>
                <f.icon size={22} />
              </div>
              <h3 className="font-black text-zinc-900 text-lg mb-2">{f.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};
