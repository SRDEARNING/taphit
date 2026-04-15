import Link from "next/link";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-bg/80 backdrop-blur sticky top-0 z-50">
      <Link href="/" className="text-xl font-bold font-heading">
        <span className="text-win">Tap</span>hit
      </Link>
      <nav className="flex items-center gap-6">
        <Link href="/trade" className="text-secondary hover:text-primary transition text-sm">Trade</Link>
        <Link href="/history" className="text-secondary hover:text-primary transition text-sm">History</Link>
        <Link href="/profile" className="text-secondary hover:text-primary transition text-sm">Profile</Link>
        <Link href="/leaderboard" className="text-secondary hover:text-primary transition text-sm">Leaderboard</Link>
        <WalletMultiButton style={{ background: "var(--win)", color: "#000", fontFamily: "DM Sans", fontWeight: 600 }} />
      </nav>
    </header>
  );
}
