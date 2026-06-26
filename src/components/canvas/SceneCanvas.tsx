// ─────────────────────────────────────────────────────────────────────────────
// src/components/canvas/SceneCanvas.tsx
//
// Fixed full-viewport WebGL atmospheric canvas.
// Pure atmosphere — StarField (3000 particles) + EnergyField (infinite grid).
// CameraRig drives ambient parallax.
// ─────────────────────────────────────────────────────────────────────────────

import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Vignette,
} from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { Vector2 } from 'three'
import * as THREE from 'three'
import CameraRig from './CameraRig'
import StarField from './StarField'
import EnergyField from './EnergyField'
import CoordinateGrid from './CoordinateGrid'
import SpatialLayout from './SpatialLayout'
import { useScrollContext } from '../../context/ScrollContext'

function DynamicPostProcessing() {
  const { scrollState } = useScrollContext()
  const caRef = useRef<{ offset: Vector2 }>(null)

  useFrame(() => {
    if (!caRef.current) return
    const p = scrollState.scrollProgress
    const caStrength = 0.0002 + p * 0.0004
    caRef.current.offset.set(caStrength, caStrength)
  })

  return (
    <EffectComposer>
      {/* Subtle bloom on the crimson star accents */}
      <Bloom
        luminanceThreshold={0.7}
        luminanceSmoothing={0.2}
        intensity={0.8}
        blendFunction={BlendFunction.ADD}
      />
      {/* Very gentle chromatic aberration — cinematic */}
      <ChromaticAberration
        // @ts-expect-error – ref forwarding supported
        ref={caRef}
        blendFunction={BlendFunction.NORMAL}
        offset={new Vector2(0.0003, 0.0003)}
        radialModulation={false}
        modulationOffset={0.15}
      />
      {/* Vignette — push focus to centre */}
      <Vignette
        eskil={false}
        offset={0.25}
        darkness={0.85}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  )
}

export default function SceneCanvas() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1, // Set zIndex to 1 to align with HUD overlays
        pointerEvents: 'auto',
      }}
    >
      <Canvas
        camera={{ position: [0, 4, 22], fov: 55, near: 0.1, far: 500 }}
        gl={{
          antialias:           true,
          alpha:               true,
          powerPreference:     'high-performance',
          toneMapping:         THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.9,
        }}
        dpr={[1, 1.5]}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <CameraRig />
          <ambientLight intensity={0.02} />
          <StarField />
          <EnergyField />
          <CoordinateGrid />
          <SpatialLayout />
          <DynamicPostProcessing />
        </Suspense>
      </Canvas>
    </div>
  )
}
