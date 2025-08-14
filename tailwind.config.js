/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["Inter", "ui-sans-serif", "system-ui"] },
      colors: {
        brand: {
          50:"#eef5ff",100:"#dae8ff",200:"#b7d0ff",300:"#8bb3ff",400:"#5b90ff",
          500:"#2e6cff",600:"#1f52d6",700:"#1a45ad",800:"#163b8a",900:"#122f6c",
        },
      },
      borderRadius: { "2xl": "1.25rem" },
      boxShadow: { card: "0 12px 40px rgba(18,47,108,0.10)" },
    },
  },
  plugins: [],
};
