import { type RefObject, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useScrollContext } from '../../context/ScrollContext'
import { IDENTITY } from '../../data/portfolioContent'

// ─── Animation Variants ────────────────────────────────────────────────────

const STAGGER = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.09 } },
}

const FADE_UP = {
  hidden:  { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] },
  },
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function CommandDeck() {
  const sectionRef = useRef<HTMLElement>(null)
  const { registerSection } = useScrollContext()

  useEffect(() => {
    registerSection('hero', sectionRef as RefObject<HTMLElement>)
  }, [registerSection])

  // Build bio with highlighted spans from IDENTITY data
  const bioWords  = IDENTITY.bio.split(', ').join(',').split(' ')

  return (
    <section
      id="command-deck"
      ref={sectionRef}
      className="relative min-h-screen flex items-center px-8 md:px-16 lg:px-24 py-28 overflow-hidden"
    >
      {/* Animated scan line */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-scan absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-galactic to-transparent opacity-15" />
      </div>

      <motion.div
        className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
        variants={STAGGER}
        initial="hidden"
        animate="visible"
      >
        {/* ── Left Panel ─────────────────────────────────────────────── */}
        <div className="space-y-8">
          {/* System status label */}
          <motion.div variants={FADE_UP} className="flex items-center gap-3">
            <div className="h-px w-10 bg-cyan-galactic" />
            <span className="font-mono text-xs tracking-[0.32em] text-cyan-galactic uppercase">
              {IDENTITY.systemTag}
            </span>
          </motion.div>

          {/* Primary heading */}
          <motion.div variants={FADE_UP}>
            <h1 className="font-display font-bold leading-none tracking-tight">
              <span className="block text-xl md:text-2xl font-mono font-light text-text-muted mb-2 tracking-[0.18em]">
                {IDENTITY.labHandle}
              </span>
              <span className="block text-5xl md:text-7xl lg:text-[5.5rem] text-text-primary animate-flicker">
                {IDENTITY.displayName.split(' ')[0]}
              </span>
              <span className="block text-5xl md:text-7xl lg:text-[5.5rem] text-cyan-galactic text-glow-cyan">
                {IDENTITY.displayName.split(' ')[1]}
              </span>
            </h1>
          </motion.div>

          {/* Horizontal rule with label */}
          <motion.div variants={FADE_UP} className="flex items-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-cyan-galactic to-transparent" />
            <span className="font-mono text-xs text-text-muted tracking-widest">{IDENTITY.shortTitle}</span>
          </motion.div>

          {/* Bio — highlights auto-rendered from data */}
          <motion.p
            variants={FADE_UP}
            className="font-display text-text-muted text-lg md:text-xl leading-relaxed max-w-lg"
          >
            {IDENTITY.bio.split(IDENTITY.bioHighlights[0])[0]}
            <span className="text-text-primary">{IDENTITY.bioHighlights[0]}</span>
            {', '}
            <span className="text-text-primary">{IDENTITY.bioHighlights[1]}</span>
            {', and '}
            <span className="text-text-primary">{IDENTITY.bioHighlights[2]}</span>
            {' applications.'}
          </motion.p>

          {/* CTA row */}
          <motion.div variants={FADE_UP} className="flex flex-wrap items-center gap-5 pt-2">
            <a
              id="hero-cta-vault"
              href="#master-vault"
              className="group inline-flex items-center gap-3 px-7 py-3 border border-cyan-galactic text-cyan-galactic font-mono text-sm tracking-widest hover:bg-cyan-galactic hover:text-surface transition-all duration-300 glow-cyan"
            >
              <span>VIEW SYSTEMS</span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="group-hover:translate-x-1 transition-transform duration-200">
                <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a
              id="hero-cta-uplink"
              href="#secure-uplink"
              className="font-mono text-sm text-text-muted tracking-widest hover:text-text-primary transition-colors duration-200"
            >
              ESTABLISH UPLINK
            </a>
          </motion.div>

          {/* Quick metrics — pulled from IDENTITY data */}
          <motion.div
            variants={FADE_UP}
            className="grid grid-cols-3 gap-6 pt-6 border-t border-surface-3"
          >
            {IDENTITY.heroMetrics.map((m) => (
              <div key={m.label} className="space-y-1">
                <p className="font-mono text-[10px] tracking-[0.25em] text-text-muted">{m.label}</p>
                <p className="font-mono text-2xl text-text-primary font-semibold">{m.value}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── Right Panel — Profile Frame ─────────────────────────────── */}
        <motion.div
          variants={FADE_UP}
          className="relative flex items-center justify-center"
        >
          <div className="relative w-72 h-[380px] md:w-[340px] md:h-[440px]">
            {/* Ambient glow behind the frame */}
            <div className="absolute inset-0 rounded-2xl bg-cyan-galactic opacity-[0.06] blur-3xl scale-110" />

            {/* Corner target reticles */}
            {[
              'top-0 left-0 border-t-2 border-l-2',
              'top-0 right-0 border-t-2 border-r-2',
              'bottom-0 left-0 border-b-2 border-l-2',
              'bottom-0 right-0 border-b-2 border-r-2',
            ].map((cls, i) => (
              <div key={i} className={`absolute ${cls} border-cyan-galactic w-5 h-5`} />
            ))}

            {/* Inner frame */}
            <div className="absolute inset-5 bg-surface-2 overflow-hidden">
              <div className="scanlines absolute inset-0 z-10 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-surface opacity-75 z-20" />

              {/* Profile content */}
              <div className="relative z-30 w-full h-full flex flex-col items-center justify-center gap-5">
                {/* Initials orb */}
                <div className="w-24 h-24 rounded-full border-2 border-cyan-galactic glow-cyan flex items-center justify-center">
                  <span className="font-display font-bold text-3xl text-cyan-galactic">MR</span>
                </div>

                <div className="text-center space-y-1">
                  <p className="font-mono text-[10px] tracking-[0.28em] text-cyan-galactic">
                    IDENTITY — VERIFIED
                  </p>
                  <p className="font-mono text-[9px] text-text-muted leading-tight max-w-[180px] text-center">
                    {IDENTITY.titleLine}
                  </p>
                </div>

                {/* Bio tags from IDENTITY data */}
                <div className="flex flex-col gap-1.5 w-full px-6">
                  {IDENTITY.profileTags.map((tag) => (
                    <div
                      key={tag}
                      className="flex items-center gap-2 px-3 py-1.5 border border-surface-3"
                    >
                      <div className="w-1 h-1 rounded-full bg-cyan-galactic" />
                      <span className="font-mono text-[10px] text-text-muted tracking-wider">{tag}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.8 }}
      >
        <span className="font-mono text-[10px] text-text-muted tracking-[0.28em]">SCROLL TO TRAVERSE</span>
        <div className="w-px h-10 bg-gradient-to-b from-cyan-galactic to-transparent" />
      </motion.div>
    </section>
  )
}
