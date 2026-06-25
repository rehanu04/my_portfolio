// ─────────────────────────────────────────────────────────────────────────────
// src/components/sections/SystemArchLog.tsx  (Experience)
//
// Architecture timeline with diagonal scan-line background,
// glassmorphism card wrappers on each TimelineEntry,
// and kinetic section header with letter-spacing animation.
// ─────────────────────────────────────────────────────────────────────────────

import { type RefObject, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useScrollContext } from '../../context/ScrollContext'
import TimelineEntry from '../ui/TimelineEntry'
import { TIMELINE, ACADEMIC_FOOTER } from '../../data/portfolioContent'

// ─── Component ─────────────────────────────────────────────────────────────

export default function SystemArchLog() {
  const sectionRef = useRef<HTMLElement>(null)
  const { registerSection } = useScrollContext()

  useEffect(() => {
    registerSection('experience', sectionRef as RefObject<HTMLElement>)
  }, [registerSection])

  return (
    <section
      id="system-arch-log"
      ref={sectionRef}
      className="relative min-h-screen flex items-center px-8 md:px-16 lg:px-24 py-24 overflow-hidden"
    >
      {/* Diagonal scan lines background */}
      <div className="pointer-events-none absolute inset-0 scanlines-diagonal opacity-20" />

      <div className="w-full max-w-7xl mx-auto">
        {/* Section header with kinetic letter-spacing animation */}
        <motion.div
          className="mb-16 flex items-start gap-6"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex flex-col items-center gap-2 pt-2 shrink-0">
            <div className="h-px w-10 bg-cyan-galactic" />
            <div className="w-px h-14 bg-gradient-to-b from-cyan-galactic to-transparent" />
          </div>
          <div>
            <p className="font-mono text-xs tracking-[0.32em] text-cyan-galactic uppercase mb-3 text-glow-cyan">
              sys::arch_log — SECTION_02
            </p>
            <h2 className="font-display font-bold text-4xl md:text-6xl text-text-primary leading-tight">
              <motion.span
                className="block"
                initial={{ letterSpacing: '0.5em', opacity: 0 }}
                whileInView={{ letterSpacing: '-0.01em', opacity: 1 }}
                viewport={{ once: true, margin: '-100px' }}
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
          {/* Vertical line */}
          <div className="absolute left-[1.375rem] top-2 bottom-0 w-px bg-gradient-to-b from-cyan-galactic via-surface-3 to-transparent" />
          <div className="space-y-0">
            {TIMELINE.map((entry, idx) => (
              <TimelineEntry key={entry.id} entry={entry} index={idx} />
            ))}
          </div>
        </div>

        {/* Academic footer */}
        <motion.div
          className="mt-14 ml-20 glass-monolith border-l-4 border-cyan-galactic overflow-hidden"
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.85, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="p-6">
            <p className="font-mono text-[10px] text-cyan-galactic tracking-[0.28em] mb-2 text-glow-cyan">
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
      </div>
    </section>
  )
}
