/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#0a0a0f',
          deeper: '#05050a',
          card: 'rgba(15, 23, 42, 0.6)',
          border: 'rgba(0, 255, 200, 0.15)',
          glow: '#00ffc8',
          teal: '#00d4aa',
          cyan: '#06b6d4',
          green: '#10b981',
          accent: '#00ffaa',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'aurora': 'aurora 8s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'spin-slow': 'spin 20s linear infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'aurora': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'aurora-gradient': 'linear-gradient(135deg, #0a0a0f 0%, #0d1f2d 25%, #0a2a2a 50%, #0d1f2d 75%, #0a0a0f 100%)',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(0, 255, 200, 0.3)',
        'glow-lg': '0 0 40px rgba(0, 255, 200, 0.4)',
        'glow-xl': '0 0 60px rgba(0, 255, 200, 0.2)',
        'inner-glow': 'inset 0 0 30px rgba(0, 255, 200, 0.1)',
      }
    },
  },
  plugins: [],
}
