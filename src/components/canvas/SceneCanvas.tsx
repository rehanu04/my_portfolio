// ─────────────────────────────────────────────────────────────────────────────
// src/components/canvas/SceneCanvas.tsx
//
// Fixed, full-viewport WebGL canvas — pure atmosphere.
// NO HTML content rendered inside — only shaders and geometry.
//
// Post-Processing Pipeline:
//   1. Selective Bloom  — luminance-threshold 0.55, intensity 1.4
//   2. Chromatic Aberration — scroll-dynamic offset
//   3. Vignette           — soft darkening toward corners
//   4. Noise              — organic cinematic film grain
// ─────────────────────────────────────────────────────────────────────────────

import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Vignette,
  Noise,
} from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { Vector2 } from 'three'
import * as THREE from 'three'
import CameraRig from './CameraRig'
import EnergyField from './EnergyField'
import CoordinateGrid from './CoordinateGrid'
import { useScrollContext } from '../../context/ScrollContext'

// ─── Dynamic Post-Processing ─────────────────────────────────────────────────

function DynamicPostProcessing() {
  const { scrollState } = useScrollContext()
  const caRef = useRef<{ offset: Vector2 }>(null)

  useFrame(() => {
    if (!caRef.current) return
    const p = scrollState.scrollProgress
    const edgeness = Math.max(0, 1 - Math.abs(p - 0.5) * 2.8)
    const centerEdge = 1 - edgeness
    const caStrength = 0.0003 + centerEdge * 0.0008
    caRef.current.offset.set(caStrength, caStrength)
  })

  return (
    <EffectComposer>
      <Bloom
        luminanceThreshold={0.55}
        luminanceSmoothing={0.15}
        intensity={1.4}
        blendFunction={BlendFunction.ADD}
      />
      <ChromaticAberration
        // @ts-expect-error – ref forwarding supported but not typed
        ref={caRef}
        blendFunction={BlendFunction.NORMAL}
        offset={new Vector2(0.0006, 0.0006)}
        radialModulation={false}
        modulationOffset={0.12}
      />
      <Vignette
        eskil={false}
        offset={0.3}
        darkness={0.8}
        blendFunction={BlendFunction.NORMAL}
      />
      <Noise
        premultiply
        blendFunction={BlendFunction.SOFT_LIGHT}
        opacity={0.15}
      />
    </EffectComposer>
  )
}

// ─── Main Canvas ─────────────────────────────────────────────────────────────

export default function SceneCanvas() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 18], fov: 58, near: 0.1, far: 500 }}
        gl={{
          antialias:           true,
          alpha:               true,
          powerPreference:     'high-performance',
          toneMapping:         THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
        dpr={[1, 1.5]}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <CameraRig />
          <ambientLight intensity={0.04} />

          {/* God-Tier Saiyan Energy Field — atmospheric backdrop */}
          <EnergyField />

          {/* Coordinate grid — subtle, always-on */}
          <CoordinateGrid />

          {/* Cinematic post-processing */}
          <DynamicPostProcessing />
        </Suspense>
      </Canvas>
    </div>
  )
}
