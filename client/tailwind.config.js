/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#F8FAFC',
        surface: '#FFFFFF',
        'surface-2': '#F1F5F9',
        primary: { DEFAULT: '#4F46E5', light: '#6366f1', dark: '#3730a3' },
        accent: { DEFAULT: '#06B6D4', light: '#22d3ee', dark: '#0891b2' },
        success: { DEFAULT: '#22C55E', light: '#4ade80', dark: '#16a34a' },
        warning: { DEFAULT: '#F59E0B', light: '#fbbf24', dark: '#d97706' },
        danger: { DEFAULT: '#EF4444', light: '#f87171', dark: '#dc2626' },
        'text-primary': '#0F172A',
        'text-secondary': '#475569',
        'text-muted': '#64748B',
        border: '#E2E8F0',
        'border-light': '#CBD5E1',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backdropBlur: { xs: '2px' },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideInLeft: { '0%': { opacity: '0', transform: 'translateX(-20px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0, 0, 0, 0.05)',
        glow: '0 0 20px rgba(79, 70, 229, 0.15)',
        'glow-accent': '0 0 20px rgba(6, 182, 212, 0.15)',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
