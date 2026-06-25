import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Project } from '../../types'
import TelemetryPanel from './TelemetryPanel'

// ─── Colour Lookups ────────────────────────────────────────────────────────

const STATUS_COLOUR: Record<Project['status'], string> = {
  ACTIVE:      'text-cyan-galactic',
  DEPLOYED:    'text-green-400',
  OPERATIONAL: 'text-blue-400',
}

const CATEGORY_CHIP: Record<string, string> = {
  frontend: 'border-blue-500/40 text-blue-400',
  backend:  'border-green-500/40 text-green-400',
  ai:       'border-cyan-500/40 text-cyan-galactic',
  infra:    'border-orange-500/40 text-orange-400',
  mobile:   'border-purple-500/40 text-purple-400',
}

// ─── Props ─────────────────────────────────────────────────────────────────

interface ProjectCardProps {
  project: Project
  index: number
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function ProjectCard({ project, index }: ProjectCardProps) {
  const [telemetryOpen, setTelemetryOpen] = useState(false)

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* ── Card shell ──────────────────────────────────────────────────── */}
      <motion.div
        id={`project-card-${project.id}`}
        className="group relative bg-glass border border-surface-3 hover:border-cyan-galactic/50 overflow-hidden cursor-pointer transition-colors duration-300"
        style={{ transformStyle: 'preserve-3d' }}
        whileHover={{
          rotateY: 2,
          rotateX: -1,
          transition: { type: 'spring', stiffness: 280, damping: 22 },
        }}
        onClick={() => setTelemetryOpen((v) => !v)}
      >
        {/* Hover gradient fill */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-galactic/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* Top status bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-surface-3">
          <span className="font-mono text-xs text-text-muted tracking-widest">{project.codename}</span>
          <div className="flex items-center gap-2">
            <div
              className={`w-1.5 h-1.5 rounded-full ${STATUS_COLOUR[project.status]} bg-current animate-pulse`}
            />
            <span className={`font-mono text-xs ${STATUS_COLOUR[project.status]}`}>
              {project.status}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Title block */}
          <div>
            <p className="font-mono text-[10px] text-text-muted tracking-[0.22em] mb-1.5">
              {project.category}
            </p>
            <h3 className="font-display font-bold text-2xl md:text-3xl text-text-primary group-hover:text-cyan-galactic transition-colors duration-300">
              {project.title}
            </h3>
          </div>

          {/* Description */}
          <p className="font-display text-text-muted text-sm leading-relaxed line-clamp-3">
            {project.description}
          </p>

          {/* Tech chips */}
          <div className="flex flex-wrap gap-1.5">
            {project.techStack.slice(0, 4).map((tech) => (
              <span
                key={tech.name}
                className={`font-mono text-[10px] px-2 py-1 border bg-surface-2 ${CATEGORY_CHIP[tech.category]}`}
              >
                {tech.name}
              </span>
            ))}
            {project.techStack.length > 4 && (
              <span className="font-mono text-[10px] px-2 py-1 border border-surface-3 text-text-muted bg-surface-2">
                +{project.techStack.length - 4}
              </span>
            )}
          </div>

          {/* Metric bars */}
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-surface-3">
            {project.metrics.map((m) => (
              <div key={m.label}>
                <div className="h-0.5 bg-surface-3 rounded-full mb-1.5 overflow-hidden">
                  <motion.div
                    className="h-full bg-cyan-galactic rounded-full"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${m.value}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
                  />
                </div>
                <p className="font-mono text-[9px] text-text-muted tracking-wider">{m.label}</p>
              </div>
            ))}
          </div>

          {/* Toggle hint */}
          <div className="flex items-center gap-2 pt-1">
            <span className="font-mono text-[10px] text-text-muted group-hover:text-cyan-galactic transition-colors tracking-wider">
              {telemetryOpen ? '[ CLOSE TELEMETRY ]' : '[ OPEN TELEMETRY ]'}
            </span>
            <motion.svg
              width="10" height="10" viewBox="0 0 10 10" fill="none"
              className="text-text-muted group-hover:text-cyan-galactic transition-colors"
              animate={{ rotate: telemetryOpen ? 90 : 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <path d="M1 5h8M5 1l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </motion.svg>
          </div>
        </div>
      </motion.div>

      {/* Slide-out telemetry panel */}
      <TelemetryPanel project={project} isOpen={telemetryOpen} />
    </motion.div>
  )
}
