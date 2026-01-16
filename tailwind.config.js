/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#1a468e',  // Deep blue from logo
          red: '#d31320',   // Vibrant red from logo
          gray: '#6b7280',
        }
      }
    },
  },
  plugins: [],
}
