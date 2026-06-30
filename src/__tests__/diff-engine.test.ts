import { describe, it, expect } from 'vitest'
import {
  computeDiff,
  semanticDiffMarkdown,
  diffToHtml,
  diffToUnifiedPatch,
  parseMarkdownStructure,
} from '@/lib/diff/semantic-diff'

describe('Semantic Diff Engine', () => {
  describe('computeDiff', () => {
    it('detects insertions', () => {
      const diff = computeDiff('Hallo', 'Hallo Welt')
      expect(diff.stats.additions).toBeGreaterThan(0)
      expect(diff.segments.some(s => s.type === 'insert')).toBe(true)
    })

    it('detects deletions', () => {
      const diff = computeDiff('Hallo Welt', 'Hallo')
      expect(diff.stats.deletions).toBeGreaterThan(0)
      expect(diff.segments.some(s => s.type === 'delete')).toBe(true)
    })

    it('works with word granularity', () => {
      const diff = computeDiff('Das ist ein Test', 'Das ist ein guter Test', 'word')
      expect(diff.stats.additions).toBe(1)
      expect(diff.granularity).toBe('word')
    })

    it('works with line granularity', () => {
      const diff = computeDiff('Zeile 1\nZeile 2', 'Zeile 1\nGeändert\nZeile 2', 'line')
      expect(diff.stats.additions).toBeGreaterThan(0)
    })

    it('works with char granularity', () => {
      const diff = computeDiff('ABC', 'AXC', 'char')
      expect(diff.segments.length).toBeGreaterThan(0)
    })

    it('returns correct structure', () => {
      const diff = computeDiff('A', 'B')
      expect(diff).toHaveProperty('original')
      expect(diff).toHaveProperty('reviewed')
      expect(diff).toHaveProperty('segments')
      expect(diff).toHaveProperty('stats')
      expect(diff).toHaveProperty('granularity')
    })

    it('uses word granularity by default', () => {
      const diff = computeDiff('A B', 'A C')
      expect(diff.granularity).toBe('word')
    })
  })

  describe('parseMarkdownStructure', () => {
    it('parses headings', () => {
      const elements = parseMarkdownStructure('# Titel\nInhalt')
      expect(elements[0].type).toBe('heading')
      expect(elements[0].level).toBe(1)
      expect(elements[0].content).toBe('Titel')
    })

    it('parses paragraphs', () => {
      const elements = parseMarkdownStructure('Normaler Text')
      expect(elements[0].type).toBe('paragraph')
    })

    it('parses lists', () => {
      const elements = parseMarkdownStructure('- Element 1\n- Element 2')
      expect(elements[0].type).toBe('list')
    })

    it('parses code blocks', () => {
      const elements = parseMarkdownStructure('```\ncode\n```')
      expect(elements[0].type).toBe('code')
    })

    it('parses blockquotes', () => {
      const elements = parseMarkdownStructure('> Zitat')
      expect(elements[0].type).toBe('blockquote')
    })

    it('parses horizontal rules', () => {
      const elements = parseMarkdownStructure('---')
      expect(elements[0].type).toBe('hr')
    })
  })

  describe('semanticDiffMarkdown', () => {
    it('detects heading changes', () => {
      const result = semanticDiffMarkdown('# Titel', '# Neuer Titel')
      expect(result.stats.modifications).toBe(1)
    })

    it('detects new paragraphs', () => {
      const result = semanticDiffMarkdown('Absatz 1', 'Absatz 1\n\nAbsatz 2')
      expect(result.stats.additions).toBe(1)
    })

    it('detects deleted paragraphs', () => {
      const result = semanticDiffMarkdown('A\nB', 'A')
      expect(result.stats.deletions).toBe(1)
    })

    it('marks equal content', () => {
      const result = semanticDiffMarkdown('Gleich', 'Gleich')
      expect(result.stats.unchanged).toBe(1)
    })
  })

  describe('diffToHtml', () => {
    it('renders equal text as plain text', () => {
      const diff = computeDiff('Hallo', 'Hallo', 'word')
      const html = diffToHtml(diff)
      expect(html).toContain('Hallo')
      expect(html).not.toContain('<mark')
    })

    it('renders deletions with diff-delete class', () => {
      const diff = computeDiff('Weg damit', '', 'word')
      const html = diffToHtml(diff)
      expect(html).toContain('diff-delete')
    })

    it('renders insertions with diff-insert class', () => {
      const diff = computeDiff('', 'Neu hier', 'word')
      const html = diffToHtml(diff)
      expect(html).toContain('diff-insert')
    })

    it('escapes HTML in diff output', () => {
      const diff = computeDiff('Weg', 'Neu', 'char')
      const html = diffToHtml(diff)
      expect(html).toContain('<mark class="diff-delete">')
      expect(html).toContain('<mark class="diff-insert">')
      expect(html).toContain('</mark>')
    })
  })

  describe('diffToUnifiedPatch', () => {
    it('prefixes insertions with +', () => {
      const diff = computeDiff('', 'Neue Zeile', 'line')
      const patch = diffToUnifiedPatch(diff)
      expect(patch).toContain('+Neue Zeile')
    })

    it('prefixes deletions with -', () => {
      const diff = computeDiff('Alte Zeile', '', 'line')
      const patch = diffToUnifiedPatch(diff)
      expect(patch).toContain('-Alte Zeile')
    })

    it('prefixes equal lines with space', () => {
      const diff = computeDiff('Gleich', 'Gleich', 'line')
      const patch = diffToUnifiedPatch(diff)
      expect(patch).toContain(' Gleich')
    })
  })
})
