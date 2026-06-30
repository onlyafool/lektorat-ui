export type DiffGranularity = 'word' | 'char' | 'line'

export interface DiffSegment {
  type: 'equal' | 'insert' | 'delete' | 'replace'
  oldValue?: string
  newValue?: string
  startIndex: number
  endIndex: number
}

export interface SemanticDiff {
  original: string
  reviewed: string
  segments: DiffSegment[]
  stats: {
    additions: number
    deletions: number
    modifications: number
    unchanged: number
  }
  granularity: DiffGranularity
}

// ═══════════════════════════════════════════════════════════════
// LCS-based Diff Algorithm
// ═══════════════════════════════════════════════════════════════

function lcs(a: string[], b: string[]): number[][] {
  const m = a.length
  const n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  return dp
}

function backtrack(
  dp: number[][],
  a: string[],
  b: string[],
  i: number,
  j: number
): DiffSegment[] {
  const segments: DiffSegment[] = []

  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      segments.unshift({
        type: 'equal',
        oldValue: a[i - 1],
        newValue: b[j - 1],
        startIndex: i - 1,
        endIndex: i,
      })
      i--
      j--
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      segments.unshift({
        type: 'delete',
        oldValue: a[i - 1],
        startIndex: i - 1,
        endIndex: i,
      })
      i--
    } else {
      segments.unshift({
        type: 'insert',
        newValue: b[j - 1],
        startIndex: i,
        endIndex: i + 1,
      })
      j--
    }
  }

  while (i > 0) {
    segments.unshift({
      type: 'delete',
      oldValue: a[i - 1],
      startIndex: i - 1,
      endIndex: i,
    })
    i--
  }

  while (j > 0) {
    segments.unshift({
      type: 'insert',
      newValue: b[j - 1],
      startIndex: i,
      endIndex: i + 1,
    })
    j--
  }

  return segments
}

// ═══════════════════════════════════════════════════════════════
// Tokenization
// ═══════════════════════════════════════════════════════════════

function tokenizeByLine(text: string): string[] {
  return text.split('\n')
}

function tokenizeByWord(text: string): string[] {
  return text.split(/(\s+)/).filter(Boolean)
}

function tokenizeByChar(text: string): string[] {
  return text.split('')
}

function tokenize(text: string, granularity: DiffGranularity): string[] {
  switch (granularity) {
    case 'line':
      return tokenizeByLine(text)
    case 'word':
      return tokenizeByWord(text)
    case 'char':
      return tokenizeByChar(text)
  }
}

// ═══════════════════════════════════════════════════════════════
// Semantic Diff for Markdown (Structure-Aware)
// ═══════════════════════════════════════════════════════════════

export interface MarkdownElement {
  type: 'heading' | 'paragraph' | 'list' | 'code' | 'blockquote' | 'hr' | 'text'
  level?: number
  content: string
  startIndex: number
  endIndex: number
}

export function parseMarkdownStructure(text: string): MarkdownElement[] {
  const elements: MarkdownElement[] = []
  const lines = text.split('\n')
  let currentIndex = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineStart = currentIndex
    const lineEnd = currentIndex + line.length

    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/)
    if (headingMatch) {
      elements.push({
        type: 'heading',
        level: headingMatch[1].length,
        content: headingMatch[2],
        startIndex: lineStart,
        endIndex: lineEnd,
      })
    }
    // Horizontal rule
    else if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      elements.push({
        type: 'hr',
        content: line,
        startIndex: lineStart,
        endIndex: lineEnd,
      })
    }
    // Code block
    else if (line.trim().startsWith('```')) {
      let codeContent = line
      while (i + 1 < lines.length && !lines[i + 1].trim().startsWith('```')) {
        i++
        codeContent += '\n' + lines[i]
      }
      if (i + 1 < lines.length) {
        i++
        codeContent += '\n' + lines[i]
      }
      elements.push({
        type: 'code',
        content: codeContent,
        startIndex: lineStart,
        endIndex: currentIndex + lines[i].length,
      })
    }
    // List items
    else if (/^[\s]*[-*+]\s/.test(line) || /^[\s]*\d+\.\s/.test(line)) {
      elements.push({
        type: 'list',
        content: line,
        startIndex: lineStart,
        endIndex: lineEnd,
      })
    }
    // Blockquote
    else if (line.trim().startsWith('>')) {
      elements.push({
        type: 'blockquote',
        content: line,
        startIndex: lineStart,
        endIndex: lineEnd,
      })
    }
    // Paragraph (default)
    else if (line.trim()) {
      elements.push({
        type: 'paragraph',
        content: line,
        startIndex: lineStart,
        endIndex: lineEnd,
      })
    }

    currentIndex = lineEnd + 1 // +1 for newline
  }

  return elements
}

