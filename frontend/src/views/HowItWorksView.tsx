import React from 'react';
import { motion } from 'motion/react';
import { View } from '../types';
import {
    Wallet, Briefcase, FileText, Shield, Cpu, CheckCircle2, Star,
    ArrowRight, Zap, Lock, Users, TrendingUp, ChevronLeft, AlertCircle, DollarSign,
} from 'lucide-react';

interface HowItWorksViewProps {
    onNavigate: (view: View) => void;
}

const steps = [
    {
        step: '01',
        icon: Wallet,
        title: 'Connect Your Wallet',
        description: 'Link your Polkadot wallet to get started. No email, no passwords — your wallet is your identity on HexaWork.',
        color: 'from-brand-600 to-violet-500',
        bg: 'bg-brand-50',
        detail: 'We use non-custodial wallet authentication, so you always own your keys and your funds.',
    },
    {
        step: '02',
        icon: Briefcase,
        title: 'Post or Browse Jobs',
        description: 'Employers post projects with clear milestones and budgets. Freelancers browse and apply with a cover letter and portfolio.',
        color: 'from-indigo-500 to-blue-500',
        bg: 'bg-indigo-50',
        detail: 'Jobs are tagged by skill, experience level, and project type so you find the perfect match fast.',
    },
    {
        step: '03',
        icon: FileText,
        title: 'Submit Milestones',
        description: 'Work is tracked through milestone-based deliverables. Freelancers submit completed work for each milestone.',
        color: 'from-emerald-500 to-teal-500',
        bg: 'bg-emerald-50',
        detail: 'Milestone payments are held in a smart contract escrow until the deliverable is accepted by the employer.',
    },
    {
        step: '04',
        icon: Cpu,
        title: 'AI Quality Audit',
        description: 'Our AI arbitrator independently reviews submitted work against the milestone requirements for objective quality scoring.',
        color: 'from-amber-500 to-orange-500',
        bg: 'bg-amber-50',
        detail: 'The AI verdict is one signal — if you disagree, you can always escalate to the human dispute center.',
    },
    {
        step: '05',
        icon: Shield,
        title: 'Dispute & Appeal',
        description: 'If an AI verdict feels unfair, freelancers can file an appeal. Human admins review all escalated disputes impartially.',
        color: 'from-rose-500 to-pink-500',
        bg: 'bg-rose-50',
        detail: 'Our dispute center ensures neither employer nor freelancer can abuse the system unilaterally.',
    },
    {
        step: '06',
        icon: DollarSign,
        title: 'Get Paid Instantly',
        description: 'Once a milestone is approved, funds release instantly from the smart contract escrow directly to your wallet.',
        color: 'from-violet-500 to-purple-500',
        bg: 'bg-violet-50',
        detail: 'No middlemen, no waiting periods, no bank delays — just instant, trustless on-chain payment.',
    },
];

const features = [
    { icon: Lock, title: 'Escrow Protection', desc: 'Funds are locked in smart contracts until work is approved — no ghosting, no chargebacks.' },
    { icon: Cpu, title: 'AI-Powered Audits', desc: 'Objective, bias-free code and deliverable reviews for every milestone submission.' },
    { icon: Shield, title: 'Human Dispute Center', desc: 'Admin-led appeals process ensures fair resolution when AI verdicts are contested.' },
    { icon: Zap, title: 'Instant Payouts', desc: 'On-chain transfers release the moment a milestone is approved. No waiting.' },
    { icon: Users, title: 'Reputation System', desc: 'Build a verifiable on-chain track record that grows with every successful project.' },
    { icon: TrendingUp, title: 'Staking Incentives', desc: 'Freelancers stake tokens to signal commitment — higher stakes signal higher trust.' },
];

const faqs = [
    { q: 'Who holds my money?', a: 'No one. Funds are held in a non-custodial smart contract on-chain. Neither HexaWork nor the employer can access those funds until a milestone is approved or a dispute is resolved.' },
    { q: 'What happens if an employer disappears?', a: 'Ghosted contracts are flagged automatically. After a configurable timeout, the dispute center can release funds back to the freelancer.' },
    { q: 'Can I appeal an AI verdict?', a: "Yes. After any AI verdict you disagree with, you can open a dispute. A human admin reviews your appeal and all submitted evidence before issuing a final ruling." },
    { q: 'What tokens does HexaWork use?', a: 'HexaWork is built on Polkadot Asset Hub. Payments and staking use PAS (Polkadot Asset Hub native token).' },
    { q: 'Do I need crypto experience?', a: 'You need a Polkadot-compatible wallet like Polkadot.js or Talisman. Beyond that, the interface handles all the on-chain complexity for you.' },
];

