/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors:{
        primary:'#FFA239',
      },
      backgroundColor:{
        primary:'#FFA239',
      },
      fontFamily: {
        sans: ['Anta', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

