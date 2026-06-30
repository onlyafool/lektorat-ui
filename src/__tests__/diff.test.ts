import { describe, it, expect } from 'vitest'
import { computeDiff, semanticDiffMarkdown, diffToHtml, diffToUnifiedPatch } from '@/lib/diff/semantic-diff'

describe('computeDiff', () => {
  it('detects equal text', () => {
    const diff = computeDiff('Hello World', 'Hello World')
    expect(diff.segments.every((s) => s.type === 'equal')).toBe(true)
    expect(diff.stats.additions).toBe(0)
    expect(diff.stats.deletions).toBe(0)
  })

  it('detects insertions', () => {
    const diff = computeDiff('Hello', 'Hello World')
    expect(diff.stats.additions).toBeGreaterThan(0)
  })

  it('detects deletions', () => {
    const diff = computeDiff('Hello World', 'Hello')
    expect(diff.stats.deletions).toBeGreaterThan(0)
  })

  it('detects replacements', () => {
    const diff = computeDiff('Hello World', 'Hi World')
    // Word-level diff: 'Hello' is deleted, 'Hi' is inserted
    expect(diff.stats.deletions + diff.stats.additions).toBeGreaterThan(0)
  })

  it('works with word granularity', () => {
    const diff = computeDiff('Hello World', 'Hello Beautiful World', undefined, 'text')
    expect(diff.granularity).toBe('word')
  })

  it('works with line granularity', () => {
    const diff = computeDiff('Line 1\nLine 2', 'Line 1\nLine 3', 'line')
    expect(diff.granularity).toBe('line')
  })
})

describe('semanticDiffMarkdown', () => {
  it('detects heading changes', () => {
    const original = '# Title\nContent'
    const reviewed = '# New Title\nContent'
    const diff = semanticDiffMarkdown(original, reviewed)
    expect(diff.segments.length).toBeGreaterThan(0)
  })

  it('detects new paragraphs', () => {
    const original = 'Paragraph 1'
    const reviewed = 'Paragraph 1\n\nParagraph 2'
    const diff = semanticDiffMarkdown(original, reviewed)
    expect(diff.stats.additions).toBeGreaterThan(0)
  })
})

describe('diffToHtml', () => {
  it('renders equal text', () => {
    const diff = computeDiff('Hello', 'Hello')
    const html = diffToHtml(diff)
    expect(html).toContain('Hello')
    expect(html).not.toContain('<mark')
  })

  it('renders insertions', () => {
    const diff = computeDiff('Hello', 'Hello World')
    const html = diffToHtml(diff)
    expect(html).toContain('diff-insert')
  })

  it('renders deletions', () => {
    const diff = computeDiff('Hello World', 'Hello')
    const html = diffToHtml(diff)
    expect(html).toContain('diff-delete')
  })
})

describe('diffToUnifiedPatch', () => {
  it('generates unified diff format', () => {
    const diff = computeDiff('Line 1\nLine 2', 'Line 1\nLine 3', 'line')
    const patch = diffToUnifiedPatch(diff)
    expect(patch).toContain('+')
    expect(patch).toContain('-')
  })
})
