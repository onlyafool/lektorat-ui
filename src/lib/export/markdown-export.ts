import type { ReviewComment } from '@/types'

export interface MarkdownExportOptions {
  includeComments: boolean
  includeDiffMarkers: boolean
}

// ═══════════════════════════════════════════════════════════════
// Markdown Export with Diff Markers
// ═══════════════════════════════════════════════════════════════

export function exportToMarkdown(
  originalText: string,
  reviewedText: string,
  comments: ReviewComment[],
  options: MarkdownExportOptions = { includeComments: true, includeDiffMarkers: true }
): string {
  let md = ''

  // Header
  md += '# Lektorat Bericht\n\n'
  md += `**Datum:** ${new Date().toLocaleDateString('de-DE')}\n\n`
  md += `**Kommentare:** ${comments.length}\n\n`

  if (options.includeDiffMarkers) {
    // Diff view with markers
    md += '## Überarbeiteter Text (mit Diff-Markern)\n\n'
    md += '> 🔴 = Entfernt | 🟢 = Hinzugefügt\n\n'
    md += '```diff\n'
    md += createDiffText(originalText, reviewedText)
    md += '```\n\n'
  }

  // Clean reviewed text
  md += '## Überarbeiteter Text\n\n'
  md += reviewedText + '\n\n'

  // Comments
  if (options.includeComments && comments.length > 0) {
    md += '## Kommentare\n\n'

    const categoryLabels: Record<string, string> = {
      grammar: 'Grammatik',
      style: 'Stil',
      clarity: 'Klarheit',
      fact: 'Fakten',
      logic: 'Logik',
      consistency: 'Konsistenz',
    }

    const severityEmoji: Record<string, string> = {
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
    }

    for (const comment of comments) {
      md += `### ${severityEmoji[comment.severity]} ${categoryLabels[comment.category]}\n\n`
      md += comment.comment + '\n\n'
      md += `*${new Date(comment.createdAt).toLocaleTimeString('de-DE')}*\n\n`
      md += '---\n\n'
    }
  }

  return md
}

function createDiffText(original: string, reviewed: string): string {
  const originalLines = original.split('\n')
  const reviewedLines = reviewed.split('\n')
  let diff = ''

  const maxLen = Math.max(originalLines.length, reviewedLines.length)

  for (let i = 0; i < maxLen; i++) {
    const origLine = originalLines[i] || ''
    const revLine = reviewedLines[i] || ''

    if (origLine === revLine) {
      diff += `  ${origLine}\n`
    } else {
      if (origLine) {
        diff += `- ${origLine}\n`
      }
      if (revLine) {
        diff += `+ ${revLine}\n`
      }
    }
  }

  return diff
}

// ═══════════════════════════════════════════════════════════════
// Download Helper
// ═══════════════════════════════════════════════════════════════

export function downloadMarkdown(
  originalText: string,
  reviewedText: string,
  comments: ReviewComment[],
  filename: string = 'lektorat-export.md'
): void {
  const md = exportToMarkdown(originalText, reviewedText, comments)
  const blob = new Blob([md], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
