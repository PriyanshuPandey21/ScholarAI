/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: { 400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9', 900: '#4c1d95' },
        accent: { 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb' },
        background: 'var(--bg-main)',
        foreground: 'var(--text-main)',
        muted: 'var(--text-muted)',
        surface: 'var(--bg-surface)',
        'glass-border': 'var(--glass-border)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass': 'var(--glass-shadow)',
        'glow': '0 0 20px rgba(139, 92, 246, 0.4)',
      },
    },
  },
  plugins: [],
}
