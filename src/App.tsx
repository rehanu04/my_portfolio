// ─────────────────────────────────────────────────────────────────────────────
// src/App.tsx
//
// Root application shell — Definitive Architecture:
//
//   ┌─────────────────────────────────────────────────────────┐
//   │  LAYER 0 (z:0)   — SceneCanvas: Fixed WebGL background  │
//   │                    EnergyField + CoordinateGrid          │
//   │                    CameraRig drives ambient parallax     │
//   │                                                          │
//   │  LAYER 1 (z:10)  — Normal DOM scroll layout             │
//   │                    Sections stack vertically             │
//   │                    100vh each, natural browser scroll    │
//   │                    Pixel-perfect text, zero distortion   │
//   │                                                          │
//   │  LAYER 2 (z:50)  — Navigation HUD (fixed)               │
//   │  LAYER 3 (z:9999)— GravWellCursor (pointer-events:none) │
//   └─────────────────────────────────────────────────────────┘
//
// The WebGL canvas is pure ambience — it never touches content.
// ─────────────────────────────────────────────────────────────────────────────

import SceneCanvas from './components/canvas/SceneCanvas'
import Navigation from './components/ui/Navigation'
import GravWellCursor from './components/ui/GravWellCursor'
import { ScrollProvider } from './context/ScrollContext'
import { CursorProvider } from './context/CursorContext'

export default function App() {
  return (
    <CursorProvider>
      <ScrollProvider>
        {/* ── Layer 0: Fixed WebGL interactive canvas ─────────────── */}
        <SceneCanvas />

        {/* ── Layer 1: Transparent scroll spacer for telemetry ────────── */}
        <div
          style={{
            height: '800vh',
            pointerEvents: 'none',
            position: 'relative',
            zIndex: 2,
          }}
        />

        {/* ── Layer 2: Fixed navigation HUD ───────────────────────────── */}
        <Navigation />

        {/* ── Layer 3: Custom cursor overlay ──────────────────────────── */}
        <GravWellCursor />
      </ScrollProvider>
    </CursorProvider>
  )
}
