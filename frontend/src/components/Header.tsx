import React from 'react';
import { Search, Bell, Menu, Wallet } from 'lucide-react';
import { View } from '../types';
import { useWallet } from '../lib/WalletContext';

interface HeaderProps { currentView: View; onMenuClick: () => void; }

export const Header: React.FC<HeaderProps> = ({ currentView, onMenuClick }) => {
    const { walletAddress, connectWallet } = useWallet();

    const formatAddress = (address: string) => `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;

    return (
        <header className="h-20 border-b border-zinc-100 bg-white/80 backdrop-blur-xl sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <button onClick={onMenuClick} className="p-2 hover:bg-zinc-100 rounded-xl lg:hidden"><Menu size={24} /></button>
                <h2 className="text-lg md:text-xl font-black text-zinc-900 capitalize tracking-tight">{currentView.replace('-', ' ')}</h2>
            </div>
            <div className="flex items-center gap-3 md:gap-6">
                {walletAddress ? (
                    <div className="flex items-center gap-3 p-1.5 pr-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                        <div className="w-8 h-8 rounded-xl bg-brand-100 flex items-center justify-center text-brand-700 font-black text-xs"><Wallet size={16} /></div>
                        <div className="text-left">
                            <p className="text-xs font-black text-zinc-900 leading-none">{formatAddress(walletAddress)}</p>
                            <p className="text-[10px] font-black text-green-500 uppercase tracking-widest mt-1">Connected ⚡</p>
                        </div>
                    </div>
                ) : (
                    <button onClick={connectWallet} className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-2xl font-bold text-sm hover:bg-zinc-800 transition-all">
                        <Wallet size={18} /> Connect Wallet
                    </button>
                )}
            </div>
        </header>
    );
};