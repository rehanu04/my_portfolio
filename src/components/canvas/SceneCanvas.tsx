// ─────────────────────────────────────────────────────────────────────────────
// src/components/canvas/SceneCanvas.tsx
//
// Fixed, full-viewport WebGL canvas — z-index:0, pointer-events:none.
//
// Post-Processing Pipeline:
//   1. Selective Bloom  — luminance-threshold 0.60, intensity 1.25
//      High-intensity glow on Galactic Cyan emissive surfaces
//   2. Chromatic Aberration — scroll-dynamic offset: larger at hero + contact
//   3. Vignette           — soft darkening toward corners, focus on centre
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
import LorenzField from './ParticleCloud'
import NeuralMesh from './NeuralMesh'
import CoordinateGrid from './CoordinateGrid'
import { useScrollContext } from '../../context/ScrollContext'

// ─── Dynamic Post-Processing ─────────────────────────────────────────────────
// Chromatic aberration offset grows at scroll extremes (hero + contact).
// This inner component reads scroll so it can mutate the effect uniforms
// inside the R3F render loop.

function DynamicPostProcessing() {
  const { scrollState } = useScrollContext()
  const caRef = useRef<{ offset: Vector2 }>(null)

  useFrame(() => {
    if (!caRef.current) return
    const p = scrollState.scrollProgress
    // Bell-curve: max at edges (hero & contact), minimum in the middle
    const edgeness = Math.max(0, 1 - Math.abs(p - 0.5) * 2.8)
    // Swap so EDGES are high, centre is low
    const centerEdge = 1 - edgeness
    const caStrength = 0.0004 + centerEdge * 0.0012
    caRef.current.offset.set(caStrength, caStrength)
  })

  return (
    <EffectComposer>
      {/* ── Selective Bloom ────────────────────────────────────────────── */}
      <Bloom
        luminanceThreshold={0.60}
        luminanceSmoothing={0.06}
        intensity={1.25}
        blendFunction={BlendFunction.ADD}
      />

      {/* ── Chromatic Aberration (scroll-dynamic) ────────────────────── */}
      <ChromaticAberration
        // @ts-expect-error – ref forwarding is supported but not typed in this version
        ref={caRef}
        blendFunction={BlendFunction.NORMAL}
        offset={new Vector2(0.0008, 0.0008)}
        radialModulation={false}
        modulationOffset={0.12}
      />

      {/* ── Vignette ─────────────────────────────────────────────────── */}
      <Vignette
        eskil={false}
        offset={0.28}
        darkness={0.75}
        blendFunction={BlendFunction.NORMAL}
      />

      {/* ── Film Grain ────────────────────────────────────────────────── */}
      <Noise
        premultiply
        blendFunction={BlendFunction.SOFT_LIGHT}
        opacity={0.18}
      />
    </EffectComposer>
  )
}

// ─── Main Canvas ─────────────────────────────────────────────────────────────

export default function SceneCanvas() {
  return (
    <div
      style={{
        position:      'fixed',
        inset:         0,
        zIndex:        0,
        pointerEvents: 'none',
      }}
    >
      <Canvas
        camera={{ position: [0, 3, 28], fov: 58, near: 0.1, far: 800 }}
        gl={{
          antialias:           true,
          alpha:               true,
          powerPreference:     'high-performance',
          toneMapping:         THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
        dpr={[1, 1.5]}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <CameraRig />

          {/* Minimal ambient — scene reads cleanly against dark page */}
          <ambientLight intensity={0.04} />

          {/* Dual-layer Lorenz attractor — speed-coloured, focal-warp */}
          <LorenzField />

          {/* Wave-displaced morphing sphere — deep-field spatial persistence */}
          <NeuralMesh />

          {/* Galactic Cyan coordinate grid — always-on, swells in contact */}
          <CoordinateGrid />

          {/* ── Cinematic Post-Processing ────────────────────────────── */}
          <DynamicPostProcessing />
        </Suspense>
      </Canvas>
    </div>
  )
}
