import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useScrollContext } from '../../context/ScrollContext'

// ─── GLSL ──────────────────────────────────────────────────────────────────

const vertexShader = /* glsl */ `
  attribute vec3 aColor;
  attribute float aSize;

  uniform float uTime;
  uniform float uExplosion;

  varying vec3 vColor;

  void main() {
    vColor = aColor;

    // Radial explosion: push particles outward along their origin direction
    vec3 dir    = normalize(position);
    float dist  = length(position);
    float scale = dist / 20.0; // farther particles burst further
    vec3 pos    = position + dir * uExplosion * 18.0 * scale;

    // Subtle breathing wave (only while not exploding)
    float wave = sin(uTime * 0.4 + dist * 0.18) * 0.35 * (1.0 - uExplosion);
    pos += dir * wave;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * (280.0 / -mv.z);
    gl_Position  = projectionMatrix * mv;
  }
`

const fragmentShader = /* glsl */ `
  varying vec3 vColor;
  uniform float uOpacity;

  void main() {
    // Soft circular disc — discard outside radius
    vec2  xy = gl_PointCoord - 0.5;
    float r  = dot(xy, xy);
    if (r > 0.25) discard;

    float alpha = (1.0 - r * 4.0) * uOpacity;
    gl_FragColor = vec4(vColor, alpha);
  }
`

// ─── Constants ─────────────────────────────────────────────────────────────

const COUNT = 9000

// ─── Component ─────────────────────────────────────────────────────────────

export default function ParticleCloud() {
  const pointsRef = useRef<THREE.Points>(null)
  const { scrollState, mousePosition } = useScrollContext()

  // Build geometry + shader material once
  const { geometry, material } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3)
    const colors    = new Float32Array(COUNT * 3)
    const sizes     = new Float32Array(COUNT)

    for (let i = 0; i < COUNT; i++) {
      // Spherical shell distribution with slight vertical squash
      const theta = Math.random() * Math.PI * 2
      const phi   = Math.acos(2 * Math.random() - 1)
      const r     = Math.pow(Math.random(), 0.45) * 18 + 2

      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.55
      positions[i * 3 + 2] = r * Math.cos(phi)

      // Colour palette: Galactic Cyan / Blue-white / Muted slate
      const roll = Math.random()
      if (roll < 0.28) {
        // Cyan
        colors[i * 3] = 0; colors[i * 3 + 1] = 0.96; colors[i * 3 + 2] = 1.0
      } else if (roll < 0.55) {
        // Blue-white
        colors[i * 3] = 0.7; colors[i * 3 + 1] = 0.88; colors[i * 3 + 2] = 1.0
      } else {
        // Slate-grey
        colors[i * 3] = 0.35; colors[i * 3 + 1] = 0.38; colors[i * 3 + 2] = 0.42
      }

      sizes[i] = Math.random() * 2.8 + 0.4
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('aColor',   new THREE.BufferAttribute(colors, 3))
    geo.setAttribute('aSize',    new THREE.BufferAttribute(sizes, 1))

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime:      { value: 0 },
        uExplosion: { value: 0 },
        uOpacity:   { value: 0.85 },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      blending:    THREE.AdditiveBlending,
      depthWrite:  false,
    })

    return { geometry: geo, material: mat }
  }, [])

  useFrame((state) => {
    if (!pointsRef.current) return
    const time = state.clock.getElapsedTime()
    const { scrollProgress } = scrollState

    material.uniforms.uTime.value = time

    // Explosion factor: ramps from 0→1 as user scrolls through first 30 % of page
    const explosion = Math.max(0, Math.min(1, (scrollProgress - 0.08) * 5))
    material.uniforms.uExplosion.value = explosion

    // Fade out as user moves beyond experience section
    const heroPresence = Math.max(0, 1 - scrollProgress * 3.5)
    material.uniforms.uOpacity.value   = Math.max(0.02, heroPresence * 0.85)

    // Slow global rotation + mouse parallax in hero
    const heroInf = Math.max(0, 1 - scrollProgress * 4)
    pointsRef.current.rotation.y = time * 0.025 + mousePosition.normalizedX * 0.12 * heroInf
    pointsRef.current.rotation.x = time * 0.012 + mousePosition.normalizedY * 0.07 * heroInf
  })

  return <points ref={pointsRef} geometry={geometry} material={material} />
}
