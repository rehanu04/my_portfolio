// ─────────────────────────────────────────────────────────────────────────────
// src/components/ui/ProjectCard.tsx
//
// Glass Monolith Card — Ultra Vegito Tier
//
// Features:
//   • Multi-axis spring tilt via @react-spring/web (rotateX ±14°, rotateY ±10°)
//     Stiffness:120, damping fraction ~0.6 → physically plausible spring paths
//   • Specular sheen: ::before radial-gradient tracking cursor via CSS vars
//   • Text depth parallax: title translateZ(+8px), desc (-4px), tags (+2px)
//     creating a 3-layer floating hologram effect on hover
//   • CursorContext focal-point broadcast: card hover emits normalised
//     viewport coords → WebGL LorenzField warps toward this card
//   • data-cursor="target" → GravWellCursor expands to telemetry reticle
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useCallback } from 'react'
import { useSpring, animated } from '@react-spring/web'
import { motion } from 'framer-motion'
import type { Project } from '../../types'
import TelemetryPanel from './TelemetryPanel'
import { useCursorContext } from '../../context/CursorContext'

// ─── Colour lookups ───────────────────────────────────────────────────────────

const STATUS_COLOUR: Record<Project['status'], string> = {
  ACTIVE:      'text-god-crimson',
  DEPLOYED:    'text-green-400',
  OPERATIONAL: 'text-blue-400',
}

const STATUS_DOT: Record<Project['status'], string> = {
  ACTIVE:      'bg-god-crimson shadow-[0_0_8px_rgba(255,30,30,0.8)]',
  DEPLOYED:    'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]',
  OPERATIONAL: 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]',
}

const CHIP_BG: Record<string, string> = {
  frontend: 'border-blue-500/40 text-blue-400 bg-blue-500/10',
  backend:  'border-green-500/40 text-green-400 bg-green-500/10',
  ai:       'border-cyan-500/40 text-god-crimson bg-cyan-500/10',
  infra:    'border-orange-500/40 text-orange-400 bg-orange-500/10',
  mobile:   'border-purple-500/40 text-purple-400 bg-purple-500/10',
}

// ─── Spring config: stiffness 120, damping ratio ~0.6 ──────────────────────

