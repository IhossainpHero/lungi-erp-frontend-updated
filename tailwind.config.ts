import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#fdf4e7",
          100: "#fce4bb",
          200: "#f9c97d",
          300: "#f7ae3f",
          400: "#f59a10",
          500: "#e08600",
          600: "#b86e00",
          700: "#8f5500",
          800: "#663d00",
          900: "#3d2400",
        },
        ink: {
          900: "#1a1208",
          800: "#2d1f0e",
          700: "#432f16",
          600: "#5c4020",
          500: "#7a5730",
        },
        sand: {
          50: "#faf8f4",
          100: "#f5f0e8",
          200: "#ede4d0",
          300: "#dfd0b0",
        },
      },
      fontFamily: {
        display: ["'Noto Serif Bengali'", "serif"],
        body: ["'Noto Sans Bengali'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(26,18,8,0.08), 0 4px 12px rgba(26,18,8,0.05)",
        "card-hover": "0 4px 12px rgba(26,18,8,0.12), 0 8px 24px rgba(26,18,8,0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
