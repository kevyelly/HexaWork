import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ChevronRight } from "lucide-react";
import { View } from "../types";
import { useWallet } from "../lib/WalletContext";

interface LandingPageViewProps {
    onNavigate: (view: View) => void;
}

// Reusable Hexagon SVG component to keep the code clean
const HexagonShape = ({ className }: { className?: string }) => (
    <svg
        viewBox="0 0 100 100"
        className={className}
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M50 5 L93 30 V70 L50 95 L7 70 V30 Z" />
    </svg>
);

export const LandingPageView: React.FC<LandingPageViewProps> = ({
    onNavigate,
}) => {
    const { connectWallet, walletAddress } = useWallet();
    const [isConnecting, setIsConnecting] = useState(false);

    useEffect(() => {
        if (walletAddress && isConnecting) {
            onNavigate("dashboard");
        }
    }, [walletAddress, isConnecting, onNavigate]);

    const handleConnect = async () => {
        if (walletAddress) {
            onNavigate("dashboard");
        } else {
            setIsConnecting(true);
            await connectWallet();
        }
    };

    return (
        <div className="relative min-h-screen bg-white selection:bg-brand-100 selection:text-brand-900 overflow-hidden">
            {/* Background Decor: Mesh Gradients, Dot Grid, and Floating Hexagons */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                {/* Subtle dot grid for a technical feel */}
                <div
                    className="absolute inset-0 opacity-[0.15]"
                    style={{
                        backgroundImage:
                            "radial-gradient(#94a3b8 1px, transparent 1px)",
                        backgroundSize: "32px 32px",
                    }}
                />

                {/* Soft radial mesh glows */}
                <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-brand-400/20 blur-[120px] rounded-full" />
                <div className="absolute top-1/2 -right-60 w-[500px] h-[500px] bg-purple-400/10 blur-[150px] rounded-full" />

                {/* --- LEFT SIDE HEXAGONS --- */}
                {/* Large blurred background hexagon */}
                <motion.div
                    animate={{ y: [0, -40, 0], rotate: [0, 5, 0] }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute top-20 -left-20 w-80 h-80 text-purple-200/30 blur-[24px]"
                >
                    <HexagonShape />
                </motion.div>

                {/* Medium sharp/glassy hexagon */}
                <motion.div
                    animate={{
                        y: [0, 30, 0],
                        x: [0, 15, 0],
                        rotate: [15, -10, 15],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1,
                    }}
                    className="absolute top-1/2 left-10 md:left-24 w-24 h-24 text-brand-300/40 blur-[2px]"
                >
                    <HexagonShape />
                </motion.div>

                {/* Small fast floating hexagon */}
                <motion.div
                    animate={{ y: [0, -50, 0], rotate: [0, 45, 0] }}
                    transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2,
                    }}
                    className="absolute bottom-32 left-32 w-12 h-12 text-purple-400/20"
                >
                    <HexagonShape />
                </motion.div>

                {/* --- RIGHT SIDE HEXAGONS --- */}
                {/* Massive subtle background hexagon */}
                <motion.div
                    animate={{ y: [0, 50, 0], rotate: [0, -10, 0] }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute top-[40%] -right-32 w-96 h-96 text-brand-100/40 blur-[32px]"
                >
                    <HexagonShape />
                </motion.div>

                {/* Medium prominent hexagon */}
                <motion.div
                    animate={{
                        y: [0, -25, 0],
                        x: [0, -10, 0],
                        rotate: [-15, 5, -15],
                    }}
                    transition={{
                        duration: 7,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1.5,
                    }}
                    className="absolute top-40 right-10 md:right-32 w-32 h-32 text-purple-300/50 blur-[3px]"
                >
                    <HexagonShape />
                </motion.div>

                {/* Small sharp rotating hexagon */}
                <motion.div
                    animate={{ y: [0, 20, 0], rotate: [0, -90, 0] }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.5,
                    }}
                    className="absolute bottom-40 right-48 w-16 h-16 text-brand-400/30 blur-[1px]"
                >
                    <HexagonShape />
                </motion.div>

                {/* --- INNER SCATTERED HEXAGONS (The 4 extra ones!) --- */}
                {/* Center-left inner floater */}
                <motion.div
                    animate={{
                        y: [0, -30, 0],
                        x: [0, 20, 0],
                        rotate: [0, 180, 0],
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    className="absolute top-1/4 left-[20%] w-16 h-16 text-brand-500/15 blur-[1px]"
                >
                    <HexagonShape />
                </motion.div>

                {/* Center-right inner floater */}
                <motion.div
                    animate={{ y: [0, 40, 0], rotate: [-45, 45, -45] }}
                    transition={{
                        duration: 9,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.8,
                    }}
                    className="absolute bottom-1/3 right-[25%] w-20 h-20 text-purple-500/15 blur-[2px]"
                >
                    <HexagonShape />
                </motion.div>

                {/* Top-right tiny spinner */}
                <motion.div
                    animate={{ y: [0, -15, 0], rotate: [0, 90, 0] }}
                    transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1.2,
                    }}
                    className="absolute top-10 right-[30%] w-10 h-10 text-brand-200/30"
                >
                    <HexagonShape />
                </motion.div>

                {/* Bottom-center large pulsing glow */}
            </div>

            {/* Navbar */}
            <nav className="relative z-10 h-24 px-4 md:px-8 flex items-center justify-between max-w-7xl mx-auto">
                <div className="flex items-center gap-3 group cursor-pointer">
                    {/* Logo - 'H' inside a Hexagon */}
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-brand-600/10 border border-zinc-100 group-hover:rotate-12 group-hover:scale-110 transition-transform">
                        <svg
                            viewBox="0 0 100 100"
                            className="w-full h-full p-1.5"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M50 5 L93 30 V70 L50 95 L7 70 V30 Z"
                                fill="#7c3aed"
                            />
                            <path
                                d="M35 25V75"
                                stroke="white"
                                strokeWidth="8"
                                strokeLinecap="round"
                            />
                            <path
                                d="M65 25V75"
                                stroke="white"
                                strokeWidth="8"
                                strokeLinecap="round"
                            />
                            <path
                                d="M35 50H65"
                                stroke="white"
                                strokeWidth="8"
                                strokeLinecap="round"
                            />
                        </svg>
                    </div>
                    {/* Brand Name */}
                    <span className="font-black text-2xl md:text-3xl tracking-tighter text-zinc-900">
                        HexaWork
                    </span>
                </div>
                <div className="hidden lg:flex items-center gap-10 text-sm font-bold text-zinc-500">
                    <a
                        href="#"
                        className="hover:text-brand-600 transition-colors"
                    >
                        Marketplace
                    </a>
                    <a
                        href="#"
                        className="hover:text-brand-600 transition-colors"
                    >
                        How it Works
                    </a>
                    <a
                        href="#"
                        className="hover:text-brand-600 transition-colors"
                    >
                        Pricing
                    </a>
                </div>
                <div className="flex items-center gap-4 md:gap-6">
                    <button
                        onClick={handleConnect}
                        className="bg-zinc-900 text-white px-4 py-2 md:px-8 md:py-3.5 rounded-2xl font-black hover:bg-brand-600 transition-all shadow-2xl shadow-zinc-900/20 hover:scale-105 active:scale-95 text-sm md:text-base"
                    >
                        {walletAddress ? "Go to Dashboard" : "Connect Wallet"}
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative z-10 px-4 md:px-8 pt-16 md:pt-28 pb-32 md:pb-48 max-w-7xl mx-auto text-center flex flex-col items-center justify-center">
                <div className="flex flex-col items-center w-full">
                    {/* Tag */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.8,
                            delay: 0.1,
                            ease: "easeOut",
                        }}
                        className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm text-brand-600 px-5 py-2 rounded-full text-[10px] md:text-xs font-black border border-brand-100 mb-8 uppercase tracking-widest shadow-sm"
                    >
                        <span>✨</span> The Future of Freelancing
                    </motion.div>

                    {/* Headline */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.8,
                            delay: 0.25,
                            ease: "easeOut",
                        }}
                    >
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-zinc-900 tracking-tighter mb-8 md:mb-10 leading-[1.1] md:leading-[0.95]">
                            Work with{" "}
                            <span className="text-brand-600">Confidence.</span>{" "}
                            <br className="hidden md:block" />
                            Get Paid{" "}
                            <span className="bg-gradient-to-r from-zinc-400 to-zinc-200 bg-clip-text text-transparent italic">
                                Instantly.
                            </span>
                        </h1>
                    </motion.div>

                    {/* Subheadline */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.8,
                            delay: 0.4,
                            ease: "easeOut",
                        }}
                        className="text-lg md:text-xl lg:text-2xl text-zinc-500 max-w-3xl mx-auto mb-10 md:mb-14 font-medium leading-relaxed"
                    >
                        The world's friendliest freelance marketplace with
                        built-in{" "}
                        <span className="text-zinc-900 font-bold">
                            Smart Escrow
                        </span>{" "}
                        and AI mediation.
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.8,
                            delay: 0.55,
                            ease: "easeOut",
                        }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 w-full sm:w-auto"
                    >
                        <button
                            onClick={() => onNavigate("marketplace")}
                            className="w-full sm:w-auto bg-brand-600 text-white px-8 md:px-12 py-4 md:py-5 rounded-2xl font-black text-lg md:text-xl shadow-2xl shadow-brand-600/30 hover:bg-brand-700 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
                        >
                            Hire Top Talent <ChevronRight size={24} />
                        </button>
                        <button
                            onClick={handleConnect}
                            className="w-full sm:w-auto bg-white/50 backdrop-blur-md border-2 border-zinc-200 text-zinc-900 px-8 md:px-12 py-4 md:py-5 rounded-2xl font-black text-lg md:text-xl hover:border-brand-300 hover:bg-white transition-all hover:scale-105 active:scale-95"
                        >
                            {walletAddress
                                ? "Go to Dashboard"
                                : "Connect Wallet"}
                        </button>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};