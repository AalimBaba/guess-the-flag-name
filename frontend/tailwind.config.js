/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Atlas & Passport palette
        parchment: {
          DEFAULT: '#F1E9D2',
          light: '#F8F2E2',
          dark: '#E5D8B0',
        },
        ink: {
          DEFAULT: '#20263B',
          soft: '#4A5170',
          faint: '#8188A3',
        },
        brass: {
          DEFAULT: '#A9822E',
          light: '#C7A656',
          dark: '#7A5D1F',
        },
        stamp: {
          red: '#9C3B3B',
          green: '#3B6142',
        },
        // legacy brand ramp kept for anything not yet migrated
        brand: {
          50: '#f4f7ff',
          100: '#e9efff',
          200: '#c8d6ff',
          300: '#a7bdff',
          400: '#86a4ff',
          500: '#648bff',
          600: '#4a6fe0',
          700: '#3755b3',
          800: '#263b80',
          900: '#17244d',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'animated-gradient':
          'radial-gradient(125% 125% at 50% 0%, #0ea5e9 0%, #1d4ed8 50%, #0f172a 100%)',
        'atlas-grid':
          'linear-gradient(rgba(32,38,59,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(32,38,59,0.06) 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '32px 32px',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        stamp: {
          '0%': { transform: 'scale(2.2) rotate(-14deg)', opacity: '0' },
          '60%': { transform: 'scale(0.95) rotate(-8deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(-8deg)', opacity: '1' },
        },
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
        stamp: 'stamp 0.4s cubic-bezier(0.2, 0.8, 0.3, 1.1) forwards',
      },
    },
  },
  plugins: [],
}
