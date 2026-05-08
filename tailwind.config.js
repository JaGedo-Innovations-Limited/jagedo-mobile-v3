/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary:    { DEFAULT: "#1976D2", light: "#42A5F5", dark: "#0D47A1" },
        secondary:  { DEFAULT: "#FF6F00", light: "#FFB300", dark: "#E65100" },
        surface:    "#FFFFFF",
        background: "#F5F5F5",
        error:      "#B00020",
      },
      fontFamily: {
        sans:   ["Roboto_400Regular"],
        bold:   ["Roboto_700Bold"],
        medium: ["Roboto_500Medium"],
      },
    },
  },
  plugins: [],
};
