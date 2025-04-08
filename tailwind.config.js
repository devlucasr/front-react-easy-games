// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#131422",
        text: "#FFFFFF",
        cardBackground: "#1A1B2D",
        buttonBuy: "#00C898",
        buttonTrade: "#012AE1",
      },
      boxShadow: {
        card: "0px 2px 8px rgba(0, 0, 0, 0.2)",
      },
      animation: {
        wiggle: "wiggle 0.3s ease-in-out infinite",
      },
      keyframes: {
        wiggle: {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(-5deg)" },
          "50%": { transform: "rotate(5deg)" },
          "75%": { transform: "rotate(-5deg)" },
        },
      },
    },
  },
  plugins: [],
};
