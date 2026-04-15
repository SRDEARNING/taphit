# 🎯 Taphit

> **Tap the market. Win instantly.**

Onchain binary options prediction trading on Solana.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Rust + Cargo
- Solana CLI (`solana`)
- Anchor CLI (`avm use 0.30.1`)

### Smart Contract

```bash
cd programs/taphit_program
anchor build
anchor deploy  # deploys to configured cluster
```

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local  # edit with your keys
npm run dev  # opens http://localhost:3000
```

### Crank Bot

```bash
cd crank-bot
npm install
node crank.js
```

### Database (Supabase)

1. Create a Supabase project
2. Run the SQL in `supabase/schema.sql` to create tables + RLS policies
3. Add Supabase URL + keys to `.env.local`

## 📁 Structure

```
taphit/
├── programs/taphit_program/   # Anchor smart contract (Rust)
├── frontend/                   # Next.js 14 app
│   ├── src/app/               # Pages (App Router)
│   ├── src/components/        # Shared UI
│   ├── src/store/             # Zustand state
│   └── .env.local             # Environment variables
├── crank-bot/                  # Node.js settlement bot
├── supabase/                   # Database schema
└── scripts/                    # Deployment + utility scripts
```

## 🔑 Environment Variables

Copy `.env.local.example` and fill in:

```
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=YOUR_PROGRAM_ID
NEXT_PUBLIC_USDC_MINT=4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU
HELius_API_KEY=your_key
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

## 📋 Platform Details

| Feature | Value |
|---------|-------|
| Network | Solana Mainnet-Beta |
| Token | USDC SPL |
| Min Stake | $0.10 |
| Max Stake | $10.00 |
| House Edge | 7.5% |
| Settler | Pyth Network Oracles |
| Assets (V1) | SOL, BTC, ETH |
| Referral | 1% instant USDC |

---

*Built on Solana. Fast, transparent, onchain.*
