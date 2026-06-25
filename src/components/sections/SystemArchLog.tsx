import { type RefObject, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useScrollContext } from '../../context/ScrollContext'
import TimelineEntry from '../ui/TimelineEntry'
import type { TimelineEntry as TEntry } from '../../types'

// ─── Ground-Truth Timeline ─────────────────────────────────────────────────
// Profile Identity: Mohammed Rehan — AI/ML Computer Science Engineer
// specialising in native mobile architectures, agentic workflows, and
// high-performance system optimisation.

const TIMELINE: TEntry[] = [
  {
    id: '01',
    period: '2023 — PRESENT',
    role: 'AI/ML Engineer & Software Architect',
    organization: 'Master R Labs',
    description:
      'Designing and shipping production-grade native Android systems with integrated agentic AI workflows. Specialisms include Kotlin/Jetpack Compose application architecture, multi-source real-time data synchronisation with Supabase and SharedFlow, autonomous voice-driven orchestration, and high-performance system optimisation across constrained hardware targets.',
    tags: ['Native Android', 'Agentic Workflows', 'System Optimisation', 'Kotlin', 'AI/ML'],
  },
  {
    id: '02',
    period: '2022 — 2023',
    role: 'Mobile & Full-Stack Engineer',
    organization: 'Independent Ventures',
    description:
      'Architected scalable Flutter education platforms and Android applications with advanced offline-first state management. Built backend services interfacing Firebase and Supabase with robust real-time listener patterns, lifecycle-aware coroutine scopes, and structured caching strategies for high-throughput workloads.',
    tags: ['Flutter', 'Kotlin', 'Firebase', 'Supabase', 'Offline-First'],
  },
  {
    id: '03',
    period: '2021 — 2022',
    role: 'Computer Science Engineer — AI/ML Track',
    organization: 'Academic Research Division',
    description:
      'Deep focus on machine learning model optimisation and on-device inference pipelines. Research into resource-efficient neural architectures for constrained edge hardware, TensorFlow Lite deployment patterns, and INT8 quantisation benchmarking for mobile targets.',
    tags: ['TensorFlow Lite', 'Edge Inference', 'Model Optimisation', 'Research'],
  },
  {
    id: '04',
    period: '2020 — 2021',
    role: 'Systems Engineering Foundation',
    organization: 'Engineering Foundation',
    description:
      'Built foundational competencies in data pipeline engineering, RESTful API design, Python ecosystem tooling, CI/CD integration, and containerised deployment workflows — the systems-engineering bedrock underlying all subsequent mobile and AI work.',
    tags: ['Python', 'Docker', 'CI/CD', 'API Design', 'Automation'],
  },
]

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
      className="relative min-h-screen flex items-center px-8 md:px-16 lg:px-24 py-24"
    >
      <div className="w-full max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          className="mb-16 flex items-start gap-6"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex flex-col items-center gap-2 pt-2 shrink-0">
            <div className="h-px w-10 bg-cyan-galactic" />
            <div className="w-px h-14 bg-gradient-to-b from-cyan-galactic to-transparent" />
          </div>
          <div>
            <p className="font-mono text-xs tracking-[0.32em] text-cyan-galactic uppercase mb-3">
              sys::arch_log — SECTION_02
            </p>
            <h2 className="font-display font-bold text-4xl md:text-6xl text-text-primary leading-tight">
              SYSTEM ARCHITECTURE
              <br />
              <span className="font-light text-text-muted">LOG</span>
            </h2>
            <p className="mt-4 text-text-muted font-display text-lg max-w-xl leading-relaxed">
              Engineering trajectory. An operational record of systems built, protocols designed, and architectures deployed across native mobile, AI, and agent domains.
            </p>
          </div>
        </motion.div>

        {/* Timeline track */}
        <div className="relative">
          {/* Vertical guide rail */}
          <div className="absolute left-[1.375rem] top-2 bottom-0 w-px bg-gradient-to-b from-cyan-galactic via-surface-3 to-transparent" />
          <div className="space-y-0">
            {TIMELINE.map((entry, idx) => (
              <TimelineEntry key={entry.id} entry={entry} index={idx} />
            ))}
          </div>
        </div>

        {/* Academic footer card */}
        <motion.div
          className="mt-14 ml-20 p-6 bg-glass border-l-2 border-cyan-galactic"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="font-mono text-[10px] text-cyan-galactic tracking-[0.28em] mb-2">ACADEMIC FOUNDATION</p>
          <p className="font-display font-semibold text-text-primary">
            B.S. Computer Science — AI / ML Specialisation
          </p>
          <p className="font-mono text-sm text-text-muted mt-1">
            Core tracks: Machine Learning · Native Mobile Architecture · System Design · Agentic Workflow Engineering
          </p>
        </motion.div>
      </div>
    </section>
  )
}
