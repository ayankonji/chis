/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"SF Pro Text"', '"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
      },
      colors: {
        'ios-bg': '#F5F5F7',
        'ios-card': '#FFFFFF',
        'ios-text': '#1D1D1F',
        'ios-text-secondary': '#86868B',
        'ios-blue': '#007AFF',
        'ios-green': '#34C759',
        'ios-orange': '#FF9500',
        'ios-red': '#FF3B30',
        'ios-pink': '#FF2D55',
        'ios-purple': '#AF52DE',
        'ios-teal': '#5AC8FA',
        'ios-yellow': '#FFCC00',
        'ios-gray': '#8E8E93',
        'ios-gray-2': '#AEAEB2',
        'ios-gray-3': '#C7C7CC',
        'ios-gray-4': '#D1D1D6',
        'ios-gray-5': '#E5E5EA',
        'ios-gray-6': '#F2F2F7',
      },
      borderRadius: {
        'ios': '20px',
        'ios-lg': '24px',
        'ios-sm': '16px',
        'ios-xs': '12px',
      },
      boxShadow: {
        'ios': '0 4px 24px rgba(0, 0, 0, 0.08)',
        'ios-hover': '0 12px 40px rgba(0, 0, 0, 0.15)',
        'ios-inner': 'inset 0 1px 2px rgba(255, 255, 255, 0.8), inset 0 -1px 2px rgba(0, 0, 0, 0.05)',
        'ios-button': '0 2px 8px rgba(0, 122, 255, 0.3)',
      },
      transitionTimingFunction: {
        'ios': 'cubic-bezier(0.4, 0.0, 0.2, 1)',
        'ios-spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      animation: {
        'shimmer': 'shimmer 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%) rotate(25deg)' },
          '100%': { transform: 'translateX(200%) rotate(25deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
}