export function semanticDiffMarkdown(original: string, reviewed: string): SemanticDiff {
  const originalElements = parseMarkdownStructure(original)
  const reviewedElements = parseMarkdownStructure(reviewed)

  // Compare elements by type and content
  const segments: DiffSegment[] = []
  let additions = 0
  let deletions = 0
  let modifications = 0
  let unchanged = 0

  const maxLen = Math.max(originalElements.length, reviewedElements.length)

  for (let i = 0; i < maxLen; i++) {
    const orig = originalElements[i]
    const rev = reviewedElements[i]

    if (!orig) {
      // Insertion
      segments.push({
        type: 'insert',
        newValue: rev.content,
        startIndex: rev.startIndex,
        endIndex: rev.endIndex,
      })
      additions++
    } else if (!rev) {
      // Deletion
      segments.push({
        type: 'delete',
        oldValue: orig.content,
        startIndex: orig.startIndex,
        endIndex: orig.endIndex,
      })
      deletions++
    } else if (orig.content === rev.content) {
      // Unchanged
      segments.push({
        type: 'equal',
        oldValue: orig.content,
        newValue: rev.content,
        startIndex: orig.startIndex,
        endIndex: orig.endIndex,
      })
      unchanged++
    } else {
      // Modification
      segments.push({
        type: 'replace',
        oldValue: orig.content,
        newValue: rev.content,
        startIndex: orig.startIndex,
        endIndex: rev.endIndex,
      })
      modifications++
    }
  }

  return {
    original,
    reviewed,
    segments,
    stats: { additions, deletions, modifications, unchanged },
    granularity: 'line',
  }
}

// ═══════════════════════════════════════════════════════════════
// Main Diff Function
// ═══════════════════════════════════════════════════════════════

export function computeDiff(
  original: string,
  reviewed: string,
  granularity: DiffGranularity = 'word',
  format: 'text' | 'markdown' = 'text'
): SemanticDiff {
  if (format === 'markdown') {
    return semanticDiffMarkdown(original, reviewed)
  }

  const origTokens = tokenize(original, granularity)
  const revTokens = tokenize(reviewed, granularity)

  const dp = lcs(origTokens, revTokens)
  const rawSegments = backtrack(dp, origTokens, revTokens, origTokens.length, revTokens.length)

  // Merge consecutive segments of same type
  const segments: DiffSegment[] = []
  let additions = 0
  let deletions = 0
  let modifications = 0
  let unchanged = 0

  for (const seg of rawSegments) {
    const last = segments[segments.length - 1]
    if (last && last.type === seg.type) {
      // Merge
      if (seg.type === 'equal' || seg.type === 'replace') {
        last.newValue = (last.newValue || '') + (seg.newValue || '')
      }
      if (seg.type === 'equal' || seg.type === 'delete') {
        last.oldValue = (last.oldValue || '') + (seg.oldValue || '')
      }
      last.endIndex = seg.endIndex
    } else {
      segments.push({ ...seg })
    }
  }

  // Count stats
  for (const seg of segments) {
    switch (seg.type) {
      case 'insert':
        additions++
        break
      case 'delete':
        deletions++
        break
      case 'replace':
        modifications++
        break
      case 'equal':
        unchanged++
        break
    }
  }

  return {
    original,
    reviewed,
    segments,
    stats: { additions, deletions, modifications, unchanged },
    granularity,
  }
}

// ═══════════════════════════════════════════════════════════════
// Diff Rendering Helpers
// ═══════════════════════════════════════════════════════════════

export function diffToHtml(diff: SemanticDiff): string {
  let html = ''

  for (const seg of diff.segments) {
    switch (seg.type) {
      case 'equal':
        html += escapeHtml(seg.oldValue || '')
        break
      case 'insert':
        html += `<mark class="diff-insert">${escapeHtml(seg.newValue || '')}</mark>`
        break
      case 'delete':
        html += `<mark class="diff-delete">${escapeHtml(seg.oldValue || '')}</mark>`
        break
      case 'replace':
        html += `<mark class="diff-delete">${escapeHtml(seg.oldValue || '')}</mark>`
        html += `<mark class="diff-insert">${escapeHtml(seg.newValue || '')}</mark>`
        break
    }
  }

  return html
}

export function diffToUnifiedPatch(diff: SemanticDiff): string {
  let patch = ''
  let lineNum = 0

  for (const seg of diff.segments) {
    const oldLines = (seg.oldValue || '').split('\n')
    const newLines = (seg.newValue || '').split('\n')

    switch (seg.type) {
      case 'equal':
        for (const line of oldLines) {
          patch += ` ${line}\n`
          lineNum++
        }
        break
      case 'insert':
        for (const line of newLines) {
          patch += `+${line}\n`
          lineNum++
        }
        break
      case 'delete':
        for (const line of oldLines) {
          patch += `-${line}\n`
          lineNum++
        }
        break
      case 'replace':
        for (const line of oldLines) {
          patch += `-${line}\n`
          lineNum++
        }
        for (const line of newLines) {
          patch += `+${line}\n`
          lineNum++
        }
        break
    }
  }

  return patch
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
