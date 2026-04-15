import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0A0B0E",
        "bg-card": "#111318",
        "bg-panel": "#1A1D26",
        win: "#00E676",
        loss: "#FF3B5C",
        zone: "#FFD600",
        info: "#2979FF",
        primary: "#F0F2F8",
        secondary: "#8B8FA8",
        muted: "#4A4E63",
      },
      fontFamily: {
        heading: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-dm-sans)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
