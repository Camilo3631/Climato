/** @type {import('tailwindcss').Config} */

module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./js/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
     'red-polish': 'rgb(220, 20, 60)'
      }
    },
  },
  plugins: [],
}