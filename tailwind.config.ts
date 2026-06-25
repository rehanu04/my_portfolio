import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: '#0D0F11',
        'surface-2': '#1A1C1E',
        'surface-3': '#242628',
        'cyan-galactic': '#00F5FF',
        'text-primary': '#E8EAF0',
        'text-muted': '#6B7280',
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        flicker: 'flicker 6s infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        scan: 'scan 6s linear infinite',
      },
      keyframes: {
        flicker: {
          '0%, 89%, 91%, 93%, 100%': { opacity: '1' },
          '90%': { opacity: '0.4' },
          '92%': { opacity: '0.8' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
