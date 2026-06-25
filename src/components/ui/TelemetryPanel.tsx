// ─────────────────────────────────────────────────────────────────────────────
// src/components/ui/TelemetryPanel.tsx
//
// Deep-glass expansion drawer beneath ProjectCard.
// Spring-animated metric bars.  Scanline texture on panel surface.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from 'react'
import { useSpring, animated } from '@react-spring/web'
import { motion, AnimatePresence } from 'framer-motion'
import type { Project } from '../../types'

// ─── Colour lookups ───────────────────────────────────────────────────────────

const CHIP_BG: Record<string, string> = {
  frontend: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  backend:  'bg-green-500/15 text-green-400 border border-green-500/30',
  ai:       'bg-cyan-500/15 text-god-crimson border border-cyan-500/30',
  infra:    'bg-orange-500/15 text-orange-400 border border-orange-500/30',
  mobile:   'bg-purple-500/15 text-purple-400 border border-purple-500/30',
}

// ─── Animated metric bar ─────────────────────────────────────────────────────

function MetricBar({ value, delay }: { value: number; delay: number }) {
  const [{ width }, api] = useSpring(() => ({
    width: 0,
    config: { tension: 180, friction: 14, mass: 1 },
  }))

  useEffect(() => {
    const t = setTimeout(() => {
      api.start({ width: value })
    }, delay)
    return () => clearTimeout(t)
  }, [api, value, delay])

  return (
    <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
      <animated.div
        className="h-full rounded-full bg-gradient-to-r from-god-crimson via-god-gold to-blue-400"
        style={{ width: width.to((w) => `${w}%`) }}
      />
    </div>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface TelemetryPanelProps {
  project: Project
  isOpen:  boolean
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TelemetryPanel({ project, isOpen }: TelemetryPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key={`telemetry-${project.id}`}
          className="overflow-hidden"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="glass-deep scanlines border border-t-0 border-god-crimson/20 relative overflow-hidden">
            {/* Subtle top line accent */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-god-crimson/50 to-transparent" />

            <div className="p-6 space-y-6 relative z-10">
              {/* Header rule */}
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-god-crimson/20" />
                <span className="font-mono text-[10px] text-god-crimson tracking-[0.28em]">
                  TELEMETRY_ACTIVE
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-god-crimson animate-pulse" />
                <div className="h-px flex-1 bg-god-crimson/20" />
              </div>

              {/* Full tech stack */}
              <div>
                <p className="font-mono text-[10px] text-text-muted tracking-[0.28em] mb-3">
                  STACK COMPONENTS
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.techStack.map((tech) => (
                    <span
                      key={tech.name}
                      className={`font-mono text-xs px-3 py-1 rounded-sm ${CHIP_BG[tech.category]}`}
                    >
                      {tech.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* System metrics */}
              <div>
                <p className="font-mono text-[10px] text-text-muted tracking-[0.28em] mb-3">
                  ARCHITECTURE SIGNALS
                </p>
                <div className="space-y-4">
                  {project.metrics.map((m, i) => (
                    <div key={m.label} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-text-muted">{m.label}</span>
                        <span className="font-mono text-xs text-god-crimson text-glow-crimson">
                          {m.value}{m.unit ? ` ${m.unit}` : ''}
                        </span>
                      </div>
                      {typeof m.value === 'number' ? (
                        <MetricBar value={m.value} delay={i * 100} />
                      ) : (
                        <div className="h-px bg-gradient-to-r from-god-crimson/40 to-transparent" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Architecture note */}
              <div className="p-4 border-l-2 border-god-crimson/50 bg-surface-3/40">
                <p className="font-mono text-[10px] text-god-crimson tracking-wider mb-2">
                  {'>'} sys::arch_note — {project.title.toUpperCase()}
                </p>
                <p className="font-mono text-xs text-text-muted leading-relaxed">
                  {project.description}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
