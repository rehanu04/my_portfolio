import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useScrollContext } from '../../context/ScrollContext'

// ─── GLSL ──────────────────────────────────────────────────────────────────

const vertexShader = /* glsl */ `
  attribute float aSize;

  uniform float uTime;

  void main() {
    // Very subtle breathing — low amplitude so particles stay composed
    float wave = sin(uTime * 0.28 + position.x * 0.12 + position.z * 0.09) * 0.22;
    vec3 pos   = position + normalize(position) * wave;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * (220.0 / -mv.z);
    gl_Position  = projectionMatrix * mv;
  }
`

const fragmentShader = /* glsl */ `
  uniform float uOpacity;

  void main() {
    // Soft disc with steep feathering — very low peak alpha
    vec2  xy = gl_PointCoord - 0.5;
    float r  = dot(xy, xy);
    if (r > 0.25) discard;

    float alpha = (1.0 - r * 4.0) * uOpacity;
    // Cool near-background blue-slate tone, not competing cyan
    gl_FragColor = vec4(0.28, 0.38, 0.52, alpha);
  }
`

// ─── Constants ─────────────────────────────────────────────────────────────
// Sparse mathematical star-cluster: 1 200 points vs previous 9 000.
// Each particle is smaller and buried behind the text layer via low opacity.

const COUNT = 1200

// ─── Component ─────────────────────────────────────────────────────────────

export default function ParticleCloud() {
  const pointsRef = useRef<THREE.Points>(null)
  const { scrollState, mousePosition } = useScrollContext()

  const { geometry, material } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3)
    const sizes     = new Float32Array(COUNT)

    for (let i = 0; i < COUNT; i++) {
      // Fibonacci sphere distribution — mathematically even, not clumped
      const golden  = Math.PI * (3 - Math.sqrt(5))
      const y       = 1 - (i / (COUNT - 1)) * 2
      const radius  = Math.sqrt(1 - y * y)
      const theta   = golden * i

      // Scale: spread across a much larger radius so density is low at viewport
      const r = (Math.random() * 0.55 + 0.45) * 22

      positions[i * 3]     = Math.cos(theta) * radius * r
      positions[i * 3 + 1] = y * r * 0.6           // vertical squash → flatter cloud
      positions[i * 3 + 2] = Math.sin(theta) * radius * r

      // Tiny points — 0.4…1.1 vs previous 0.4…3.2
      sizes[i] = Math.random() * 0.7 + 0.4
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('aSize',    new THREE.BufferAttribute(sizes, 1))

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime:    { value: 0 },
        uOpacity: { value: 0.18 },  // baseline deeply attenuated
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      blending:    THREE.AdditiveBlending,
      depthWrite:  false,
    })

    return { geometry: geo, material: mat }
  }, [])

  useFrame((state, _delta) => {
    if (!pointsRef.current) return
    const time = state.clock.getElapsedTime()
    const { scrollProgress } = scrollState

    material.uniforms.uTime.value = time

    // Max opacity: 0.22 in hero, fades to near-zero as user scrolls —
    // particles are purely atmospheric accent, never a focal point.
    const heroPresence = Math.max(0, 1 - scrollProgress * 2.8)
    material.uniforms.uOpacity.value = heroPresence * 0.22

    // Ultra-slow rotation + gentle mouse parallax (hero only)
    const heroInf = Math.max(0, 1 - scrollProgress * 5)
    pointsRef.current.rotation.y = time * 0.014 + mousePosition.normalizedX * 0.06 * heroInf
    pointsRef.current.rotation.x = time * 0.007 + mousePosition.normalizedY * 0.04 * heroInf
  })

  return <points ref={pointsRef} geometry={geometry} material={material} />
}
