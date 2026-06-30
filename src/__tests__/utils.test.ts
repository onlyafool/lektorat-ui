import { describe, it, expect } from 'vitest'
import { cn, generateId, formatDate, truncate, debounce, throttle } from '@/lib/utils'

describe('cn (classnames)', () => {
  it('merges class names', () => {
    const result = cn('foo', 'bar')
    expect(result).toBe('foo bar')
  })

  it('handles conditional classes', () => {
    const showBar = false
    const result = cn('foo', showBar && 'bar', 'baz')
    expect(result).toBe('foo baz')
  })

  it('merges tailwind classes', () => {
    const result = cn('px-4 py-2', 'px-8')
    expect(result).toBe('py-2 px-8')
  })
})

describe('generateId', () => {
  it('generates unique IDs', () => {
    const id1 = generateId()
    const id2 = generateId()
    expect(id1).not.toBe(id2)
  })

  it('generates UUID format', () => {
    const id = generateId()
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
  })
})

describe('formatDate', () => {
  it('formats date in German', () => {
    const date = new Date('2024-01-15T10:30:00')
    const formatted = formatDate(date)
    expect(formatted).toContain('15')
    expect(formatted).toContain('01')
    expect(formatted).toContain('2024')
  })

  it('handles string dates', () => {
    const formatted = formatDate('2024-01-15T10:30:00')
    expect(formatted).toContain('15')
  })
})

describe('truncate', () => {
  it('truncates long strings', () => {
    const result = truncate('Hello World', 5)
    expect(result).toBe('Hello...')
  })

  it('does not truncate short strings', () => {
    const result = truncate('Hi', 5)
    expect(result).toBe('Hi')
  })
})

describe('debounce', () => {
  it('delays function execution', async () => {
    let callCount = 0
    const debouncedFn = debounce(() => {
      callCount++
    }, 100)

    debouncedFn()
    debouncedFn()
    debouncedFn()

    expect(callCount).toBe(0)

    await new Promise((resolve) => setTimeout(resolve, 150))
    expect(callCount).toBe(1)
  })
})

describe('throttle', () => {
  it('limits function calls', async () => {
    let callCount = 0
    const throttledFn = throttle(() => {
      callCount++
    }, 100)

    throttledFn()
    throttledFn()
    throttledFn()

    expect(callCount).toBe(1)

    await new Promise((resolve) => setTimeout(resolve, 150))
    throttledFn()
    expect(callCount).toBe(2)
  })
})
