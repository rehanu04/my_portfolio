// ─────────────────────────────────────────────────────────────────────────────
// src/components/canvas/EnergyField.tsx
//
// God-Tier Saiyan Energy Field — Clean procedural vector field with FBM noise
// acting as a majestic, high-fidelity spatial background.
//
// Magnetic displacement ripple: Warps towards the uFocalPoint (the cursor position)
// emitting a rippling God Ki distortion across the geometric array.
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useCursorContext } from '../../context/CursorContext'

// ─── Vertex Shader ────────────────────────────────────────────────────────────

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec2  uFocalPoint;
  uniform float uFocalStrength;

  varying vec2  vUv;
  varying float vDisplace;
  varying vec3  vWorldPos;

  // 3D Classic Perlin Noise
  vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
  
  float snoise(vec3 v){ 
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 = v - i + dot(i, C.xxx) ;

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );

    vec3 x1 = x0 - i1 + 1.0 * C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

    i = mod(i, 289.0 ); 
    vec4 p = permute( permute( permute( 
               i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
             + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

    float n_ = 1.0/7.0;
    vec3  ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z *ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
  }

  // FBM
  float fbm(vec3 p) {
    float f = 0.0;
    float w = 0.5;
    for (int i = 0; i < 5; i++) {
      f += w * snoise(p);
      p *= 2.0;
      w *= 0.5;
    }
    return f;
  }

  void main() {
    vUv = uv;
    vec3 pos = position;

    // Organic space-time fabric displacement
    float n1 = fbm(vec3(pos.x * 0.05, pos.y * 0.05, uTime * 0.2));
    float n2 = fbm(vec3(pos.x * 0.1, pos.y * 0.1, uTime * 0.3 + 10.0));
    
    // Z-displacement wave
    float baseDisp = (n1 * 1.5) + (n2 * 0.5);
    pos.z += baseDisp;

    // Magnetic focal warp (God Ki accumulation)
    // uFocalPoint is -1 to 1 screen NDC. We map roughly to world coords.
    vec2 focalWorld = uFocalPoint * 30.0;
    float dist = length(pos.xy - focalWorld);
    
    // Intense gravity well near focal point
    float warp = exp(-dist * 0.15) * uFocalStrength * 8.0;
    pos.z += warp * sin(uTime * 5.0 - dist * 0.8) * 1.5;

    vDisplace = pos.z;
    vWorldPos = (modelMatrix * vec4(pos, 1.0)).xyz;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

// ─── Fragment Shader ─────────────────────────────────────────────────────────

const fragmentShader = /* glsl */ `
  uniform float uTime;
  
  varying vec2  vUv;
  varying float vDisplace;
  varying vec3  vWorldPos;

  void main() {
    // God-Tier Energy Palette
    vec3 colDeepCrimson = vec3(0.5, 0.0, 0.0);       // Base dark red
    vec3 colGodCrimson  = vec3(1.0, 0.12, 0.12);     // Bright red/crimson (#FF1E1E)
    vec3 colRoyalViolet = vec3(0.36, 0.0, 0.90);     // Deep purple (#5D00E6)
    vec3 colCosmicGold  = vec3(1.0, 0.84, 0.0);      // Pure Gold (#FFD700)

    // Blend based on displacement height
    float t = clamp(vDisplace * 0.3 + 0.5, 0.0, 1.0);

    // Deep valleys are Violet, mids are Crimson, peaks are Gold
    vec3 color = mix(colRoyalViolet, colDeepCrimson, smoothstep(0.0, 0.4, t));
    color = mix(color, colGodCrimson, smoothstep(0.4, 0.7, t));
    color = mix(color, colCosmicGold, smoothstep(0.7, 1.0, t));

    // Distance fade to black (infinite space)
    float fade = 1.0 - smoothstep(20.0, 50.0, length(vWorldPos.xy));

    // Sparkle / Energy crackle logic
    float crackle = fract(sin(dot(vUv.xy + uTime * 0.1, vec2(12.9898, 78.233))) * 43758.5453);
    float glow = smoothstep(0.8, 1.0, crackle) * smoothstep(0.6, 1.0, t) * 0.5;
    
    color += colCosmicGold * glow;

    // Output with opacity mapped to fade
    gl_FragColor = vec4(color, fade * 0.85);
  }
`

// ─── Component ────────────────────────────────────────────────────────────────

export default function EnergyField() {
  const meshRef = useRef<THREE.Mesh>(null)
  const { focalPoint } = useCursorContext()

  const { geometry, material } = useMemo(() => {
    // Large heavily-subdivided plane for smooth vertex displacement
    const geo = new THREE.PlaneGeometry(100, 100, 200, 200)

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime:          { value: 0 },
        uFocalPoint:    { value: new THREE.Vector2(0, 0) },
        uFocalStrength: { value: 0 },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      blending:    THREE.AdditiveBlending,
      depthWrite:  false,
      wireframe:   true, // Render as an energy mesh/grid
    })

    return { geometry: geo, material: mat }
  }, [])

  useFrame((state) => {
    if (!meshRef.current) return
    const time = state.clock.getElapsedTime()

    material.uniforms.uTime.value = time

    // Focal warp uniform from CursorContext
    const focalStr = focalPoint.isHovering ? 1.0 : 0.0
    material.uniforms.uFocalPoint.value.set(focalPoint.x, focalPoint.y)
    // Smooth damp the strength
    material.uniforms.uFocalStrength.value = THREE.MathUtils.lerp(
      material.uniforms.uFocalStrength.value,
      focalStr,
      0.08
    )

    // Slow ambient rotation to make the field feel alive
    meshRef.current.rotation.z = Math.sin(time * 0.05) * 0.1
  })

  return (
    <mesh 
      ref={meshRef} 
      geometry={geometry} 
      material={material} 
      position={[0, 0, -20]} 
    />
  )
}
