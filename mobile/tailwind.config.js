/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#FFA239",
        "primary-dark": "#e8923a",
        background: "#f5f0f0",
        text: "#3e3e3e",
      },
    },
  },
  plugins: [],
};
