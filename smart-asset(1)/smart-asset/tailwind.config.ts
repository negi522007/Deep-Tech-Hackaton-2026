import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/app/**/*.{ts,tsx}', './src/components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#05070A',          // deepest background
        ink2: '#080B11',
        panel: '#0C111A',        // glass base
        panel2: '#121926',
        line: 'rgba(148,163,184,0.12)',
        steel: '#7C8AA0',
        chalk: '#EAF0F7',
        // signature gradient accent: electric cyan -> industrial amber
        cyan: '#22D3EE',
        ice: '#7DD3FC',
        amber: '#FFB22E',
        ember: '#FF6A3D',
        ok: '#34E5A1',
        warn: '#FBBF24',
        crit: '#FF5C7A',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      backgroundImage: {
        'grid-fade': 'radial-gradient(circle at 50% 0%, rgba(34,211,238,0.08), transparent 60%)',
        'accent': 'linear-gradient(135deg, #22D3EE 0%, #7DD3FC 40%, #FFB22E 100%)',
      },
      boxShadow: {
        glass: '0 1px 0 0 rgba(255,255,255,0.06) inset, 0 20px 60px -25px rgba(0,0,0,0.9)',
        glow: '0 0 0 1px rgba(34,211,238,0.25), 0 0 40px -8px rgba(34,211,238,0.35)',
        glowamber: '0 0 0 1px rgba(255,178,46,0.3), 0 0 40px -8px rgba(255,178,46,0.4)',
      },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        scan: { '0%': { top: '0%' }, '100%': { top: '100%' } },
        pulseRing: { '0%': { transform: 'scale(0.8)', opacity: '0.6' }, '100%': { transform: 'scale(2.2)', opacity: '0' } },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
        scan: 'scan 1.8s ease-in-out infinite alternate',
        pulseRing: 'pulseRing 2s ease-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
