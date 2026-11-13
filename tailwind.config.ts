import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fef7ee",
          100: "#fdedd3",
          200: "#f9d7a5",
          300: "#f5b96d",
          400: "#f09333",
          500: "#ed7712",
          600: "#de5c08",
          700: "#b84309",
          800: "#93360e",
          900: "#772e0f",
          950: "#401405",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      boxShadow: {
        "card": "0 1px 2px rgba(17,24,39,0.04), 0 2px 6px rgba(17,24,39,0.03)",
        "card-hover": "0 2px 6px rgba(17,24,39,0.04), 0 12px 32px rgba(17,24,39,0.08)",
        "card-dark": "0 1px 2px rgba(0,0,0,0.24), 0 2px 6px rgba(0,0,0,0.2)",
        "card-dark-hover": "0 2px 6px rgba(0,0,0,0.3), 0 12px 32px rgba(0,0,0,0.4)",
        "brand": "0 6px 16px rgba(237,119,18,0.22)",
        "brand-lg": "0 10px 28px rgba(237,119,18,0.3)",
        "inset-line": "inset 0 1px 0 rgba(255,255,255,0.06)",
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "float-delayed": "float 6s ease-in-out 2s infinite",
        "float-slow": "float 8s ease-in-out 1s infinite",
        "fade-in": "fadeIn 0.6s ease-out",
        "slide-up": "slideUp 0.6s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
