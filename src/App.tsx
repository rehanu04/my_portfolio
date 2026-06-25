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
import Navigation from './components/ui/Navigation'
import GravWellCursor from './components/ui/GravWellCursor'
import CommandDeck from './components/sections/CommandDeck'
import SystemArchLog from './components/sections/SystemArchLog'
import MasterVault from './components/sections/MasterVault'
import SecureUplink from './components/sections/SecureUplink'
import { ScrollProvider } from './context/ScrollContext'
import { CursorProvider } from './context/CursorContext'

export default function App() {
  return (
    <CursorProvider>
      <ScrollProvider>
        {/* Magnetic grav-well cursor — overlays entire viewport */}
        <GravWellCursor />

        {/* Fixed WebGL canvas — floats behind all DOM content */}
        <SceneCanvas />

        {/* Scrollable HTML layer — pointer events fully active */}
        <div className="relative z-10">
          <Navigation />
          <main>
            <CommandDeck />
            <SystemArchLog />
            <MasterVault />
            <SecureUplink />
          </main>
        </div>
      </ScrollProvider>
    </CursorProvider>
  )
}
