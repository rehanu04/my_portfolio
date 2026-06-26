// ─────────────────────────────────────────────────────────────────────────────
// src/components/canvas/CameraRig.tsx
//
// Ambient atmospheric camera — drives parallax on the background EnergyField
// and CoordinateGrid. It does NOT need to aim at specific section coordinates
// since sections are now normal DOM elements.
//
// Behaviour:
//   • As user scrolls the page, camera slowly drifts left/right/depth to
//     create a sense of moving through a 3D environment.
//   • Mouse position adds subtle parallax on top.
//   • Camera always looks roughly forward (+Z) so the background
//     feels immersive without ever obstructing the DOM content.
// ─────────────────────────────────────────────────────────────────────────────

import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useScrollContext } from '../../context/ScrollContext'

// Ambient parallax keyframes keyed to scroll progress 0→1
// Camera gently drifts through a curved path in the background plane
const DRIFT: { t: number; x: number; y: number; z: number }[] = [
  { t: 0.00, x:  0.0, y:  0.0, z: 18 },
  { t: 0.25, x:  3.0, y: -1.5, z: 16 },
  { t: 0.50, x: -2.0, y: -3.0, z: 14 },
  { t: 0.75, x:  4.0, y: -4.5, z: 12 },
  { t: 1.00, x:  0.0, y: -6.0, z: 10 },
]

function lerpDrift(progress: number): THREE.Vector3 {
  const n = DRIFT.length - 1
  const raw = Math.min(progress * n, n - 1e-6)
  const seg = Math.floor(raw)
  const f   = raw - seg
  const a   = DRIFT[seg]
  const b   = DRIFT[Math.min(seg + 1, n)]
  return new THREE.Vector3(
    a.x + (b.x - a.x) * f,
    a.y + (b.y - a.y) * f,
    a.z + (b.z - a.z) * f,
  )
}

export default function CameraRig() {
  const { camera } = useThree()
  const { scrollState, mousePosition } = useScrollContext()

  const currentPos = useRef(new THREE.Vector3(0, 0, 18))

  useFrame((_state, delta) => {
    const raw = Math.max(0, Math.min(1, scrollState.scrollProgress))

    // Ambient drift target
    const target = lerpDrift(raw)

    // Add gentle mouse parallax
    target.x += mousePosition.normalizedX * 1.5
    target.y += mousePosition.normalizedY * 0.7

    // Smooth damped spring
    const alpha = 1 - Math.pow(0.04, delta)
    currentPos.current.lerp(target, alpha)

    camera.position.copy(currentPos.current)
    // Always look forward into the scene, slightly angled toward origin
    camera.lookAt(
      currentPos.current.x * 0.2,
      currentPos.current.y * 0.2,
      0,
    )
  })

  return null
}
