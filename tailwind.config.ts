import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        wow: {
          warrior: "#C79C6E",
          paladin: "#F58CBA",
          hunter: "#ABD473",
          rogue: "#FFF569",
          priest: "#FFFFFF",
          shaman: "#0070DE",
          mage: "#40C7EB",
          warlock: "#8787ED",
          druid: "#FF7D0A",
          gold: "#FFD100",
        },
        ink: {
          900: "#08090b",
          800: "#0d0f13",
          700: "#13161c",
          600: "#1a1e26",
          500: "#222731",
          400: "#2c323e",
        },
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(251,191,36,0.25), 0 8px 24px -8px rgba(251,191,36,0.15)",
        card: "0 1px 0 0 rgba(255,255,255,0.03) inset, 0 8px 24px -12px rgba(0,0,0,0.6)",
      },
      keyframes: {
        "fade-in": { "0%": { opacity: "0", transform: "translateY(2px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
      },
      animation: {
        "fade-in": "fade-in 200ms ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
