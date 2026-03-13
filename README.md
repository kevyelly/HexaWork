<div align="center">
  
  <img src="https://via.placeholder.com/150?text=HexaWork+Logo" alt="HexaWork Logo" width="120" />

  # HexaWork
  
  **Trustless. Fair. Decentralized. The AI-Powered Escrow for the Gig Economy.**

  [![React 19](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
  [![Solidity](https://img.shields.io/badge/Solidity-363636?style=for-the-badge&logo=solidity&logoColor=white)](https://soliditylang.org/)
  [![Polkadot](https://img.shields.io/badge/Polkadot_EVM-E6007A?style=for-the-badge&logo=polkadot&logoColor=white)](https://polkadot.network/)
  [![LangGraph](https://img.shields.io/badge/AI_Agent-LangGraph-FF4F00?style=for-the-badge)](https://langchain.com/)

</div>

<br/>

## Work with Confidence. Get Paid Instantly.

Freelancing is broken. Clients fear being ghosted, and freelancers fear being ignored when it is time to get paid. HexaWork replaces "blind trust" with automated code and fair mediation. It is a marketplace where terms are absolute, deadlines are enforced by code, and payment is guaranteed upon delivery.

---

## Why HexaWork?

HexaWork is a protocol designed to balance human fairness with machine precision.

* **Commitment Staking**
  To prevent spam and ensure project integrity, clients lock 100% of the project funds in escrow, while freelancers lock a 3% "Commitment Stake" to signal their intent to deliver.

* **AI-Driven Verification**
  HexaWork utilizes a LangGraph-powered AI agent to audit GitHub commits and verify live deployments via Firecrawl. If the output matches the pre-defined acceptance criteria, the milestone is approved automatically.

* **The Right to Appeal Penalty**
  If the AI Oracle rejects a submission, the freelancer may appeal to a decentralized human jury. To prevent frivolous disputes, the 3% stake is forfeited as a penalty if the human jury confirms the AI's rejection was correct.

* **Ghost-Proof Payouts**
  On HexaWork, silence is treated as consent. When a freelancer submits work, a 72-hour review timer begins. If the client does not respond or initiate a dispute within this window, the smart contract automatically releases the funds.

* **Instant Liquidity**
  The moment work is verified—whether by AI, client approval, or a jury verdict—the funds and the original stake are released to the freelancer's wallet immediately via the Polkadot EVM.

---

## How It Works

1. **Hire:** Establish clear milestones and technical acceptance criteria.
2. **Lock:** The client funds the project and pays a flat Oracle Fee. The freelancer locks their 3% commitment stake.
3. **Build:** Freelancer submits work via GitHub. The AI Oracle verifies the technical requirements in real-time.
4. **Finalize:** Payout occurs automatically after 72 hours of client inactivity or upon successful verification.

---

## Monetization

HexaWork maintains protocol sustainability through two primary channels:
* **Oracle Fees:** A flat fee paid by the client per project to cover the computational costs of AI auditing and data scraping.
* **Penalty Capture:** A portion of forfeited stakes from failed human appeals is routed to the protocol treasury to fund ongoing development and jury incentives.

---

## Tech Stack

### Frontend
* React 19, Vite, Tailwind CSS 4, Motion, Ethers.js v6.

### Backend & AI
* FastAPI (Python), LangGraph (AI Agents), Supabase (Real-time DB).

### Blockchain
* Solidity (Smart Contracts), Polkadot Hub EVM (Execution Layer).

---

## Quick Start

### Prerequisites
* Node.js 18+
* Python 3.10+
* MetaMask

### 1. Backend & AI Oracle
```bash
cd backend
python -m venv venv
source venv/bin/activate 
pip install -r requirements.txt
uvicorn main:app --reload