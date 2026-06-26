// ─────────────────────────────────────────────────────────────────────────────
// src/components/canvas/StarField.tsx
//
// Premium deep-space particle system — 3000 points arranged in a sphere cloud.
// Responds to mouse: particles slightly lean toward cursor position.
// Color: mostly white/silver with rare crimson accent stars.
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useScrollContext } from '../../context/ScrollContext'

const COUNT = 3000

export default function StarField() {
  const meshRef = useRef<THREE.Points>(null)
  const { mousePosition, scrollState } = useScrollContext()

  const { positions, colors, sizes } = useMemo(() => {
    const pos = new Float32Array(COUNT * 3)
    const col = new Float32Array(COUNT * 3)
    const sz  = new Float32Array(COUNT)

    for (let i = 0; i < COUNT; i++) {
      // Distribute in a large sphere
      const r     = 30 + Math.random() * 120
      const theta = Math.random() * Math.PI * 2
      const phi   = Math.acos(2 * Math.random() - 1)

      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.5 // flatten Y
      pos[i * 3 + 2] = r * Math.cos(phi)

      // 95% white/silver, 5% crimson accent
      const isCrimson = Math.random() < 0.05
      if (isCrimson) {
        col[i * 3]     = 1.0
        col[i * 3 + 1] = 0.12
        col[i * 3 + 2] = 0.12
      } else {
        const brightness = 0.6 + Math.random() * 0.4
        col[i * 3]     = brightness
        col[i * 3 + 1] = brightness * 0.95
        col[i * 3 + 2] = brightness
      }

      sz[i] = 0.5 + Math.random() * 1.5
    }

    return { positions: pos, colors: col, sizes: sz }
  }, [])

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3))
    geo.setAttribute('size',     new THREE.BufferAttribute(sizes, 1))
    return geo
  }, [positions, colors, sizes])

  const material = useMemo(() => new THREE.PointsMaterial({
    size:        0.3,
    vertexColors: true,
    transparent: true,
    opacity:     0.85,
    sizeAttenuation: true,
    depthWrite:  false,
    blending:    THREE.AdditiveBlending,
  }), [])

  useFrame((_, delta) => {
    if (!meshRef.current) return
    // Slow ambient drift
    meshRef.current.rotation.y += delta * 0.008
    meshRef.current.rotation.x += delta * 0.003

    // Mouse lean — ultra subtle parallax
    const targetX = mousePosition.normalizedY * 0.04
    const targetY = mousePosition.normalizedX * 0.04
    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetX, 0.02)
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetY, 0.02)

    // Opacity reacts to scroll — fades slightly as user dives deeper
    const fadeOpacity = 0.85 - scrollState.scrollProgress * 0.3
    material.opacity = Math.max(0.4, fadeOpacity)
  })

  return <points ref={meshRef} geometry={geometry} material={material} />
}
