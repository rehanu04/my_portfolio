// ─────────────────────────────────────────────────────────────────────────────
// src/components/sections/SecureUplink.tsx  (Contact)
//
// Contact section with:
//   • Glass monolith contact cards with spring tilt
//   • data-cursor="target" on all link cards
//   • Animated ONLINE badge with orbiting indicator ring
//   • Coordinate-grid-visible background (WebGL shows through)
// ─────────────────────────────────────────────────────────────────────────────

import { type RefObject, useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useSpring, animated } from '@react-spring/web'
import { useScrollContext } from '../../context/ScrollContext'
import { UPLINK_META, UPLINK_CHANNELS } from '../../data/portfolioContent'

// ─── Icon Registry ─────────────────────────────────────────────────────────

const CHANNEL_ICONS: Record<string, JSX.Element> = {
  linkedin: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
  email: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
      />
    </svg>
  ),
  github: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  ),
}

// ─── Spring-tilting contact card ───────────────────────────────────────────

const CONTACT_SPRING = { tension: 130, friction: 19, mass: 0.9 }

interface ContactCardProps {
  channel: typeof UPLINK_CHANNELS[number]
  index: number
}

function ContactCard({ channel, index }: ContactCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef<HTMLAnchorElement>(null)

  const [{ rotateX, rotateY, scale }, springApi] = useSpring(() => ({
    rotateX: 0, rotateY: 0, scale: 1, config: CONTACT_SPRING,
  }))

  const [{ shineX, shineY }, shineApi] = useSpring(() => ({
    shineX: 50, shineY: 50, config: { tension: 200, friction: 16 },
  }))

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const cx = (e.clientX - rect.left) / rect.width
    const cy = (e.clientY - rect.top)  / rect.height
    springApi.start({ rotateX: -(cy - 0.5) * 18, rotateY: (cx - 0.5) * 18, scale: 1.02 })
    shineApi.start({ shineX: cx * 100, shineY: cy * 100 })
  }, [springApi, shineApi])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
    springApi.start({ rotateX: 0, rotateY: 0, scale: 1 })
    shineApi.start({ shineX: 50, shineY: 50 })
  }, [springApi, shineApi])

  return (
    <motion.div
      className="perspective-1200"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: index * 0.14, ease: [0.16, 1, 0.3, 1] }}
    >
      <animated.a
        ref={cardRef}
        id={`uplink-${channel.id}`}
        href={channel.href}
        target={channel.external ? '_blank' : undefined}
        rel={channel.external ? 'noopener noreferrer' : undefined}
        data-cursor="target"
        className="group relative block glass-monolith specular-sheen overflow-hidden preserve-3d"
        style={{
          rotateX,
          rotateY,
          scale,
          // @ts-expect-error – CSS custom properties
          '--card-shine-x': shineX.to((v: number) => `${v}%`),
          '--card-shine-y': shineY.to((v: number) => `${v}%`),
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
      >
        {/* Shimmer on hover */}
        {isHovered && (
          <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
            <div
              className="absolute top-0 bottom-0 w-16 bg-gradient-to-r from-transparent via-white/8 to-transparent animate-gradient-sweep"
              style={{ left: '-4rem' }}
            />
          </div>
        )}

        <div className="relative z-10 flex flex-col items-center gap-5 p-8">
          {/* Icon box */}
          <div className={`w-12 h-12 border flex items-center justify-center transition-all duration-300 ${
            isHovered
              ? 'border-cyan-galactic text-cyan-galactic glow-cyan'
              : 'border-surface-3 text-text-muted'
          }`}>
            {CHANNEL_ICONS[channel.id]}
          </div>

          <div className="text-center">
            <p className={`font-mono text-sm font-medium tracking-widest transition-colors duration-200 ${
              isHovered ? 'text-cyan-galactic text-glow-cyan' : 'text-text-primary'
            }`}>
              {channel.label}
            </p>
            <p className="font-mono text-xs text-text-muted mt-0.5">{channel.sublabel}</p>
          </div>

          <div className={`flex items-center gap-1.5 transition-colors duration-200 ${
            isHovered ? 'text-cyan-galactic' : 'text-text-muted'
          }`}>
            <span className="font-mono text-[10px] tracking-widest">CONNECT</span>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1 5h8M5 1l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </animated.a>
    </motion.div>
  )
}

// ─── Main Section ──────────────────────────────────────────────────────────

export default function SecureUplink() {
  const sectionRef = useRef<HTMLElement>(null)
  const { registerSection } = useScrollContext()

  useEffect(() => {
    registerSection('contact', sectionRef as RefObject<HTMLElement>)
  }, [registerSection])

  return (
    <section
      id="secure-uplink"
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-center px-8 md:px-16 lg:px-24 py-24"
    >
      <div className="w-full max-w-4xl mx-auto text-center">
        {/* Header */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="font-mono text-xs tracking-[0.32em] text-cyan-galactic uppercase mb-5 text-glow-cyan">
            {UPLINK_META.sectionTag}
          </p>
          <h2 className="font-display font-bold text-4xl md:text-6xl text-text-primary leading-tight mb-4">
            {UPLINK_META.headline1}
            <br />
            <span className="text-cyan-galactic text-glow-cyan">{UPLINK_META.headline2}</span>
          </h2>
          <p className="text-text-muted font-display text-lg max-w-md mx-auto leading-relaxed">
            {UPLINK_META.subtext}
          </p>
        </motion.div>

        {/* Contact cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
          {UPLINK_CHANNELS.map((channel, idx) => (
            <ContactCard key={channel.id} channel={channel} index={idx} />
          ))}
        </div>

        {/* Signature footer with orbiting ONLINE badge */}
        <motion.div
          className="border-t border-white/5 pt-8 space-y-5"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.5 }}
        >
          <div className="flex items-center justify-center gap-5">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-surface-3" />
            <span className="font-mono text-[10px] text-text-muted tracking-[0.32em]">
              MASTER R LABS
            </span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-surface-3" />
          </div>

          <p className="font-mono text-[10px] text-text-muted tracking-wider">
            {UPLINK_META.footerLine}
          </p>

          {/* Orbiting ONLINE badge */}
          <div className="flex items-center justify-center gap-3">
            <div className="relative w-5 h-5">
              {/* Core dot */}
              <div className="absolute inset-[4px] rounded-full bg-cyan-galactic" />
              {/* Pulse ring 1 */}
              <div className="absolute inset-0 rounded-full border border-cyan-galactic/50 animate-pulse-ring" />
              {/* Pulse ring 2 */}
              <div className="absolute inset-0 rounded-full border border-cyan-galactic/30 animate-pulse-ring"
                style={{ animationDelay: '0.5s' }}
              />
              {/* Orbiting dot */}
              <div
                className="absolute top-1/2 left-1/2 w-1 h-1 rounded-full bg-cyan-galactic animate-orbit"
                style={{ transformOrigin: '0 0' }}
              />
            </div>
            <span className="font-mono text-xs text-cyan-galactic text-glow-cyan">ONLINE</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
