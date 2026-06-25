import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        surface:          '#0D0F11',
        'surface-2':      '#1A1C1E',
        'surface-3':      '#242628',
        'surface-4':      '#2E3032',
        'cyan-galactic':  '#00F5FF',
        'cyan-dim':       '#00C4CC',
        'text-primary':   '#E8EAF0',
        'text-secondary': '#B8BCC8',
        'text-muted':     '#6B7280',
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      animation: {
        flicker:           'flicker 6s infinite',
        'pulse-slow':      'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        scan:              'scan 6s linear infinite',
        'reticle-spin':    'reticle-spin 3s linear infinite',
        'reticle-spin-ccw':'reticle-spin-ccw 5s linear infinite',
        orbit:             'orbit 4s linear infinite',
        'pulse-ring':      'pulse-ring 1.4s ease-out infinite',
        'cursor-breathe':  'cursor-breathe 2s ease-in-out infinite',
        'gradient-sweep':  'gradient-sweep 1.2s ease forwards',
        'bracket-draw':    'bracket-draw 0.5s ease forwards',
      },
      keyframes: {
        flicker: {
          '0%, 89%, 91%, 93%, 100%': { opacity: '1' },
          '90%':  { opacity: '0.35' },
          '92%':  { opacity: '0.8' },
        },
        scan: {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'reticle-spin': {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(360deg)' },
        },
        'reticle-spin-ccw': {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(-360deg)' },
        },
        orbit: {
          from: { transform: 'rotate(0deg) translateX(10px) rotate(0deg)' },
          to:   { transform: 'rotate(360deg) translateX(10px) rotate(-360deg)' },
        },
        'pulse-ring': {
          '0%':   { transform: 'scale(1)',   opacity: '0.7' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        'cursor-breathe': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%':      { transform: 'scale(1.08)' },
        },
        'gradient-sweep': {
          '0%':   { transform: 'translateX(-100%) skewX(-12deg)' },
          '100%': { transform: 'translateX(350%)  skewX(-12deg)' },
        },
        'bracket-draw': {
          from: { strokeDashoffset: '40', opacity: '0' },
          to:   { strokeDashoffset: '0',  opacity: '1' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}

export default config
