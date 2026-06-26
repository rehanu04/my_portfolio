// ─────────────────────────────────────────────────────────────────────────────
// src/components/canvas/CameraRig.tsx
//
// Ultra Vegito Multi-Axis Orbital Camera Rig
//
// ┌────────────────────────────────────────────────────────────────────────┐
// │  4 cinematic section waypoints + 3 inter-section flight waypoints      │
// │  Camera always arrives 15 units in front of each section panel         │
// │  Catmull-Rom Hermite spline for smooth non-linear orbital paths         │
// │  Critically-damped spring physics (FPS-independent)                     │
// │  Mouse parallax persists 30% influence throughout full scroll           │
// └────────────────────────────────────────────────────────────────────────┘
//
// Section world positions (from SpatialLayout):
//   Command Deck:    [0,  0,   0]
//   System Arch Log: [8, -4, -35]
//   Master Vault:    [-8, -8, -70]
//   Secure Uplink:   [4, -12, -105]
//
// Matching camera waypoints (15 units forward on Z from each section):
//   WP[0] Hero:    pos=[0,  0,  15] look=[0,  0,   0]
//   WP[2] ArchLog: pos=[8, -4, -20] look=[8, -4, -35]
//   WP[4] Vault:   pos=[-8,-8, -55] look=[-8,-8, -70]
//   WP[6] Uplink:  pos=[4,-12, -90] look=[4,-12,-105]
//
// Inter-section flight arcs (WP[1], WP[3], WP[5]) sweep dramatically
// off-axis to sell the sense of traversing 3D space.
// ─────────────────────────────────────────────────────────────────────────────

import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useScrollContext } from '../../context/ScrollContext'

// ─── Waypoint Definition ─────────────────────────────────────────────────────

interface Waypoint {
  pos:    THREE.Vector3
  target: THREE.Vector3
}

const WP: Waypoint[] = [
  // 0.00 — Command Deck: dead-on, 15 units out, looking at [0,0,0]
  { pos: new THREE.Vector3( 0,   0,  15), target: new THREE.Vector3(  0,   0,   0) },

  // 0.16 — Cinematic fly-through arc to Arch Log: barrel right and pull back
  { pos: new THREE.Vector3(14,  -2,  -2), target: new THREE.Vector3(  8,  -3, -15) },

  // 0.33 — System Arch Log locked: 15 units out, facing [8,-4,-35]
  { pos: new THREE.Vector3( 8,  -4, -20), target: new THREE.Vector3(  8,  -4, -35) },

  // 0.50 — Cinematic arc to Vault: sweep hard left and dive
  { pos: new THREE.Vector3(-4, -6,  -42), target: new THREE.Vector3( -6,  -7, -55) },

  // 0.66 — Master Vault locked: 15 units out, facing [-8,-8,-70]
  { pos: new THREE.Vector3(-8,  -8, -55), target: new THREE.Vector3( -8,  -8, -70) },

  // 0.83 — Cinematic arc to Uplink: sweep right and continue descent
  { pos: new THREE.Vector3( 6, -10, -77), target: new THREE.Vector3(  4, -11, -90) },

  // 1.00 — Secure Uplink locked: 15 units out, facing [4,-12,-105]
  { pos: new THREE.Vector3( 4, -12, -90), target: new THREE.Vector3(  4, -12,-105) },
]

// ─── Catmull-Rom Hermite interpolation ───────────────────────────────────────

function catmullRom(
  out: THREE.Vector3,
  p0:  THREE.Vector3,
  p1:  THREE.Vector3,
  p2:  THREE.Vector3,
  p3:  THREE.Vector3,
  t:   number,
): void {
  const tau = 0.5
  const t2  = t * t
  const t3  = t2 * t
  const h00 =  2 * t3 - 3 * t2 + 1
  const h10 =      t3 - 2 * t2 + t
  const h01 = -2 * t3 + 3 * t2
  const h11 =      t3 -     t2
  const m0  = p2.clone().sub(p0).multiplyScalar(tau)
  const m1  = p3.clone().sub(p1).multiplyScalar(tau)

  out
    .copy(p1)            .multiplyScalar(h00)
    .addScaledVector(m0, h10)
    .addScaledVector(p2, h01)
    .addScaledVector(m1, h11)
}

function sampleSpline(
  out:   THREE.Vector3,
  field: 'pos' | 'target',
  t:     number,
): void {
  const n   = WP.length - 1
  const raw = Math.min(t * n, n - 1e-6)
  const seg = Math.floor(raw)
  const frac = raw - seg

  const i0 = Math.max(seg - 1, 0)
  const i1  = seg
  const i2  = Math.min(seg + 1, n)
  const i3  = Math.min(seg + 2, n)

  catmullRom(out, WP[i0][field], WP[i1][field], WP[i2][field], WP[i3][field], frac)
}

// ─── Easing ───────────────────────────────────────────────────────────────────

function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CameraRig() {
  const { camera } = useThree()
  const { scrollState, mousePosition } = useScrollContext()

  const currentPos    = useRef(WP[0].pos.clone())
  const currentTarget = useRef(WP[0].target.clone())
  const desiredPos    = useRef(new THREE.Vector3())
  const desiredTarget = useRef(new THREE.Vector3())

  useFrame((_state, delta) => {
    const raw = Math.max(0, Math.min(1, scrollState.scrollProgress))
    const t   = easeInOutCubic(raw)

    // Sample Catmull-Rom spline
    sampleSpline(desiredPos.current,    'pos',    t)
    sampleSpline(desiredTarget.current, 'target', t)

    // Mouse parallax — 60% at hero, decays to 20% at deep sections
    // Kept subtle so it doesn't push the camera off-axis from the content
    const parallaxDecay  = 1 - raw * 0.65          // 1.0 → 0.35 across full scroll
    desiredPos.current.x += mousePosition.normalizedX * 1.2 * parallaxDecay
    desiredPos.current.y += mousePosition.normalizedY * 0.5 * parallaxDecay

    // Critically-damped spring: fast settle → ~80ms half-life
    const alpha = 1 - Math.pow(0.035, delta)
    currentPos.current.lerp(desiredPos.current, alpha)
    currentTarget.current.lerp(desiredTarget.current, alpha)

    camera.position.copy(currentPos.current)
    camera.lookAt(currentTarget.current)
  })

  return null
}
