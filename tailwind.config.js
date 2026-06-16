/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        bg: {
          primary: "#0f172a",
          secondary: "#1e293b",
          tertiary: "#334155",
          elevated: "#1e293b",
        },
        border: {
          default: "#334155",
          hover: "#475569",
          focus: "#f97316",
        },
        text: {
          primary: "#f1f5f9",
          secondary: "#94a3b8",
          muted: "#64748b",
        },
        alert: {
          orange: "#f97316",
          red: "#ef4444",
          green: "#10b981",
          yellow: "#eab308",
          blue: "#3b82f6",
        },
        accent: {
          orange: "#f97316",
          "orange-hover": "#ea580c",
          "orange-light": "#fdba74",
        },
      },
      fontFamily: {
        display: ["Orbitron", "sans-serif"],
        sans: ["Noto Sans SC", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        glow: "0 0 12px rgba(249, 115, 22, 0.4)",
        "glow-red": "0 0 12px rgba(239, 68, 68, 0.4)",
        "glow-green": "0 0 12px rgba(16, 185, 129, 0.4)",
        card: "0 4px 20px rgba(0, 0, 0, 0.3)",
        inset: "inset 0 2px 4px rgba(0, 0, 0, 0.3)",
      },
      animation: {
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "slide-out-right": "slideOutRight 0.3s ease-in",
        "fade-in": "fadeIn 0.2s ease-out",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
        marquee: "marquee 20s linear infinite",
      },
      keyframes: {
        slideInRight: {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideOutRight: {
          "0%": { transform: "translateX(0)", opacity: "1" },
          "100%": { transform: "translateX(100%)", opacity: "0" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 8px rgba(249, 115, 22, 0.3)" },
          "50%": { boxShadow: "0 0 20px rgba(249, 115, 22, 0.6)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};
