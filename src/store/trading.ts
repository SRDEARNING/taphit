import { create } from "zustand";

type Asset = "SOL" | "BTC" | "ETH";

interface TradingState {
  // Price feed
  price: number;
  priceHistory: { time: number; open: number; high: number; low: number; close: number }[];
  setPrice: (price: number, candle?: { time: number; open: number; high: number; low: number; close: number }) => void;
  
  // Selection
  asset: Asset;
  setAsset: (a: Asset) => void;
  stake: number;
  setStake: (s: number) => void;
  demoMode: boolean;
  setDemoMode: (d: boolean) => void;
  demoBalance: number;
  setDemoBalance: (b: number) => void;
  platformBalance: number;
  setPlatformBalance: (b: number) => void;

  // Orders
  pendingOrders: { id: string; direction: string; expiry: number; stake: number; multiplier: number; zone: string }[];
  completedOrders: { id: string; direction: string; stake: number; multiplier: number; result: "won" | "lost"; payout: number; time: number }[];
  addOrder: (o: any) => void;
  removeOrder: (id: string) => void;
  settleOrder: (id: string, result: "won" | "lost", payout: number) => void;

  // Multipliers grid
  multipliers: number[][];
  recalcMultipliers: () => void;
}

// Simulated grid multipliers
const ROWS = 17; // 8 above + 1 current + 8 below
const COLS = 12; // +5s to +60s

function calcMultipliers(): number[][] {
  const grid: number[][] = [];
  for (let row = 0; row < ROWS; row++) {
    grid[row] = [];
    for (let col = 0; col < COLS; col++) {
      const distFromMid = Math.abs(row - 8); // 8 is current price
      const timeSec = (col + 1) * 5; // 5, 10, 15... 60s
      const multiplier = (distFromMid + 1) * (1.2 + (60 - timeSec) / 60) * 0.925; // house edge baked in
      grid[row][col] = Math.max(1.1, Math.min(multiplier, 33));
    }
  }
  return grid;
}

export const useStore = create<TradingState>((set) => ({
  price: 150.00,
  priceHistory: [],
  setPrice: (price, candle) => set((s) => ({
    price,
    priceHistory: candle ? [...s.priceHistory.slice(-100), candle] : s.priceHistory,
  })),

  asset: "SOL",
  setAsset: (a) => set({ asset: a }),
  stake: 1,
  setStake: (s) => set({ stake: s }),
  demoMode: false,
  setDemoMode: (d) => set({ demoMode: d }),
  demoBalance: 100,
  setDemoBalance: (b) => set({ demoBalance: b }),
  platformBalance: 0,
  setPlatformBalance: (b) => set({ platformBalance: b }),

  pendingOrders: [],
  completedOrders: [],
  addOrder: (o) => set((s) => ({
    pendingOrders: [...s.pendingOrders, { ...o, id: Math.random().toString(36).slice(2, 10) }],
  })),
  removeOrder: (id) => set((s) => ({
    pendingOrders: s.pendingOrders.filter((o) => o.id !== id),
  })),
  settleOrder: (id, result, payout) => set((s) => {
    const order = s.pendingOrders.find((o) => o.id === id);
    if (!order) return s;
    return {
      pendingOrders: s.pendingOrders.filter((o) => o.id !== id),
      completedOrders: [{ ...order, result, payout, time: Date.now() / 1000 }, ...s.completedOrders].slice(0, 50),
    };
  }),

  multipliers: calcMultipliers(),
  recalcMultipliers: () => set({ multipliers: calcMultipliers() }),
}));
