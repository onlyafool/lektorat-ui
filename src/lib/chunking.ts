export interface TextChunk {
  id: string
  index: number
  content: string
  wordCount: number
  startOffset: number
  endOffset: number
  heading?: string
  overlapBefore?: string
  overlapAfter?: string
}

export interface ChunkingOptions {
  maxChunkWords: number
  overlapWords: number
  splitOnHeadings: boolean
}

const DEFAULT_OPTIONS: ChunkingOptions = {
  maxChunkWords: 3000,
  overlapWords: 200,
  splitOnHeadings: true,
}

const HEADING_PATTERNS = [
  /^#{1,6}\s+.+$/m,           // Markdown headings: # Title
  /^[A-ZÄÖÜ][A-ZÄÖÜ\s]{2,}$/m, // ALL CAPS headings
  /^Kapitel\s+\d+/mi,         // "Kapitel 1", "Kapitel 2"
  /^Chapter\s+\d+/mi,         // "Chapter 1"
  /^\d+\.\s+[A-ZÄÖÜ]/m,      // "1. Introduction"
  /^Teil\s+\d+/mi,            // "Teil 1"
  /^Prolog$/mi,               // "Prolog"
  /^Epilog$/mi,               // "Epilog"
  /^Nachwort$/mi,             // "Nachwort"
  /^Vorwort$/mi,              // "Vorwort"
]

function countWords(text: string): number {
  return text.split(/\s+/).filter((w) => w.length > 0).length
}

function getParagraphs(text: string): { text: string; start: number }[] {
  const paragraphs: { text: string; start: number }[] = []
  const lines = text.split('\n')

  let currentParagraph = ''
  let currentStart = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.trim() === '') {
      if (currentParagraph.trim()) {
        paragraphs.push({
          text: currentParagraph.trim(),
          start: currentStart,
        })
      }
      currentParagraph = ''
      currentStart = (currentParagraph || '').length + 1
    } else {
      if (!currentParagraph) {
        currentStart = paragraphs.reduce((sum, p) => sum + p.text.length + 2, 0)
      }
      currentParagraph += (currentParagraph ? '\n' : '') + line
    }
  }

  if (currentParagraph.trim()) {
    paragraphs.push({
      text: currentParagraph.trim(),
      start: paragraphs.reduce((sum, p) => sum + p.text.length + 2, 0),
    })
  }

  return paragraphs
}

function splitByHeadings(text: string): { heading: string; content: string; startOffset: number }[] {
  const sections: { heading: string; content: string; startOffset: number }[] = []
  const lines = text.split('\n')

  let currentHeading = ''
  let currentContent: string[] = []
  let currentOffset = 0
  let sectionStart = 0

  for (const line of lines) {
    const trimmed = line.trim()
    const isHeading = HEADING_PATTERNS.some((p) => p.test(trimmed))

    if (isHeading) {
      if (currentContent.length > 0 || currentHeading) {
        sections.push({
          heading: currentHeading || '(Ohne Überschrift)',
          content: currentContent.join('\n'),
          startOffset: sectionStart,
        })
      }
      currentHeading = trimmed
      currentContent = []
      sectionStart = currentOffset
    } else {
      currentContent.push(line)
    }

    currentOffset += line.length + 1
  }

  // Last section
  if (currentContent.length > 0 || currentHeading) {
    sections.push({
      heading: currentHeading || '(Ohne Überschrift)',
      content: currentContent.join('\n'),
      startOffset: sectionStart,
    })
  }

  return sections
}

function splitByParagraphs(
  paragraphs: { text: string; start: number }[],
  maxWords: number
): { text: string; start: number }[] {
  const chunks: { text: string; start: number }[] = []
  let currentChunk: string[] = []
  let currentWords = 0
  let currentStart = 0

  for (const para of paragraphs) {
    const paraWords = countWords(para.text)

    if (currentWords + paraWords > maxWords && currentChunk.length > 0) {
      chunks.push({
        text: currentChunk.join('\n\n'),
        start: currentStart,
      })
      currentChunk = []
      currentWords = 0
    }

    if (currentChunk.length === 0) {
      currentStart = para.start
    }

    currentChunk.push(para.text)
    currentWords += paraWords
  }

  if (currentChunk.length > 0) {
    chunks.push({
      text: currentChunk.join('\n\n'),
      start: currentStart,
    })
  }

  return chunks
}

