/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html","./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        chango: ["Chango", "cursive"],
        opensans: ["Open Sans", "sans-serif"],
        stack: ["Stack Sans Headline", "sans-serif"],
      },
    },
  },
  plugins: [],
};