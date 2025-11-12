/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.jsx',
    './index.js',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0b5fff',
          dark: '#0a4bcc',
          light: '#e8f0ff',
        },
      },
    },
  },
}