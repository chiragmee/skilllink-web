import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5',
        secondary: '#F97316',
        background: '#F9FAFB',
        card: '#FFFFFF',
        foreground: '#0F172A',
        muted: '#64748B',
        border: '#E5E7EB',
        success: '#16A34A',
        danger: '#DC2626',
        surface: '#F9FAFB',
        'surface-container-lowest': '#FFFFFF',
        'surface-container-low': '#F8FAFC',
        'surface-container-high': '#EEF2FF',
        'on-surface': '#0F172A',
        'on-surface-variant': '#64748B',
        'primary-container': '#C7D2FE',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        headline: ['var(--font-inter)', 'sans-serif'],
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
        '3xl': '20px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0, 0, 0, 0.1)',
        nav: '0 -1px 3px rgba(0, 0, 0, 0.08)',
        editorial: '0 1px 3px rgba(0, 0, 0, 0.1)',
        'editorial-sm': '0 1px 3px rgba(0, 0, 0, 0.08)',
        'bottom-nav': '0 -1px 3px rgba(0, 0, 0, 0.08)',
      },
      maxWidth: {
        shell: '1200px',
      },
    },
  },
  plugins: [],
}

export default config
