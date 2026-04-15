"use client";
import Link from "next/link";
import Header from "@/components/Header";
import { useWallet } from "@solana/wallet-adapter-react";
import { useStore } from "@/store/trading";

export default function ProfilePage() {
  const { connected, publicKey } = useWallet();
  const { completedOrders, demoBalance, platformBalance } = useStore();

  if (!connected || !publicKey) {
    return <div className="min-h-screen flex items-center justify-center text-secondary">Connect wallet to view profile</div>;
  }

  const totalWon = completedOrders.filter(o => o.result === "won").length;
  const totalLost = completedOrders.filter(o => o.result === "lost").length;
  const winRate = completedOrders.length ? ((totalWon / completedOrders.length) * 100).toFixed(1) : 0;
  const totalWagered = completedOrders.reduce((s, o) => s + o.stake, 0);
  const totalPayout = completedOrders.filter(o => o.result === "won").reduce((s, o) => s + o.payout, 0);
  const bestMult = completedOrders.reduce((m, o) => Math.max(m, o.multiplier), 1);

  const addr = publicKey.toBase58();
  const short = `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  const refLink = `taphit.io/?ref=${addr.slice(0, 8)}`;

  const badges = [
    { earned: completedOrders.length >= 1, icon: "🏆", label: "First Trade" },
    { earned: totalWon >= 1, icon: "⭐", label: "First Win" },
    { earned: bestMult >= 10, icon: "🔥", label: "10x Club" },
    { earned: completedOrders.length >= 100, icon: "💎", label: "100 Trades" },
    { earned: completedOrders.some(o => o.result === "won" && o.payout >= 50), icon: "🎰", label: "Big Winner ($50+)" },
  ];

  return (
    <div>
      <Header />
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-heading font-bold mb-6">Profile</h1>

        {/* Wallet */}
        <div className="bg-bg-card border border-white/10 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs text-secondary mb-1">Connected Wallet</div>
              <div className="font-mono text-sm">{short}</div>
            </div>
            <button onClick={() => navigator.clipboard.writeText(addr)} className="text-xs text-info hover:underline">Copy</button>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div>
              <div className="text-xs text-secondary">Demo Balance</div>
              <div className="text-xl font-mono font-bold text-amber-400">${demoBalance.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-xs text-secondary">Platform Balance</div>
              <div className="text-xl font-mono font-bold">${platformBalance.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-xs text-secondary">Joined</div>
              <div className="text-sm font-medium">{new Date().toLocaleDateString()}</div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Orders", value: completedOrders.length },
            { label: "Win Rate", value: `${winRate}%` },
            { label: "Total Wagered", value: `$${totalWagered.toFixed(2)}` },
            { label: "Net P&L", value: `$${(totalPayout - totalWagered).toFixed(2)}`, green: totalPayout >= totalWagered },
          ].map((s) => (
            <div key={s.label} className="bg-bg-card border border-white/10 rounded-lg p-4">
              <div className="text-xs text-secondary mb-1">{s.label}</div>
              <div className={`text-xl font-mono font-bold ${s.green ? "text-win" : s.green === false ? "text-loss" : ""}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Referral */}
        <div className="bg-bg-card border border-white/10 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-bold mb-2">📢 Referral Program</h2>
          <p className="text-sm text-secondary mb-3">Earn 1% of every trade your referrals make, paid instantly in USDC.</p>
          <div className="flex items-center gap-2 bg-bg-panel rounded-lg px-3 py-2">
            <span className="font-mono text-sm flex-1">{refLink}</span>
            <button onClick={() => navigator.clipboard.writeText(refLink)} className="text-xs bg-info text-white px-3 py-1 rounded">Copy</button>
          </div>
        </div>

        {/* Badges */}
        <div className="bg-bg-card border border-white/10 rounded-lg p-6">
          <h2 className="text-lg font-bold mb-4">🏅 Achievements</h2>
          <div className="flex gap-4 flex-wrap">
            {badges.map(b => (
              <div key={b.label} className={`px-4 py-3 rounded-lg text-center text-sm transition ${b.earned ? "bg-win/10 border border-win/30" : "bg-bg-panel opacity-40"}`}>
                <div className="text-2xl mb-1">{b.icon}</div>
                <div>{b.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
