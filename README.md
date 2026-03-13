# 🚀 Hexawork 
**Trustless. Fair. Decentralized. The AI-Powered Escrow for the Gig Economy.**

Hexawork is a decentralized freelance platform that replaces blind trust with immutable code. By combining **Dual-Staking Smart Contracts** on the Polkadot Hub EVM with an **Objective AI Mediator**, we ensure that clients get what they paid for and freelancers always get paid for their work.

---

## 🧠 Why Hexawork?
* **Dual-Staking Escrow:** Clients lock project funds; Freelancers lock a 5% "Commitment Stake." Both parties have skin in the game.
* **AI-Transcribed Interviews:** Video calls automatically transcribe the "Scope of Work" into immutable contract terms.
* **Cryptographic Deadlines:** Time-locked contracts automatically handle refunds and stake-slashing if deadlines are missed.
* **AI Arbitrator:** An automated LangGraph agent that audit code (GitHub), verifies live sites (Firecrawl), and analyzes chat history to render fair verdicts instantly.

---

## 🛠️ Tech Stack

### **Frontend (Vite + React 19)**
* **Vite / React 19:** Modern, fast UI with concurrent rendering.
* **Tailwind CSS 4:** Sleek, high-performance styling.
* **Supabase:** Real-time chat (WebSockets), persistent milestone storage, and document hosting.
* **Ethers.js v6:** Interaction with Polkadot Hub EVM Smart Contracts.
* **Motion:** Fluid, high-end animations (formerly Framer Motion).

### **Backend (AI & Services)**
* **AI Arbitrator (FastAPI + LangGraph):** Multi-agent system (Auditor, Scraper, Judge) using GPT-4o-mini for dispute resolution.
* **Web Scraping:** Firecrawl for real-time UI/UX verification of live project sites.
* **Meeting Service (Node.js/Express):** Integration with Zoom API for automated meeting memos.

### **Blockchain (Smart Contracts)**
* **Solidity:** Custom Escrow logic on Polkadot Hub EVM.
* **On-Chain Milestones:** Payment releases are triggered via on-chain approval or AI verdict.

---

## 🏗️ Project Structure
```bash
├── frontend/               # React 19 Client App
│   ├── src/lib/supabase.ts # Database & Auth configuration
│   └── src/views/          # UI components (Dashboard, Chat, Disputes)
├── backend/                # Server-Side Services
│   ├── src/main.py         # AI Arbitrator API (Python/FastAPI)
│   ├── src/agents.py       # LangGraph Agent logic
│   ├── src/tools.py        # Code auditing & Web scraping tools
│   └── src/server.ts       # Zoom Meeting Integration (Node.js/Express)
└── requirements.txt        # Backend dependencies
```

---

## 🚀 Getting Started

### **Prerequisites**
* **Node.js** (v18+) & **Python** (v3.10+)
* **MetaMask** (configured for Polkadot Hub EVM)
* **API Keys:** Supabase, OpenAI, Firecrawl, and Zoom.

### **1. AI Arbitrator (Python Backend)**
1. **Navigate to backend:** `cd backend`
2. **Setup environment:** Create a `.env` with `OPENAI_API_KEY` and `FIRECRAWL_API_KEY`.
3. **Install deps:** `pip install -r requirements.txt`
4. **Run Server:** `python src/main.py` (Runs on port 8000)

### **2. Meeting Service (Node Backend)**
1. **From root/frontend:** Ensure `npm install` has been run.
2. **Setup environment:** Create a `.env` in `backend/` with `ZOOM_CLIENT_ID`, `ZOOM_CLIENT_SECRET`, and `ZOOM_ACCOUNT_ID`.
3. **Run Service:** `npx tsx backend/src/server.ts` (Runs on port 3001)

### **3. Frontend (React Client)**
1. **Navigate to frontend:** `cd frontend`
2. **Install deps:** `npm install`
3. **Setup environment:** Create a `.env` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. **Launch:** `npm run dev` (Runs on port 3000)

---

## 🤝 Community & Support
* **Hackathon:** Built for Polkadot Hub.
* **Inquiries:** 📍 PH-based startup focusing on the local gig economy.
