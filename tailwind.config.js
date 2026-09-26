/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: 'rgb(var(--brand-dark) / <alpha-value>)',
          surface: 'rgb(var(--brand-surface) / <alpha-value>)',
          card: 'rgb(var(--brand-card) / <alpha-value>)',
          border: 'rgb(var(--brand-border) / <alpha-value>)',
          red: '#C40000',
          redHover: '#9E0000',
          redLight: '#E53935',
          gold: '#F59E0B',
          amber: '#FBBF24',
          accent: '#C40000',
          blue: '#2563EB',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        'glow-red': '0 0 25px -5px rgba(196, 0, 0, 0.45)',
        'glow-red-lg': '0 0 40px -8px rgba(196, 0, 0, 0.6)',
        'glow': '0 0 25px -5px rgba(196, 0, 0, 0.4)',
        'soft': '0 10px 30px -10px rgba(0, 0, 0, 0.4)',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-4deg)' },
          '50%': { transform: 'rotate(4deg)' },
        },
        pulseGlow: {
          '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(196, 0, 0, 0.7)' },
          '50%': { transform: 'scale(1.05)', boxShadow: '0 0 0 12px rgba(196, 0, 0, 0)' },
        }
      },
      animation: {
        wiggle: 'wiggle 0.3s ease-in-out infinite',
        pulseGlow: 'pulseGlow 2s infinite',
      }
    },
  },
  plugins: [],
}
