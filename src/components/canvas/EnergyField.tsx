// ─────────────────────────────────────────────────────────────────────────────
// src/components/canvas/EnergyField.tsx
//
// Atmospheric depth plane — a clean, subtle infinite grid with very low
// opacity, replacing the original FBM blob that caused the visual catastrophe.
//
// Uses a custom shader to draw a crisp grid in the XZ plane with:
//   • Horizon fade (distance-based alpha dropoff)
//   • Subtle glow on grid intersections
//   • Very low opacity — this is ambience, not foreground
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useCursorContext } from '../../context/CursorContext'

const vertexShader = /* glsl */`
  varying vec2 vUv;
  varying vec3 vWorldPos;
  void main() {
    vUv = uv;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorldPos = world.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */`
  uniform float uTime;
  uniform vec2  uFocalPoint;
  uniform float uFocalStrength;

  varying vec2 vUv;
  varying vec3 vWorldPos;

  void main() {
    // Grid lines at every 5 world units
    float gridSize = 5.0;
    vec2 grid = abs(fract(vWorldPos.xz / gridSize - 0.5) - 0.5) / fwidth(vWorldPos.xz / gridSize);
    float line = min(grid.x, grid.y);
    float gridAlpha = 1.0 - min(line, 1.0);

    // Distance fade from camera (approximate using UV distance from centre)
    float dist = length(vWorldPos.xz);
    float horizonFade = 1.0 - smoothstep(20.0, 80.0, dist);

    // Pulse along grid lines
    float pulse = sin(dist * 0.3 - uTime * 1.5) * 0.5 + 0.5;
    pulse *= 0.4;

    // Focal point ripple
    vec2 focalWorld = uFocalPoint * 40.0;
    float focalDist = length(vWorldPos.xz - focalWorld);
    float focalRipple = exp(-focalDist * 0.1) * sin(focalDist * 0.8 - uTime * 3.0) * uFocalStrength;

    // Crimson grid colour, very dim
    vec3 col = vec3(0.8, 0.05, 0.05);

    float alpha = (gridAlpha * 0.12 + pulse * gridAlpha * 0.06 + focalRipple * 0.15) * horizonFade;

    gl_FragColor = vec4(col, clamp(alpha, 0.0, 0.4));
  }
`

export default function EnergyField() {
  const meshRef = useRef<THREE.Mesh>(null)
  const { focalPoint } = useCursorContext()

  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime:          { value: 0 },
      uFocalPoint:    { value: new THREE.Vector2(0, 0) },
      uFocalStrength: { value: 0 },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite:  false,
    side: THREE.DoubleSide,
  }), [])

  const geometry = useMemo(() => new THREE.PlaneGeometry(200, 200, 1, 1), [])

  useFrame((state) => {
    if (!meshRef.current) return
    material.uniforms.uTime.value = state.clock.getElapsedTime()
    material.uniforms.uFocalPoint.value.set(focalPoint.x, focalPoint.y)
    material.uniforms.uFocalStrength.value = THREE.MathUtils.lerp(
      material.uniforms.uFocalStrength.value,
      focalPoint.isHovering ? 1.0 : 0.0,
      0.08,
    )
  })

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -8, 0]}
    />
  )
}
