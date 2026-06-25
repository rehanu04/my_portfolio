import SceneCanvas from './components/canvas/SceneCanvas'
import Navigation from './components/ui/Navigation'
import CommandDeck from './components/sections/CommandDeck'
import SystemArchLog from './components/sections/SystemArchLog'
import MasterVault from './components/sections/MasterVault'
import SecureUplink from './components/sections/SecureUplink'
import { ScrollProvider } from './context/ScrollContext'

export default function App() {
  return (
    <ScrollProvider>
      {/* Fixed WebGL canvas — floats behind all DOM content */}
      <SceneCanvas />

      {/* Scrollable HTML layer — pointer events fully active */}
      <div className="relative z-10">
        <Navigation />
        <main>
          <CommandDeck />
          <SystemArchLog />
          <MasterVault />
          <SecureUplink />
        </main>
      </div>
    </ScrollProvider>
  )
}