export const HowItWorksView: React.FC<HowItWorksViewProps> = ({ onNavigate }) => {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero */}
            <div className="relative overflow-hidden bg-gradient-to-br from-zinc-950 via-brand-950 to-zinc-900 text-white">
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'radial-gradient(#a78bfa 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
                <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-brand-500/20 blur-[120px] rounded-full pointer-events-none" />

                <div className="relative z-10 max-w-5xl mx-auto px-6 pt-10 pb-24">
                    <motion.button
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => onNavigate('landing')}
                        className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-12 text-sm font-bold"
                    >
                        <ChevronLeft size={16} /> Back to Home
                    </motion.button>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <div className="inline-flex items-center gap-2 bg-brand-500/20 border border-brand-500/30 text-brand-300 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6">
                            ✦ The Platform
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-[0.95]">
                            How <span className="text-brand-400">HexaWork</span><br />
                            <span className="text-white/60 italic font-black">actually works.</span>
                        </h1>
                        <p className="text-lg md:text-xl text-white/60 font-medium max-w-2xl leading-relaxed">
                            A trustless freelance marketplace powered by smart contracts, AI-audited deliverables, and human-overseen dispute resolution.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Steps */}
            <div className="max-w-5xl mx-auto px-6 py-24">
                <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
                    <p className="text-xs font-black uppercase tracking-widest text-brand-600 mb-3">Step by Step</p>
                    <h2 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tighter">The full journey</h2>
                </motion.div>

                <div className="relative">
                    {/* Vertical line */}
                    <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-brand-200 via-indigo-200 to-transparent -translate-x-1/2 hidden md:block" />

                    <div className="space-y-12">
                        {steps.map((s, i) => {
                            const Icon = s.icon;
                            const isEven = i % 2 === 0;
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.05 }}
                                    className={`flex flex-col md:flex-row items-center gap-8 ${isEven ? '' : 'md:flex-row-reverse'}`}
                                >
                                    {/* Card */}
                                    <div className="flex-1 bg-white rounded-[2rem] p-8 border border-zinc-100 shadow-sm hover:shadow-xl transition-shadow duration-300">
                                        <div className={`w-12 h-12 rounded-2xl ${s.bg} flex items-center justify-center mb-5 bg-gradient-to-br ${s.color}`}>
                                            <Icon size={22} className="text-white" />
                                        </div>
                                        <div className="text-[10px] font-black text-zinc-300 uppercase tracking-widest mb-2">Step {s.step}</div>
                                        <h3 className="text-xl font-black text-zinc-900 mb-3">{s.title}</h3>
                                        <p className="text-zinc-500 font-medium text-sm leading-relaxed mb-4">{s.description}</p>
                                        <div className="flex items-start gap-2 bg-zinc-50 rounded-xl p-4 border border-zinc-100">
                                            <CheckCircle2 size={14} className="text-brand-500 flex-shrink-0 mt-0.5" />
                                            <p className="text-xs font-medium text-zinc-500">{s.detail}</p>
                                        </div>
                                    </div>

                                    {/* Center dot */}
                                    <div className="hidden md:flex w-8 h-8 rounded-full bg-white border-2 border-brand-300 items-center justify-center z-10 flex-shrink-0 shadow-md shadow-brand-200/50">
                                        <div className="w-3 h-3 rounded-full bg-brand-500" />
                                    </div>

                                    <div className="flex-1 hidden md:block" />
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Features grid */}
            <div className="bg-zinc-50 py-24">
                <div className="max-w-5xl mx-auto px-6">
                    <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
                        <p className="text-xs font-black uppercase tracking-widest text-brand-600 mb-3">Built Different</p>
                        <h2 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tighter">Why HexaWork?</h2>
                    </motion.div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((f, i) => {
                            const Icon = f.icon;
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.06 }}
                                    className="bg-white rounded-[2rem] p-7 border border-zinc-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                                >
                                    <div className="w-11 h-11 bg-brand-50 rounded-2xl flex items-center justify-center mb-4 border border-brand-100">
                                        <Icon size={20} className="text-brand-600" />
                                    </div>
                                    <h3 className="font-black text-zinc-900 mb-2">{f.title}</h3>
                                    <p className="text-sm text-zinc-500 font-medium leading-relaxed">{f.desc}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* FAQ */}
            <div className="max-w-3xl mx-auto px-6 py-24">
                <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
                    <p className="text-xs font-black uppercase tracking-widest text-brand-600 mb-3">Got Questions?</p>
                    <h2 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tighter">FAQ</h2>
                </motion.div>
                <div className="space-y-4">
                    {faqs.map((faq, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.06 }}
                            className="bg-white rounded-[1.5rem] p-7 border border-zinc-100 shadow-sm"
                        >
                            <div className="flex items-start gap-3">
                                <div className="w-7 h-7 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0 mt-0.5 border border-brand-100">
                                    <AlertCircle size={14} className="text-brand-600" />
                                </div>
                                <div>
                                    <p className="font-black text-zinc-900 mb-2">{faq.q}</p>
                                    <p className="text-sm text-zinc-500 font-medium leading-relaxed">{faq.a}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* CTA */}
            <div className="relative overflow-hidden bg-gradient-to-br from-brand-600 to-violet-700 py-24 text-white text-center">
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative z-10 max-w-2xl mx-auto px-6"
                >
                    <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/20 backdrop-blur">
                        <Star size={28} className="text-white" />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">Ready to get started?</h2>
                    <p className="text-white/70 font-medium mb-10">Connect your wallet in seconds. Your first project is one click away.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <motion.button
                            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                            onClick={() => onNavigate('landing')}
                            className="bg-white text-brand-700 font-black px-8 py-4 rounded-2xl hover:bg-brand-50 transition-all shadow-xl flex items-center justify-center gap-2"
                        >
                            Connect Wallet <ArrowRight size={18} />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                            onClick={() => onNavigate('marketplace')}
                            className="bg-white/10 border border-white/20 font-black px-8 py-4 rounded-2xl hover:bg-white/20 transition-all flex items-center justify-center gap-2 backdrop-blur"
                        >
                            Browse Jobs <ArrowRight size={18} />
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
