// ─────────────────────────────────────────────────────────────────────────────
// src/components/sections/CommandDeck.tsx  (Hero)
//
// Ultra Vegito Hero — multi-layer depth architecture:
//   • perspective(800px) container → all children float in 3D space
//   • Lab handle / headline / bio each on separate Z depths
//   • Bio highlights float independently on mouse move (spring physics)
//   • Profile frame: animated SVG corner-reticle draw on mount
//   • Initials orb: conic-gradient rotating border + inner glow
//   • data-cursor="target" on all CTA buttons
//   • Hero metrics with animated counting effect via CSS
// ─────────────────────────────────────────────────────────────────────────────

import { type RefObject, useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useSpring, animated } from '@react-spring/web'
import { useScrollContext } from '../../context/ScrollContext'
import { IDENTITY } from '../../data/portfolioContent'

// ─── Animation variants ────────────────────────────────────────────────────

const STAGGER = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.10 } },
}

const FADE_UP = {
  hidden:  { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] },
  },
}

// ─── Animated SVG corner reticle ───────────────────────────────────────────

function CornerReticle({ pos }: { pos: string }) {
  return (
    <motion.svg
      width={28} height={28}
      viewBox="0 0 28 28"
      className={`absolute ${pos} text-cyan-galactic`}
      fill="none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.2, duration: 0.4 }}
    >
      <motion.path
        d={pos.includes('top') && pos.includes('left')
          ? 'M14 2H2V14'
          : pos.includes('top') && pos.includes('right')
          ? 'M14 2H26V14'
          : pos.includes('bottom') && pos.includes('left')
          ? 'M14 26H2V14'
          : 'M14 26H26V14'}
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.6, ease: 'easeOut' }}
      />
    </motion.svg>
  )
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function CommandDeck() {
  const sectionRef = useRef<HTMLElement>(null)
  const { registerSection, mousePosition } = useScrollContext()

  useEffect(() => {
    registerSection('hero', sectionRef as RefObject<HTMLElement>)
  }, [registerSection])

  // Spring for bio highlight micro-parallax on mouse move
  const [{ bioX, bioY }, bioApi] = useSpring(() => ({
    bioX: 0,
    bioY: 0,
    config: { tension: 80, friction: 18 },
  }))

  useEffect(() => {
    bioApi.start({
      bioX: mousePosition.normalizedX * 6,
      bioY: mousePosition.normalizedY * -4,
    })
  }, [bioApi, mousePosition.normalizedX, mousePosition.normalizedY])

  return (
    <section
      id="command-deck"
      ref={sectionRef}
      className="relative min-h-screen flex items-center px-8 md:px-16 lg:px-24 py-28 overflow-hidden"
    >
      {/* Animated scan line */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-scan absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-galactic to-transparent opacity-10" />
      </div>

      {/* Diagonal scan lines background */}
      <div className="pointer-events-none absolute inset-0 scanlines-diagonal opacity-30" />

      {/* Main content grid — perspective container */}
      <motion.div
        className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
        style={{ perspective: '800px' }}
        variants={STAGGER}
        initial="hidden"
        animate="visible"
      >
        {/* ── Left Panel ─────────────────────────────────────────────── */}
        <div className="space-y-8">
          {/* System status label */}
          <motion.div variants={FADE_UP} className="flex items-center gap-3">
            <div className="h-px w-10 bg-gradient-to-r from-cyan-galactic to-transparent" />
            <span className="font-mono text-xs tracking-[0.32em] text-cyan-galactic uppercase text-glow-cyan">
              {IDENTITY.systemTag}
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-galactic animate-pulse" />
          </motion.div>

          {/* Primary heading — depth layers */}
          <motion.div variants={FADE_UP}>
            <h1 className="font-display font-bold leading-none tracking-tight" style={{ transformStyle: 'preserve-3d' }}>
              <span className="block text-xl md:text-2xl font-mono font-light text-text-muted mb-2 tracking-[0.18em]"
                style={{ transform: 'translateZ(2px)' }}
              >
                {IDENTITY.labHandle}
              </span>
              <span
                className="block text-5xl md:text-7xl lg:text-[5.5rem] text-text-primary animate-flicker"
                style={{ transform: 'translateZ(8px)', display: 'block' }}
              >
                {IDENTITY.displayName.split(' ')[0]}
              </span>
              <span
                className="block text-5xl md:text-7xl lg:text-[5.5rem] text-cyan-galactic text-glow-cyan"
                style={{ transform: 'translateZ(14px)', display: 'block' }}
              >
                {IDENTITY.displayName.split(' ')[1]}
              </span>
            </h1>
          </motion.div>

          {/* Horizontal rule */}
          <motion.div variants={FADE_UP} className="flex items-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-cyan-galactic/60 to-transparent" />
            <span className="font-mono text-xs text-text-muted tracking-widest">{IDENTITY.shortTitle}</span>
          </motion.div>

          {/* Bio — highlights with mouse parallax */}
          <motion.div variants={FADE_UP}>
            <p className="font-display text-text-muted text-lg md:text-xl leading-relaxed max-w-lg">
              {IDENTITY.bio.split(IDENTITY.bioHighlights[0])[0]}
              <animated.span
                className="text-text-primary font-medium"
                style={{ display: 'inline-block', x: bioX, y: bioY }}
              >
                {IDENTITY.bioHighlights[0]}
              </animated.span>
              {', '}
              <animated.span
                className="text-text-primary font-medium"
                style={{ display: 'inline-block', x: bioX.to((x) => x * 0.7), y: bioY.to((y) => y * 0.7) }}
              >
                {IDENTITY.bioHighlights[1]}
              </animated.span>
              {', and '}
              <animated.span
                className="text-text-primary font-medium"
                style={{ display: 'inline-block', x: bioX.to((x) => x * 0.4), y: bioY.to((y) => y * 0.4) }}
              >
                {IDENTITY.bioHighlights[2]}
              </animated.span>
              {' applications.'}
            </p>
          </motion.div>

          {/* CTA row */}
          <motion.div variants={FADE_UP} className="flex flex-wrap items-center gap-5 pt-2">
            <a
              id="hero-cta-vault"
              href="#master-vault"
              data-cursor="target"
              className="group relative inline-flex items-center gap-3 px-7 py-3.5 border border-cyan-galactic text-cyan-galactic font-mono text-sm tracking-widest overflow-hidden transition-colors duration-300 hover:text-surface glow-cyan"
            >
              {/* Hover fill */}
              <span className="absolute inset-0 bg-cyan-galactic transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-in-out" />
              <span className="relative z-10">VIEW SYSTEMS</span>
              <svg
                width="14" height="14" viewBox="0 0 14 14" fill="none"
                className="relative z-10 group-hover:translate-x-1 transition-transform duration-200"
              >
                <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a
              id="hero-cta-uplink"
              href="#secure-uplink"
              data-cursor="target"
              className="font-mono text-sm text-text-muted tracking-widest hover:text-cyan-galactic transition-colors duration-200"
            >
              ESTABLISH UPLINK
            </a>
          </motion.div>

          {/* Hero metrics */}
          <motion.div
            variants={FADE_UP}
            className="grid grid-cols-3 gap-6 pt-6 border-t border-white/5"
          >
            {IDENTITY.heroMetrics.map((m) => (
              <div key={m.label} className="space-y-1.5">
                <p className="font-mono text-[10px] tracking-[0.25em] text-text-muted">{m.label}</p>
                <p className="font-mono text-2xl text-text-primary font-semibold text-glow-white">{m.value}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── Right Panel — Profile Frame ─────────────────────────────── */}
        <motion.div
          variants={FADE_UP}
          className="relative flex items-center justify-center"
        >
          <div className="relative w-72 h-[400px] md:w-[340px] md:h-[460px]">
            {/* Ambient glow */}
            <div className="absolute inset-0 bg-cyan-galactic opacity-[0.07] blur-3xl scale-110 rounded-full" />

            {/* Corner reticles */}
            <CornerReticle pos="top-0 left-0" />
            <CornerReticle pos="top-0 right-0" />
            <CornerReticle pos="bottom-0 left-0" />
            <CornerReticle pos="bottom-0 right-0" />

            {/* Inner frame */}
            <div className="absolute inset-5 glass-monolith overflow-hidden">
              <div className="scanlines absolute inset-0 z-10 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-surface opacity-80 z-20" />

              {/* Profile content */}
              <div className="relative z-30 w-full h-full flex flex-col items-center justify-center gap-6">

                {/* Initials orb — conic gradient rotating border */}
                <div className="relative">
                  <div
                    className="w-24 h-24 rounded-full flex items-center justify-center"
                    style={{
                      background: 'conic-gradient(from 0deg, #00F5FF, #0066FF, #00F5FF)',
                      padding: '2px',
                      animation: 'reticle-spin 6s linear infinite',
                    }}
                  >
                    <div className="w-full h-full rounded-full bg-surface-2 flex items-center justify-center glow-cyan">
                      <span className="font-display font-bold text-3xl text-cyan-galactic text-glow-cyan">MR</span>
                    </div>
                  </div>
                  {/* Pulse ring */}
                  <div
                    className="absolute inset-0 rounded-full border border-cyan-galactic/40 animate-pulse-ring"
                    style={{ animationDelay: '0.5s' }}
                  />
                </div>

                <div className="text-center space-y-1.5">
                  <p className="font-mono text-[10px] tracking-[0.28em] text-cyan-galactic text-glow-cyan">
                    IDENTITY — VERIFIED
                  </p>
                  <p className="font-mono text-[9px] text-text-muted leading-tight max-w-[185px] text-center">
                    {IDENTITY.titleLine}
                  </p>
                </div>

                {/* Bio tags */}
                <div className="flex flex-col gap-1.5 w-full px-6">
                  {IDENTITY.profileTags.map((tag, i) => (
                    <motion.div
                      key={tag}
                      className="flex items-center gap-2 px-3 py-1.5 border border-surface-3 hover:border-cyan-galactic/40 transition-colors duration-200"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.0 + i * 0.08, duration: 0.5 }}
                    >
                      <div className="w-1 h-1 rounded-full bg-cyan-galactic" />
                      <span className="font-mono text-[10px] text-text-muted tracking-wider">{tag}</span>
                    </motion.div>
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
        transition={{ delay: 2.0, duration: 0.8 }}
      >
        <span className="font-mono text-[10px] text-text-muted tracking-[0.28em]">SCROLL TO TRAVERSE</span>
        <div className="w-px h-12 bg-gradient-to-b from-cyan-galactic to-transparent" />
        <motion.div
          className="w-1.5 h-1.5 rounded-full bg-cyan-galactic"
          animate={{ y: [0, 6, 0], opacity: [1, 0.3, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        />
      </motion.div>
    </section>
  )
}
