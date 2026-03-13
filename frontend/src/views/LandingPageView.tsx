import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { View } from '../types';
import { useWallet } from '../lib/WalletContext';

interface LandingPageViewProps {
  onNavigate: (view: View) => void;
}

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
    <div className="min-h-screen bg-white selection:bg-brand-100 selection:text-brand-900">
    <nav className="h-24 px-4 md:px-8 flex items-center justify-between max-w-7xl mx-auto">
      <div className="flex items-center gap-3 group cursor-pointer">
        <div className="w-10 h-10 md:w-12 md:h-12 bg-brand-600 rounded-2xl flex items-center justify-center text-white font-black text-xl md:text-2xl shadow-lg shadow-brand-600/20 group-hover:rotate-12 transition-transform">F</div>
        <span className="font-black text-2xl md:text-3xl tracking-tighter text-zinc-900">Escrow</span>
      </div>
      <div className="hidden lg:flex items-center gap-10 text-sm font-bold text-zinc-500">
        <a href="#" className="hover:text-brand-600 transition-colors">Marketplace</a>
        <a href="#" className="hover:text-brand-600 transition-colors">How it Works</a>
        <a href="#" className="hover:text-brand-600 transition-colors">Pricing</a>
      </div>
      <div className="flex items-center gap-4 md:gap-6">
        <button onClick={handleConnect} className="bg-zinc-900 text-white px-4 py-2 md:px-8 md:py-3.5 rounded-2xl font-black hover:bg-brand-600 transition-all shadow-2xl shadow-zinc-900/20 hover:scale-105 active:scale-95 text-sm md:text-base">
          {walletAddress ? 'Go to Dashboard' : 'Connect Wallet'}
        </button>
      </div>
    </nav>

    <section className="px-4 md:px-8 pt-16 md:pt-24 pb-32 md:pb-40 max-w-7xl mx-auto text-center relative overflow-hidden">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}>
        <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-600 px-5 py-2 rounded-full text-[10px] md:text-xs font-black border border-brand-100 mb-8 uppercase tracking-widest shadow-sm">
          <span>✨</span> The Future of Freelancing
        </div>
        <h1 className="text-4xl md:text-6xl lg:text-8xl font-black text-zinc-900 tracking-tighter mb-8 md:mb-10 leading-[1.1] md:leading-[0.95]">
          Work with <span className="text-brand-600">Confidence.</span> <br className="hidden md:block" />
          Get Paid <span className="text-zinc-300 italic">Instantly.</span>
        </h1>
        <p className="text-lg md:text-xl lg:text-2xl text-zinc-500 max-w-3xl mx-auto mb-10 md:mb-14 font-medium leading-relaxed">
          The world's friendliest freelance marketplace with built-in <span className="text-zinc-900 font-bold">Smart Escrow</span> and AI mediation.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6">
          <button onClick={() => onNavigate('marketplace')} className="w-full sm:w-auto bg-brand-600 text-white px-8 md:px-12 py-4 md:py-5 rounded-2xl font-black text-lg md:text-xl shadow-2xl shadow-brand-600/30 hover:bg-brand-700 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3">
            Hire Top Talent <ChevronRight size={24} />
          </button>
          <button onClick={handleConnect} className="w-full sm:w-auto bg-white border-4 border-zinc-100 text-zinc-900 px-8 md:px-12 py-4 md:py-5 rounded-2xl font-black text-lg md:text-xl hover:border-brand-200 transition-all hover:scale-105 active:scale-95">
            {walletAddress ? 'Go to Dashboard' : 'Connect Wallet'}
          </button>
        </div>
      </motion.div>
    </section>
  </div>
  );
};
