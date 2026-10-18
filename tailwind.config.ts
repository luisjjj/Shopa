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
        "card": "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
        "card-hover": "0 8px 25px rgba(0,0,0,0.08), 0 4px 10px rgba(0,0,0,0.04)",
        "card-dark": "0 1px 3px rgba(0,0,0,0.2), 0 1px 2px rgba(0,0,0,0.15)",
        "card-dark-hover": "0 8px 25px rgba(0,0,0,0.35), 0 4px 10px rgba(0,0,0,0.2)",
        "soft": "0 1px 2px rgba(24,15,5,0.05), 0 10px 30px -12px rgba(24,15,5,0.10)",
        "soft-lg": "0 1px 3px rgba(24,15,5,0.05), 0 28px 64px -28px rgba(24,15,5,0.18)",
        "soft-dark": "0 1px 2px rgba(0,0,0,0.3), 0 10px 30px -12px rgba(0,0,0,0.5)",
        "soft-lg-dark": "0 1px 3px rgba(0,0,0,0.35), 0 28px 64px -28px rgba(0,0,0,0.65)",
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "float-delayed": "float 6s ease-in-out 2s infinite",
        "float-slow": "float 8s ease-in-out 1s infinite",
        "fade-in": "fadeIn 0.6s ease-out",
        "slide-up": "slideUp 0.6s ease-out",
        "slide-up-1": "slideUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.08s both",
        "slide-up-2": "slideUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.16s both",
        "slide-up-3": "slideUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.26s both",
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
