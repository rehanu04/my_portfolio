import { useScrollContext } from '../context/ScrollContext'
import type { SectionId, ScrollState } from '../types'

/** Returns the full global scroll state */
export function useScrollProgress(): ScrollState {
  const { scrollState } = useScrollContext()
  return scrollState
}

/** Returns the 0–1 progress value for a specific section */
export function useSectionProgress(sectionId: SectionId): number {
  const { scrollState } = useScrollContext()
  return scrollState.sectionProgress[sectionId]
}
