// ─────────────────────────────────────────────────────────────────────────────
// src/components/sections/MasterVault.tsx  (Projects)
//
// Project grid with:
//   • Kinetic section header: letter-spacing collapse + stagger animation
//   • 3D perspective container for the card grid
//   • Staggered card reveal with viewport intersection
//   • Footer telemetry hint
// ─────────────────────────────────────────────────────────────────────────────

import { type RefObject, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useSpring, animated } from '@react-spring/web'
import { useScrollContext } from '../../context/ScrollContext'
import ProjectCard from '../ui/ProjectCard'
import { PROJECTS } from '../../data/portfolioContent'

// ─── Component ─────────────────────────────────────────────────────────────

export default function MasterVault() {
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollState } = useScrollContext()

  // Animate Y based on local section progress
  const { ySpring } = useSpring({
    ySpring: -(scrollState.sectionProgress.projects * 800), // Adjust 800 based on grid height
    config: { tension: 120, friction: 20 },
  })

  return (
    <section
      id="master-vault"
      ref={sectionRef}
      className="relative w-full h-auto flex items-center px-8 md:px-16 lg:px-24 py-24 overflow-hidden"
    >
      {/* Subtle diagonal scan lines */}
      <div className="pointer-events-none absolute inset-0 scanlines opacity-15" />

      {/* Animate Y translation based on local section progress */}
      <animated.div
        className="w-full max-w-7xl mx-auto"
        style={{
          transform: ySpring.to((y) => `translate3d(0, ${y}px, 0)`),
        }}
      >
        {/* Section header */}
        <motion.div
          className="mb-16 flex items-start gap-6"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex flex-col items-center gap-2 pt-2 shrink-0">
            <div className="h-px w-10 bg-god-crimson" />
            <div className="w-px h-14 bg-gradient-to-b from-god-crimson to-transparent" />
          </div>
          <div>
            <p className="font-mono text-xs tracking-[0.32em] text-god-crimson uppercase mb-3 text-glow-crimson">
              sys::vault — SECTION_03
            </p>
            <h2 className="font-display font-bold text-4xl md:text-6xl text-text-primary leading-tight">
              <motion.span
                className="block"
                initial={{ letterSpacing: '0.5em', opacity: 0 }}
                whileInView={{ letterSpacing: '-0.01em', opacity: 1 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 1.0, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                THE MASTER
              </motion.span>
              <span className="font-light text-text-muted">VAULT</span>
            </h2>
            <p className="mt-4 text-text-muted font-display text-lg max-w-xl leading-relaxed">
              Four operational systems. Native Android, education ecosystems, diagnostic utilities,
              and autonomous agent orchestrators — all built for production scale.
            </p>
          </div>
        </motion.div>

        {/* 3D perspective container for project grid */}
        <div className="perspective-1200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PROJECTS.map((project, idx) => (
              <ProjectCard key={project.id} project={project} index={idx} />
            ))}
          </div>
        </div>

        {/* Footer telemetry hint */}
        <motion.p
          className="mt-12 text-center font-mono text-xs text-text-muted tracking-widest"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.8 }}
        >
          HOVER EACH CARD → TELEMETRY PANEL ACTIVATES · TILT TO TRAVERSE DEPTH
        </motion.p>
      </animated.div>
    </section>
  )
}
