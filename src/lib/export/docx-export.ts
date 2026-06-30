import JSZip from 'jszip'
import type { ReviewComment } from '@/types'

export interface DocxExportOptions {
  title?: string
  author?: string
  includeComments: boolean
  includeTrackChanges: boolean
}

// ═══════════════════════════════════════════════════════════════
// DOCX Export with Track Changes
// ═══════════════════════════════════════════════════════════════

export async function exportToDocx(
  originalText: string,
  reviewedText: string,
  comments: ReviewComment[],
  options: DocxExportOptions = { includeComments: true, includeTrackChanges: true }
): Promise<Blob> {
  const zip = new JSZip()

  // Create document.xml with track changes
  const documentXml = createDocumentXml(
    originalText,
    reviewedText,
    comments,
    options
  )

  // Create comments.xml if needed
  const commentsXml = options.includeComments
    ? createCommentsXml(comments)
    : null

  // Add all required DOCX files
  zip.file('[Content_Types].xml', createContentTypes(commentsXml !== null))
  zip.file('_rels/.rels', createRels())
  zip.file('word/document.xml', documentXml)
  zip.file('word/_rels/document.xml.rels', createDocumentRels(commentsXml !== null))

  if (commentsXml) {
    zip.file('word/comments.xml', commentsXml)
  }

  // Add styles
  zip.file('word/styles.xml', createStylesXml())

  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE' })
}

function createDocumentXml(
  originalText: string,
  reviewedText: string,
  comments: ReviewComment[],
  options: DocxExportOptions
): string {
  const originalLines = originalText.split('\n')
  const reviewedLines = reviewedText.split('\n')

  let body = ''

  if (options.includeTrackChanges) {
    // Generate track changes XML
    body = generateTrackChangesXml(originalLines, reviewedLines, comments)
  } else {
    // Just the reviewed text
    for (const line of reviewedLines) {
      body += `    <w:p><w:r><w:t>${escapeXml(line)}</w:t></w:r></w:p>\n`
    }
  }

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
            xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
            xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
            xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
            xmlns:v="urn:schemas-microsoft-com:vml"
            xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
            xmlns:w10="urn:schemas-microsoft-com:office:word"
            xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml"
            mc:Ignorable="w14 wp14">
  <w:body>
${body}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`
}

function generateTrackChangesXml(
  originalLines: string[],
  reviewedLines: string[],
  _comments: ReviewComment[]
): string {
  let xml = ''
  const maxLines = Math.max(originalLines.length, reviewedLines.length)

  for (let i = 0; i < maxLines; i++) {
    const origLine = originalLines[i] || ''
    const revLine = reviewedLines[i] || ''

    if (origLine === revLine) {
      // Unchanged
      xml += `    <w:p><w:r><w:t>${escapeXml(origLine)}</w:t></w:r></w:p>\n`
    } else {
      // Track change
      const revId = i + 1
      xml += `    <w:p>\n`

      if (origLine) {
        xml += `      <w:del w:id="${revId}" w:author="Lektorat UI" w:date="${new Date().toISOString()}">\n`
        xml += `        <w:r><w:delText>${escapeXml(origLine)}</w:delText></w:r>\n`
        xml += `      </w:del>\n`
      }

      if (revLine) {
        xml += `      <w:ins w:id="${revId + 1000}" w:author="Lektorat UI" w:date="${new Date().toISOString()}">\n`
        xml += `        <w:r><w:t>${escapeXml(revLine)}</w:t></w:r>\n`
        xml += `      </w:ins>\n`
      }

      xml += `    </w:p>\n`
    }
  }

  return xml
}

function createCommentsXml(comments: ReviewComment[]): string {
  let xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:comments xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
            xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">\n`

  for (const comment of comments) {
    const categoryEmoji = {
      grammar: '[Grammatik]',
      style: '[Stil]',
      clarity: '[Klarheit]',
      fact: '[Fakten]',
      logic: '[Logik]',
      consistency: '[Konsistenz]',
    }

    xml += `  <w:comment w:id="${comment.id}" w:author="Lektorat UI" w:date="${comment.createdAt}">\n`
    xml += `    <w:p>\n`
    xml += `      <w:r>\n`
    xml += `        <w:rPr><w:b/></w:rPr>\n`
    xml += `        <w:t>${escapeXml(categoryEmoji[comment.category] || '')} ${escapeXml(comment.comment)}</w:t>\n`
    xml += `      </w:r>\n`
    xml += `    </w:p>\n`
    xml += `  </w:comment>\n`
  }

  xml += `</w:comments>`
  return xml
}

function createContentTypes(hasComments: boolean): string {
  let xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>`

  if (hasComments) {
    xml += `\n  <Override PartName="/word/comments.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml"/>`
  }

  xml += `\n</Types>`
  return xml
}

function createRels(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`
}

function createDocumentRels(hasComments: boolean): string {
  let xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>`

  if (hasComments) {
    xml += `\n  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/comments" Target="comments.xml"/>`
  }

  xml += `\n</Relationships>`
  return xml
}

function createStylesXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:rPr>
      <w:sz w:val="24"/>
      <w:szCs w:val="24"/>
    </w:rPr>
  </w:style>
</w:styles>`
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

// ═══════════════════════════════════════════════════════════════
// Download Helper
// ═══════════════════════════════════════════════════════════════

export async function downloadDocx(
  originalText: string,
  reviewedText: string,
  comments: ReviewComment[],
  filename: string = 'lektorat-export.docx'
): Promise<void> {
  const blob = await exportToDocx(originalText, reviewedText, comments)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
