import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: '#C8A84B',
        'gold-light': '#F0D580',
        dark: '#0A0812',
        panel: 'rgba(13, 10, 26, 0.88)',
        border: 'rgba(58, 46, 94, 0.7)',
        'border-gold': 'rgba(107, 84, 32, 0.8)',
        parchment: '#F0E6C8',
        'red-wow': '#8C1414',
        'red-dark': '#5A0A0A',
      },
      fontFamily: {
        display: ['Cinzel', 'serif'],
        body: ['Crimson Text', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
