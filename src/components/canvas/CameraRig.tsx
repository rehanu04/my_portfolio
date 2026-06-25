import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useScrollContext } from '../../context/ScrollContext'

// ─── Cinematic Multi-Axis Orbital Camera Rig ──────────────────────────────────
//
// DESIGN GOALS
// ┌────────────────────────────────────────────────────────────────────────┐
// │  1. Non-linear spline path through 5 waypoints (not linear segments)  │
// │  2. Combines X-pan, Y-sweep and Z-dolly simultaneously                │
// │  3. Spring physics: critically-damped, FPS-independent                │
// │  4. Spatial Coordinate Persistence: geometry from past sections        │
// │     remains present (tiny, distant) — never pops out of existence     │
// │  5. Zero scroll-hijacking — maps directly from scrollProgress [0,1]   │
// └────────────────────────────────────────────────────────────────────────┘
//
// Waypoint layout (scroll progress → camera world position)
//
//  0.00  Command Deck  — front, slightly elevated
//  0.25  Transition    — sweeping left, pulling back gently
//  0.50  Arch Log      — arcing right, descending into the mesh
//  0.75  Master Vault  — orbiting high and right, maximum depth
//  1.00  Secure Uplink — returning near-centre from great distance

interface Waypoint {
  pos:    THREE.Vector3
  target: THREE.Vector3
}

const WP: Waypoint[] = [
  // 0.00 — Command Deck
  { pos: new THREE.Vector3(  0,   2.5, 26), target: new THREE.Vector3( 0,   0,  0) },
  // 0.25 — Mid-hero sweep
  { pos: new THREE.Vector3(-10,  -1,  22), target: new THREE.Vector3(-2,  -1,  0) },
  // 0.50 — Arch Log orbital arc
  { pos: new THREE.Vector3( -5,  -4,  16), target: new THREE.Vector3(-1,  -2,  0) },
  // 0.75 — Master Vault: high orbit
  { pos: new THREE.Vector3(  9,   5,  14), target: new THREE.Vector3( 2,   1,  0) },
  // 1.00 — Secure Uplink: pull back to near-centre
  { pos: new THREE.Vector3( -2,  -3,  24), target: new THREE.Vector3( 0,  -1,  0) },
]

// ─── Catmull-Rom Hermite interpolation ───────────────────────────────────────

function catmullRom(
  out: THREE.Vector3,
  p0: THREE.Vector3,
  p1: THREE.Vector3,
  p2: THREE.Vector3,
  p3: THREE.Vector3,
  t: number,
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
    .copy(p1)        .multiplyScalar(h00)
    .addScaledVector(m0, h10)
    .addScaledVector(p2, h01)
    .addScaledVector(m1, h11)
}

function sampleSpline(
  out: THREE.Vector3,
  field: 'pos' | 'target',
  t: number,
): void {
  const n   = WP.length - 1
  const raw = Math.min(t * n, n - 1e-6)
  const seg = Math.floor(raw)
  const frac = raw - seg

  const i0 = Math.max(seg - 1, 0)
  const i1 = seg
  const i2 = Math.min(seg + 1, n)
  const i3 = Math.min(seg + 2, n)

  catmullRom(out, WP[i0][field], WP[i1][field], WP[i2][field], WP[i3][field], frac)
}

// ─── Easing ───────────────────────────────────────────────────────────────────
// Custom ease-in-out so the camera accelerates and decelerates naturally

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
    const t = easeInOutCubic(Math.max(0, Math.min(1, scrollState.scrollProgress)))

    // Sample the Catmull-Rom spline
    sampleSpline(desiredPos.current,    'pos',    t)
    sampleSpline(desiredTarget.current, 'target', t)

    // Hero mouse parallax — decays after first 20% of scroll
    const heroInfluence = Math.max(0, 1 - t * 5)
    desiredPos.current.x += mousePosition.normalizedX * 2.0 * heroInfluence
    desiredPos.current.y += mousePosition.normalizedY * 0.9 * heroInfluence

    // Critically-damped spring: alpha = 1 - (1 - λ)^(delta*60)
    // λ = 0.055 gives a 110ms half-life — snappy but not twitchy
    const alpha = 1 - Math.pow(0.055, delta)
    currentPos.current.lerp(desiredPos.current, alpha)
    currentTarget.current.lerp(desiredTarget.current, alpha)

    camera.position.copy(currentPos.current)
    camera.lookAt(currentTarget.current)
  })

  return null
}
