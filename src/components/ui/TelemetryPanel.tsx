import { motion, AnimatePresence } from 'framer-motion'
import type { Project } from '../../types'

// ─── Colour Lookups ────────────────────────────────────────────────────────

const CHIP_BG: Record<string, string> = {
  frontend: 'bg-blue-500/15 text-blue-400',
  backend:  'bg-green-500/15 text-green-400',
  ai:       'bg-cyan-500/15 text-cyan-galactic',
  infra:    'bg-orange-500/15 text-orange-400',
  mobile:   'bg-purple-500/15 text-purple-400',
}

// ─── Props ─────────────────────────────────────────────────────────────────

interface TelemetryPanelProps {
  project: Project
  isOpen: boolean
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function TelemetryPanel({ project, isOpen }: TelemetryPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key={`telemetry-${project.id}`}
          className="overflow-hidden border border-t-0 border-cyan-galactic/25 bg-surface-2"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="p-6 space-y-6">
            {/* Header rule */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-cyan-galactic/20" />
              <span className="font-mono text-[10px] text-cyan-galactic tracking-[0.28em]">
                TELEMETRY_ACTIVE
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-galactic animate-pulse" />
              <div className="h-px flex-1 bg-cyan-galactic/20" />
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
              <div className="space-y-3.5">
                {project.metrics.map((m, i) => (
                  <div key={m.label} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-text-muted">{m.label}</span>
                      <span className="font-mono text-xs text-cyan-galactic">
                        {m.value}{m.unit ? ` ${m.unit}` : ''}
                      </span>
                    </div>
                    {typeof m.value === 'number' && (
                      <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-cyan-galactic to-blue-400 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${m.value}%` }}
                          transition={{
                            duration: 0.85,
                            ease: [0.16, 1, 0.3, 1],
                            delay: i * 0.08,
                          }}
                        />
                      </div>
                    )}
                    {typeof m.value === 'string' && (
                      <div className="h-px bg-gradient-to-r from-cyan-galactic/30 to-transparent" />
                    )}
                  </div>
                ))}
              </div>
            </div>


            {/* Architecture note */}
            <div className="p-4 border-l-2 border-cyan-galactic/50 bg-surface-3/40">
              <p className="font-mono text-[10px] text-cyan-galactic tracking-wider mb-1">
                {'>'} sys::arch_note — {project.title.toUpperCase()}
              </p>
              <p className="font-mono text-xs text-text-muted leading-relaxed">
                {project.description}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
