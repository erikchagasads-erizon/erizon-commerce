import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "var(--surface)",
        "surface-alt": "var(--surface-alt)",
        border: "var(--border)",
        "text-main": "var(--text-main)",
        "text-soft": "var(--text-soft)",
        accent: "var(--accent)",
        "accent-2": "var(--accent-2)",
        mint: "var(--mint)",
      },
      boxShadow: {
        glow: "0 0 40px rgba(249, 115, 22, 0.22)",
        "glow-sm": "0 0 20px rgba(249, 115, 22, 0.15)",
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
