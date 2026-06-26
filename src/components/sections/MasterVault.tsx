// ─────────────────────────────────────────────────────────────────────────────
// src/components/sections/MasterVault.tsx  (Projects)
//
// Horizontal-scroll project gallery — drag/scroll through cards like a
// premium product showcase. Each card is a full-height glass panel with
// 3D hover tilt. The track is scroll-snapping for a crisp feel.
// ─────────────────────────────────────────────────────────────────────────────

import { type RefObject, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useScrollContext } from '../../context/ScrollContext'
import ProjectCard from '../ui/ProjectCard'
import { PROJECTS } from '../../data/portfolioContent'

export default function MasterVault() {
  const sectionRef = useRef<HTMLElement>(null)
  const { registerSection } = useScrollContext()

  useEffect(() => {
    registerSection('projects', sectionRef as RefObject<HTMLElement>)
  }, [registerSection])

  return (
    <section
      id="master-vault"
      ref={sectionRef}
      className="relative w-full py-32 overflow-hidden"
    >
      {/* Subtle section divider top */}
      <div className="section-divider mb-0" />

      <div className="w-full px-8 md:px-16 lg:px-24">
        {/* Section header */}
        <motion.div
          className="flex items-start gap-6 mb-16 max-w-7xl mx-auto"
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
              sys::vault — SECTION_03
            </div>
            <h2 className="font-display font-bold text-4xl md:text-6xl text-text-primary leading-tight">
              <motion.span
                className="block"
                initial={{ letterSpacing: '0.4em', opacity: 0 }}
                whileInView={{ letterSpacing: '-0.01em', opacity: 1 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 1.0, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                THE MASTER
              </motion.span>
              <span className="font-light text-text-muted">VAULT</span>
            </h2>
            <p className="mt-4 text-text-muted font-display text-lg max-w-xl leading-relaxed">
              Four operational systems deployed at production scale across mobile, AI, and autonomous agent domains.
            </p>
          </div>

          {/* Right label hint */}
          <div className="ml-auto flex-shrink-0 hidden lg:flex items-center gap-2 self-end pb-2">
            <span className="font-mono text-xs text-text-muted tracking-widest">SCROLL →</span>
            <div className="flex gap-1">
              {PROJECTS.map((_, i) => (
                <div key={i} className="w-1 h-1 rounded-full bg-surface-3" />
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Horizontal scroll gallery — extends edge-to-edge */}
      <motion.div
        className="h-scroll-track px-8 md:px-16 lg:px-24"
        initial={{ opacity: 0, x: 60 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        {PROJECTS.map((project, idx) => (
          <div key={project.id} className="h-scroll-item">
            <ProjectCard project={project} index={idx} />
          </div>
        ))}

        {/* Spacer at end */}
        <div className="flex-shrink-0 w-8 md:w-16" />
      </motion.div>

      {/* Telemetry footer hint */}
      <motion.div
        className="flex justify-center mt-12 px-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        <p className="font-mono text-[10px] text-text-muted tracking-[0.3em] text-center">
          CLICK ANY CARD → TELEMETRY PANEL · DRAG TO EXPLORE ALL SYSTEMS
        </p>
      </motion.div>

      {/* Subtle section divider bottom */}
      <div className="section-divider mt-16" />
    </section>
  )
}
