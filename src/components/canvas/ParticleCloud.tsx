// ─────────────────────────────────────────────────────────────────────────────
// src/components/canvas/ParticleCloud.tsx  (LorenzField)
//
// Dual-layer Lorenz Attractor field.
//   • Two trajectories with offset initial conditions for visual richness
//   • 8 000 points per layer (16 000 total)
//   • Speed-based per-point colouring: slow segments = Muted Twilight Slate,
//     fast chaotic segments = full Galactic Cyan (#00F5FF)
//   • uFocalPoint uniform: when a card is hovered, the field warps its Z
//     displacement toward the cursor's normalised focal coordinate
//   • Persists across all scroll positions at a minimum 0.12 base opacity
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useScrollContext } from '../../context/ScrollContext'
import { useCursorContext } from '../../context/CursorContext'

// ─── Lorenz parameters ────────────────────────────────────────────────────────

const SIGMA = 10
const RHO   = 28
const BETA  = 8 / 3
const STEPS = 8000
const DT    = 0.005

interface LorenzPoint { x: number; y: number; z: number; speed: number }

function buildLorenzPath(x0: number, y0: number, z0: number): { pos: Float32Array; speed: Float32Array } {
  const pos   = new Float32Array(STEPS * 3)
  const speed = new Float32Array(STEPS)
  let x = x0, y = y0, z = z0

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
    speed[i] = Math.sqrt(dx * dx + dy * dy + dz * dz)
  }
  return { pos, speed }
}

function normalisePath(
  pos: Float32Array,
  scale: number,
): void {
  // Compute bounding box
  let minX = Infinity, maxX = -Infinity
  let minY = Infinity, maxY = -Infinity
  let minZ = Infinity, maxZ = -Infinity
  for (let i = 0; i < pos.length; i += 3) {
    if (pos[i]     < minX) minX = pos[i]
    if (pos[i]     > maxX) maxX = pos[i]
    if (pos[i + 1] < minY) minY = pos[i + 1]
    if (pos[i + 1] > maxY) maxY = pos[i + 1]
    if (pos[i + 2] < minZ) minZ = pos[i + 2]
    if (pos[i + 2] > maxZ) maxZ = pos[i + 2]
  }
  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2
  const cz = (minZ + maxZ) / 2
  const span = Math.max(maxX - minX, maxY - minY, maxZ - minZ)
  const s = scale / span

  for (let i = 0; i < pos.length; i += 3) {
    pos[i]     = (pos[i]     - cx) * s
    pos[i + 1] = (pos[i + 1] - cy) * s
    pos[i + 2] = (pos[i + 2] - cz) * s
  }
}

// ─── Vertex Shader ────────────────────────────────────────────────────────────

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uMorph;
  uniform float uOpacity;
  uniform vec3  uFocalPoint;
  uniform float uFocalStrength;

  attribute float aSpeed;

  varying float vAlpha;
  varying float vSpeed;

  void main() {
    vec3 pos = position;

    // Slow breathing drift along Z axis
    float wave = sin(uTime * 0.16 + pos.x * 0.04 + pos.y * 0.03) * 0.7;
    pos.z += wave * uMorph;

    // Focal warp: pull Z displacement toward focal point when card hovered
    float focalDist = length(pos.xy - uFocalPoint.xy);
    float focalWarp = exp(-focalDist * 0.12) * uFocalStrength;
    pos.z += focalWarp * sin(uTime * 1.8 + focalDist * 0.6) * 2.0;

    // Distance-based fade
    float dist = length(pos) / 44.0;
    vAlpha = clamp(1.0 - dist * 0.85, 0.0, 1.0) * uOpacity;
    vSpeed = aSpeed;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = 1.8 * (300.0 / -mv.z);
    gl_Position  = projectionMatrix * mv;
  }
