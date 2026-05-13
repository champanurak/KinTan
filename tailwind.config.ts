import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#07111f",
        foreground: "#edf2ff",
        muted: "#91a4c7",
        panel: "rgba(12, 22, 40, 0.78)",
        accent: "#f97316",
        accentSoft: "#ffb36b",
        line: "rgba(255,255,255,0.08)"
      },
      boxShadow: {
        glow: "0 20px 80px rgba(249, 115, 22, 0.22)"
      }
    }
  },
  plugins: []
};

export default config;
