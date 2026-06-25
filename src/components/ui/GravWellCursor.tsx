// ─────────────────────────────────────────────────────────────────────────────
// src/components/ui/GravWellCursor.tsx
//
// Magnetic grav-well cursor with spring physics, velocity warp, and
// interactive telemetry targeting reticle on hover.
//
// Architecture:
//   • useSpring (@react-spring/web) drives smooth X/Y position with
//     configurable spring tension / friction.
//   • Velocity vector computed per-frame → cursor tilts along movement axis
//     using skewX / scaleY warp transforms.
//   • MutationObserver + event delegation detect `data-cursor="target"` elements
//     to switch the cursor into reticle mode.
//   • Entire overlay is pointer-events:none at z-index 9999.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState, useCallback } from 'react'
import { useSpring, animated } from '@react-spring/web'

// ─── Spring configs ────────────────────────────────────────────────────────

const SPRING_IDLE = { tension: 380, friction: 26, mass: 0.8 }
const SPRING_HOVER = { tension: 220, friction: 20, mass: 1.2 }

// ─── Component ────────────────────────────────────────────────────────────

export default function GravWellCursor() {
  const [isHovering, setIsHovering] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  const prevPos = useRef({ x: 0, y: 0 })
  const velocity = useRef({ x: 0, y: 0 })
  const rafRef = useRef<number>(0)
  const currentPos = useRef({ x: 0, y: 0 })

  // Spring for cursor position
  const [{ x, y }, springApi] = useSpring(() => ({
    x: 0,
    y: 0,
    config: SPRING_IDLE,
  }))

  // Spring for cursor scale + warp
  const [{ scale, skewX, scaleY }, warpApi] = useSpring(() => ({
    scale: 1,
    skewX: 0,
    scaleY: 1,
    config: { tension: 300, friction: 18 },
  }))

  // Spring for reticle opacity + size
  const [{ reticleOpacity, reticleScale }, reticleApi] = useSpring(() => ({
    reticleOpacity: 0,
    reticleScale: 0.6,
    config: { tension: 260, friction: 22 },
  }))

  const updateVelocity = useCallback(() => {
    const px = currentPos.current.x
    const py = currentPos.current.y
    velocity.current.x = px - prevPos.current.x
    velocity.current.y = py - prevPos.current.y
    prevPos.current = { x: px, y: py }

    const speed = Math.sqrt(velocity.current.x ** 2 + velocity.current.y ** 2)
    const warpX = Math.max(-18, Math.min(18, velocity.current.x * 0.6))
    const scY = Math.max(0.78, Math.min(1, 1 - speed * 0.008))

    warpApi.start({ skewX: warpX, scaleY: scY })
    rafRef.current = requestAnimationFrame(updateVelocity)
  }, [warpApi])

  useEffect(() => {
    rafRef.current = requestAnimationFrame(updateVelocity)
    return () => cancelAnimationFrame(rafRef.current)
  }, [updateVelocity])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      currentPos.current = { x: e.clientX, y: e.clientY }
      springApi.start({
        x: e.clientX,
        y: e.clientY,
        config: isHovering ? SPRING_HOVER : SPRING_IDLE,
      })
      if (!isVisible) setIsVisible(true)
    }

    const onEnter = () => setIsVisible(true)
    const onLeave = () => setIsVisible(false)

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const cursorTarget = target.closest('[data-cursor="target"]')
      if (cursorTarget) {
        setIsHovering(true)
        reticleApi.start({ reticleOpacity: 1, reticleScale: 1 })
        warpApi.start({ scale: 1.5 })
      }
    }

    const onOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const related = e.relatedTarget as HTMLElement | null
      if (
        target.closest('[data-cursor="target"]') &&
        !related?.closest('[data-cursor="target"]')
      ) {
        setIsHovering(false)
        reticleApi.start({ reticleOpacity: 0, reticleScale: 0.6 })
        warpApi.start({ scale: 1 })
      }
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    document.documentElement.addEventListener('mouseenter', onEnter)
    document.documentElement.addEventListener('mouseleave', onLeave)
    document.addEventListener('mouseover', onOver, { passive: true })
    document.addEventListener('mouseout', onOut, { passive: true })

    return () => {
      window.removeEventListener('mousemove', onMove)
      document.documentElement.removeEventListener('mouseenter', onEnter)
      document.documentElement.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
    }
  }, [isHovering, isVisible, springApi, warpApi, reticleApi])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      <animated.div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          x,
          y,
          opacity: isVisible ? 1 : 0,
          translateX: '-50%',
          translateY: '-50%',
          transition: 'opacity 0.3s ease',
        }}
      >
        <animated.div
          style={{
            scale,
            skewX,
            scaleY,
            transformOrigin: 'center center',
          }}
        >
          {/* ── Core crosshair dot ────────────────────────────────────── */}
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#00F5FF',
              boxShadow: '0 0 10px rgba(0,245,255,0.8), 0 0 24px rgba(0,245,255,0.3)',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />

          {/* ── Idle outer ring ───────────────────────────────────────── */}
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: '1px solid rgba(0,245,255,0.45)',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              transition: 'opacity 0.2s ease',
              opacity: isHovering ? 0 : 1,
            }}
          />

          {/* ── Telemetry reticle (hover state) ──────────────────────── */}
          <animated.div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              translateX: '-50%',
              translateY: '-50%',
              width: 64,
              height: 64,
              opacity: reticleOpacity,
              scale: reticleScale,
            }}
          >
            {/* Outer rotating arc ring */}
            <svg
              width={64}
              height={64}
              style={{
                position: 'absolute',
                inset: 0,
                animation: 'reticle-spin 3s linear infinite',
              }}
            >
              <circle
                cx={32} cy={32} r={28}
                fill="none"
                stroke="rgba(0,245,255,0.7)"
                strokeWidth={1}
                strokeDasharray="20 8"
              />
            </svg>

            {/* Inner counter-rotating arc ring */}
            <svg
              width={64}
              height={64}
              style={{
                position: 'absolute',
                inset: 0,
                animation: 'reticle-spin-ccw 5s linear infinite',
              }}
            >
              <circle
                cx={32} cy={32} r={20}
                fill="none"
                stroke="rgba(0,245,255,0.35)"
                strokeWidth={0.75}
                strokeDasharray="6 10"
              />
            </svg>

            {/* Corner tick marks */}
            {(
              [
                { top: 4,    left: 4,   rotateDeg: 0   } as const,
                { top: 4,    right: 4,  rotateDeg: 90  } as const,
                { bottom: 4, left: 4,   rotateDeg: -90 } as const,
                { bottom: 4, right: 4,  rotateDeg: 180 } as const,
              ] as Array<{
                top?: number; bottom?: number;
                left?: number; right?: number;
                rotateDeg: number
              }>
            ).map((pos, i) => {
              const { rotateDeg, ...rest } = pos
              return (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    width: 8,
                    height: 8,
                    ...rest,
                    borderTop: '1.5px solid rgba(0,245,255,0.9)',
                    borderLeft: '1.5px solid rgba(0,245,255,0.9)',
                    transform: `rotate(${rotateDeg}deg)`,
                    boxShadow: '0 0 4px rgba(0,245,255,0.5)',
                  }}
                />
              )
            })}

            {/* Centre crosshair arms */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 18,
              height: 1,
              background: 'rgba(0,245,255,0.8)',
            }} />
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 1,
              height: 18,
              background: 'rgba(0,245,255,0.8)',
            }} />
          </animated.div>
        </animated.div>
      </animated.div>
    </div>
  )
}
