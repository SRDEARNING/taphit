"use client";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Header from "@/components/Header";
import { useStore } from "@/store/trading";
import { useEffect, useState, useCallback } from "react";
import { BsArrowUp, BsArrowDown, BsLightningChargeFill } from "react-icons/bs";

export default function TradePage() {
  const { connected, publicKey } = useWallet();
  const { asset, setAsset, stake, setStake, demoMode, setDemoMode, demoBalance, setDemoBalance } = useStore();
  const { price, setPrice, priceHistory, addOrder, pendingOrders } = useStore();
  const [selectedZone, setSelectedZone] = useState<{ row: number; col: number } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(8);

  // Simulated price feed (replace with real Pyth subscription)
  useEffect(() => {
    let basePrice = 152.5;
    const interval = setInterval(() => {
      const delta = (Math.random() - 0.5) * 0.6;
      basePrice = Math.max(140, Math.min(165, basePrice + delta));
      setPrice(parseFloat(basePrice.toFixed(2)));
    }, 400);
    return () => clearInterval(interval);
  }, [setPrice]);

  // Countdown timer for order modal
  useEffect(() => {
    if (!showModal) return;
    setTimeLeft(8);
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { closeModal(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [showModal]);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setSelectedZone(null);
  }, []);

  // Grid data
  const rows = [];
  const currentPrice = price;
  const numRowsAbove = 8;
  const numRowsBelow = 8;
  const priceStepPct = 0.0006; // 0.06%

  for (let r = -numRowsAbove; r <= numRowsBelow; r++) {
    const rowPrice = currentPrice * (1 + r * priceStepPct);
    const isCurrentRow = r === 0;
    const isAbove = r < 0;
    const row: any = { label: rowPrice.toFixed(2), isCurrentRow, isAbove, cells: [] };

    for (let c = 0; c < 12; c++) {
      const expirySec = (c + 1) * 5;
      const distFromMid = Math.abs(r);
      const baseMult = (distFromMid + 1) * (1.2 + (60 - expirySec) / 60);
      const mult = Math.max(1.1, Math.min(baseMult * 0.925, 33));
      row.cells.push({
        row: r,
        col: c,
        expirySec,
        multiplier: parseFloat(mult.toFixed(2)),
        payout: parseFloat((stake * mult).toFixed(2)),
        rowPrice: rowPrice.toFixed(2),
      });
    }
    rows.push(row);
  }

  const handleCellClick = (row: number, col: number) => {
    if (row === 0) return; // current price not clickable
    if (!connected) return;
    setSelectedZone({ row, col });
    setShowModal(true);
  };

  const confirmOrder = () => {
    if (!selectedZone) return;
    const row = rows.find(r => {
      const idx = r.label.split('').length;
      return false;
    });
    const rowData = rows[selectedZone.row + numRowsAbove];
    const cell = rowData.cells[selectedZone.col];

    if (demoMode) {
      if (stake > demoBalance) return;
      setDemoBalance(demoBalance - stake);
    }

    addOrder({
      direction: selectedZone.row < 0 ? "UP" : "DOWN",
      zone: `${parseFloat(rowData.label).toFixed(2)}`,
      stake,
      multiplier: cell.multiplier,
      expiry: cell.expirySec,
    });
    closeModal();
  };

  if (!connected) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-4xl font-heading font-bold mb-4">Connect Wallet</h1>
        <p className="text-secondary mb-8">Connect your wallet to start trading</p>
        <WalletMultiButton style={{ background: "var(--win)", color: "#000" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="flex h-[calc(100vh-56px)]">
        {/* LEFT - Chart */}
        <div className="w-[30%] border-r border-white/10 p-4 space-y-4">
          <div className="flex gap-2 mb-4">
            {(["SOL", "BTC", "ETH"] as const).map(a => (
              <button key={a} onClick={() => setAsset(a)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition ${asset === a ? "bg-info text-white" : "text-secondary hover:text-primary"}`}>
                {a}/USDT
              </button>
            ))}
          </div>
          <div className="text-4xl font-mono font-bold tabular-nums">
            ${currentPrice.toFixed(2)}
          </div>
          <div className="text-xs text-muted">
            <div className="text-muted">LIVE <span className="inline-block w-2 h-2 rounded-full bg-win animate-pulse ml-1"></span></div>
            <div className="mt-4">24h High: $—</div>
            <div>24h Low: $—</div>
            <div>24h Change: —</div>
          </div>
          <div className="bg-bg-panel rounded-lg h-48 flex items-center justify-center text-muted text-sm">
            TradingView Chart<br/>(connect to data source)
          </div>
        </div>

        {/* CENTER - Grid */}
        <div className="w-[50%] p-4 overflow-auto">
          {/* Column headers */}
          <div className="flex mb-2">
            <div className="w-20 shrink-0"></div>
            {Array.from({ length: 12 }, (_, c) => (
              <div key={c} className="flex-1 text-center text-xs text-secondary font-mono">
                +{(c + 1) * 5}s
              </div>
            ))}
          </div>

          {/* Rows */}
          {rows.map((row, ri) => (
            <div key={ri} className="flex mb-1">
              <div className={`w-20 shrink-0 pr-2 text-right font-mono text-sm flex items-center justify-end ${
                row.isCurrentRow ? "text-zone" : row.isAbove ? "text-win/70" : "text-loss/70"
              }`}>
                {row.label} {row.isCurrentRow ? "←" : ""}
              </div>
              {row.cells.map((cell, ci) => (
                <button
                  key={ci}
                  onClick={() => handleCellClick(cell.row, ci)}
                  disabled={cell.row === 0}
                  className={`flex-1 p-2 text-center rounded border transition-all duration-150 ${
                    cell.row === 0
                      ? "bg-zone/20 border-zone/30 text-zone cursor-not-allowed"
                      : cell.row < 0
                      ? "bg-win/5 border-white/10 hover:border-win hover:scale-[1.02] cursor-pointer"
                      : "bg-loss/5 border-white/10 hover:border-loss hover:scale-[1.02] cursor-pointer"
                  }`}>
                  <div className={`font-mono text-sm font-bold ${
                    cell.row < 0 ? "text-win" : cell.row > 0 ? "text-loss" : "text-zone"
                  }`}>
                    {cell.multiplier}x
                  </div>
                  <div className="text-[10px] text-secondary">${cell.payout.toFixed(2)}</div>
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* RIGHT - Controls */}
        <div className="w-[20%] border-l border-white/10 p-4 space-y-4">
          {/* Demo toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={demoMode} onChange={e => setDemoMode(e.target.checked)}
              className="w-4 h-4 accent-amber-400" />
            <span className="text-sm font-medium">Demo Mode</span>
          </label>

          {/* Balance */}
          <div className="bg-bg-panel rounded-lg p-4">
            <div className="text-xs text-secondary mb-1">{demoMode ? "Demo Balance" : "Platform Balance"}</div>
            <div className="text-2xl font-mono font-bold">
              ${demoMode ? demoBalance.toFixed(2) : "—"}
            </div>
          </div>

          {/* Stake */}
          <div>
            <label className="text-sm font-medium mb-2 block">Stake Amount</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {[0.1, 0.5, 1, 2, 5, 10].map(v => (
                <button key={v} onClick={() => setStake(v)}
                  className={`px-2 py-1 text-xs rounded transition ${stake === v ? "bg-win text-black font-bold" : "bg-bg-panel text-secondary hover:text-primary"}`}>
                  ${v}
                </button>
              ))}
            </div>
            <input type="number" value={stake} onChange={e => setStake(parseFloat(e.target.value) || 0)}
              className="w-full bg-bg-panel border border-white/10 rounded-lg px-3 py-2 font-mono text-sm"
              min={0.1} max={10} step={0.1} />
          </div>

          {/* Pending Orders */}
          <div>
            <div className="text-sm font-medium mb-2">Pending Orders ({pendingOrders.length})</div>
            {pendingOrders.length === 0 ? (
              <div className="text-xs text-muted">No active orders</div>
            ) : (
              pendingOrders.map((o) => (
                <div key={o.id} className="bg-bg-panel rounded-lg p-2 mb-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className={o.direction === "UP" ? "text-win" : "text-loss"}>
                      {o.direction} {o.multiplier}x
                    </span>
                    <span className="text-secondary">${o.stake}</span>
                  </div>
                  <div className="text-muted mt-0.5">{o.expiry}s expiry</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Order Confirmation Modal */}
      {showModal && selectedZone && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={closeModal}>
          <div className="bg-bg-card border border-white/10 rounded-xl p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold font-heading mb-4">Confirm Order</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-secondary">Asset</span>
                <span className="font-mono">{asset}/USDT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Direction</span>
                <span className={selectedZone.row < 0 ? "text-win" : "text-loss"}>
                  {selectedZone.row < 0 ? "▲ UP" : "▼ DOWN"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Expiry</span>
                <span className="font-mono">+{(selectedZone.col + 1) * 5}s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Stake</span>
                <span className="font-mono">${stake}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Multiplier</span>
                <span className="font-mono text-info">{rows[selectedZone.row + 8]?.cells[selectedZone.col]?.multiplier}x</span>
              </div>
              <div className="flex justify-between text-base font-bold pt-2 border-t border-white/10">
                <span>Potential Payout</span>
                <span className="text-win">${(stake * (rows[selectedZone.row + 8]?.cells[selectedZone.col]?.multiplier ?? 0)).toFixed(2)}</span>
              </div>
              <div className="text-center">
                <span className="text-muted text-xs">Confirm in <span className="text-info">{timeLeft}s</span></span>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={closeModal} className="flex-1 py-3 border border-white/20 rounded-lg text-secondary hover:text-primary transition">
                Cancel
              </button>
              <button onClick={confirmOrder} disabled={timeLeft === 0}
                className="flex-1 py-3 bg-win text-black font-bold rounded-lg hover:opacity-90 transition disabled:opacity-50">
                Confirm Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
