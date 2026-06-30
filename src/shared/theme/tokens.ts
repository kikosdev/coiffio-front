// Ré-export TS des design tokens "Ivory Éditorial" (miroir de tailwind.config.js).
// Pour les usages JS (charts, styles inline) — la source canonique reste Tailwind.
export const tokens = {
  color: {
    ink: '#1C1612',
    ivory: '#F3ECE0',
    surface: '#FAF6EE',
    champagne: '#B89968',
    champagneDeep: '#9A7B4F',
    success: '#3F8F6B',
    pending: '#C9A227',
    error: '#B4543E',
    muted: '#8A8076',
    line: '#E2D8C8',
    lineStrong: '#CFC3AE',
  },
  font: {
    serif: '"Cormorant Garamond", Georgia, serif',
    sans: 'Inter, system-ui, sans-serif',
    mono: '"JetBrains Mono", ui-monospace, monospace',
  },
} as const;

export type Tokens = typeof tokens;
