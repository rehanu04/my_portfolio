import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useScrollContext } from '../../context/ScrollContext'
import type { SectionId } from '../../types'

// ─── Nav items ─────────────────────────────────────────────────────────────

interface NavItem {
  id: string
  label: string
  section: SectionId
}

const NAV_ITEMS: NavItem[] = [
  { id: 'command-deck',    label: 'COMMAND DECK', section: 'hero' },
  { id: 'system-arch-log', label: 'ARCH LOG',    section: 'experience' },
  { id: 'master-vault',    label: 'VAULT',        section: 'projects' },
  { id: 'secure-uplink',   label: 'UPLINK',       section: 'contact' },
]

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
          ? 'bg-surface/80 backdrop-blur-md border-b border-surface-3'
          : ''
      }`}
      initial={{ y: -72, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="max-w-7xl mx-auto px-8 md:px-16 h-16 flex items-center justify-between">
        {/* Logo mark */}
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 bg-cyan-galactic rounded-full animate-pulse-slow" />
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
                  className={`font-mono text-xs tracking-[0.22em] transition-colors duration-300 ${
                    active ? 'text-cyan-galactic' : 'text-text-muted hover:text-text-primary'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  {item.label}
                </a>
                <AnimatePresence>
                  {active && (
                    <motion.span
                      className="absolute -bottom-0.5 left-0 right-0 h-px bg-cyan-galactic"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      exit={{ scaleX: 0 }}
                      transition={{ duration: 0.25 }}
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
          <div className="font-mono text-xs text-text-muted border border-surface-3 px-2.5 py-1">
            v2.0
          </div>
        </div>
      </div>
    </motion.nav>
  )
}
