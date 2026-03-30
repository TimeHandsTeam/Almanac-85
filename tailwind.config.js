/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#0A0A0A',
        surface: '#141414',
        elevated: '#1E1E1E',
        gold: '#C9A84C',
        danger: '#E03131',
        primary: '#F5F5F5',
        muted: '#8A8A8A',
        border: '#2A2A2A',
      },
    },
  },
  plugins: [],
};
