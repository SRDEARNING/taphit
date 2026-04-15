"use client";
import Header from "@/components/Header";

export default function LeaderboardPage() {
  const leaderboard = [
    { rank: 1, name: "8xGf...3mK9", volume: "$12,450", wins: 342, bigWin: "$890.00", rate: "62.3%" },
    { rank: 2, name: "5kLp...9nR2", volume: "$8,920", wins: 278, bigWin: "$650.00", rate: "58.1%" },
    { rank: 3, name: "3mWq...7tY4", volume: "$6,100", wins: 201, bigWin: "$520.00", rate: "71.2%" },
    { rank: 4, name: "9fXz...2cV8", volume: "$4,800", wins: 156, bigWin: "$410.00", rate: "55.4%" },
    { rank: 5, name: "7jBn...5hK1", volume: "$3,200", wins: 134, bigWin: "$380.00", rate: "67.8%" },
  ];

  return (
    <div>
      <Header />
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-heading font-bold mb-2">🏆 Leaderboard</h1>
        <p className="text-secondary mb-6">Top traders on Taphit</p>
        <div className="flex gap-2 mb-6">
          {["Daily", "Weekly", "All-time"].map((t, i) => (
            <button key={t} className={`px-4 py-1.5 rounded text-sm transition ${i === 2 ? "bg-info text-white" : "text-secondary hover:text-primary"}`}>{t}</button>
          ))}
        </div>
        <div className="bg-bg-card border border-white/10 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10">
              <tr>
                <th className="text-left px-4 py-3 text-xs text-secondary font-medium">RANK</th>
                <th className="text-left px-4 py-3 text-xs text-secondary font-medium">WALLET</th>
                <th className="text-right px-4 py-3 text-xs text-secondary font-medium">VOLUME</th>
                <th className="text-right px-4 py-3 text-xs text-secondary font-medium">WINS</th>
                <th className="text-right px-4 py-3 text-xs text-secondary font-medium">BIGGEST WIN</th>
                <th className="text-right px-4 py-3 text-xs text-secondary font-medium">WIN RATE</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((u) => (
                <tr key={u.rank} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <span className={`w-7 h-7 rounded-full inline-flex items-center justify-center text-xs font-bold ${u.rank === 1 ? "bg-yellow-400 text-black" : u.rank === 2 ? "bg-gray-400 text-black" : u.rank === 3 ? "bg-amber-700 text-white" : "bg-bg-panel text-secondary"}`}>
                      {u.rank}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono">{u.name}</td>
                  <td className="px-4 py-3 text-right font-mono">{u.volume}</td>
                  <td className="px-4 py-3 text-right font-mono">{u.wins}</td>
                  <td className="px-4 py-3 text-right font-mono text-win">{u.bigWin}</td>
                  <td className="px-4 py-3 text-right font-mono">{u.rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
