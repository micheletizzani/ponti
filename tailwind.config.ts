import type { Config } from 'tailwindcss';

/**
 * Design system Ponti.
 * I colori vivono come CSS custom properties (src/index.css) così che la modalità
 * alto contrasto e la scala tipografica siano personalizzabili senza rebuild.
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: 'var(--paper)',
        'paper-deep': 'var(--paper-deep)',
        surface: 'var(--surface)',
        ink: 'var(--ink)',
        'ink-soft': 'var(--ink-soft)',
        line: 'var(--line)',
        'line-strong': 'var(--line-strong)',
        accent: 'var(--accent)',
        'accent-hover': 'var(--accent-hover)',
        'accent-soft': 'var(--accent-soft)',
        'accent-ink': 'var(--accent-ink)',
        focus: 'var(--focus)',
        agent: {
          fill: 'var(--agent-fill)',
          line: 'var(--agent-line)',
          ink: 'var(--agent-ink)',
        },
        verb: {
          fill: 'var(--verb-fill)',
          line: 'var(--verb-line)',
          ink: 'var(--verb-ink)',
        },
        patient: {
          fill: 'var(--patient-fill)',
          line: 'var(--patient-line)',
          ink: 'var(--patient-ink)',
        },
        place: {
          fill: 'var(--place-fill)',
          line: 'var(--place-line)',
          ink: 'var(--place-ink)',
        },
      },
      fontFamily: {
        ui: ['"Atkinson Hyperlegible"', 'Verdana', 'system-ui', 'sans-serif'],
        display: ['"Lexend Variable"', '"Atkinson Hyperlegible"', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        shell: '76rem',
        reading: '40rem',
      },
      borderRadius: {
        card: '1.5rem',
        tile: '1.25rem',
      },
      boxShadow: {
        lift: '0 1px 0 rgba(30, 36, 31, 0.04), 0 18px 40px -28px rgba(30, 36, 31, 0.35)',
      },
      transitionTimingFunction: {
        gentle: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
      },
    },
  },
  plugins: [],
} satisfies Config;
