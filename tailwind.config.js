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
          dark: '#0B0F19',
          surface: '#111827',
          card: '#1F2937',
          border: '#374151',
          gold: '#F59E0B',
          goldHover: '#D97706',
          amber: '#FBBF24',
          accent: '#E11D48',
          blue: '#2563EB',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 25px -5px rgba(245, 158, 11, 0.3)',
        'glow-lg': '0 0 40px -10px rgba(245, 158, 11, 0.4)',
        'soft': '0 10px 30px -10px rgba(0, 0, 0, 0.3)',
      }
    },
  },
  plugins: [],
}
