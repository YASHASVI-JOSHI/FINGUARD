/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#07111F',
        surface: '#101C2C',
        card: '#16283D',
        primary: '#3B82F6',
        accent: '#38BDF8',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        text: '#F8FAFC',
        muted: '#94A3B8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        glow: '0 0 40px rgba(59, 130, 246, 0.15)',
      },
    },
  },
  plugins: [],
}
