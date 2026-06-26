// ─────────────────────────────────────────────────────────────────────────────
// src/components/sections/SystemArchLog.tsx  (Experience)
//
// Architecture timeline with diagonal scan-line background,
// glassmorphism card wrappers on each TimelineEntry,
// and kinetic section header with letter-spacing animation.
//
// Inner-section progress: sectionProgress.experience (0→1) from ScrollContext
// drives a smooth upward Y-translate so all timeline cards become accessible
// while the camera remains locked at the Arch Log waypoint.
// ─────────────────────────────────────────────────────────────────────────────

import { useRef } from 'react'
import { motion } from 'framer-motion'
import { useSpring, animated } from '@react-spring/web'
import { useScrollContext } from '../../context/ScrollContext'
import TimelineEntry from '../ui/TimelineEntry'
import { TIMELINE, ACADEMIC_FOOTER } from '../../data/portfolioContent'

// Estimated inner height of the full timeline content (px).
// When sectionProgress.experience reaches 1.0, the panel has fully scrolled.
const INNER_SCROLL_HEIGHT = 1600

export default function SystemArchLog() {
  const containerRef = useRef<HTMLElement>(null)
  const { scrollState } = useScrollContext()

  // Smooth Y-translate driven by localSectionProgress — simulates inner scroll
  const [{ yTranslate }] = useSpring(
    () => ({
      yTranslate: -(scrollState.sectionProgress.experience * INNER_SCROLL_HEIGHT),
      config: { tension: 140, friction: 26, mass: 1 },
    }),
    [scrollState.sectionProgress.experience],
  )

  return (
    <section
      id="system-arch-log"
      ref={containerRef as React.RefObject<HTMLElement>}
      className="relative w-full h-auto flex items-start px-8 md:px-16 lg:px-24 py-24 overflow-hidden"
      style={{ minHeight: '100vh' }}
    >
      {/* Diagonal scan lines background */}
      <div className="pointer-events-none absolute inset-0 scanlines-diagonal opacity-20" />

      {/* Inner scroll container — translates UP as user scrolls through the section */}
      <animated.div
        className="w-full max-w-7xl mx-auto"
        style={{ transform: yTranslate.to((y) => `translate3d(0, ${y}px, 0)`) }}
      >
        {/* Section header with kinetic letter-spacing animation */}
        <motion.div
          className="mb-16 flex items-start gap-6"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex flex-col items-center gap-2 pt-2 shrink-0">
            <div className="h-px w-10 bg-god-crimson" />
            <div className="w-px h-14 bg-gradient-to-b from-god-crimson to-transparent" />
          </div>
          <div>
            <p className="font-mono text-xs tracking-[0.32em] text-god-crimson uppercase mb-3 text-glow-crimson">
              sys::arch_log — SECTION_02
            </p>
            <h2 className="font-display font-bold text-4xl md:text-6xl text-text-primary leading-tight">
              <motion.span
                className="block"
                initial={{ letterSpacing: '0.5em', opacity: 0 }}
                animate={{ letterSpacing: '-0.01em', opacity: 1 }}
                transition={{ duration: 1.0, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                SYSTEM ARCHITECTURE
              </motion.span>
              <span className="font-light text-text-muted">LOG</span>
            </h2>
            <p className="mt-4 text-text-muted font-display text-lg max-w-xl leading-relaxed">
              Engineering trajectory. An operational record of systems built, protocols designed,
              and architectures deployed across native mobile, AI, and agent domains.
            </p>
          </div>
        </motion.div>

        {/* Timeline track */}
        <div className="relative">
          <div className="absolute left-[1.375rem] top-2 bottom-0 w-px bg-gradient-to-b from-god-crimson via-surface-3 to-transparent" />
          <div className="space-y-0">
            {TIMELINE.map((entry, idx) => (
              <TimelineEntry key={entry.id} entry={entry} index={idx} />
            ))}
          </div>
        </div>

        {/* Academic footer */}
        <motion.div
          className="mt-14 ml-20 glass-monolith border-l-4 border-god-crimson overflow-hidden"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.85, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="p-6">
            <p className="font-mono text-[10px] text-god-crimson tracking-[0.28em] mb-2 text-glow-crimson">
              {ACADEMIC_FOOTER.label}
            </p>
            <p className="font-display font-semibold text-text-primary">
              {ACADEMIC_FOOTER.degree}
            </p>
            <p className="font-mono text-sm text-text-muted mt-1">
              {ACADEMIC_FOOTER.tracks}
            </p>
          </div>
        </motion.div>
      </animated.div>
    </section>
  )
}