const CARD_SPRING = { tension: 120, friction: 18, mass: 1 }

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProjectCardProps {
  project: Project
  index: number
  onClick?: () => void
  showTelemetryInline?: boolean
  defaultTelemetryOpen?: boolean
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProjectCard({
  project,
  index,
  onClick,
  showTelemetryInline = true,
  defaultTelemetryOpen = false,
}: ProjectCardProps) {
  const [telemetryOpen, setTelemetryOpen] = useState(defaultTelemetryOpen)
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const { setFocalPoint, clearFocalPoint } = useCursorContext()

  // Spring for 3D tilt + lift
  const [{ rotateX, rotateY, scale, z }, springApi] = useSpring(() => ({
    rotateX: 0,
    rotateY: 0,
    scale: 1,
    z: 0,
    config: CARD_SPRING,
  }))

  // Spring for specular sheen position
  const [{ shineX, shineY }, shineApi] = useSpring(() => ({
    shineX: 50,
    shineY: 50,
    config: { tension: 200, friction: 16 },
  }))

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const cx = (e.clientX - rect.left) / rect.width   // 0..1
    const cy = (e.clientY - rect.top)  / rect.height  // 0..1

    // Tilt: centre = 0, edges = ±max
    const tiltY =  (cx - 0.5) * 20   // rotateY
    const tiltX = -(cy - 0.5) * 28   // rotateX (negative for natural feel)

    springApi.start({ rotateX: tiltX, rotateY: tiltY, scale: 1.015, z: 12 })
    shineApi.start({ shineX: cx * 100, shineY: cy * 100 })

    // Broadcast focal point to WebGL
    setFocalPoint({
      x: (e.clientX / window.innerWidth)  * 2 - 1,
      y: -((e.clientY / window.innerHeight) * 2 - 1),
      targetId: project.id,
      isHovering: true,
    })
  }, [springApi, shineApi, setFocalPoint, project.id])

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
    springApi.start({ rotateX: 0, rotateY: 0, scale: 1, z: 0 })
    shineApi.start({ shineX: 50, shineY: 50 })
    clearFocalPoint()
  }, [springApi, shineApi, clearFocalPoint])

  return (
    <motion.div
      className="relative perspective-1200"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* ── Spring-driven 3D card shell ────────────────────────────────── */}
      <animated.div
        ref={cardRef}
        id={`project-card-${project.id}`}
        data-cursor="target"
        className="relative glass-monolith specular-sheen overflow-hidden cursor-pointer preserve-3d"
        style={{
          rotateX,
          rotateY,
          scale,
          z,
          // Specular sheen position as CSS vars
          // @ts-expect-error – CSS custom properties not in CSSProperties type
          '--card-shine-x': shineX.to((v: number) => `${v}%`),
          '--card-shine-y': shineY.to((v: number) => `${v}%`),
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={(e) => {
          if (onClick) {
            onClick()
          } else {
            setTelemetryOpen((v) => !v)
          }
        }}
      >
        {/* Shimmer sweep on hover */}
        {isHovered && (
          <div
            className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
            aria-hidden="true"
          >
            <div
              className="absolute top-0 bottom-0 w-16 bg-gradient-to-r from-transparent via-white/8 to-transparent animate-gradient-sweep"
              style={{ left: '-4rem' }}
            />
          </div>
        )}

        {/* ── Top status bar ────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-white/5">
          <span className="font-mono text-xs text-text-muted tracking-widest">
            {project.codename}
          </span>
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${STATUS_DOT[project.status]}`} />
            <span className={`font-mono text-xs ${STATUS_COLOUR[project.status]}`}>
              {project.status}
            </span>
          </div>
        </div>

        {/* ── Body ──────────────────────────────────────────────────── */}
        <div className="p-6 space-y-5 preserve-3d">

          {/* Title block — depth layer +16px Z */}
          <div
            className="preserve-3d"
            style={{ transform: isHovered ? 'translateZ(16px)' : 'translateZ(0px)', transition: 'transform 0.2s ease' }}
          >
            <p className="font-mono text-[10px] text-text-muted tracking-[0.22em] mb-1.5">
              {project.category}
            </p>
            <h3 className={`font-display font-bold text-2xl md:text-3xl leading-tight transition-colors duration-300 ${
              isHovered ? 'text-god-crimson text-glow-crimson' : 'text-text-primary'
            }`}>
              {project.title}
            </h3>
          </div>

          {/* Description — depth layer -4px Z (recessed) */}
          <div
            style={{ transform: isHovered ? 'translateZ(-4px)' : 'translateZ(0px)', transition: 'transform 0.2s ease' }}
          >
            <p className="font-display text-text-muted text-sm leading-relaxed line-clamp-3">
              {project.description}
            </p>
          </div>

          {/* Tech chips — depth layer +4px Z */}
          <div
            className="flex flex-wrap gap-1.5"
            style={{ transform: isHovered ? 'translateZ(4px)' : 'translateZ(0px)', transition: 'transform 0.2s ease' }}
          >
            {project.techStack.slice(0, 4).map((tech) => (
              <span
                key={tech.name}
                className={`font-mono text-[10px] px-2 py-1 border ${CHIP_BG[tech.category]} transition-all duration-200`}
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

          {/* Metric descriptors */}
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/5">
            {project.metrics.map((m) => (
              <div key={m.label} className="flex flex-col gap-1">
                <p className="font-mono text-[9px] text-text-muted tracking-wider uppercase">{m.label}</p>
                <p className="font-mono text-[11px] text-god-crimson leading-tight font-semibold text-glow-crimson">
                  {m.value}{m.unit ? ` ${m.unit}` : ''}
                </p>
              </div>
            ))}
          </div>

          {/* Toggle hint */}
          <div className="flex items-center gap-2 pt-1">
            <span className={`font-mono text-[10px] tracking-wider transition-colors duration-200 ${
              isHovered ? 'text-god-crimson' : 'text-text-muted'
            }`}>
              {telemetryOpen ? '[ CLOSE TELEMETRY ]' : '[ OPEN TELEMETRY ]'}
            </span>
            <motion.svg
              width="10" height="10" viewBox="0 0 10 10" fill="none"
              className={`transition-colors duration-200 ${isHovered ? 'text-god-crimson' : 'text-text-muted'}`}
              animate={{ rotate: telemetryOpen ? 90 : 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <path d="M1 5h8M5 1l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </motion.svg>
          </div>
        </div>
      </animated.div>

      {/* Slide-out telemetry panel */}
      {showTelemetryInline && <TelemetryPanel project={project} isOpen={telemetryOpen} />}
    </motion.div>
  )
}
