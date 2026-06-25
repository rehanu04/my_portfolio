// ─────────────────────────────────────────────────────────────────────────────
// src/App.tsx
//
// Root application shell.
//   • CursorProvider wraps everything for DOM↔WebGL focal-point broadcast
//   • GravWellCursor mounted at root level (z-index 9999, pointer-events:none)
//   • ScrollProvider drives all scroll telemetry
//   • SceneCanvas fixed WebGL layer at z-index 0
//   • HTML sections fully layered above
// ─────────────────────────────────────────────────────────────────────────────

import SceneCanvas from './components/canvas/SceneCanvas'
import SpatialLayout from './components/canvas/SpatialLayout'
import Navigation from './components/ui/Navigation'
import GravWellCursor from './components/ui/GravWellCursor'
import { ScrollProvider } from './context/ScrollContext'
import { CursorProvider } from './context/CursorContext'

export default function App() {
  return (
    <CursorProvider>
      <ScrollProvider>
        {/* Magnetic grav-well cursor — overlays entire viewport */}
        <GravWellCursor />

        {/* Fixed WebGL canvas — floats behind all DOM content */}
        <SceneCanvas>
          <SpatialLayout />
        </SceneCanvas>

        {/* Navigation HUD */}
        <div className="relative z-50">
          <Navigation />
        </div>

        {/* Dummy scroll container to drive ScrollContext (5 sections * 100vh = 500vh) */}
        <div style={{ height: '500vh', width: '100%', position: 'absolute', top: 0, zIndex: 1, pointerEvents: 'none' }} />
      </ScrollProvider>
    </CursorProvider>
  )
}
