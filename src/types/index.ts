// ─── Shared Primitive Types ────────────────────────────────────────────────

export type SectionId = 'hero' | 'experience' | 'projects' | 'contact'

// ─── Scroll State ──────────────────────────────────────────────────────────

export interface SectionProgress {
  hero: number
  experience: number
  projects: number
  contact: number
}

export interface ScrollState {
  /** 0 – 1 across the full page height */
  scrollProgress: number
  /** Raw window.scrollY in pixels */
  scrollY: number
  /** Per-section 0 – 1 progress based on viewport intersection */
  sectionProgress: SectionProgress
  /** Section whose top edge is closest to mid-viewport */
  activeSection: SectionId
}

// ─── Mouse ─────────────────────────────────────────────────────────────────

export interface MousePosition {
  /** Pixel x coordinate */
  x: number
  /** Pixel y coordinate */
  y: number
  /** –1 … +1 horizontal, left-to-right */
  normalizedX: number
  /** –1 … +1 vertical, bottom-to-top (WebGL convention) */
  normalizedY: number
}

// ─── Project Registry ─────────────────────────────────────────────────────

export type TechCategory = 'frontend' | 'backend' | 'ai' | 'infra' | 'mobile'

export interface TechTag {
  name: string
  category: TechCategory
}

export interface SystemMetric {
  label: string
  /** 0 – 100 */
  value: number
  unit: string
}

export type ProjectStatus = 'ACTIVE' | 'DEPLOYED' | 'OPERATIONAL'

export interface Project {
  id: string
  codename: string
  title: string
  description: string
  category: string
  techStack: TechTag[]
  metrics: SystemMetric[]
  status: ProjectStatus
}

// ─── Timeline ──────────────────────────────────────────────────────────────

export interface TimelineEntry {
  id: string
  period: string
  role: string
  organization: string
  description: string
  tags: string[]
}

// ─── Camera ────────────────────────────────────────────────────────────────

export interface CameraKeyframe {
  position: readonly [number, number, number]
  target: readonly [number, number, number]
}
