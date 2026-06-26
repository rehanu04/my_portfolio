import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useScrollContext } from '../../context/ScrollContext'

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function getCameraPath(p: number) {
  const pos = new THREE.Vector3()
  const look = new THREE.Vector3()

  if (p <= 0.15) {
    // Hero Zone
    pos.set(0, 0, 15)
    look.set(0, 0, 0)
  } else if (p > 0.15 && p < 0.35) {
    // Flight 1: Hero -> Experience
    const t = easeInOutCubic((p - 0.15) / 0.20)
    pos.x = THREE.MathUtils.lerp(0, 8, t)
    pos.y = THREE.MathUtils.lerp(0, -4, t)
    pos.z = THREE.MathUtils.lerp(15, -20, t)
    // Swoop curves
    pos.x += Math.sin(t * Math.PI) * 4
    pos.y += Math.sin(t * Math.PI) * 2

    look.x = THREE.MathUtils.lerp(0, 8, t)
    look.y = THREE.MathUtils.lerp(0, -4, t)
    look.z = THREE.MathUtils.lerp(0, -35, t)
  } else if (p >= 0.35 && p <= 0.60) {
    // Experience Zone
    pos.set(8, -4, -20)
    look.set(8, -4, -35)
  } else if (p > 0.60 && p < 0.75) {
    // Flight 2: Experience -> Projects
    const t = easeInOutCubic((p - 0.60) / 0.15)
    pos.x = THREE.MathUtils.lerp(8, -8, t)
    pos.y = THREE.MathUtils.lerp(-4, -8, t)
    pos.z = THREE.MathUtils.lerp(-20, -55, t)
    // Swoop curves
    pos.x -= Math.sin(t * Math.PI) * 4
    pos.y += Math.sin(t * Math.PI) * 3

    look.x = THREE.MathUtils.lerp(8, -8, t)
    look.y = THREE.MathUtils.lerp(-4, -8, t)
    look.z = THREE.MathUtils.lerp(-35, -70, t)
  } else if (p >= 0.75 && p <= 0.92) {
    // Projects Zone
    pos.set(-8, -8, -55)
    look.set(-8, -8, -70)
  } else if (p > 0.92 && p < 0.97) {
    // Flight 3: Projects -> Contact
    const t = easeInOutCubic((p - 0.92) / 0.05)
    pos.x = THREE.MathUtils.lerp(-8, 4, t)
    pos.y = THREE.MathUtils.lerp(-8, -12, t)
    pos.z = THREE.MathUtils.lerp(-55, -90, t)
    // Swoop curves
    pos.x += Math.sin(t * Math.PI) * 2

    look.x = THREE.MathUtils.lerp(-8, 4, t)
    look.y = THREE.MathUtils.lerp(-8, -12, t)
    look.z = THREE.MathUtils.lerp(-70, -105, t)
  } else {
    // Contact Zone
    pos.set(4, -12, -90)
    look.set(4, -12, -105)
  }

  return { pos, look }
}

export default function CameraRig() {
  const { camera } = useThree()
  const { scrollState, mousePosition } = useScrollContext()

  const currentPos = useRef(new THREE.Vector3(0, 0, 15))
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0))

  useFrame((_state, delta) => {
    const raw = Math.max(0, Math.min(1, scrollState.scrollProgress))

    const { pos, look } = getCameraPath(raw)

    // Add subtle mouse parallax for responsive depth
    pos.x += mousePosition.normalizedX * 1.2
    pos.y += mousePosition.normalizedY * 0.6

    // Snappy yet smooth frame interpolation
    const alpha = 1 - Math.pow(0.01, delta)
    currentPos.current.lerp(pos, alpha)
    currentLookAt.current.lerp(look, alpha)

    camera.position.copy(currentPos.current)
    camera.lookAt(currentLookAt.current)
  })

  return null
}
