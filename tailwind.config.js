/** @type {import('tailwindcss').Config} */
// Design tokens "Ivory Éditorial" — source de vérité (SKILL.md + SKILL_foundation.md).
// Ne jamais inventer de couleur/typo/espacement hors de ces tokens.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1C1612',
        ivory: '#F3ECE0',
        champagne: { DEFAULT: '#B89968', deep: '#9A7B4F' },
        success: '#3F8F6B',
        pending: '#C9A227',
        error: '#B4543E',
        muted: '#8A8076',
        line: '#E2D8C8',
        lineStrong: '#CFC3AE',
        surface: '#FAF6EE',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        card: '16px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(28,22,18,.04), 0 4px 16px rgba(28,22,18,.06)',
        card: '0 1px 2px rgba(28,22,18,.05), 0 12px 32px rgba(28,22,18,.08)',
      },
    },
  },
  plugins: [],
};
