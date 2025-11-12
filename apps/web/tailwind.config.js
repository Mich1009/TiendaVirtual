/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0b5fff',
          dark: '#0a4bcc',
          light: '#e8f0ff'
        }
      }
    }
  },
  plugins: []
}