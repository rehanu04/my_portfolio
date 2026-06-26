// ─────────────────────────────────────────────────────────────────────────────
// src/components/sections/CommandDeck.tsx  (Hero)
//
// Ultra-premium full-screen hero. 100vh. Cinematic entrance sequence.
//   • Giant kinetic name with shimmer text
//   • Right panel: floating identity card with 3D tilt on hover
//   • Mouse-driven bio highlights micro-parallax
//   • Animated orbital status ring
//   • Scroll cue with animated indicator line
// ─────────────────────────────────────────────────────────────────────────────

import { type RefObject, useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useSpring, animated } from '@react-spring/web'
import { useScrollContext } from '../../context/ScrollContext'
import { IDENTITY } from '../../data/portfolioContent'

// ── Profile card with 3D tilt ─────────────────────────────────────────────

const CARD_SPRING = { tension: 110, friction: 18, mass: 1 }

function IdentityCard() {
  const cardRef = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState(false)

  const [{ rotX, rotY, glow }, api] = useSpring(() => ({
    rotX: 0, rotY: 0, glow: 0, config: CARD_SPRING,
  }))
  const [{ shX, shY }, shApi] = useSpring(() => ({
    shX: 50, shY: 50, config: { tension: 180, friction: 14 },
  }))

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const r = cardRef.current.getBoundingClientRect()
    const cx = (e.clientX - r.left) / r.width
    const cy = (e.clientY - r.top) / r.height
    api.start({ rotX: -(cy - 0.5) * 22, rotY: (cx - 0.5) * 22, glow: 1 })
    shApi.start({ shX: cx * 100, shY: cy * 100 })
  }, [api, shApi])

  const onLeave = useCallback(() => {
    setHovered(false)
    api.start({ rotX: 0, rotY: 0, glow: 0 })
    shApi.start({ shX: 50, shY: 50 })
  }, [api, shApi])

  return (
    <motion.div
      className="perspective-1200 w-full max-w-xs mx-auto"
      initial={{ opacity: 0, y: 60, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1.1, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <animated.div
        ref={cardRef}
        className="relative glass-card specular-sheen preserve-3d"
        style={{
          rotateX: rotX,
          rotateY: rotY,
          // @ts-expect-error – CSS custom props
          '--card-shine-x': shX.to((v: number) => `${v}%`),
          '--card-shine-y': shY.to((v: number) => `${v}%`),
          boxShadow: glow.to((g: number) =>
            `0 0 ${20 + g * 40}px rgba(255,30,30,${0.04 + g * 0.14}), 0 ${8 + g * 16}px ${40 + g * 40}px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05) inset`
          ),
        }}
        onMouseMove={onMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={onLeave}
      >
        {/* Top status bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
          <span className="font-mono text-[9px] tracking-[0.28em] text-text-muted">IDENTITY — VERIFIED</span>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-god-crimson animate-pulse" />
            <span className="font-mono text-[9px] text-god-crimson">ONLINE</span>
          </div>
        </div>

        {/* Card body */}
        <div className="p-6 space-y-6">
          {/* Initials orb with spinning conic gradient ring */}
          <div className="relative flex justify-center">
            <div className="relative">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background: 'conic-gradient(from 0deg, #FF1E1E 0%, #3B0A0A 30%, #FF1E1E 60%, #1A0505 80%, #FF1E1E 100%)',
                  padding: '2px',
                  animation: 'reticle-spin 8s linear infinite',
                }}
              >
                <div className="w-full h-full rounded-full bg-[#0a0b0f] flex items-center justify-center">
                  <span
                    className="font-display font-bold text-2xl text-gradient-crimson"
                    style={{ WebkitTextFillColor: 'unset' } as React.CSSProperties}
                  >
                    MR
                  </span>
                </div>
              </div>
              <div className="absolute inset-0 rounded-full border border-god-crimson/30 animate-pulse-ring" />
            </div>
          </div>

          {/* Name & title */}
          <div
            className="text-center space-y-1.5"
            style={{ transform: hovered ? 'translateZ(10px)' : 'none', transition: 'transform 0.2s' }}
          >
            <p className="font-display font-bold text-lg text-text-primary tracking-wide">
              {IDENTITY.displayName}
            </p>
            <p className="font-mono text-[9px] text-text-muted leading-snug max-w-[200px] mx-auto tracking-wide">
              {IDENTITY.titleLine}
            </p>
          </div>

          {/* Tag list */}
          <div className="space-y-2">
            {IDENTITY.profileTags.map((tag, i) => (
              <motion.div
                key={tag}
                className="flex items-center gap-2.5 px-3 py-2 border border-white/5 hover:border-god-crimson/25 transition-colors duration-200"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 + i * 0.1, duration: 0.5 }}
                style={{ transform: hovered ? `translateZ(${4 + i * 2}px)` : 'none', transition: 'transform 0.2s' }}
              >
                <div className="w-1 h-1 rounded-full bg-god-crimson flex-shrink-0" />
                <span className="font-mono text-[10px] text-text-muted tracking-wider">{tag}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom code line */}
        <div className="px-5 py-3 border-t border-white/5 flex items-center gap-2">
          <div className="w-1 h-1 rounded-full bg-green-400 animate-pulse" />
          <span className="font-mono text-[8px] text-text-muted tracking-widest">sys::auth_granted</span>
        </div>
      </animated.div>
    </motion.div>
  )
}

