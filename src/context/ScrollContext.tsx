// ─────────────────────────────────────────────────────────────────────────────
// src/context/ScrollContext.tsx
//
// Master Timeline Scroll Engine
//
// Maps raw window.scrollY into a tiered zone system:
//   • Section Zones  → camera LOCKED at section waypoint; sectionProgress
//     drives internal content animation (Y-translate within the Html node).
//   • Flight Zones   → camera interpolates between waypoints along spline.
//
// Total scroll height: 1000vh (App.tsx spacer).
// Zone map (in raw 0→1 progress):
//   0.00 – 0.12  Hero lock          (sectionProgress.hero    0→1)
//   0.12 – 0.22  Flight 1: Hero→Log (camera 0.00→0.33)
//   0.22 – 0.44  Arch Log lock      (sectionProgress.experience 0→1)
//   0.44 – 0.54  Flight 2: Log→Vault (camera 0.33→0.66)
//   0.54 – 0.76  Vault lock         (sectionProgress.projects 0→1)
//   0.76 – 0.86  Flight 3: Vault→Uplink (camera 0.66→1.00)
//   0.86 – 1.00  Uplink lock        (sectionProgress.contact 0→1)
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

// ─── Zone Boundaries ───────────────────────────────────────────────────────
// Keep these in one place so Navigation.tsx can reference them too.

export const SCROLL_ZONES = {
  HERO_LOCK_START:    0.00,
  HERO_LOCK_END:      0.12,
  FLIGHT_1_END:       0.22,  // camera arrives at Arch Log
  ARCH_LOCK_END:      0.44,
  FLIGHT_2_END:       0.54,  // camera arrives at Vault
  VAULT_LOCK_END:     0.76,
  FLIGHT_3_END:       0.86,  // camera arrives at Uplink
  UPLINK_LOCK_END:    1.00,
} as const

// ─── Provider ──────────────────────────────────────────────────────────────

export function ScrollProvider({ children }: { children: React.ReactNode }) {
  const [scrollState, setScrollState] = useState<ScrollState>(defaultScrollState)
  const [mousePosition, setMousePosition] = useState<MousePosition>(defaultMouse)

  const sectionRefs = useRef<Partial<Record<SectionId, React.RefObject<HTMLElement>>>>({})
  const lastMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

  const registerSection = useCallback(
    (id: SectionId, ref: React.RefObject<HTMLElement>) => {
      sectionRefs.current[id] = ref
    },
    [],
  )

  useEffect(() => {
    const Z = SCROLL_ZONES

    const handleScroll = () => {
      const scrollY = window.scrollY
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      const raw = totalHeight > 0 ? Math.min(1, scrollY / totalHeight) : 0

      let cameraProgress = 0
      let activeSection: SectionId = 'hero'
      const sectionProgress: ScrollState['sectionProgress'] = {
        hero: 0, experience: 0, projects: 0, contact: 0,
      }

      // ── Zone 1: Command Deck locked ──────────────────────────────────────
      if (raw < Z.HERO_LOCK_END) {
        cameraProgress = 0.0
        activeSection = 'hero'
        sectionProgress.hero = raw / Z.HERO_LOCK_END

      // ── Flight 1: Hero → Arch Log ─────────────────────────────────────────
      } else if (raw < Z.FLIGHT_1_END) {
        const t = (raw - Z.HERO_LOCK_END) / (Z.FLIGHT_1_END - Z.HERO_LOCK_END)
        cameraProgress = t * 0.33
        activeSection = 'experience'
        sectionProgress.experience = 0

      // ── Zone 2: System Arch Log locked ───────────────────────────────────
      } else if (raw < Z.ARCH_LOCK_END) {
        cameraProgress = 0.33
        activeSection = 'experience'
        sectionProgress.experience = (raw - Z.FLIGHT_1_END) / (Z.ARCH_LOCK_END - Z.FLIGHT_1_END)

      // ── Flight 2: Arch Log → Vault ────────────────────────────────────────
      } else if (raw < Z.FLIGHT_2_END) {
        const t = (raw - Z.ARCH_LOCK_END) / (Z.FLIGHT_2_END - Z.ARCH_LOCK_END)
        cameraProgress = 0.33 + t * 0.33
        activeSection = 'projects'
        sectionProgress.projects = 0

      // ── Zone 3: Master Vault locked ───────────────────────────────────────
      } else if (raw < Z.VAULT_LOCK_END) {
        cameraProgress = 0.66
        activeSection = 'projects'
        sectionProgress.projects = (raw - Z.FLIGHT_2_END) / (Z.VAULT_LOCK_END - Z.FLIGHT_2_END)

      // ── Flight 3: Vault → Uplink ──────────────────────────────────────────
      } else if (raw < Z.FLIGHT_3_END) {
        const t = (raw - Z.VAULT_LOCK_END) / (Z.FLIGHT_3_END - Z.VAULT_LOCK_END)
        cameraProgress = 0.66 + t * 0.34
        activeSection = 'contact'
        sectionProgress.contact = 0

      // ── Zone 4: Secure Uplink locked ──────────────────────────────────────
      } else {
        cameraProgress = 1.0
        activeSection = 'contact'
        sectionProgress.contact = Math.min(1, (raw - Z.FLIGHT_3_END) / (Z.UPLINK_LOCK_END - Z.FLIGHT_3_END))
      }

      setScrollState({ scrollProgress: cameraProgress, scrollY, sectionProgress, activeSection })
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
