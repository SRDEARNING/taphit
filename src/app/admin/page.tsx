"use client";
import Header from "@/components/Header";

export default function AdminPage() {
  return (
    <div>
      <Header />
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-heading font-bold mb-2">🛡️ Admin Dashboard</h1>
        <p className="text-secondary mb-8">Platform management — <span className="text-loss">protect this admin key</span></p>

        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Volume", value: "$0" },
            { label: "Vault Balance", value: "$0.00 USDC" },
            { label: "Total Users", value: "0" },
            { label: "24h Volume", value: "$0" },
          ].map((s) => (
            <div key={s.label} className="bg-bg-card border border-white/10 rounded-lg p-4">
              <div className="text-xs text-secondary">{s.label}</div>
              <div className="text-xl font-mono font-bold">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <div className="bg-bg-card border border-white/10 rounded-lg p-6">
            <h3 className="font-bold mb-4">Emergency Controls</h3>
            <button className="px-6 py-2 bg-loss/20 text-loss rounded-lg font-medium hover:bg-loss/30 transition">
              ⏸ Pause Platform
            </button>
          </div>

          <div className="bg-bg-card border border-white/10 rounded-lg p-6">
            <h3 className="font-bold mb-4">Vault Liquidity</h3>
            <button className="px-6 py-2 bg-win/20 text-win rounded-lg font-medium hover:bg-win/30 transition">
              💰 Add Liquidity
            </button>
          </div>

          <div className="bg-bg-card border border-white/10 rounded-lg p-6">
            <h3 className="font-bold mb-4">Settlement Monitor</h3>
            <div className="text-sm text-secondary">No pending orders to settle</div>
            <button className="mt-3 px-4 py-2 bg-info/20 text-info rounded-lg text-sm hover:bg-info/30 transition">
              Manual Settle Check
            </button>
          </div>

          <div className="bg-bg-card border border-white/10 rounded-lg p-6">
            <h3 className="font-bold mb-4">Config</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="text-secondary text-xs block mb-1">House Edge (%)</label>
                <input type="number" defaultValue="7.5" className="w-full bg-bg-panel border border-white/10 rounded px-3 py-2 font-mono" />
              </div>
              <div>
                <label className="text-secondary text-xs block mb-1">Min Stake (USDC)</label>
                <input type="number" defaultValue="0.1" className="w-full bg-bg-panel border border-white/10 rounded px-3 py-2 font-mono" />
              </div>
              <div>
                <label className="text-secondary text-xs block mb-1">Max Stake (USDC)</label>
                <input type="number" defaultValue="10" className="w-full bg-bg-panel border border-white/10 rounded px-3 py-2 font-mono" />
              </div>
            </div>
            <button className="mt-4 px-6 py-2 bg-info text-white rounded-lg hover:opacity-90 transition">
              Update Config
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
