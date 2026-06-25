import type { ReactNode } from 'react'

// ─── Props ─────────────────────────────────────────────────────────────────

interface SectionWrapperProps {
  children: ReactNode
  className?: string
  id?: string
}

// ─── Component ─────────────────────────────────────────────────────────────

/**
 * Thin layout wrapper providing a consistent relative positioning context
 * for sections that need to layer DOM elements above the WebGL canvas.
 */
export default function SectionWrapper({ children, className = '', id }: SectionWrapperProps) {
  return (
    <div id={id} className={`relative ${className}`}>
      {children}
    </div>
  )
}
