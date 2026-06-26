// ─────────────────────────────────────────────────────────────────────────────
// src/components/sections/SystemArchLog.tsx  (Experience)
//
// Cinematic vertical timeline with large visual timeline track.
// Each entry reveals with a staggered whileInView animation.
// Academic footer has a distinct glass panel treatment.
// ─────────────────────────────────────────────────────────────────────────────

import { type RefObject, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useScrollContext } from '../../context/ScrollContext'
import TimelineEntry from '../ui/TimelineEntry'
import { TIMELINE, ACADEMIC_FOOTER } from '../../data/portfolioContent'

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
      className="relative w-full px-8 md:px-16 lg:px-24 py-32"
    >
      {/* Section divider top */}
      <div className="section-divider mb-0" />

      <div className="w-full max-w-7xl mx-auto pt-16">
        {/* Section header */}
        <motion.div
          className="mb-20 flex items-start gap-6"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex flex-col items-center gap-2 pt-2 shrink-0">
            <div className="h-px w-10 bg-god-crimson" />
            <div className="w-px h-14 bg-gradient-to-b from-god-crimson to-transparent" />
          </div>
          <div>
            <div className="section-chip mb-4">
              <div className="w-1 h-1 rounded-full bg-god-crimson" />
              sys::arch_log — SECTION_02
            </div>
            <h2 className="font-display font-bold text-4xl md:text-6xl text-text-primary leading-tight">
              <motion.span
                className="block"
                initial={{ letterSpacing: '0.4em', opacity: 0 }}
                whileInView={{ letterSpacing: '-0.01em', opacity: 1 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 1.0, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                SYSTEM ARCHITECTURE
              </motion.span>
              <span className="font-light text-text-muted">LOG</span>
            </h2>
            <p className="mt-4 text-text-muted font-display text-lg max-w-xl leading-relaxed">
              Engineering trajectory — an operational record of systems built, protocols designed,
              and architectures deployed across native mobile, AI, and agent domains.
            </p>
          </div>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical track line */}
          <div className="absolute left-[1.375rem] top-0 bottom-24 w-px bg-gradient-to-b from-god-crimson via-god-crimson/30 to-transparent" />
          <div className="space-y-0">
            {TIMELINE.map((entry, idx) => (
              <TimelineEntry key={entry.id} entry={entry} index={idx} />
            ))}
          </div>
        </div>

        {/* Academic foundation card */}
        <motion.div
          className="mt-14 ml-14 glass-card overflow-hidden"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.85, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-stretch">
            {/* Crimson left accent */}
            <div className="w-1 bg-gradient-to-b from-god-crimson to-god-crimson/20 flex-shrink-0" />
            <div className="p-6 flex-1">
              <p className="font-mono text-[9px] text-god-crimson tracking-[0.28em] mb-2 text-glow-crimson">
                {ACADEMIC_FOOTER.label}
              </p>
              <p className="font-display font-semibold text-text-primary text-lg">
                {ACADEMIC_FOOTER.degree}
              </p>
              <p className="font-mono text-sm text-text-muted mt-1 tracking-wide">
                {ACADEMIC_FOOTER.tracks}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Section divider bottom */}
      <div className="section-divider mt-20" />
    </section>
  )
}
