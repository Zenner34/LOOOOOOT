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
        // Chinese vermillion — primary brand accent
        vermillion: {
          50:  "#FDE7E9",
          100: "#FBC9CD",
          200: "#F58A93",
          300: "#ED5560",
          400: "#DD2C3D",
          500: "#C8102E",
          600: "#A50D26",
          700: "#82091E",
          800: "#5F0617",
          900: "#3D040E",
        },
        // Imperial gold — secondary highlight (BiS scores, marks)
        gold: {
          50:  "#FFFBE6",
          100: "#FFF3B0",
          200: "#FFE665",
          300: "#FFD93B",
          400: "#FFD700",
          500: "#E5C100",
          600: "#B89800",
          700: "#8A7100",
          800: "#5C4B00",
          900: "#2E2500",
        },
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
        // vermillion glow (focus / hover halos)
        glow: "0 0 0 1px rgba(200,16,46,0.30), 0 8px 24px -8px rgba(200,16,46,0.25)",
        "glow-gold": "0 0 0 1px rgba(255,215,0,0.30), 0 8px 24px -8px rgba(255,215,0,0.20)",
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
