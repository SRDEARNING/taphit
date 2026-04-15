"use client";
import Link from "next/link";
import Header from "@/components/Header";
import { useStore } from "@/store/trading";
import { BsArrowUp, BsArrowDown } from "react-icons/bs";

export default function HistoryPage() {
  const { completedOrders } = useStore();

  return (
    <div>
      <Header />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-heading font-bold mb-2">Trade History</h1>
        <p className="text-secondary mb-6">All your settled orders</p>

        {/* Summary */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Wagered", value: `$${completedOrders.reduce((s, o) => s + o.stake, 0).toFixed(2)}` },
            { label: "Total Won", value: `$${completedOrders.filter(o => o.result === "won").reduce((s, o) => s + o.payout, 0).toFixed(2)}` },
            { label: "Net P&L", value: `$${(completedOrders.filter(o => o.result === "won").reduce((s, o) => s + o.payout, 0) - completedOrders.reduce((s, o) => s + o.stake, 0)).toFixed(2)}`, green: true },
            { label: "Win Rate", value: `${completedOrders.length ? ((completedOrders.filter(o => o.result === "won").length / completedOrders.length) * 100).toFixed(1) : 0}%` },
          ].map((s) => (
            <div key={s.label} className="bg-bg-card border border-white/10 rounded-lg p-4">
              <div className="text-xs text-secondary mb-1">{s.label}</div>
              <div className={`text-xl font-mono font-bold ${s.green ? "text-win" : ""}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-bg-card border border-white/10 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10">
              <tr>
                <th className="text-left px-4 py-3 text-xs text-secondary font-medium">TIME</th>
                <th className="text-left px-4 py-3 text-xs text-secondary font-medium">DIRECTION</th>
                <th className="text-right px-4 py-3 text-xs text-secondary font-medium">STAKE</th>
                <th className="text-right px-4 py-3 text-xs text-secondary font-medium">MULTIPLIER</th>
                <th className="text-right px-4 py-3 text-xs text-secondary font-medium">RESULT</th>
                <th className="text-right px-4 py-3 text-xs text-secondary font-medium">PAYOUT</th>
              </tr>
            </thead>
            <tbody>
              {completedOrders.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-secondary">No trades yet. <Link href="/trade" className="text-info underline">Go trade →</Link></td></tr>
              ) : completedOrders.map((o) => (
                <tr key={o.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-secondary font-mono text-xs">{new Date(o.time * 1000).toLocaleTimeString()}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 ${o.direction === "UP" ? "text-win" : "text-loss"}`}>
                      {o.direction === "UP" ? <BsArrowUp /> : <BsArrowDown />} {o.direction}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono">${o.stake}</td>
                  <td className="px-4 py-3 text-right font-mono text-info">{o.multiplier}x</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${o.result === "won" ? "bg-win/10 text-win" : "bg-loss/10 text-loss"}`}>
                      {o.result.toUpperCase()}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-right font-mono font-bold ${o.result === "won" ? "text-win" : ""}`}>
                    {o.result === "won" ? `+$${o.payout.toFixed(2)}` : `-$${o.stake.toFixed(2)}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
