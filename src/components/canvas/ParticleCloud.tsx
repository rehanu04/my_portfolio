import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useScrollContext } from '../../context/ScrollContext'

// ─── Lorenz Attractor Field ───────────────────────────────────────────────────
// Integrates the Lorenz differential equations to generate a mathematically
// precise strange attractor trajectory. The resulting geometry is a beautifully
// complex, never-repeating 3D curve — the antithesis of a particle blizzard.
//
// σ = 10, ρ = 28, β = 8/3  (classic chaotic parameters)

const SIGMA = 10
const RHO   = 28
const BETA  = 8 / 3
const STEPS = 6000          // points on the attractor curve
const DT    = 0.005         // integration time-step

function buildLorenzPath(): Float32Array {
  const pos = new Float32Array(STEPS * 3)
  let x = 0.1, y = 0, z = 0

  for (let i = 0; i < STEPS; i++) {
    const dx = SIGMA * (y - x)
    const dy = x * (RHO - z) - y
    const dz = x * y - BETA * z
    x += dx * DT
    y += dy * DT
    z += dz * DT
    pos[i * 3]     = x
    pos[i * 3 + 1] = y
    pos[i * 3 + 2] = z
  }
  return pos
}

// ─── Vertex Shader ────────────────────────────────────────────────────────────

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uMorph;
  uniform float uOpacity;

  varying float vAlpha;

  void main() {
    // Slow, breathing drift along the attractor's Z axis
    float wave = sin(uTime * 0.18 + position.x * 0.04 + position.y * 0.03) * 0.6;
    vec3 pos   = position;
    pos.z     += wave * uMorph;

    // Distance-based fade: nearby points brightest
    float dist = length(pos) / 42.0;
    vAlpha = clamp(1.0 - dist * 0.9, 0.0, 1.0) * uOpacity;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    // Very small points — atmospheric, not dominant
    gl_PointSize = 1.6 * (280.0 / -mv.z);
    gl_Position  = projectionMatrix * mv;
  }
`

// ─── Fragment Shader ─────────────────────────────────────────────────────────

const fragmentShader = /* glsl */ `
  varying float vAlpha;

  void main() {
    // Circular disc with steep feather — no hard edges
    vec2  xy = gl_PointCoord - 0.5;
    float r  = dot(xy, xy);
    if (r > 0.25) discard;

    float alpha = (1.0 - r * 4.0) * vAlpha;
    // Galactic Cyan — attenuated so it glows rather than blares
    gl_FragColor = vec4(0.0, 0.96, 1.0, alpha);
  }
`

// ─── Component ────────────────────────────────────────────────────────────────

export default function LorenzField() {
  const pointsRef = useRef<THREE.Points>(null)
  const { scrollState, mousePosition } = useScrollContext()

  const { geometry, material } = useMemo(() => {
    const positions = buildLorenzPath()

    // Normalise to fit a ±12 unit bounding box
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    // Centre around origin
    geo.computeBoundingBox()
    const box    = geo.boundingBox!
    const centre = new THREE.Vector3()
    box.getCenter(centre)
    const span   = new THREE.Vector3()
    box.getSize(span)
    const scale  = 22 / Math.max(span.x, span.y, span.z)

    const pos = geo.attributes['position'] as THREE.BufferAttribute
    for (let i = 0; i < pos.count; i++) {
      pos.setXYZ(
        i,
        (pos.getX(i) - centre.x) * scale,
        (pos.getY(i) - centre.y) * scale,
        (pos.getZ(i) - centre.z) * scale,
      )
    }
    pos.needsUpdate = true

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime:    { value: 0 },
        uMorph:   { value: 1 },
        uOpacity: { value: 0.28 },
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

    material.uniforms.uTime.value  = time
    material.uniforms.uMorph.value = 1 + scrollProgress * 0.6

    // Presence: fade from hero into distance as user scrolls
    // Max 0.28 opacity — purely atmospheric, never dominant
    const heroEnvelope = Math.max(0, 1 - scrollProgress * 1.6)
    material.uniforms.uOpacity.value = heroEnvelope * 0.28

    // Very slow orbital rotation + subtle mouse parallax in hero
    const heroInf = Math.max(0, 1 - scrollProgress * 4)
    pointsRef.current.rotation.y = time * 0.018 + mousePosition.normalizedX * 0.08 * heroInf
    pointsRef.current.rotation.x = time * 0.009 + mousePosition.normalizedY * 0.04 * heroInf
  })

  return <points ref={pointsRef} geometry={geometry} material={material} />
}
