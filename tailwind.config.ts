import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f7efff",
          100: "#eddefd",
          200: "#ddc1fb",
          300: "#c89cf5",
          400: "#b678ef",
          500: "#9b5de5",
          600: "#8247cc",
          700: "#6a36aa",
          800: "#572d89",
          900: "#442468",
        },
        ink: {
          50: "#f7f8fc",
          100: "#edf0f8",
          500: "#667085",
          700: "#344054",
          900: "#111827",
        },
        coral: {
          50: "#fff0f9",
          500: "#f15bb5",
          600: "#d83c9e",
        },
        honey: {
          50: "#fffce5",
          500: "#fee440",
          600: "#e8c800",
        },
        mint: {
          50: "#e6fffb",
          500: "#00f5d4",
          600: "#00c4ab",
        },
        aqua: {
          50: "#e6f9ff",
          500: "#00bbf9",
          600: "#0099ce",
        },
      },
      boxShadow: {
        card: "0 18px 48px -30px rgba(17, 24, 39, 0.36), 0 8px 24px -18px rgba(17, 24, 39, 0.24)",
        soft: "0 20px 44px -22px rgba(155, 93, 229, 0.36)",
        float: "0 28px 65px -36px rgba(17, 24, 39, 0.38)",
        glow: "0 22px 60px -34px rgba(155, 93, 229, 0.7), 0 18px 54px -34px rgba(0, 187, 249, 0.52)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
        "4xl": "2.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
