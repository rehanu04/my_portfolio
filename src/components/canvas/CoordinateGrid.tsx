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
  varying vec2 vWorldXZ;

  float gridLine(float coord, float spacing, float thickness) {
    float f = abs(fract(coord / spacing - 0.5) - 0.5);
    return 1.0 - smoothstep(0.0, thickness, f * spacing);
  }

  void main() {
    float major = gridLine(vWorldXZ.x, 5.0, 0.06)
                + gridLine(vWorldXZ.y, 5.0, 0.06);
    float minor = (gridLine(vWorldXZ.x, 1.0, 0.04)
                 + gridLine(vWorldXZ.y, 1.0, 0.04)) * 0.28;
    float grid  = clamp(major + minor, 0.0, 1.0);

    // Radial fade — grid dissolves at the horizon
    float dist  = length(vWorldXZ) / 55.0;
    float fade  = 1.0 - smoothstep(0.25, 1.0, dist);

    // Gentle pulse ripple originating from centre
    float ripple = 0.5 + 0.5 * sin(uTime * 0.55 - length(vWorldXZ) * 0.09);

    vec3  colour = vec3(0.0, 0.96, 1.0); // Galactic Cyan
    float alpha  = grid * fade * uOpacity * (0.38 + ripple * 0.12);

    gl_FragColor = vec4(colour, alpha);
  }
`

// ─── Component ─────────────────────────────────────────────────────────────

export default function CoordinateGrid() {
  const meshRef = useRef<THREE.Mesh>(null)
  const { scrollState } = useScrollContext()

  const { geometry, material } = useMemo(() => {
    // Large horizontal plane
    const geo = new THREE.PlaneGeometry(200, 200, 1, 1)
    geo.rotateX(-Math.PI / 2)

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime:    { value: 0 },
        uOpacity: { value: 0 },
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

    // Fade in during contact section (final 25 % of page)
    const presence = Math.max(0, Math.min(1, (scrollProgress - 0.72) * 12))
    material.uniforms.uOpacity.value = presence

    // Very slow drift so it feels alive
    meshRef.current.position.y = -8 + Math.sin(time * 0.18) * 0.3
  })

  return <mesh ref={meshRef} geometry={geometry} material={material} />
}
