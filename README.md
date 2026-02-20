z# 🚀 Hexawork 
**Trustless. Fair. Decentralized. The AI-Powered Escrow for the Gig Economy.**

[![Hackathon](https://img.shields.io/badge/Hackathon-Ready-purple.svg)](https://github.com/)
[![Solidity](https://img.shields.io/badge/Solidity-EVM-363636.svg)](https://soliditylang.org/)
[![AI-Powered](https://img.shields.io/badge/AI-Mediator-000000.svg)](https://github.com/)



## 🛑 The Problem
In the fast-growing gig economy—especially in regions like the Philippines—trust is broken. 
* **Freelancers** suffer from "joy-hiring" (clients refusing to pay after work is delivered).
* **Clients** suffer from "ghosting" (freelancers taking an upfront fee and disappearing).
* **Traditional Platforms** (Upwork, Fiverr) charge exorbitant fees (10-20%) and rely on slow, biased human customer service for disputes.

## 💡 The Hexawork Solution
**Hexawork** replaces blind trust with immutable code. By combining **Dual-Staking Smart Contracts** with an **Objective AI Mediator**, we ensure that clients always get what they paid for, and freelancers always get paid for their work.

### ✨ Key Features
* 🤝 **Dual-Staking Escrow:** The Client locks the total project budget ($B$), and the Freelancer locks a micro "Commitment Stake" (e.g., 50 PHP). Both parties have skin in the game.
* 🎙️ **AI-Transcribed Interviews:** Built-in video calls automatically transcribe and summarize the "Scope of Work" into immutable contract terms.
* ⏱️ **Cryptographic Deadlines:** Time-locked contracts automatically slash the freelancer's stake and refund the client if the deadline passes with zero submissions.
* ⚖️ **Automated Dispute Resolution:** If a client refuses to release funds, the AI Mediator analyzes the initial interview transcript, the real-time chat logs, and the submitted work to render a mathematically fair verdict instantly.
* 💬 **Immutable Evidence Chat:** Integrated real-time chat (via Socket.io) where messages act as permanent evidence for the AI judge.

---

## 🏗️ Architecture & Workflow

1. **Discovery & Interview:** Client posts a job $\rightarrow$ Freelancer applies $\rightarrow$ In-App Video Interview with AI Transcription.
2. **The Double Opt-In:** Both parties review the AI-generated "Meeting Memo." 
3. **The Lock (On-Chain):** Client signs transaction to lock project funds. Freelancer signs to lock their micro-stake. `block.timestamp` deadline is set.
4. **Development:** Freelancer submits work via the Hexawork portal before the timer hits zero.
5. **Resolution:** * *Happy Path:* Client approves $\rightarrow$ Smart Contract releases all funds to Freelancer.
    * *Dispute Path:* AI evaluates chat logs/commits vs. the original agreement $\rightarrow$ Smart Contract executes the AI's verdict.

---

## 🛠️ Tech Stack

### Frontend (Client App)
* **React.js** (Next.js optional)
* **Tailwind CSS** (Custom FinTech UI: Purple & White theme)
* **Web3.js / Ethers.js** (For wallet connection)
* **Socket.io-client** (Real-time messaging)

### Backend & AI
* **Node.js & Express** (Server logic and API routing)
* **Socket.io** (Handling chat rooms and system alerts)
* **MongoDB** (Immutable storage for chat logs and user profiles)
* **LLM API** (Gemini/OpenAI for transcription summarization and dispute mediation)

### Blockchain (Web3)
* **Solidity** (Smart contract logic)
* **Hardhat** (Testing and deployment)
* **EVM-Compatible Chain** (Polygon/Ethereum/Arbitrum)

---

## 🚀 Getting Started (Local Development)

### Prerequisites
* Node.js (v18+)
* MetaMask Wallet Extension
* MongoDB running locally or via MongoDB Atlas

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/yourusername/hexawork.git](https://github.com/yourusername/hexawork.git)
   cd hexawork