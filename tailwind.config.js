/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#10b981',
        accent: '#f59e0b',
        danger: '#ef4444',
        dark: '#1f2937',
        // 可爱色彩
        pingu: '#0ea5e9',
        bear: '#f97316',
        pink: '#ec4899',
        purple: '#8b5cf6',
        mint: '#14b8a6',
        yellow: '#eab308',
        lightBlue: '#60a5fa',
        lightPink: '#f9a8d4',
      },
      fontFamily: {
        sans: ['system-ui', 'sans-serif'],
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top, 0px)',
        'safe-bottom': 'env(safe-area-inset-bottom, 16px)',
      },
    },
  },
  plugins: [],
};
