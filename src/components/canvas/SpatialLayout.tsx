// ─────────────────────────────────────────────────────────────────────────────
// src/components/canvas/SpatialLayout.tsx
//
// Section coordinate layout inside the WebGL scene.
//
// KEY READABILITY PRINCIPLE:
//   distanceFactor controls how the HTML panel scales as the camera moves.
//   When camera is at the paired waypoint (15 units away from section), the
//   panel renders at exactly 1200px viewport width — fully legible, flat, clean.
//
// Sections are brought close enough together that past sections are visible
// as small glowing orbs in the far distance while the current one fills the
// viewport, creating spatial depth without microscopic text syndrome.
//
// Coordinate map:
//   Command Deck        [0,  0,   0]   — origin, camera at z=15
//   System Arch Log     [8, -4, -35]   — right+down, camera at z=-20
//   Master Vault        [-8, -8, -70]  — left+deep, camera at z=-55
//   Secure Uplink       [4, -12, -105] — re-centre, camera at z=-90
// ─────────────────────────────────────────────────────────────────────────────

import { Html } from '@react-three/drei'
import CommandDeck from '../sections/CommandDeck'
import SystemArchLog from '../sections/SystemArchLog'
import MasterVault from '../sections/MasterVault'
import SecureUplink from '../sections/SecureUplink'

export default function SpatialLayout() {
  return (
    <group>
      {/*
        Section 1: Command Deck — origin
        Camera sits at [0, 0, 15] → 15 units away → distanceFactor=15 → 1200px panel
      */}
      <Html
        transform
        distanceFactor={15}
        position={[0, 0, 0]}
        center
        occlude="blending"
        style={{ pointerEvents: 'auto' }}
      >
        <div style={{ width: '1200px', maxWidth: '90vw' }}>
          <CommandDeck />
        </div>
      </Html>

      {/*
        Section 2: System Architecture Log
        Drifts right (+8), descends (-4), retreats to z=-35
        Camera will sit at [8, -4, -20] — 15 units away on Z → same 1200px read
      */}
      <Html
        transform
        distanceFactor={15}
        position={[8, -4, -35]}
        center
        occlude="blending"
        style={{ pointerEvents: 'auto' }}
      >
        <div style={{ width: '1200px', maxWidth: '90vw' }}>
          <SystemArchLog />
        </div>
      </Html>

      {/*
        Section 3: Master Vault
        Sweeps left (-8), descends further (-8), retreats to z=-70
        Camera sits at [-8, -8, -55] — 15 units away on Z
      */}
      <Html
        transform
        distanceFactor={15}
        position={[-8, -8, -70]}
        center
        occlude="blending"
        style={{ pointerEvents: 'auto' }}
      >
        <div style={{ width: '1200px', maxWidth: '90vw' }}>
          <MasterVault />
        </div>
      </Html>

      {/*
        Section 4: Secure Uplink
        Re-centres (+4), deepest descent (-12), retreats to z=-105
        Camera sits at [4, -12, -90] — 15 units away on Z
      */}
      <Html
        transform
        distanceFactor={15}
        position={[4, -12, -105]}
        center
        occlude="blending"
        style={{ pointerEvents: 'auto' }}
      >
        <div style={{ width: '900px', maxWidth: '90vw' }}>
          <SecureUplink />
        </div>
      </Html>
    </group>
  )
}
