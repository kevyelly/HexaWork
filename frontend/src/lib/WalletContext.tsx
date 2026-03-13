import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

interface WalletContextType {
    walletAddress: string | null;
    connectWallet: () => Promise<void>;
    disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType>({
    walletAddress: null,
    connectWallet: async () => {},
    disconnectWallet: () => {},
});

export const WalletProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
    const [walletAddress, setWalletAddress] = useState<string | null>(null);

    useEffect(() => {
        const checkConnection = async () => {
            if (window.ethereum) {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const accounts = await provider.listAccounts();
                if (accounts.length > 0) setWalletAddress(accounts[0].address);
            }
        };
        checkConnection();
    }, []);

    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                setWalletAddress(accounts[0]);
            } catch (error) { console.error("Connection failed", error); }
        } else { alert("Please install MetaMask!"); }
    };

    const disconnectWallet = () => {
        setWalletAddress(null);
    };

    return (
        <WalletContext.Provider value={{ walletAddress, connectWallet, disconnectWallet }}>
            {children}
        </WalletContext.Provider>
    );
};

export const useWallet = () => useContext(WalletContext);