/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'nyc-blue': '#1a365d',
        'nyc-gold': '#f6ad55',
      },
    },
  },
  plugins: [],
}