import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useScrollContext } from '../../context/ScrollContext'

// ─── Wave-Displaced Vertex Surface ───────────────────────────────────────────
// A mathematically-driven icosphere with custom GLSL vertex displacement:
// overlapping sine waves create an organic fluid membrane that breathes and
// morphs as the user scrolls. The wireframe is rendered at near-zero opacity
// so it reads as deep-field infrastructure.

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uScroll;
  uniform float uOpacity;

  varying vec3  vNormal;
  varying float vDisplace;
  varying float vAlpha;

  // Smooth 3D noise via sin/cos lattice (no texture dependency)
  float fbm(vec3 p) {
    float v  = 0.0;
    float a  = 0.5;
    vec3  s  = p;
    for (int i = 0; i < 5; i++) {
      v += a * sin(s.x) * sin(s.y) * sin(s.z);
      s  = s * 2.0 + vec3(1.7, 9.2, 3.8);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vNormal = normal;

    // Displacement driven by time + scroll (morphs shape over scroll depth)
    float amp     = 1.2 + uScroll * 0.8;
    float disp    = fbm(normal * 2.4 + uTime * 0.22) * amp;
    vec3  pos     = position + normal * disp;
    vDisplace     = disp;

    // Distance fade
    float dist = length(pos) / 18.0;
    vAlpha = clamp(1.0 - dist * 0.7, 0.0, 1.0) * uOpacity;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  varying vec3  vNormal;
  varying float vDisplace;
  varying float vAlpha;

  void main() {
    // Tint toward cyan on displaced ridges, deeper slate on troughs
    float t     = clamp(vDisplace * 0.4 + 0.5, 0.0, 1.0);
    vec3  cyan  = vec3(0.0,  0.96, 1.0);
    vec3  slate = vec3(0.12, 0.18, 0.28);
    vec3  col   = mix(slate, cyan, t * 0.5);

    gl_FragColor = vec4(col, vAlpha * 0.65);
  }
`

// ─── Component ────────────────────────────────────────────────────────────────

export default function NeuralMesh() {
  const meshRef = useRef<THREE.Mesh>(null)
  const { scrollState } = useScrollContext()

  const { geometry, material } = useMemo(() => {
    // Icosphere: subdivision 4 gives ~2500 triangles — smooth but light
    const geo = new THREE.IcosahedronGeometry(7.5, 4)

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime:    { value: 0 },
        uScroll:  { value: 0 },
        uOpacity: { value: 0 },
      },
      vertexShader,
      fragmentShader,
      transparent:  true,
      blending:     THREE.AdditiveBlending,
      depthWrite:   false,
      side:         THREE.DoubleSide,
      wireframe:    false,
    })

    return { geometry: geo, material: mat }
  }, [])

  useFrame((state, _delta) => {
    if (!meshRef.current) return
    const time = state.clock.getElapsedTime()
    const { scrollProgress } = scrollState

    material.uniforms.uTime.value   = time
    material.uniforms.uScroll.value = scrollProgress

    // Fade: visible in experience section (0.2 – 0.6 scroll)
    const fadeIn  = Math.max(0, Math.min(1, (scrollProgress - 0.18) * 8))
    const fadeOut = Math.max(0, 1 - Math.max(0, scrollProgress - 0.55) * 8)
    material.uniforms.uOpacity.value = fadeIn * fadeOut * 0.30

    // Slow organic drift
    meshRef.current.rotation.y = time * 0.024
    meshRef.current.rotation.x = time * 0.011
  })

  return <mesh ref={meshRef} geometry={geometry} material={material} />
}
