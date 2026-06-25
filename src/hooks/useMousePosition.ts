import { useScrollContext } from '../context/ScrollContext'
import type { MousePosition } from '../types'

/** Returns the normalised mouse position from the global scroll context */
export function useMousePosition(): MousePosition {
  const { mousePosition } = useScrollContext()
  return mousePosition
}
