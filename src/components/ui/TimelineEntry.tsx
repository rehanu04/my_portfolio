import { motion } from 'framer-motion'
import type { TimelineEntry as TEntry } from '../../types'

// ─── Props ─────────────────────────────────────────────────────────────────

interface TimelineEntryProps {
  entry: TEntry
  index: number
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function TimelineEntry({ entry, index }: TimelineEntryProps) {
  return (
    <motion.div
      className="relative pl-20 pb-12 last:pb-0"
      initial={{ opacity: 0, x: -28 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Timeline node dot */}
      <div className="absolute left-[14px] top-1.5 w-4 h-4 rounded-full border-2 border-cyan-galactic bg-surface flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-cyan-galactic" />
      </div>

      {/* Connector to next node (hidden on last entry via parent's last:pb-0) */}
      <div className="absolute left-[21px] top-6 bottom-0 w-px bg-gradient-to-b from-surface-3 to-transparent" />

      {/* Content */}
      <div className="space-y-3">
        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-xs text-cyan-galactic tracking-wider">{entry.period}</span>
          <span className="text-surface-3 text-xs">//</span>
          <span className="font-mono text-xs text-text-muted">{entry.organization}</span>
        </div>

        {/* Role heading */}
        <h3 className="font-display font-semibold text-xl md:text-2xl text-text-primary leading-tight">
          {entry.role}
        </h3>

        {/* Description */}
        <p className="font-display text-text-muted leading-relaxed max-w-2xl text-base">
          {entry.description}
        </p>

        {/* Skill tags */}
        <div className="flex flex-wrap gap-2 pt-1">
          {entry.tags.map((tag) => (
            <span
              key={tag}
              className="font-mono text-[10px] px-2.5 py-1 border border-surface-3 text-text-muted hover:border-cyan-galactic/50 hover:text-text-primary transition-colors duration-200"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