`

// ─── Fragment Shader ─────────────────────────────────────────────────────────

const fragmentShader = /* glsl */ `
  varying float vAlpha;
  varying float vSpeed;

  void main() {
    vec2  xy = gl_PointCoord - 0.5;
    float r  = dot(xy, xy);
    if (r > 0.25) discard;

    float disc = (1.0 - r * 4.0) * vAlpha;

    // Speed-based colour: slate → cyan
    float t     = clamp(vSpeed, 0.0, 1.0);
    vec3  slate = vec3(0.10, 0.11, 0.12);   // Muted Twilight Slate #1A1C1E
    vec3  cyan  = vec3(0.00, 0.96, 1.00);   // Galactic Cyan #00F5FF
    vec3  col   = mix(slate * 4.0, cyan, t * 0.85);

    gl_FragColor = vec4(col, disc);
  }
`

// ─── Helper — build geometry ───────────────────────────────────────────────

function buildGeometry(
  pos: Float32Array,
  speed: Float32Array,
): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))

  // Normalise speed to 0–1
  let maxS = 0
  for (let i = 0; i < speed.length; i++) if (speed[i] > maxS) maxS = speed[i]
  const normSpeed = new Float32Array(speed.length)
  for (let i = 0; i < speed.length; i++) normSpeed[i] = speed[i] / maxS
  geo.setAttribute('aSpeed', new THREE.BufferAttribute(normSpeed, 1))

  return geo
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function LorenzField() {
  const groupRef  = useRef<THREE.Group>(null)
  const { scrollState, mousePosition } = useScrollContext()
  const { focalPoint }                 = useCursorContext()

  const layers = useMemo(() => {
    // Layer A — classic initial condition
    const a = buildLorenzPath(0.1, 0, 0)
    normalisePath(a.pos, 22)
    const geoA = buildGeometry(a.pos, a.speed)

    // Layer B — offset initial condition for second lobe density
    const b = buildLorenzPath(0.1, 0.1, 25)
    normalisePath(b.pos, 18)
    const geoB = buildGeometry(b.pos, b.speed)

    const makeMat = (opacityMult: number) =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime:         { value: 0 },
          uMorph:        { value: 1 },
          uOpacity:      { value: opacityMult * 0.28 },
          uFocalPoint:   { value: new THREE.Vector3(0, 0, 0) },
          uFocalStrength:{ value: 0 },
        },
        vertexShader,
        fragmentShader,
        transparent: true,
        blending:    THREE.AdditiveBlending,
        depthWrite:  false,
      })

    return [
      { geo: geoA, mat: makeMat(1.0) },
      { geo: geoB, mat: makeMat(0.6) },
    ]
  }, [])

  useFrame((state) => {
    if (!groupRef.current) return
    const time = state.clock.getElapsedTime()
    const { scrollProgress } = scrollState

    // Persist throughout scroll — fade to 0.12 min, 0.35 max at hero
    const heroEnv = Math.max(0, 1 - scrollProgress * 1.4)
    const baseOp  = 0.12 + heroEnv * 0.23

    // Focal warp uniform — driven by CursorContext
    const focalX = focalPoint.x * 12
    const focalY = focalPoint.y * 8
    const focalStr = focalPoint.isHovering ? 1.0 : 0.0

    for (const layer of layers) {
      layer.mat.uniforms.uTime.value          = time
      layer.mat.uniforms.uMorph.value         = 1 + scrollProgress * 0.7
      layer.mat.uniforms.uOpacity.value       = baseOp
      layer.mat.uniforms.uFocalPoint.value.set(focalX, focalY, 0)
      layer.mat.uniforms.uFocalStrength.value = focalStr
    }

    // Very slow orbital rotation + hero mouse parallax
    const heroInf = Math.max(0, 1 - scrollProgress * 3)
    groupRef.current.rotation.y = time * 0.015 + mousePosition.normalizedX * 0.10 * heroInf
    groupRef.current.rotation.x = time * 0.008 + mousePosition.normalizedY * 0.05 * heroInf
  })

  return (
    <group ref={groupRef}>
      {layers.map((layer, i) => (
        <points key={i} geometry={layer.geo} material={layer.mat} />
      ))}
    </group>
  )
}
