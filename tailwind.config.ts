import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'unbound-purple': '#7B56FB',
        'unbound-purple-hover': '#6D48E8',
        'unbound-border': '#EAEBEE',
        'unbound-text-primary': '#3D3D3D',
        'unbound-text-secondary': '#404453',
        'unbound-text-tertiary': '#6B6F76',
        'unbound-text-muted': '#9B97A1',
        'unbound-bg': '#FAFAFB',
        'unbound-bg-hover': '#F9FAFB',
        'unbound-disabled': '#D1D5DB',
        // severity
        'sev-critical': '#E11D48',
        'sev-critical-bg': '#FFF1F2',
        'sev-high': '#EA580C',
        'sev-high-bg': '#FFF7ED',
        'sev-medium': '#CA8A04',
        'sev-medium-bg': '#FEFCE8',
        'sev-low': '#16A34A',
        'sev-low-bg': '#F0FDF4',
        'sev-info': '#64748B',
        'sev-info-bg': '#F1F5F9',
      },
      fontFamily: {
        inter: ['var(--font-inter)'],
        mono: ['var(--font-fira-code)'],
      },
      borderRadius: {
        xl: '0.75rem',
      },
    },
  },
  plugins: [],
};

export default config;
