import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        page: "var(--page)",
        panel: "var(--panel)",
        raised: "var(--raised)",
        hairline: "var(--hairline)",
        paper: "var(--text)",
        fog: "var(--fog)",
        signal: "var(--signal)",
        "on-signal": "var(--text-on-signal)",
        verdict: {
          safe: "var(--verdict-safe)",
          "safe-text": "var(--verdict-safe-text)",
          "safe-surface": "var(--verdict-safe-surface)",
          warn: "var(--verdict-warn)",
          "warn-text": "var(--verdict-warn-text)",
          "warn-surface": "var(--verdict-warn-surface)",
          scam: "var(--verdict-scam)",
          "scam-text": "var(--verdict-scam-text)",
          "scam-surface": "var(--verdict-scam-surface)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        tile: "var(--radius-tile)",
        panel: "var(--radius-panel)",
        pill: "var(--radius-pill)",
      },
      boxShadow: {
        innerHighlight: "var(--inner-highlight)",
      },
      transitionTimingFunction: {
        out: "var(--ease-out)",
        inOut: "var(--ease-in-out)",
        spring: "var(--stamp-spring)",
      },
    },
  },
  plugins: [],
};

export default config;
