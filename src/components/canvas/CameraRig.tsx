import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useScrollContext } from '../../context/ScrollContext'
import type { CameraKeyframe } from '../../types'

// ─── Keyframes ─────────────────────────────────────────────────────────────
// Each keyframe defines where the camera sits for each section boundary.
// Scroll progress 0 → 0.25 → 0.50 → 0.75 → 1.0

const KF: Record<string, CameraKeyframe> = {
  hero: {
    position: [0, 0, 30],
    target: [0, 0, 0],
  },
  experience: {
    position: [0, -1, 6],
    target: [0, -1, 0],
  },
  projects: {
    position: [10, 1, 20],
    target: [0, 0, 0],
  },
  contact: {
    position: [0, -5, 26],
    target: [0, -5, 0],
  },
}

function makeVec(t: readonly [number, number, number]): THREE.Vector3 {
  return new THREE.Vector3(...t)
}

function lerpV3(
  out: THREE.Vector3,
  a: THREE.Vector3,
  b: THREE.Vector3,
  t: number,
): void {
  out.lerpVectors(a, b, t)
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function CameraRig() {
  const { camera } = useThree()
  const { scrollState, mousePosition } = useScrollContext()

  const currentPos = useRef(makeVec(KF.hero.position))
  const currentTarget = useRef(makeVec(KF.hero.target))
  const desiredPos = useRef(makeVec(KF.hero.position))
  const desiredTarget = useRef(makeVec(KF.hero.target))

  useFrame((_state, delta) => {
    const { scrollProgress } = scrollState

    // ── Map scroll → camera target position ────────────────────────────────
    if (scrollProgress <= 0.25) {
      const t = scrollProgress / 0.25
      lerpV3(desiredPos.current, makeVec(KF.hero.position), makeVec(KF.experience.position), t)
      lerpV3(desiredTarget.current, makeVec(KF.hero.target), makeVec(KF.experience.target), t)
    } else if (scrollProgress <= 0.5) {
      const t = (scrollProgress - 0.25) / 0.25
      lerpV3(desiredPos.current, makeVec(KF.experience.position), makeVec(KF.projects.position), t)
      lerpV3(desiredTarget.current, makeVec(KF.experience.target), makeVec(KF.projects.target), t)
    } else if (scrollProgress <= 0.75) {
      const t = (scrollProgress - 0.5) / 0.25
      lerpV3(desiredPos.current, makeVec(KF.projects.position), makeVec(KF.contact.position), t)
      lerpV3(desiredTarget.current, makeVec(KF.projects.target), makeVec(KF.contact.target), t)
    } else {
      desiredPos.current.copy(makeVec(KF.contact.position))
      desiredTarget.current.copy(makeVec(KF.contact.target))
    }

    // ── Hero mouse parallax (fades out as user scrolls) ────────────────────
    const heroInfluence = Math.max(0, 1 - scrollProgress * 5)
    desiredPos.current.x += mousePosition.normalizedX * 2.5 * heroInfluence
    desiredPos.current.y += mousePosition.normalizedY * 1.2 * heroInfluence

    // ── Frame-rate-independent lerp ────────────────────────────────────────
    // alpha = 1 - (1 - targetAlpha)^(delta * 60)  → same feel at any FPS
    const alpha = 1 - Math.pow(0.04, delta)
    currentPos.current.lerp(desiredPos.current, alpha)
    currentTarget.current.lerp(desiredTarget.current, alpha)

    camera.position.copy(currentPos.current)
    camera.lookAt(currentTarget.current)
  })

  return null
}
