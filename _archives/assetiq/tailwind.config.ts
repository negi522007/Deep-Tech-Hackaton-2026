import type { Config } from "tailwindcss";

/* Mappe les variables CSS de globals.css vers des utilitaires Tailwind.
   Exemples d'usage : bg-base, bg-surface-1, text-ink, text-ink-soft,
   border-hair, text-accent, rounded-card, shadow-amb, font-mono. */

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "var(--bg-base)",
        void: "var(--bg-void)",
        surface: { 1: "var(--surface-1)", 2: "var(--surface-2)" },
        ink: {
          DEFAULT: "var(--text-primary)",
          soft: "var(--text-secondary)",
          mute: "var(--text-muted)",
        },
        accent: { DEFAULT: "var(--accent)", hover: "var(--accent-hover)" },
        ok: "var(--ok)", warn: "var(--warn)", danger: "var(--danger)", info: "var(--info)",
        hair: "var(--border-hair)", strong: "var(--border-strong)",
      },
      borderRadius: {
        card: "var(--r-card)", btn: "var(--r-btn)",
        input: "var(--r-input)", pill: "var(--r-pill)",
      },
      boxShadow: {
        amb: "var(--shadow-amb)",
        "inset-hi": "var(--inset-hi)",
        glow: "0 6px 24px var(--accent-glow)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16,1,0.3,1)",
        "out-quart": "cubic-bezier(0.25,1,0.5,1)",
        "in-out-quint": "cubic-bezier(0.83,0,0.17,1)",
      },
    },
  },
  plugins: [],
};
export default config;
