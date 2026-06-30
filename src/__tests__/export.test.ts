import { describe, it, expect } from 'vitest'
import { exportToMarkdown } from '@/lib/export/markdown-export'
import type { ReviewComment } from '@/types'

describe('Export Functions', () => {
  const mockComments: ReviewComment[] = [
    {
      id: '1',
      textId: 'text-1',
      personaId: 'persona-1',
      startIndex: 0,
      endIndex: 5,
      originalText: 'Hallo',
      suggestedText: 'Hi',
      comment: 'Besserer Begrüßungsstil',
      category: 'style',
      severity: 'info',
      resolved: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      textId: 'text-1',
      personaId: 'persona-2',
      startIndex: 10,
      endIndex: 15,
      originalText: 'Fehler',
      comment: 'Grammatikfehler gefunden',
      category: 'grammar',
      severity: 'error',
      resolved: false,
      createdAt: new Date().toISOString(),
    },
  ]

  describe('exportToMarkdown', () => {
    it('generates markdown header', () => {
      const md = exportToMarkdown('Original', 'Überarbeitet', [])
      expect(md).toContain('# Lektorat Bericht')
      expect(md).toContain('**Datum:**')
    })

    it('includes comment count', () => {
      const md = exportToMarkdown('Original', 'Review', mockComments)
      expect(md).toContain('**Kommentare:** 2')
    })

    it('includes diff markers when enabled', () => {
      const md = exportToMarkdown('Original', 'Review', [], {
        includeComments: true,
        includeDiffMarkers: true,
      })
      expect(md).toContain('```diff')
    })

    it('includes reviewed text', () => {
      const md = exportToMarkdown('Original', 'Mein überarbeiteter Text', [])
      expect(md).toContain('Mein überarbeiteter Text')
    })

    it('includes comments with categories', () => {
      const md = exportToMarkdown('Original', 'Review', mockComments)
      expect(md).toContain('Grammatik')
      expect(md).toContain('Stil')
    })

    it('includes severity emojis', () => {
      const md = exportToMarkdown('Original', 'Review', mockComments)
      expect(md).toContain('❌')
      expect(md).toContain('ℹ️')
    })

    it('handles empty comments', () => {
      const md = exportToMarkdown('Original', 'Review', [])
      expect(md).toContain('**Kommentare:** 0')
    })

    it('skips comments section when includeComments is false', () => {
      const md = exportToMarkdown('Original', 'Review', mockComments, {
        includeComments: false,
        includeDiffMarkers: false,
      })
      expect(md).not.toContain('## Kommentare')
    })

    it('skips diff markers when disabled', () => {
      const md = exportToMarkdown('Original', 'Review', [], {
        includeComments: false,
        includeDiffMarkers: false,
      })
      expect(md).not.toContain('```diff')
    })
  })
})
