import type { Metadata } from "next";
import React from "react";
import "./globals.css";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: "Taphit — Tap the market. Win instantly.",
  description: "Trade binary options onchain on Solana",
};

const Providers = dynamic(
  () => import("@/components/Providers"),
  { ssr: false }
);

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
