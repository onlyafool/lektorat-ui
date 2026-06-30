import { describe, it, expect } from 'vitest'
import { chunkText, mergeChunkResults } from '@/lib/chunking'

describe('chunkText', () => {
  it('returns single chunk for short text', () => {
    const text = 'Das ist ein kurzer Text mit ein paar Worten.'
    const chunks = chunkText(text)

    expect(chunks.length).toBe(1)
    expect(chunks[0].content).toBe(text)
  })

  it('splits long text into multiple chunks', () => {
    const text = Array.from({ length: 100 }, (_, i) =>
      `Absatz ${i + 1}: ${'Wort '.repeat(50)}`
    ).join('\n\n')

    const chunks = chunkText(text, { maxChunkWords: 500 })

    expect(chunks.length).toBeGreaterThan(1)
  })

  it('splits on markdown headings', () => {
    const text = `# Kapitel 1

${'Text '.repeat(100)}

# Kapitel 2

${'Text '.repeat(100)}

# Kapitel 3

${'Text '.repeat(100)}`

    const chunks = chunkText(text, { maxChunkWords: 200, splitOnHeadings: true })

    expect(chunks.length).toBe(3)
    expect(chunks[0].heading).toBe('# Kapitel 1')
    expect(chunks[1].heading).toBe('# Kapitel 2')
    expect(chunks[2].heading).toBe('# Kapitel 3')
  })

  it('splits on "Kapitel N" headings', () => {
    const text = `Kapitel 1

${'Text '.repeat(100)}

Kapitel 2

${'Text '.repeat(100)}`

    const chunks = chunkText(text, { maxChunkWords: 200, splitOnHeadings: true })

    expect(chunks.length).toBe(2)
    expect(chunks[0].heading).toBe('Kapitel 1')
  })

  it('adds overlap between chunks', () => {
    const paragraphs = Array.from({ length: 20 }, (_, i) =>
      `Absatz ${i + 1}: ${'Wort '.repeat(30)}`
    )
    const text = paragraphs.join('\n\n')

    const chunks = chunkText(text, { maxChunkWords: 100, overlapWords: 20 })

    expect(chunks.length).toBeGreaterThan(1)
    // Second chunk should have overlap from first
    expect(chunks[1].overlapBefore).toBeDefined()
    expect(chunks[1].overlapBefore!.length).toBeGreaterThan(0)
  })

  it('preserves chunk IDs and indices', () => {
    const text = Array.from({ length: 100 }, (_, i) =>
      `Absatz ${i + 1}: ${'Wort '.repeat(50)}`
    ).join('\n\n')

    const chunks = chunkText(text, { maxChunkWords: 500 })

    chunks.forEach((chunk, i) => {
      expect(chunk.id).toBe(`chunk-${i}`)
      expect(chunk.index).toBe(i)
    })
  })

  it('calculates word counts correctly', () => {
    const text = 'Ein zwei drei vier fünf'
    const chunks = chunkText(text)

    expect(chunks[0].wordCount).toBe(5)
  })

  it('disables heading split when splitOnHeadings is false', () => {
    const text = `# Kapitel 1

${'Text '.repeat(100)}

# Kapitel 2

${'Text '.repeat(100)}`

    const chunks = chunkText(text, { maxChunkWords: 200, splitOnHeadings: false })

    // Should still split, but not on headings
    expect(chunks.length).toBeGreaterThan(1)
    expect(chunks[0].heading).toBeUndefined()
  })
})

describe('mergeChunkResults', () => {
  it('merges comments from multiple chunks', () => {
    const results = [
      {
        chunkId: 'chunk-0',
        comments: [
          { startIndex: 0, endIndex: 10, comment: 'Fehler 1' },
          { startIndex: 20, endIndex: 30, comment: 'Fehler 2' },
        ],
      },
      {
        chunkId: 'chunk-1',
        comments: [
          { startIndex: 100, endIndex: 110, comment: 'Fehler 3' },
        ],
      },
    ]

    const merged = mergeChunkResults(results)

    expect(merged.length).toBe(3)
    expect(merged[0].chunkId).toBe('chunk-0')
  })

  it('deduplicates identical comments', () => {
    const results = [
      {
        chunkId: 'chunk-0',
        comments: [
          { startIndex: 0, endIndex: 10, comment: 'Fehler 1' },
        ],
      },
      {
        chunkId: 'chunk-1',
        comments: [
          { startIndex: 0, endIndex: 10, comment: 'Fehler 1' },
        ],
      },
    ]

    const merged = mergeChunkResults(results)

    expect(merged.length).toBe(1)
  })

  it('sorts comments by position', () => {
    const results = [
      {
        chunkId: 'chunk-0',
        comments: [
          { startIndex: 50, endIndex: 60, comment: 'Später' },
          { startIndex: 10, endIndex: 20, comment: 'Früher' },
        ],
      },
    ]

    const merged = mergeChunkResults(results)

    expect(merged[0].startIndex).toBe(10)
    expect(merged[1].startIndex).toBe(50)
  })
})
