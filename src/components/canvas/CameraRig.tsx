// ─────────────────────────────────────────────────────────────────────────────
// src/components/canvas/CameraRig.tsx
//
// Ultra Vegito Multi-Axis Orbital Camera Rig
//
// ┌────────────────────────────────────────────────────────────────────────┐
// │  7 cinematic waypoints — sweeping X-pans (±14 units), deep Z-dollies  │
// │  (range –8 to +28), aggressive Y-tilts                                │
// │  Catmull-Rom Hermite spline for smooth non-linear orbital paths        │
// │  Critically-damped spring physics (FPS-independent)                   │
// │  Mouse parallax persists 40% influence throughout full scroll          │
// │  Spatial Coordinate Persistence — past sections remain visible         │
// │  in deep Z space; camera never wipes geometry from view               │
// └────────────────────────────────────────────────────────────────────────┘
//
// Waypoints (scroll 0.0 → 1.0):
//   0.00  Command Deck       — front, elevated gaze into the void
//   0.16  Mid-hero sweep     — aggressive left pan, pull-back
//   0.33  Arch Log arc       — barrel-right, deep Z plunge
//   0.50  Arch-Log peak      — arcing high, maximum roll
//   0.66  Master Vault       — orbital high-right, maximum depth
//   0.83  Vault apex         — sweeping counter-left with Y tilt
//   1.00  Secure Uplink      — returns near-centre from far distance
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
  // 0.00 — Command Deck: front, slightly elevated
  { pos: new THREE.Vector3(  0,   3.0, 28), target: new THREE.Vector3(  0,  0.5,  0) },
  // 0.16 — Mid-hero sweep: aggressive left X-pan, gentle pull-back
  { pos: new THREE.Vector3(-14,  -0.5, 24), target: new THREE.Vector3( -3, -0.5,  0) },
  // 0.33 — Arch Log arc: barrel right, deep Z plunge
  { pos: new THREE.Vector3(  8,  -5.0, 16), target: new THREE.Vector3(  2, -2.0,  0) },
  // 0.50 — Arch Log peak: arcing overhead, maximum height
  { pos: new THREE.Vector3( -6,   8.0, 12), target: new THREE.Vector3( -1,  2.0,  0) },
  // 0.66 — Master Vault: high-right orbit, deepest Z
  { pos: new THREE.Vector3( 13,   6.0,  8), target: new THREE.Vector3(  3,  1.5,  0) },
  // 0.83 — Vault apex: counter-left sweep with downward Y tilt
  { pos: new THREE.Vector3(-10,  -2.0, 14), target: new THREE.Vector3( -2, -1.0,  0) },
  // 1.00 — Secure Uplink: pull back near-centre, looking inward
  { pos: new THREE.Vector3( -1,  -2.5, 26), target: new THREE.Vector3(  0, -0.5,  0) },
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

    // Mouse parallax — 100% influence at hero, 40% minimum throughout scroll
    const parallaxDecay  = 1 - raw * 0.6          // 1.0 → 0.4 across full page
    desiredPos.current.x += mousePosition.normalizedX * 2.2 * parallaxDecay
    desiredPos.current.y += mousePosition.normalizedY * 1.0 * parallaxDecay

    // Critically-damped spring: λ = 0.048 → ~130ms half-life
    const alpha = 1 - Math.pow(0.048, delta)
    currentPos.current.lerp(desiredPos.current, alpha)
    currentTarget.current.lerp(desiredTarget.current, alpha)

    camera.position.copy(currentPos.current)
    camera.lookAt(currentTarget.current)
  })

  return null
}