// ── Main section ──────────────────────────────────────────────────────────────

export default function CommandDeck() {
  const sectionRef = useRef<HTMLElement>(null)
  const { registerSection, mousePosition } = useScrollContext()

  useEffect(() => {
    registerSection('hero', sectionRef as RefObject<HTMLElement>)
  }, [registerSection])

  const [{ bioX, bioY }, bioApi] = useSpring(() => ({
    bioX: 0, bioY: 0, config: { tension: 80, friction: 18 },
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
      className="relative w-full min-h-screen flex items-center px-8 md:px-16 lg:px-24 overflow-hidden"
    >
      {/* Animated scan line */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-scan absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-god-crimson/20 to-transparent opacity-60" />
      </div>

      {/* Subtle noise texture */}
      <div className="pointer-events-none absolute inset-0 scanlines-diagonal opacity-40" />

      {/* Main grid */}
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 lg:gap-20 items-center py-24">

        {/* ── Left: Name + Bio + CTAs ───────────────────────────────────── */}
        <div className="space-y-10">

          {/* System status chip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="section-chip">
              <div className="w-1.5 h-1.5 rounded-full bg-god-crimson animate-pulse" />
              {IDENTITY.systemTag}
            </div>
          </motion.div>

          {/* Primary headline — giant staggered name */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="font-display font-bold leading-none tracking-tight" style={{ perspective: '600px' }}>
              <motion.span
                className="block text-lg md:text-2xl font-mono font-light text-text-muted mb-3 tracking-[0.2em]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              >
                {IDENTITY.labHandle}
              </motion.span>
              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="block text-6xl md:text-8xl lg:text-[7rem] text-text-primary animate-flicker leading-none">
                  {IDENTITY.displayName.split(' ')[0]}
                </span>
                <span className="block text-6xl md:text-8xl lg:text-[7rem] text-shimmer leading-none">
                  {IDENTITY.displayName.split(' ')[1]}
                </span>
              </motion.h1>
            </div>
          </motion.div>

          {/* Horizontal rule with title */}
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            style={{ transformOrigin: 'left' }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="h-px flex-1 max-w-[80px] bg-gradient-to-r from-god-crimson/70 to-transparent" />
            <span className="font-mono text-xs text-text-muted tracking-[0.22em]">{IDENTITY.shortTitle}</span>
          </motion.div>

          {/* Bio with mouse parallax highlights */}
          <motion.p
            className="font-display text-text-muted text-lg md:text-xl leading-relaxed max-w-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            {IDENTITY.bio.split(IDENTITY.bioHighlights[0])[0]}
            <animated.span className="text-text-primary font-medium" style={{ display: 'inline-block', x: bioX, y: bioY }}>
              {IDENTITY.bioHighlights[0]}
            </animated.span>
            {', '}
            <animated.span className="text-text-primary font-medium" style={{ display: 'inline-block', x: bioX.to(x => x * 0.7), y: bioY.to(y => y * 0.7) }}>
              {IDENTITY.bioHighlights[1]}
            </animated.span>
            {', and '}
            <animated.span className="text-text-primary font-medium" style={{ display: 'inline-block', x: bioX.to(x => x * 0.4), y: bioY.to(y => y * 0.4) }}>
              {IDENTITY.bioHighlights[2]}
            </animated.span>
            {' applications.'}
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="flex flex-wrap items-center gap-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
          >
            <a
              id="hero-cta-vault"
              href="#master-vault"
              data-cursor="target"
              className="group relative inline-flex items-center gap-3 px-8 py-4 font-mono text-sm tracking-widest overflow-hidden text-god-crimson border border-god-crimson/60 hover:text-white transition-colors duration-300 glow-crimson-sm"
              onClick={e => {
                e.preventDefault()
                document.getElementById('master-vault')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              <span className="absolute inset-0 bg-god-crimson -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out" />
              <span className="relative z-10">VIEW SYSTEMS</span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="relative z-10 group-hover:translate-x-1 transition-transform duration-200">
                <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a
              id="hero-cta-uplink"
              href="#secure-uplink"
              data-cursor="target"
              className="font-mono text-sm text-text-muted tracking-widest hover:text-god-crimson transition-colors duration-200"
              onClick={e => {
                e.preventDefault()
                document.getElementById('secure-uplink')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              ESTABLISH UPLINK →
            </a>
          </motion.div>

          {/* Hero metrics */}
          <motion.div
            className="grid grid-cols-3 gap-6 pt-8 border-t border-white/5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            {IDENTITY.heroMetrics.map((m) => (
              <div key={m.label} className="space-y-1">
                <p className="font-mono text-[9px] tracking-[0.25em] text-text-muted uppercase">{m.label}</p>
                <p className="font-mono text-3xl font-bold text-text-primary">{m.value}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── Right: 3D Identity card ────────────────────────────────────── */}
        <div className="hidden lg:block w-72 xl:w-80">
          <IdentityCard />
        </div>
      </div>

      {/* Scroll cue */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 1 }}
      >
        <span className="font-mono text-[9px] text-text-muted tracking-[0.3em]">SCROLL TO TRAVERSE</span>
        <div className="w-px h-14 bg-gradient-to-b from-god-crimson/60 to-transparent" />
        <motion.div
          className="w-1.5 h-1.5 rounded-full bg-god-crimson"
          animate={{ y: [0, 8, 0], opacity: [1, 0.3, 1] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
        />
      </motion.div>
    </section>
  )
}
