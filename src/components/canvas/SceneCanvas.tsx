import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import CameraRig from './CameraRig'
import ParticleCloud from './ParticleCloud'
import NeuralMesh from './NeuralMesh'
import CoordinateGrid from './CoordinateGrid'

/**
 * Fixed, full-viewport WebGL canvas that renders the scroll-driven 3D scene.
 * pointer-events: none so the HTML DOM layer receives all interactions normally.
 */
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
        camera={{ position: [0, 0, 30], fov: 60, near: 0.1, far: 1000 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
        dpr={[1, 1.5]}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <CameraRig />
          {/* Dim ambient so particles read well against the dark background */}
          <ambientLight intensity={0.05} />
          <ParticleCloud />
          <NeuralMesh />
          <CoordinateGrid />
        </Suspense>
      </Canvas>
    </div>
  )
}
