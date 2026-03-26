import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        axel: {
          50:  '#F0EFFF',
          100: '#E0DEFF',
          400: '#7C6FF5',
          500: '#5446E5',
          600: '#4338CA',
          700: '#3730A3',
          ink:     '#1C1917',
          surface: '#F5F4F2',
        },
      },
      animation: {
        'float':         'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'pulse-slow':    'pulse 3s ease-in-out infinite',
        'fade-up':       'fadeUp 0.6s ease-out forwards',
        'shimmer':       'shimmer 1.8s linear infinite',
        'spin-slow':     'spin 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-400% 0' },
          '100%': { backgroundPosition: '400% 0' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
