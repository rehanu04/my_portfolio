// ─────────────────────────────────────────────────────────────────────────────
// src/context/ScrollContext.tsx
//
// Passive scroll + mouse telemetry provider.
// Updated to include velocity tracking on mouse position.
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

// ─── Provider ──────────────────────────────────────────────────────────────

export function ScrollProvider({ children }: { children: React.ReactNode }) {
  const [scrollState, setScrollState] = useState<ScrollState>(defaultScrollState)
  const [mousePosition, setMousePosition] = useState<MousePosition>(defaultMouse)

  // Map of section id → DOM ref, populated lazily via registerSection
  const sectionRefs = useRef<Partial<Record<SectionId, React.RefObject<HTMLElement>>>>({})
  // Track last mouse position for velocity
  const lastMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

  const registerSection = useCallback(
    (id: SectionId, ref: React.RefObject<HTMLElement>) => {
      sectionRefs.current[id] = ref
    },
    [],
  )

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      const rawProgress = totalHeight > 0 ? Math.min(1, scrollY / totalHeight) : 0

      // Map raw scroll to camera flight path and section timelines
      let cameraProgress = 0
      let activeSection: SectionId = 'hero'
      const sectionProgress: ScrollState['sectionProgress'] = {
        hero: 0,
        experience: 0,
        projects: 0,
        contact: 0,
      }

      if (rawProgress < 0.15) {
        // Zone 1: Locked on Command Deck
        cameraProgress = 0.0
        activeSection = 'hero'
        sectionProgress.hero = rawProgress / 0.15
      } else if (rawProgress < 0.30) {
        // Flight: Hero -> Arch Log
        const t = (rawProgress - 0.15) / 0.15
        cameraProgress = t * 0.33
        activeSection = 'experience'
      } else if (rawProgress < 0.45) {
        // Zone 2: Locked on System Arch Log
        cameraProgress = 0.33
        activeSection = 'experience'
        sectionProgress.experience = (rawProgress - 0.30) / 0.15
      } else if (rawProgress < 0.60) {
        // Flight: Arch Log -> Vault
        const t = (rawProgress - 0.45) / 0.15
        cameraProgress = 0.33 + t * 0.33
        activeSection = 'projects'
      } else if (rawProgress < 0.75) {
        // Zone 3: Locked on Master Vault
        cameraProgress = 0.66
        activeSection = 'projects'
        sectionProgress.projects = (rawProgress - 0.60) / 0.15
      } else if (rawProgress < 0.90) {
        // Flight: Vault -> Uplink
        const t = (rawProgress - 0.75) / 0.15
        cameraProgress = 0.66 + t * 0.34
        activeSection = 'contact'
      } else {
        // Zone 4: Locked on Secure Uplink
        cameraProgress = 1.0
        activeSection = 'contact'
        sectionProgress.contact = Math.min(1, (rawProgress - 0.90) / 0.10)
      }

      setScrollState({
        scrollProgress: cameraProgress, // Pass camera flight to standard scrollProgress
        scrollY,
        sectionProgress,
        activeSection,
      })
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
    handleScroll() // seed initial state

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