export function chunkText(
  text: string,
  options: Partial<ChunkingOptions> = {}
): TextChunk[] {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const totalWords = countWords(text)

  // Short text: no chunking needed
  if (totalWords <= opts.maxChunkWords) {
    return [{
      id: 'chunk-0',
      index: 0,
      content: text,
      wordCount: totalWords,
      startOffset: 0,
      endOffset: text.length,
    }]
  }

  const chunks: TextChunk[] = []

  if (opts.splitOnHeadings) {
    // Split by headings first
    const sections = splitByHeadings(text)

    for (const section of sections) {
      const sectionWords = countWords(section.content)

      if (sectionWords <= opts.maxChunkWords) {
        chunks.push({
          id: `chunk-${chunks.length}`,
          index: chunks.length,
          content: section.content,
          wordCount: sectionWords,
          startOffset: section.startOffset,
          endOffset: section.startOffset + section.content.length,
          heading: section.heading,
        })
      } else {
        // Section too large: split by paragraphs
        const paragraphs = getParagraphs(section.content)
        const subChunks = splitByParagraphs(paragraphs, opts.maxChunkWords)

        for (const subChunk of subChunks) {
          chunks.push({
            id: `chunk-${chunks.length}`,
            index: chunks.length,
            content: subChunk.text,
            wordCount: countWords(subChunk.text),
            startOffset: section.startOffset + subChunk.start,
            endOffset: section.startOffset + subChunk.start + subChunk.text.length,
            heading: section.heading,
          })
        }
      }
    }
  } else {
    // Simple paragraph-based splitting
    const paragraphs = getParagraphs(text)
    const rawChunks = splitByParagraphs(paragraphs, opts.maxChunkWords)

    for (const raw of rawChunks) {
      chunks.push({
        id: `chunk-${chunks.length}`,
        index: chunks.length,
        content: raw.text,
        wordCount: countWords(raw.text),
        startOffset: raw.start,
        endOffset: raw.start + raw.text.length,
      })
    }
  }

  // Add overlap
  if (opts.overlapWords > 0 && chunks.length > 1) {
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]

      // Overlap from previous chunk
      if (i > 0) {
        const prevWords = chunks[i - 1].content.split(/\s+/)
        const overlap = prevWords.slice(-opts.overlapWords).join(' ')
        chunk.overlapBefore = overlap
      }

      // Overlap from next chunk
      if (i < chunks.length - 1) {
        const nextWords = chunks[i + 1].content.split(/\s+/)
        const overlap = nextWords.slice(0, opts.overlapWords).join(' ')
        chunk.overlapAfter = overlap
      }
    }
  }

  return chunks
}

export function mergeChunkResults(
  chunkResults: { chunkId: string; comments: Array<{ startIndex: number; endIndex: number; [key: string]: unknown }> }[]
): Array<{ startIndex: number; endIndex: number; chunkId: string; [key: string]: unknown }> {
  const allComments: Array<{ startIndex: number; endIndex: number; chunkId: string; [key: string]: unknown }> = []
  const seen = new Set<string>()

  for (const result of chunkResults) {
    for (const comment of result.comments) {
      // Simple dedup based on position and first 60 chars
      const key = `${comment.startIndex}-${comment.endIndex}-${JSON.stringify(comment).slice(0, 60)}`
      if (!seen.has(key)) {
        seen.add(key)
        allComments.push({
          ...comment,
          chunkId: result.chunkId,
        })
      }
    }
  }

  return allComments.sort((a, b) => a.startIndex - b.startIndex)
}
