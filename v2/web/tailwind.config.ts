import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          500: "#0284c7",
          600: "#0369a1",
          700: "#075985",
          900: "#0c4a6e",
        },
        verdict: {
          safe: "#10b981",
          safeBg: "#ecfdf5",
          safeBorder: "#6ee7b7",
          suspicious: "#f59e0b",
          suspiciousBg: "#fffbeb",
          suspiciousBorder: "#fcd34d",
          scam: "#ef4444",
          scamBg: "#fef2f2",
          scamBorder: "#fca5a5",
        },
      },
    },
  },
  plugins: [],
};

export default config;
