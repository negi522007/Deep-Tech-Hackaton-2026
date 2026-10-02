import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dark Theme (Industrial-Luxe)
        'surface-dark': {
          0: '#0a0e17',
          1: '#111820',
          2: '#16212d',
          3: '#1f2a3d',
        },
        'ink-dark': {
          base: '#e8eef6',
          soft: '#a8b2c1',
        },
        'accent-dark': '#ff6b35',

        // Light Theme (Editorial Bold)
        'surface-light': {
          0: '#fefdfb',
          1: '#faf8f3',
          2: '#f5f1e8',
          3: '#ede7dc',
        },
        'ink-light': {
          base: '#1a1410',
          soft: '#6b5f54',
        },
        'accent-light': '#d63724',

        // Semantic
        'status-success': '#4ade80',
        'status-warning': '#facc15',
        'status-error': '#ef4444',
        'status-info': '#0ea5e9',
      },
    },
  },
  plugins: [],
};

export default config;
