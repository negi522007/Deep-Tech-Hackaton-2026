import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/app/**/*.{ts,tsx}', './src/components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Surfaces — driven by CSS vars (dual-theme)
        ink:    'var(--bg)',
        ink2:   'var(--surface2)',
        panel:  'var(--surface1)',
        panel2: 'var(--surface2)',

        // Text
        chalk:  'var(--chalk)',
        steel:  'var(--steel)',
        muted:  'var(--muted)',

        // Borders
        line:   'var(--line)',
        hair:   'var(--hair)',

        // Accent — molten vermillon replaces cyan everywhere
        // All text-cyan / bg-cyan / border-cyan → vermillon automatically
        cyan:   'var(--accent)',
        accent: 'var(--accent)',
        ice:    'var(--info)',

        // Amber companion
        amber:  'var(--amber)',
        ember:  'var(--accent-sub)',

        // Semantic
        ok:     'var(--ok)',
        warn:   'var(--warn)',
        crit:   'var(--crit)',
        info:   'var(--info)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      backgroundImage: {
        'grid-fade': 'radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--accent) 8%, transparent), transparent 60%)',
        'accent': 'linear-gradient(135deg, var(--accent) 0%, var(--amber) 100%)',
      },
      boxShadow: {
        glass:     '0 1px 0 0 var(--line) inset, 0 20px 60px -25px rgba(0,0,0,0.6)',
        glow:      '0 0 0 1px color-mix(in srgb, var(--accent) 30%, transparent), 0 0 40px -8px var(--glow)',
        glowamber: '0 0 0 1px color-mix(in srgb, var(--amber) 30%, transparent), 0 0 40px -8px var(--amber-glow)',
      },
      keyframes: {
        float:     { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        shimmer:   { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        scan:      { '0%': { top: '0%' }, '100%': { top: '100%' } },
        pulseRing: { '0%': { transform: 'scale(0.8)', opacity: '0.6' }, '100%': { transform: 'scale(2.2)', opacity: '0' } },
      },
      animation: {
        float:     'float 6s ease-in-out infinite',
        shimmer:   'shimmer 2.5s linear infinite',
        scan:      'scan 1.8s ease-in-out infinite alternate',
        pulseRing: 'pulseRing 2s ease-out infinite',
      },
      transitionTimingFunction: {
        'out-expo':  'cubic-bezier(0.16, 1, 0.3, 1)',
        'out-quart': 'cubic-bezier(0.25, 1, 0.5, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
