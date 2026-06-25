// ─────────────────────────────────────────────────────────────────────────────
// src/context/CursorContext.tsx
//
// Cross-layer communication channel.  DOM components (ProjectCard, CTAs)
// write a CursorFocalPoint here; the WebGL CameraRig / LorenzField read it
// to warp the shader field toward the active card's viewport position.
// ─────────────────────────────────────────────────────────────────────────────

import React, {
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react'
import type { CursorFocalPoint } from '../types'

// ─── Context shape ────────────────────────────────────────────────────────────

interface CursorContextValue {
  focalPoint: CursorFocalPoint
  setFocalPoint: (fp: CursorFocalPoint) => void
  clearFocalPoint: () => void
}

// ─── Defaults ────────────────────────────────────────────────────────────────

const DEFAULT_FOCAL: CursorFocalPoint = {
  x: 0,
  y: 0,
  targetId: null,
  isHovering: false,
}

// ─── Context ─────────────────────────────────────────────────────────────────

const CursorContext = createContext<CursorContextValue>({
  focalPoint: DEFAULT_FOCAL,
  setFocalPoint: () => undefined,
  clearFocalPoint: () => undefined,
})

export const useCursorContext = () => useContext(CursorContext)

// ─── Provider ────────────────────────────────────────────────────────────────

export function CursorProvider({ children }: { children: React.ReactNode }) {
  const [focalPoint, setFocalPointState] = useState<CursorFocalPoint>(DEFAULT_FOCAL)

  const setFocalPoint = useCallback((fp: CursorFocalPoint) => {
    setFocalPointState(fp)
  }, [])

  const clearFocalPoint = useCallback(() => {
    setFocalPointState(DEFAULT_FOCAL)
  }, [])

  return (
    <CursorContext.Provider value={{ focalPoint, setFocalPoint, clearFocalPoint }}>
      {children}
    </CursorContext.Provider>
  )
}
