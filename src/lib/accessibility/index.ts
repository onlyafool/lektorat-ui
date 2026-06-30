// ═══════════════════════════════════════════════════════════════
// Accessibility Utilities (WCAG 2.1 AA)
// ═══════════════════════════════════════════════════════════════

// Focus management
export function trapFocus(element: HTMLElement): () => void {
  const focusableElements = element.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )

  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key !== 'Tab') return

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement?.focus()
        e.preventDefault()
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement?.focus()
        e.preventDefault()
      }
    }
  }

  element.addEventListener('keydown', handleKeyDown)
  firstElement?.focus()

  return () => {
    element.removeEventListener('keydown', handleKeyDown)
  }
}

// Announce to screen readers
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcer = document.getElementById('sr-announcer')
  if (announcer) {
    announcer.setAttribute('aria-live', priority)
    announcer.textContent = message
    // Clear after announcement
    setTimeout(() => {
      announcer.textContent = ''
    }, 1000)
  }
}

// Skip to main content
export function skipToMainContent() {
  const main = document.querySelector('main')
  if (main) {
    main.tabIndex = -1
    main.focus()
    main.scrollIntoView({ behavior: 'smooth' })
  }
}

// Keyboard shortcut handler
export type ShortcutHandler = (e: KeyboardEvent) => void

const shortcuts = new Map<string, ShortcutHandler>()

export function registerShortcut(combo: string, handler: ShortcutHandler) {
  shortcuts.set(combo, handler)
}

export function unregisterShortcut(combo: string) {
  shortcuts.delete(combo)
}

export function handleKeyboardShortcuts(e: KeyboardEvent) {
  const combo = [
    e.ctrlKey || e.metaKey ? 'Ctrl' : '',
    e.shiftKey ? 'Shift' : '',
    e.altKey ? 'Alt' : '',
    e.key.toUpperCase(),
  ]
    .filter(Boolean)
    .join('+')

  const handler = shortcuts.get(combo)
  if (handler) {
    e.preventDefault()
    handler(e)
  }
}

// Color contrast checker (WCAG AA requires 4.5:1 for normal text)
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)

  if (!rgb1 || !rgb2) return 0

  const l1 = getRelativeLuminance(rgb1)
  const l2 = getRelativeLuminance(rgb2)

  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)

  return (lighter + 0.05) / (darker + 0.05)
}

export function meetsWCAGAA(color1: string, color2: string, isLargeText = false): boolean {
  const ratio = getContrastRatio(color1, color2)
  return isLargeText ? ratio >= 3 : ratio >= 4.5
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

function getRelativeLuminance({ r, g, b }: { r: number; g: number; b: number }): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

// ARIA helpers
export function generateAriaId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

// Live region for dynamic content
export function createLiveRegion(id: string, priority: 'polite' | 'assertive' = 'polite'): HTMLElement {
  let region = document.getElementById(id)
  if (!region) {
    region = document.createElement('div')
    region.id = id
    region.setAttribute('aria-live', priority)
    region.setAttribute('aria-atomic', 'true')
    region.className = 'sr-only'
    document.body.appendChild(region)
  }
  return region
}
