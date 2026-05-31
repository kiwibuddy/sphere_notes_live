import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F7F5F2",
        surface: "#FFFFFF",
        foreground: "#1A1A18",
        muted: {
          DEFAULT: "#6B6860",
          foreground: "#6B6860",
        },
        border: "#E8E5E0",
        live: {
          active: "#22C55E",
          waiting: "#A8A29E",
          chip: "#E85D4C",
        },
        tab: {
          live: "#2563EB",
          qa: "#C2410C",
          slides: "#4F46E5",
          notes: "#B45309",
          week: "#57534E",
          cloud: "#0D9488",
          overview: "#78716C",
          mine: "#16A34A",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-instrument-serif)", "Georgia", "serif"],
      },
      borderRadius: {
        lg: "14px",
        md: "12px",
        sm: "10px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
      },
      keyframes: {
        "pulse-live": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      animation: {
        "pulse-live": "pulse-live 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
