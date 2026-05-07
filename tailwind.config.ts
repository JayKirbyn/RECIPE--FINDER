/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary-yellow': '#FFC107',
        'primary-dark': '#1A1A1A',
        'card-yellow': '#ffffff',
        'hover-yellow': '#FFB300',
      },
      boxShadow: {
        'premium': '0 20px 35px -10px rgba(0,0,0,0.1)',
        'card': '0 10px 25px -5px rgba(0,0,0,0.05)',
        'glow': '0 8px 20px rgba(255,193,7,0.3)',
      },
    },
  },
  plugins: [],
};