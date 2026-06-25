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

  const registerSection = useCallback(
    (id: SectionId, ref: React.RefObject<HTMLElement>) => {
      sectionRefs.current[id] = ref
    },
    [],
  )

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight
      const scrollProgress = totalHeight > 0 ? Math.min(1, scrollY / totalHeight) : 0

      const sectionProgress: ScrollState['sectionProgress'] = {
        hero: 0,
        experience: 0,
        projects: 0,
        contact: 0,
      }

      let activeSection: SectionId = 'hero'
      const ids: SectionId[] = ['hero', 'experience', 'projects', 'contact']

      for (const id of ids) {
        const ref = sectionRefs.current[id]
        if (ref?.current) {
          const rect = ref.current.getBoundingClientRect()
          // 0 when section top is at screen-bottom; 1 when section top is at screen-top
          const progress = Math.max(
            0,
            Math.min(1, (-rect.top + window.innerHeight * 0.5) / rect.height + 0.5),
          )
          sectionProgress[id] = progress

          if (rect.top <= window.innerHeight * 0.55 && rect.bottom > 0) {
            activeSection = id
          }
        }
      }

      setScrollState({ scrollProgress, scrollY, sectionProgress, activeSection })
    }

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
        normalizedX: (e.clientX / window.innerWidth) * 2 - 1,
        normalizedY: -((e.clientY / window.innerHeight) * 2 - 1),
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
