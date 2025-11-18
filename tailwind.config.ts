import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primaryBlack: "#0A0A0A",
        accentOrange: "#FF6B35",
        slateGray: "#475569",
        lightGray: "#F1F5F9",
        navy: "#1E3A8A",
      },
      fontFamily: {
        sans: ["Inter", "var(--font-inter)", "system-ui", "-apple-system"],
      },
    },
  },
  plugins: [],
};

export default config;
