import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { Vector2 } from 'three'
import * as THREE from 'three'
import CameraRig from './CameraRig'
import LorenzField from './ParticleCloud'
import NeuralMesh from './NeuralMesh'
import CoordinateGrid from './CoordinateGrid'

/**
 * Fixed, full-viewport WebGL canvas.
 * Layer z-index: 0 (behind all HTML content).
 * pointer-events: none — DOM receives all interactions.
 *
 * Post-processing pipeline (R3F v8 compatible):
 *   • Selective Bloom on Galactic Cyan emissive surfaces
 *   • Low-frequency Chromatic Aberration toward viewport bounds
 *   • Cinematic Vignette
 */
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
        camera={{ position: [0, 2.5, 26], fov: 58, near: 0.1, far: 600 }}
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

          {/* Minimal ambient so scene reads against the dark page */}
          <ambientLight intensity={0.04} />

          {/* Lorenz attractor — atmospheric, additive, low opacity */}
          <LorenzField />

          {/* Wave-displaced morphing sphere — deep field */}
          <NeuralMesh />

          {/* Galactic-cyan coordinate grid — fades in on contact section */}
          <CoordinateGrid />

          {/* ── Post-Processing Pipeline ─────────────────────────────────── */}
          <EffectComposer>
            {/* Selective Bloom: luminance threshold set high so only pure
                Galactic Cyan (#00F5FF) emissive glows — nothing else blooms */}
            <Bloom
              luminanceThreshold={0.72}
              luminanceSmoothing={0.08}
              intensity={0.90}
              blendFunction={BlendFunction.ADD}
            />

            {/* Chromatic Aberration: very subtle offset toward edges.
                Gives cinematic lens-distortion without artefact noise. */}
            <ChromaticAberration
              blendFunction={BlendFunction.NORMAL}
              offset={new Vector2(0.0006, 0.0006)}
              radialModulation={false}
              modulationOffset={0.15}
            />

            {/* Vignette: soft darkening toward corners — focuses gaze
                toward the centre where text lives */}
            <Vignette
              eskil={false}
              offset={0.30}
              darkness={0.72}
              blendFunction={BlendFunction.NORMAL}
            />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  )
}
