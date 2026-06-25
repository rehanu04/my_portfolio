import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useScrollContext } from '../../context/ScrollContext'

const NODE_COUNT       = 60
const CONNECT_RADIUS   = 5.5

/**
 * Interconnected neural-network mesh that becomes visible when the camera
 * dollies through the particle cloud into the experience section.
 */
export default function NeuralMesh() {
  const groupRef = useRef<THREE.Group>(null)
  const { scrollState } = useScrollContext()

  const { nodeGeo, nodeMat, lineGeo, lineMat } = useMemo(() => {
    // ── Generate node positions ─────────────────────────────────────────
    const nodes: THREE.Vector3[] = Array.from({ length: NODE_COUNT }, () =>
      new THREE.Vector3(
        (Math.random() - 0.5) * 32,
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) * 10,
      ),
    )

    // ── Node point cloud ────────────────────────────────────────────────
    const nodePosArr = new Float32Array(NODE_COUNT * 3)
    nodes.forEach((p, i) => {
      nodePosArr[i * 3]     = p.x
      nodePosArr[i * 3 + 1] = p.y
      nodePosArr[i * 3 + 2] = p.z
    })
    const nodeGeo = new THREE.BufferGeometry()
    nodeGeo.setAttribute('position', new THREE.BufferAttribute(nodePosArr, 3))

    const nodeMat = new THREE.PointsMaterial({
      color:       0x00f5ff,
      size:        0.18,
      transparent: true,
      opacity:     0,
      sizeAttenuation: true,
      blending:    THREE.AdditiveBlending,
      depthWrite:  false,
    })

    // ── Connection lines ────────────────────────────────────────────────
    const linePositions: number[] = []
    for (let i = 0; i < NODE_COUNT; i++) {
      for (let j = i + 1; j < NODE_COUNT; j++) {
        if (nodes[i].distanceTo(nodes[j]) < CONNECT_RADIUS) {
          linePositions.push(
            nodes[i].x, nodes[i].y, nodes[i].z,
            nodes[j].x, nodes[j].y, nodes[j].z,
          )
        }
      }
    }

    // Guard: ensure we have at least one degenerate segment
    const safeArr = linePositions.length > 0
      ? new Float32Array(linePositions)
      : new Float32Array([0, 0, 0, 0, 0, 0])

    const lineGeo = new THREE.BufferGeometry()
    lineGeo.setAttribute('position', new THREE.BufferAttribute(safeArr, 3))

    const lineMat = new THREE.LineBasicMaterial({
      color:       0x00f5ff,
      transparent: true,
      opacity:     0,
      blending:    THREE.AdditiveBlending,
    })

    return { nodeGeo, nodeMat, lineGeo, lineMat }
  }, [])

  useFrame((state) => {
    if (!groupRef.current) return
    const time = state.clock.getElapsedTime()
    const { scrollProgress } = scrollState

    // Visible in experience section band: ~0.22 – 0.55 of total scroll
    const fadeIn  = Math.max(0, Math.min(1, (scrollProgress - 0.2) * 10))
    const fadeOut = Math.max(0, 1 - Math.max(0, scrollProgress - 0.5) * 10)
    const presence = fadeIn * fadeOut

    nodeMat.opacity = presence * 0.95
    lineMat.opacity = presence * 0.22

    // Slow drift + gentle vertical oscillation
    groupRef.current.rotation.y  = time * 0.012
    groupRef.current.position.y  = Math.sin(time * 0.25) * 0.4
  })

  return (
    <group ref={groupRef}>
      <points        geometry={nodeGeo} material={nodeMat} />
      <lineSegments  geometry={lineGeo} material={lineMat} />
    </group>
  )
}
