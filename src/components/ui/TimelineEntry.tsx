// ─────────────────────────────────────────────────────────────────────────────
// src/components/ui/TimelineEntry.tsx
//
// Glassmorphism timeline card with light spring tilt (±6°) and
// an animated pulse ring on the timeline node when entering the viewport.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useState } from 'react'
import { useSpring, animated } from '@react-spring/web'
import { motion } from 'framer-motion'
import type { TimelineEntry as TEntry } from '../../types'

// ─── Spring config — lighter tilt than ProjectCard ───────────────────────────

const ENTRY_SPRING = { tension: 140, friction: 20, mass: 0.9 }

// ─── Props ────────────────────────────────────────────────────────────────────

interface TimelineEntryProps {
  entry: TEntry
  index: number
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TimelineEntry({ entry, index }: TimelineEntryProps) {
  const [isHovered, setIsHovered] = useState(false)

  const [{ rotateX, rotateY, scale }, springApi] = useSpring(() => ({
    rotateX: 0,
    rotateY: 0,
    scale: 1,
    config: ENTRY_SPRING,
  }))

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const cx = (e.clientX - rect.left) / rect.width
    const cy = (e.clientY - rect.top)  / rect.height
    springApi.start({
      rotateX: -(cy - 0.5) * 12,
      rotateY:  (cx - 0.5) * 12,
      scale: 1.008,
    })
  }, [springApi])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
    springApi.start({ rotateX: 0, rotateY: 0, scale: 1 })
  }, [springApi])

  return (
    <motion.div
      className="relative pl-20 pb-10 last:pb-0 perspective-1200"
      initial={{ opacity: 0, x: -32 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.75, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Timeline node dot with pulse ring */}
      <div className="absolute left-[14px] top-5 z-10">
        {/* Outer pulse ring */}
        <motion.div
          className="absolute inset-0 rounded-full border border-god-crimson"
          initial={{ scale: 1, opacity: 0 }}
          whileInView={{ scale: [1, 2.2], opacity: [0.7, 0] }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{
            delay: index * 0.12 + 0.4,
            duration: 1.2,
            ease: 'easeOut',
          }}
          style={{ width: 16, height: 16 }}
        />
        {/* Node */}
        <div className="w-4 h-4 rounded-full border-2 border-god-crimson bg-surface flex items-center justify-center glow-crimson-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-god-crimson" />
        </div>
      </div>

      {/* Connector line */}
      <div className="absolute left-[21px] top-9 bottom-0 w-px bg-gradient-to-b from-god-crimson/30 via-surface-3/50 to-transparent" />

      {/* Glass card */}
      <animated.div
        className="glass-monolith overflow-hidden preserve-3d"
        style={{ rotateX, rotateY, scale }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
      >
        <div className="p-6 space-y-3">
          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-xs text-god-crimson tracking-wider text-glow-crimson">
              {entry.period}
            </span>
            <span className="text-surface-3 text-xs">//</span>
            <span className="font-mono text-xs text-text-muted">{entry.organization}</span>
          </div>

          {/* Role heading */}
          <h3
            className={`font-display font-semibold text-xl md:text-2xl leading-tight transition-colors duration-300 ${
              isHovered ? 'text-god-crimson' : 'text-text-primary'
            }`}
            style={{ transform: isHovered ? 'translateZ(8px)' : 'translateZ(0px)', transition: 'transform 0.2s ease, color 0.3s ease' }}
          >
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
                className="font-mono text-[10px] px-2.5 py-1 border border-surface-3 text-text-muted hover:border-god-crimson/50 hover:text-text-primary transition-colors duration-200"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </animated.div>
    </motion.div>
  )
}
