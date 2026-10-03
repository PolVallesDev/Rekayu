/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Instrument Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
      },
      colors: {
        calma: {
          bg: 'var(--bg)',
          surface: 'var(--surface)',
          ink: 'var(--ink)',
          muted: 'var(--muted)',
          line: 'var(--line)',
          accent: 'var(--accent)',
          'accent-soft': 'var(--accent-soft)',
          warn: 'var(--warn)',
          clase: 'var(--c-clase)',
          examenes: 'var(--c-examenes)',
          emprender: 'var(--c-emprender)',
          personal: 'var(--c-personal)',
        },
      },
      boxShadow: {
        calma: 'var(--shadow)',
      },
      keyframes: {
        'page-popup': {
          '0%': {
            opacity: '0',
            transform: 'translateY(16px) scale(0.985)',
          },
          '100%': {
            opacity: '1',
            transform: 'none',
          },
        },
      },
      animation: {
        'page-popup': 'page-popup 260ms cubic-bezier(0.16, 1, 0.3, 1) both',
      },
    },
  },
  plugins: [],
}
