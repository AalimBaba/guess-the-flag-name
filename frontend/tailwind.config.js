/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
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
      backgroundImage: {
        'animated-gradient':
          'radial-gradient(125% 125% at 50% 0%, #0ea5e9 0%, #1d4ed8 50%, #0f172a 100%)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
