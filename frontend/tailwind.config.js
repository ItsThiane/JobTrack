/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        indigo: { 300: "#818cf8", 400: "#6366f1" },
        pink: { 400: "#f472b6" },
        emerald: { 300: "#6ee7b7", 400: "#34d399", 600: "#059669" },
      },
    },
  },
  plugins: [],
}