import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useScrollContext } from '../../context/ScrollContext'

// ─── Orbital Flight Path ────────────────────────────────────────────────────
// Instead of simple Z-linear keyframes we define a continuous cubic Hermite
// spline through four spatial waypoints. The camera orbits in X, sweeps in Y,
// and retreats along Z simultaneously, creating a cinematic multi-axis flight.
//
// SPATIAL COORDINATE PERSISTENCE: all waypoints are kept at large Z distances
// so geometry from earlier sections remains visible (small, distant) in the
// background as the camera flies away — never abruptly disappearing.

interface Waypoint {
  pos: THREE.Vector3
  target: THREE.Vector3
}

// Waypoints ordered by scroll progress 0 → 0.33 → 0.66 → 1.0
const WAYPOINTS: Waypoint[] = [
  // 0.00 — Command Deck: front-centre, slightly elevated
  {
    pos:    new THREE.Vector3(0,   2, 28),
    target: new THREE.Vector3(0,   0,  0),
  },
  // 0.33 — System Arch Log: camera sweeps left + pulls back on Y
  {
    pos:    new THREE.Vector3(-9, -2, 20),
    target: new THREE.Vector3(-2, -1,  0),
  },
  // 0.66 — Master Vault: arc right, ascend, more distant
  {
    pos:    new THREE.Vector3(8,   4, 14),
    target: new THREE.Vector3(2,   1,  0),
  },
  // 1.00 — Secure Uplink: sweep back to near-centre, descend, pull far
  {
    pos:    new THREE.Vector3(-3, -4, 22),
    target: new THREE.Vector3(0,  -2,  0),
  },
]

// ─── Hermite Interpolation ─────────────────────────────────────────────────
// Smooth cubic interpolation between two waypoints using their neighbours as
// tangent guides — creates a "camera on a rail" feel with smooth acceleration.

function hermiteV3(
  out: THREE.Vector3,
  p0: THREE.Vector3,
  p1: THREE.Vector3,
  p2: THREE.Vector3,
  p3: THREE.Vector3,
  t: number,
): void {
  // Catmull-Rom tangent factor
  const tau = 0.5
  const t2  = t * t
  const t3  = t2 * t

  // Basis coefficients
  const h00 =  2 * t3 - 3 * t2 + 1
  const h10 =      t3 - 2 * t2 + t
  const h01 = -2 * t3 + 3 * t2
  const h11 =      t3 -     t2

  // Tangents from Catmull-Rom formula
  const m0 = p2.clone().sub(p0).multiplyScalar(tau)
  const m1 = p3.clone().sub(p1).multiplyScalar(tau)

  out
    .copy(p1)
    .multiplyScalar(h00)
    .addScaledVector(m0, h10)
    .addScaledVector(p2, h01)
    .addScaledVector(m1, h11)
}

function samplePath(out: THREE.Vector3, field: 'pos' | 'target', t: number): void {
  const n    = WAYPOINTS.length - 1
  const seg  = Math.min(Math.floor(t * n), n - 1)
  const frac = t * n - seg

  const i0 = Math.max(seg - 1, 0)
  const i1 = seg
  const i2 = Math.min(seg + 1, n)
  const i3 = Math.min(seg + 2, n)

  hermiteV3(
    out,
    WAYPOINTS[i0][field],
    WAYPOINTS[i1][field],
    WAYPOINTS[i2][field],
    WAYPOINTS[i3][field],
    frac,
  )
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function CameraRig() {
  const { camera } = useThree()
  const { scrollState, mousePosition } = useScrollContext()

  // Spring state — separate smoothed position and look-target
  const currentPos    = useRef(WAYPOINTS[0].pos.clone())
  const currentTarget = useRef(WAYPOINTS[0].target.clone())

  const desiredPos    = useRef(new THREE.Vector3())
  const desiredTarget = useRef(new THREE.Vector3())

  useFrame((_state, delta) => {
    const { scrollProgress } = scrollState
    const t = Math.max(0, Math.min(1, scrollProgress))

    // ── Sample the orbital spline at current scroll t ──────────────────────
    samplePath(desiredPos.current,    'pos',    t)
    samplePath(desiredTarget.current, 'target', t)

    // ── Hero mouse parallax (decays after first 20 % of page) ─────────────
    const heroInf = Math.max(0, 1 - t * 5)
    desiredPos.current.x += mousePosition.normalizedX * 2.2 * heroInf
    desiredPos.current.y += mousePosition.normalizedY * 1.0 * heroInf

    // ── Frame-rate-independent spring (critically-damped feel) ────────────
    // alpha = 1 - (1 - 0.05)^(delta * 60) → ~5 % per frame at 60 fps
    const alpha = 1 - Math.pow(0.05, delta)
    currentPos.current.lerp(desiredPos.current, alpha)
    currentTarget.current.lerp(desiredTarget.current, alpha)

    camera.position.copy(currentPos.current)
    camera.lookAt(currentTarget.current)
  })

  return null
}
