import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { supabase } from './supabase';

interface WalletContextType {
    walletAddress: string | null;
    isAdmin: boolean;
    connectWallet: () => Promise<void>;
    disconnectWallet: () => void;
    setIsAdmin: (isAdmin: boolean) => void;
}

const WalletContext = createContext<WalletContextType>({
    walletAddress: null,
    isAdmin: false,
    connectWallet: async () => {},
    disconnectWallet: () => {},
    setIsAdmin: () => {},
});


export const WalletProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);


    const registerUserIfNotExists = async (address: string) => {
        const addrLower = address.toLowerCase();
        try {
            const { data } = await supabase.from('users').select('wallet_address').eq('wallet_address', addrLower).single();
            if (!data) {
                await supabase.from('users').insert([{
                    wallet_address: addrLower,
                    full_name: '',
                    title: '',
                    bio: '',
                    hourly_rate: '',
                    skills: [],
                    avatar_url: ''
                }]);
                console.log("New user profile created for:", addrLower);
            }
        } catch (error) {
            console.error("Error checking/registering user in Supabase:", error);
        }
    };

    useEffect(() => {
        const checkConnection = async () => {
            if (window.ethereum) {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const accounts = await provider.listAccounts();
                if (accounts.length > 0) {
                    const address = accounts[0].address;
                    setWalletAddress(address);
                    await registerUserIfNotExists(address);
                }
            }
        };
        checkConnection();
    }, []);

    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                const address = accounts[0];
                setWalletAddress(address);
                await registerUserIfNotExists(address);
            } catch (error) { console.error("Connection failed", error); }
        } else { alert("Please install MetaMask!"); }
    };

    const disconnectWallet = () => {
        setWalletAddress(null);
        setIsAdmin(false);
    };

    return (
        <WalletContext.Provider value={{ walletAddress, connectWallet, disconnectWallet, isAdmin, setIsAdmin }}>
            {children}
        </WalletContext.Provider>
    );
};


export const useWallet = () => useContext(WalletContext);