import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./data/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#F2F0EB",
        ivory: "#0A0A0B",
        pearl: "#141416",
        marble: "#08080A",
        espresso: "#0A0A0B",
        cocoa: "#1D1D20",
        mocha: "#8B877E",
        champagne: "#C7C2B8",
        rose: "#C7C2B8",
        velvet: "#8B877E",
        aurora1: "#C7C2B8",
        aurora2: "#8B877E",
        aurora3: "#E5482F",
        chrome: "#C7C2B8",
        chromehi: "#F2F0EB",
        "gilt-glow": "#C7C2B8",
        blush: "#8B877E",
        "ice-glow": "#F2F0EB",
        signal: "#E5482F",
        hair: "rgba(199,194,184,0.14)",
        hair2: "rgba(199,194,184,0.24)"
      },
      fontFamily: {
        display: ["var(--font-display)", "Space Grotesk", "Arial", "sans-serif"],
        body: ["var(--font-body)", "Inter", "Arial", "sans-serif"],
        utility: ["var(--font-utility)", "Arial", "sans-serif"]
      },
      boxShadow: {
        glow: "0 30px 90px rgba(0,0,0,.6)",
        case: "0 30px 90px rgba(0,0,0,.6)"
      }
    }
  },
  plugins: []
};

export default config;
