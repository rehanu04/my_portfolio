// ─────────────────────────────────────────────────────────────────────────────
// src/context/ScrollContext.tsx
//
// Passive scroll + mouse telemetry provider.
//
// Now that sections are normal DOM elements, scroll is linear and natural.
// scrollProgress (0→1) drives the background camera ambient drift.
// activeSection is computed by viewport intersection for nav highlighting.
// ─────────────────────────────────────────────────────────────────────────────

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import type { MousePosition, ScrollState, SectionId } from '../types'

// ─── Context Shape ─────────────────────────────────────────────────────────

interface ScrollContextValue {
  scrollState: ScrollState
  mousePosition: MousePosition
  registerSection: (id: SectionId, ref: React.RefObject<HTMLElement>) => void
}

// ─── Defaults ──────────────────────────────────────────────────────────────

const defaultScrollState: ScrollState = {
  scrollProgress: 0,
  scrollY: 0,
  sectionProgress: { hero: 0, experience: 0, projects: 0, contact: 0 },
  activeSection: 'hero',
}

const defaultMouse: MousePosition = {
  x: 0,
  y: 0,
  normalizedX: 0,
  normalizedY: 0,
  velocityX: 0,
  velocityY: 0,
}

// ─── Context ───────────────────────────────────────────────────────────────

const ScrollContext = createContext<ScrollContextValue>({
  scrollState: defaultScrollState,
  mousePosition: defaultMouse,
  registerSection: () => undefined,
})

export const useScrollContext = () => useContext(ScrollContext)

// ─── Exported zone constants (used by Navigation for snap-scroll) ──────────

export const SECTION_IDS: SectionId[] = ['hero', 'experience', 'projects', 'contact']
export const SECTION_DOM_IDS: Record<SectionId, string> = {
  hero:       'command-deck',
  experience: 'system-arch-log',
  projects:   'master-vault',
  contact:    'secure-uplink',
}

// ─── Provider ──────────────────────────────────────────────────────────────

export function ScrollProvider({ children }: { children: React.ReactNode }) {
  const [scrollState, setScrollState] = useState<ScrollState>(defaultScrollState)
  const [mousePosition, setMousePosition] = useState<MousePosition>(defaultMouse)

  const lastMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

  const registerSection = useCallback(
    (_id: SectionId, _ref: React.RefObject<HTMLElement>) => {
      // Deterministic calculations based on scrollProgress zones do not need DOM refs.
      // We keep the signature so we do not break any other components.
    },
    [],
  )

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollProgress = totalHeight > 0 ? Math.min(1, scrollY / totalHeight) : 0

      // Compute activeSection based on midpoint transitions
      let activeSection: SectionId = 'hero'
      if (scrollProgress < 0.25) {
        activeSection = 'hero'
      } else if (scrollProgress >= 0.25 && scrollProgress < 0.675) {
        activeSection = 'experience'
      } else if (scrollProgress >= 0.675 && scrollProgress < 0.945) {
        activeSection = 'projects'
      } else {
        activeSection = 'contact'
      }

      // Compute local progress (0 to 1) for each section zone
      const sectionProgress: ScrollState['sectionProgress'] = {
        hero:       Math.max(0, Math.min(1, scrollProgress / 0.15)),
        experience: Math.max(0, Math.min(1, (scrollProgress - 0.35) / 0.25)),
        projects:   Math.max(0, Math.min(1, (scrollProgress - 0.75) / 0.17)),
        contact:    Math.max(0, Math.min(1, (scrollProgress - 0.97) / 0.03)),
      }

      setScrollState({ scrollProgress, scrollY, sectionProgress, activeSection })
    }

    const handleMouseMove = (e: MouseEvent) => {
      const velocityX = e.clientX - lastMouseRef.current.x
      const velocityY = e.clientY - lastMouseRef.current.y
      lastMouseRef.current = { x: e.clientX, y: e.clientY }

      setMousePosition({
        x: e.clientX,
        y: e.clientY,
        normalizedX: (e.clientX / window.innerWidth) * 2 - 1,
        normalizedY: -((e.clientY / window.innerHeight) * 2 - 1),
        velocityX,
        velocityY,
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <ScrollContext.Provider value={{ scrollState, mousePosition, registerSection }}>
      {children}
    </ScrollContext.Provider>
  )
}
