/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',
        secondary: '#4f46e5',
        dark: '#0f172a',
        darker: '#020617',
        panel: '#1e293b'
      }
    },
  },
  plugins: [],
}
