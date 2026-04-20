import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
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
      },
    },
  },
  plugins: [],
};

export default config;
