import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen">
      <nav className="flex items-center justify-between px-8 py-4 border-b border-white/10">
        <Link href="/" className="text-2xl font-bold font-heading">
          <span className="text-win">Tap</span>hit
        </Link>
        <Link href="/trade" className="px-6 py-2 bg-win text-black font-medium rounded-md hover:opacity-90 transition">
          Launch App
        </Link>
      </nav>

      <main className="max-w-6xl mx-auto px-8 py-24 text-center">
        <h1 className="text-7xl font-bold font-heading mb-4">
          Predict. Tap. <span className="text-win">Win.</span>
        </h1>
        <p className="text-xl text-secondary max-w-2xl mx-auto mb-10">
          Trade binary options onchain on Solana. 0.1–10 USDC per tap. Instant settlement.
        </p>

        <div className="flex items-center justify-center gap-4 mb-16">
          <Link href="/trade" className="px-8 py-4 bg-win text-black font-semibold rounded-lg hover:opacity-90 transition text-lg">
            Connect Wallet & Trade
          </Link>
          <Link href="/trade?demo=true" className="px-8 py-4 border border-secondary text-primary font-medium rounded-lg hover:border-primary transition">
            Try Demo Free
          </Link>
        </div>

        <div className="grid grid-cols-4 gap-6 mb-20">
          {[
            { label: "Total Volume", value: "$0" },
            { label: "Active Players", value: "0" },
            { label: "Biggest Win", value: "$0" },
            { label: "SOL/USD", value: "$—" },
          ].map((s) => (
            <div key={s.label} className="bg-bg-card border border-white/10 rounded-lg p-6">
              <div className="text-muted text-sm mb-1">{s.label}</div>
              <div className="text-2xl font-mono font-bold">{s.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {[
            { icon: "🔗", title: "Fully Onchain", desc: "Every bet settled by smart contracts" },
            { icon: "⚡", title: "Instant Settlement", desc: "Settled in seconds via Pyth oracles" },
            { icon: "🎯", title: "Up to 33x Payout", desc: "High risk, high reward predictions" },
          ].map((f) => (
            <div key={f.title} className="bg-bg-card border border-white/10 rounded-lg p-8">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-bold mb-2">{f.title}</h3>
              <p className="text-secondary">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-white/10 mt-24 px-8 py-6 flex justify-between text-sm text-secondary">
        <span>© 2026 Taphit. All rights reserved.</span>
        <div className="flex gap-6">
          <a href="#" className="hover:text-primary transition">Docs</a>
          <a href="#" className="hover:text-primary transition">Terms</a>
          <a href="#" className="hover:text-primary transition">Twitter/X</a>
          <a href="#" className="hover:text-primary transition">Telegram</a>
        </div>
      </footer>
    </div>
  );
}
