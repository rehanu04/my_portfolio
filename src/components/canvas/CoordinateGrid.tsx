// ─────────────────────────────────────────────────────────────────────────────
// src/components/canvas/CoordinateGrid.tsx
//
// Infinite coordinate grid — always-on at low opacity, swells to full
// prominence in the contact section.  Animated data-pulse ripples
// travel outward from the origin along grid lines.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useScrollContext } from '../../context/ScrollContext'

// ─── GLSL ──────────────────────────────────────────────────────────────────

const vertexShader = /* glsl */ `
  varying vec2 vWorldXZ;

  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorldXZ   = world.xz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  uniform float uPulseOriginX;
  uniform float uPulseOriginZ;
  varying vec2 vWorldXZ;

  float gridLine(float coord, float spacing, float thickness) {
    float f = abs(fract(coord / spacing - 0.5) - 0.5);
    return 1.0 - smoothstep(0.0, thickness, f * spacing);
  }

  void main() {
    float major = gridLine(vWorldXZ.x, 5.0, 0.055)
                + gridLine(vWorldXZ.y, 5.0, 0.055);
    float minor = (gridLine(vWorldXZ.x, 1.0, 0.038)
                 + gridLine(vWorldXZ.y, 1.0, 0.038)) * 0.25;
    float grid  = clamp(major + minor, 0.0, 1.0);

    // Radial fade — grid dissolves at the horizon
    float dist  = length(vWorldXZ) / 55.0;
    float fade  = 1.0 - smoothstep(0.18, 1.0, dist);

    // Slow ambient ripple from centre
    float ambient = 0.5 + 0.5 * sin(uTime * 0.45 - length(vWorldXZ) * 0.08);

    // Data pulse — fast-travelling wave emanating from uPulseOrigin
    vec2  pulseOrig = vec2(uPulseOriginX, uPulseOriginZ);
    float pulseDist = length(vWorldXZ - pulseOrig);
    float pulse     = max(0.0,
      1.0 - abs(pulseDist - mod(uTime * 8.0, 60.0)) * 0.4
    ) * 0.6;

    vec3 colViolet = vec3(0.36, 0.0, 0.90); // Royal Space Violet
    vec3 colGold   = vec3(1.0, 0.84, 0.0);  // Cosmic Gold
    vec3 colour = mix(colViolet, colGold, pulse * 1.5);
    
    float alpha  = grid * fade * uOpacity * (0.35 + ambient * 0.10 + pulse);

    gl_FragColor = vec4(colour, alpha);
  }
`

// ─── Component ─────────────────────────────────────────────────────────────

export default function CoordinateGrid() {
  const meshRef = useRef<THREE.Mesh>(null)
  const { scrollState } = useScrollContext()

  const { geometry, material } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(200, 200, 1, 1)
    geo.rotateX(-Math.PI / 2)

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime:          { value: 0 },
        uOpacity:       { value: 0.06 },
        uPulseOriginX:  { value: 0 },
        uPulseOriginZ:  { value: 0 },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      side:        THREE.DoubleSide,
      depthWrite:  false,
    })

    return { geometry: geo, material: mat }
  }, [])

  useFrame((state) => {
    if (!meshRef.current) return
    const time = state.clock.getElapsedTime()
    const { scrollProgress } = scrollState

    material.uniforms.uTime.value = time

    // Always-on base (0.06) + swells in contact section
    const contactPresence = Math.max(0, Math.min(1, (scrollProgress - 0.72) * 12))
    material.uniforms.uOpacity.value = 0.06 + contactPresence * 0.42

    // Pulse origin drifts slowly for living feel
    material.uniforms.uPulseOriginX.value = Math.sin(time * 0.15) * 8
    material.uniforms.uPulseOriginZ.value = Math.cos(time * 0.12) * 6

    // Slight vertical drift
    meshRef.current.position.y = -8 + Math.sin(time * 0.17) * 0.4
  })

  return <mesh ref={meshRef} geometry={geometry} material={material} />
}
