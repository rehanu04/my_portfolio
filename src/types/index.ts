// ─────────────────────────────────────────────────────────────────────────────
// src/types/index.ts
// Ground-truth TypeScript interfaces for the entire portfolio runtime.
// ─────────────────────────────────────────────────────────────────────────────

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
  /** Pixel delta from last frame — x axis */
  velocityX: number
  /** Pixel delta from last frame — y axis */
  velocityY: number
}

// ─── Cursor / Focal Point ──────────────────────────────────────────────────

/**
 * World-space focal point emitted when the DOM cursor hovers over a project
 * card or interactive element. The WebGL shader layer reads this to warp
 * the Lorenz attractor field toward the active card's spatial position.
 */
export interface CursorFocalPoint {
  /** WebGL-space X coordinate (normalised –1…+1 or raw world units) */
  x: number
  /** WebGL-space Y coordinate */
  y: number
  /** Active element id for targeted glow — null when idle */
  targetId: string | null
  /** Whether the cursor is in telemetry-reticle hover mode */
  isHovering: boolean
}

// ─── Project Registry ─────────────────────────────────────────────────────

export type TechCategory = 'frontend' | 'backend' | 'ai' | 'infra' | 'mobile'

export interface TechTag {
  name: string
  category: TechCategory
}

export interface SystemMetric {
  label: string
  /** Factual descriptor or numeric value */
  value: string | number
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
