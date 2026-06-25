// ─────────────────────────────────────────────────────────────────────────────
// src/components/canvas/NeuralMesh.tsx
//
// Wave-displaced organic membrane — 8-octave FBM with Lorenz-derived
// frequency modulation and specular rim-lighting from a Galactic Cyan source.
//
// Spatial Coordinate Persistence:
//   This mesh lives at Z = -40 throughout the entire scroll journey,
//   always visible as a tiny distant telemetry cluster — it never
//   unmounts or pops out of existence.  Its scale and opacity are
//   modulated by scroll progress so it swells to full prominence in
//   the experience section and recedes (but stays) elsewhere.
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useScrollContext } from '../../context/ScrollContext'

// ─── Vertex Shader ────────────────────────────────────────────────────────────

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uScroll;
  uniform float uOpacity;

  varying vec3  vNormal;
  varying float vDisplace;
  varying float vAlpha;
  varying vec3  vWorldPos;

  // 8-octave Fractional Brownian Motion via sin/cos lattice
  float fbm(vec3 p) {
    float v  = 0.0;
    float a  = 0.5;
    vec3  s  = p;
    for (int i = 0; i < 8; i++) {
      v += a * sin(s.x) * sin(s.y) * sin(s.z);
      s  = s * 2.1 + vec3(1.7, 9.2, 3.8);
      a *= 0.5;
    }
    return v;
  }

  // Lorenz-derived frequency modulator (simplified closed-form approximation)
  float lorenzFreq(vec3 p, float t) {
    float x = p.x + t * 0.08;
    float y = p.y + t * 0.05;
    return sin(10.0 * (y - x)) * cos(x * (28.0 - p.z * 0.5) - y) * 0.2;
  }

  void main() {
    vNormal = normal;

    // Multi-octave displacement driven by time + scroll
    float amp     = 1.4 + uScroll * 1.0;
    float base    = fbm(normal * 2.6 + uTime * 0.20) * amp;
    float lMod    = lorenzFreq(normal, uTime);
    float disp    = base + lMod * amp;
    vec3  pos     = position + normal * disp;
    vDisplace     = disp;
    vWorldPos     = pos;

    // Distance fade from origin
    float dist = length(pos) / 20.0;
    vAlpha = clamp(1.0 - dist * 0.65, 0.0, 1.0) * uOpacity;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

// ─── Fragment Shader ─────────────────────────────────────────────────────────

const fragmentShader = /* glsl */ `
  uniform float uTime;

  varying vec3  vNormal;
  varying float vDisplace;
  varying float vAlpha;
  varying vec3  vWorldPos;

  void main() {
    // Cyan rim light direction (Galactic Cyan directional source)
    vec3  lightDir = normalize(vec3(0.4, 0.8, 1.0));
    float rim      = pow(1.0 - max(dot(normalize(vNormal), lightDir), 0.0), 3.5);
    float diff     = max(dot(normalize(vNormal), lightDir), 0.0) * 0.5;

    // Tint: displaced ridges → cyan, troughs → deep slate
    float t      = clamp(vDisplace * 0.35 + 0.5, 0.0, 1.0);
    vec3  cyan   = vec3(0.00, 0.96, 1.00);   // #00F5FF
    vec3  slate  = vec3(0.10, 0.11, 0.12);   // Twilight Slate
    vec3  col    = mix(slate, cyan, t * 0.55);

    // Apply rim lighting — bright cyan specular halo
    col += cyan * rim * 0.65;
    col += cyan * diff * 0.15;

    gl_FragColor = vec4(col, vAlpha * 0.60);
  }
`

// ─── Component ────────────────────────────────────────────────────────────────

export default function NeuralMesh() {
  const meshRef = useRef<THREE.Mesh>(null)
  const { scrollState } = useScrollContext()

  const { geometry, material } = useMemo(() => {
    // Icosphere: subdivision 5 ≈ 10K triangles — cinematic smoothness
    const geo = new THREE.IcosahedronGeometry(7.5, 5)

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime:    { value: 0 },
        uScroll:  { value: 0 },
        uOpacity: { value: 0 },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      blending:    THREE.AdditiveBlending,
      depthWrite:  false,
      side:        THREE.DoubleSide,
    })

    return { geometry: geo, material: mat }
  }, [])

  useFrame((state) => {
    if (!meshRef.current) return
    const time = state.clock.getElapsedTime()
    const { scrollProgress } = scrollState

    material.uniforms.uTime.value   = time
    material.uniforms.uScroll.value = scrollProgress

    // ── Spatial Coordinate Persistence ─────────────────────────────────────
    // Full prominence in experience section (0.2 – 0.6 scroll).
    // Recedes to tiny distant cluster (0.06 opacity, 0.4 scale) elsewhere.
    const inExp   = Math.max(0, Math.min(1, (scrollProgress - 0.18) * 8))
    const outExp  = Math.max(0, 1 - Math.max(0, scrollProgress - 0.55) * 8)
    const expOp   = inExp * outExp

    // Always-visible base (distant telemetry cluster)
    const distOp  = 0.06
    const finalOp = distOp + expOp * 0.28
    material.uniforms.uOpacity.value = finalOp

    // Scale: large in exp section, small/distant elsewhere
    const baseScale = 0.38 + expOp * 0.62
    meshRef.current.scale.setScalar(baseScale)

    // Position: lives in deep Z space, comes forward in experience section
    const targetZ = -40 + expOp * 40
    meshRef.current.position.z = THREE.MathUtils.lerp(
      meshRef.current.position.z, targetZ, 0.04,
    )

    // Slow organic drift
    meshRef.current.rotation.y = time * 0.022
    meshRef.current.rotation.x = time * 0.010
  })

  return <mesh ref={meshRef} geometry={geometry} material={material} />
}
