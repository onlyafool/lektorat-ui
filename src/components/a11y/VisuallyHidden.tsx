import { type ReactNode } from 'react'

interface VisuallyHiddenProps {
  children: ReactNode
  as?: keyof React.JSX.IntrinsicElements
}

// ═══════════════════════════════════════════════════════════════
// Visually Hidden (Screen Reader Only)
// ═══════════════════════════════════════════════════════════════

export function VisuallyHidden({ children, as: Component = 'span' }: VisuallyHiddenProps) {
  const style = {
    position: 'absolute' as const,
    border: 0,
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap' as const,
    wordWrap: 'normal' as const,
  }

  return (
    <Component style={style}>
      {children}
    </Component>
  )
}

// ═══════════════════════════════════════════════════════════════
// Skip Link
// ═══════════════════════════════════════════════════════════════

export function SkipLink({ href = '#main', children = 'Zum Hauptinhalt' }: { href?: string; children?: ReactNode }) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-white focus:outline-none"
    >
      {children}
    </a>
  )
}

// ═══════════════════════════════════════════════════════════════
// Focus Indicator
// ═══════════════════════════════════════════════════════════════

export function FocusIndicator() {
  return (
    <style>{`
      :focus-visible {
        outline: 2px solid #2563eb;
        outline-offset: 2px;
      }
      
      .focus-ring:focus-visible {
        outline: 2px solid #2563eb;
        outline-offset: 2px;
        border-radius: 4px;
      }
    `}</style>
  )
}

// ═══════════════════════════════════════════════════════════════
// Screen Reader Announcer
// ═══════════════════════════════════════════════════════════════

export function ScreenReaderAnnouncer() {
  return (
    <div
      id="sr-announcer"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    />
  )
}
