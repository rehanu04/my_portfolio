// ─────────────────────────────────────────────────────────────────────────────
// src/components/ui/Navigation.tsx
//
// Fixed nav with glassmorphism backdrop on scroll.
// data-cursor="target" on all interactive elements.
// Active section indicator with spring-animated underline.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useScrollContext } from '../../context/ScrollContext'
import { NAV_ITEMS } from '../../data/portfolioContent'

// ─── Component ─────────────────────────────────────────────────────────────

export default function Navigation() {
  const { scrollState } = useScrollContext()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    setScrolled(scrollState.scrollY > 64)
  }, [scrollState.scrollY])

  return (
    <motion.nav
      id="global-nav"
      role="navigation"
      aria-label="Main navigation"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-surface/85 backdrop-blur-xl border-b border-white/5'
          : ''
      }`}
      initial={{ y: -72, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Top glint line */}
      {scrolled && (
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-galactic/30 to-transparent" />
      )}

      <div className="max-w-7xl mx-auto px-8 md:px-16 h-16 flex items-center justify-between">
        {/* Logo mark */}
        <div className="flex items-center gap-2.5" data-cursor="target">
          <div className="relative w-2.5 h-2.5">
            <div className="w-2.5 h-2.5 bg-cyan-galactic rounded-full animate-pulse-slow" />
            <div className="absolute inset-0 rounded-full bg-cyan-galactic opacity-40 animate-pulse-ring" />
          </div>
          <span className="font-mono text-sm font-medium text-text-primary tracking-widest">
            MRL<span className="text-cyan-galactic">::</span>SYS
          </span>
        </div>

        {/* Nav links (desktop) */}
        <ul className="hidden md:flex items-center gap-8 list-none" role="list">
          {NAV_ITEMS.map((item) => {
            const active = scrollState.activeSection === item.section
            return (
              <li key={item.id} className="relative">
                <a
                  href={`#${item.id}`}
                  data-cursor="target"
                  className={`font-mono text-xs tracking-[0.22em] transition-colors duration-300 ${
                    active ? 'text-cyan-galactic text-glow-cyan' : 'text-text-muted hover:text-text-primary'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  {item.label}
                </a>
                <AnimatePresence>
                  {active && (
                    <motion.span
                      className="absolute -bottom-0.5 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-galactic to-transparent"
                      initial={{ scaleX: 0, opacity: 0 }}
                      animate={{ scaleX: 1, opacity: 1 }}
                      exit={{ scaleX: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    />
                  )}
                </AnimatePresence>
              </li>
            )
          })}
        </ul>

        {/* Status chip */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-galactic animate-pulse" />
            <span className="font-mono text-xs text-text-muted">ONLINE</span>
          </div>
          <div className="font-mono text-xs text-text-muted border border-surface-3 px-2.5 py-1 glow-cyan-sm">
            v3.0
          </div>
        </div>
      </div>
    </motion.nav>
  )
}
