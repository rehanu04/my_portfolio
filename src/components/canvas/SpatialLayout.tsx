import { Html } from '@react-three/drei'
import CommandDeck from '../sections/CommandDeck'
import SystemArchLog from '../sections/SystemArchLog'
import MasterVault from '../sections/MasterVault'
import SecureUplink from '../sections/SecureUplink'

export default function SpatialLayout() {
  return (
    <group>
      {/* 
        Section 1: Command Deck
        Origin point
      */}
      <Html
        transform
        distanceFactor={12}
        position={[0, 0, 0]}
        center
        occlude="blending"
      >
        <div className="w-[1200px]">
          <CommandDeck />
        </div>
      </Html>

      {/* 
        Section 2: System Architecture Log
        Positioned deeply back and to the right
      */}
      <Html
        transform
        distanceFactor={12}
        position={[15, -10, -25]}
        center
        occlude="blending"
      >
        <div className="w-[1200px]">
          <SystemArchLog />
        </div>
      </Html>

      {/* 
        Section 3: Master Vault
        Positioned drastically to the left and further down
      */}
      <Html
        transform
        distanceFactor={12}
        position={[-20, -30, -60]}
        center
        occlude="blending"
      >
        <div className="w-[1200px]">
          <MasterVault />
        </div>
      </Html>

      {/* 
        Section 4: Secure Uplink
        Continuing the deep-space descent
      */}
      <Html
        transform
        distanceFactor={12}
        position={[10, -45, -90]}
        center
        occlude="blending"
      >
        <div className="w-[800px]">
          <SecureUplink />
        </div>
      </Html>
    </group>
  )
}
