import { type RefObject, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useScrollContext } from '../../context/ScrollContext'
import ProjectCard from '../ui/ProjectCard'
import { PROJECTS } from '../../data/portfolioContent'

export default function MasterVault() {
  const sectionRef = useRef<HTMLElement>(null)
  const { registerSection, scrollState } = useScrollContext()
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  useEffect(() => {
    registerSection('projects', sectionRef as RefObject<HTMLElement>)
  }, [registerSection])

  const progress = scrollState.sectionProgress.projects
  // Rotation goes from 0 to -270 degrees based on projects scroll progress
  const rotation = -progress * 270

  const handleCardClick = (index: number) => {
    const angle = index * 90
    const cardRotation = angle + rotation
    let normalizedRot = cardRotation % 360
    if (normalizedRot > 180) normalizedRot -= 360
    if (normalizedRot < -180) normalizedRot += 360

    const isActive = Math.abs(normalizedRot) < 45

    if (isActive) {
      setExpandedIndex(index)
    } else {
      // Scroll window to bring this card to front
      const localTarget = index / 3 // 0 to 1 range mapping 4 cards
      const globalTarget = 0.75 + localTarget * 0.17
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      window.scrollTo({
        top: globalTarget * totalHeight,
        behavior: 'smooth',
      })
    }
  }

  return (
    <section
      id="master-vault"
      ref={sectionRef}
      className="relative w-full py-32 overflow-hidden min-h-[90vh] flex flex-col justify-between"
    >
      {/* Subtle section divider top */}
      <div className="section-divider mb-0" />

      <div className="w-full px-8 md:px-16 lg:px-24">
        {/* Section header */}
        <motion.div
          className="flex items-start gap-6 mb-8 max-w-7xl mx-auto"
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
              Mohammed Rehan's operations. Scroll to rotate the cylinder, click the active card to expand.
            </p>
          </div>
        </motion.div>
      </div>

      {/* 3D Cylinder Carousel container */}
      <div
        className="relative w-full flex items-center justify-center py-6 select-none"
        style={{
          height: '500px',
          perspective: '1200px',
          transformStyle: 'preserve-3d',
        }}
      >
        <div
          className="relative w-[380px] h-[450px]"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateY(${rotation}deg)`,
            transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {PROJECTS.map((project, idx) => {
            const angle = idx * 90
            const cardRotation = angle + rotation
            let normalizedRot = cardRotation % 360
            if (normalizedRot > 180) normalizedRot -= 360
            if (normalizedRot < -180) normalizedRot += 360

            const isActive = Math.abs(normalizedRot) < 45
            const scale = isActive ? 1.0 : 0.82
            const opacity = isActive ? 1.0 : 0.3
            const zOffset = isActive ? 0 : -60

            return (
              <div
                key={project.id}
                style={{
                  position: 'absolute',
                  inset: 0,
                  transform: `rotateY(${angle}deg) translateZ(360px) scale(${scale}) translateZ(${zOffset}px)`,
                  opacity,
                  transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease',
                  backfaceVisibility: 'hidden',
                  zIndex: isActive ? 20 : 10,
                }}
              >
                {/* Click blocker/redirector for inactive side cards */}
                {!isActive && (
                  <div
                    className="absolute inset-0 z-30 cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleCardClick(idx)
                    }}
                  />
                )}
                <ProjectCard
                  project={project}
                  index={idx}
                  showTelemetryInline={false}
                  onClick={() => handleCardClick(idx)}
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* Telemetry footer hint */}
      <div className="flex justify-center mt-4 px-8">
        <p className="font-mono text-[10px] text-text-muted tracking-[0.3em] text-center">
          SCROLL TO ROTATE CAROUSEL · CLICK ACTIVE CARD TO EXPAND
        </p>
      </div>

      {/* In-place Expand Details Overlay */}
      <AnimatePresence>
        {expandedIndex !== null && (
          <motion.div
            className="absolute inset-0 z-[100] flex items-center justify-center p-4 bg-surface/90 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setExpandedIndex(null)}
          >
            <motion.div
              className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto glass-card border border-god-crimson/30 rounded-lg shadow-[0_0_60px_rgba(255,30,30,0.2)] bg-surface-2/95"
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 180 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                className="absolute top-4 right-4 z-50 font-mono text-xs text-text-muted hover:text-god-crimson transition-colors duration-200 border border-white/10 px-2 py-1 bg-surface/80 rounded"
                onClick={() => setExpandedIndex(null)}
              >
                CLOSE [X]
              </button>

              <div className="p-2">
                <ProjectCard
                  project={PROJECTS[expandedIndex]}
                  index={expandedIndex}
                  showTelemetryInline={true}
                  defaultTelemetryOpen={true}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle section divider bottom */}
      <div className="section-divider mt-16" />
    </section>
  )
}
