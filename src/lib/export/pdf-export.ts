import type { ReviewComment } from '@/types'

export interface PdfExportOptions {
  title?: string
  author?: string
  includeComments: boolean
  includeAnnotations: boolean
}

// ═══════════════════════════════════════════════════════════════
// PDF Export with Annotations
// ═══════════════════════════════════════════════════════════════

export async function exportToPdf(
  reviewedText: string,
  comments: ReviewComment[],
  options: PdfExportOptions = { includeComments: true, includeAnnotations: true }
): Promise<Blob> {
  // Create a simple PDF manually
  // For production, use a library like jsPDF or pdf-lib
  const pdf = createPdfContent(reviewedText, comments, options)
  return new Blob([pdf], { type: 'application/pdf' })
}

function createPdfContent(
  reviewedText: string,
  comments: ReviewComment[],
  options: PdfExportOptions
): string {
  // Minimal PDF structure
  // This is a simplified implementation - in production use pdf-lib

  let pdf = '%PDF-1.4\n'

  // Catalog
  const catalogOffset = pdf.length
  pdf += '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n'

  // Pages
  pdf += '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n'

  // Page
  pdf += '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n'

  // Content stream
  const content = createPageContent(reviewedText, comments, options)
  pdf += '4 0 obj\n<< /Length ' + content.length + ' >>\nstream\n'
  pdf += content
  pdf += '\nendstream\nendobj\n'

  // Font
  pdf += '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n'

  // Cross-reference table
  const xrefOffset = pdf.length
  pdf += 'xref\n'
  pdf += '0 6\n'
  pdf += '0000000000 65535 f \n'
  pdf += String(catalogOffset).padStart(10, '0') + ' 00000 n \n'

  // Trailer
  pdf += 'trailer\n<< /Size 6 /Root 1 0 R >>\n'
  pdf += 'startxref\n'
  pdf += xrefOffset + '\n'
  pdf += '%%EOF'

  return pdf
}

function createPageContent(
  reviewedText: string,
  comments: ReviewComment[],
  options: PdfExportOptions
): string {
  let content = ''

  // Title
  content += 'BT\n'
  content += '/F1 18 Tf\n'
  content += '50 800 Td\n'
  content += '(Lektorat Bericht) Tj\n'
  content += 'ET\n'

  // Date
  content += 'BT\n'
  content += '/F1 10 Tf\n'
  content += '50 780 Td\n'
  content += `(${new Date().toLocaleDateString('de-DE')}) Tj\n`
  content += 'ET\n'

  // Reviewed text section
  content += 'BT\n'
  content += '/F1 14 Tf\n'
  content += '50 740 Td\n'
  content += '(Ueberarbeiteter Text:) Tj\n'
  content += 'ET\n'

  // Add reviewed text (simplified - first 500 chars)
  const textPreview = reviewedText.slice(0, 500).replace(/[()\\]/g, '\\$&')
  content += 'BT\n'
  content += '/F1 10 Tf\n'
  content += '50 720 Td\n'

  const lines = textPreview.split('\n').slice(0, 20)
  for (const line of lines) {
    const escapedLine = line.replace(/[()\\]/g, '\\$&').slice(0, 80)
    content += `(${escapedLine}) Tj\n`
    content += '0 -14 Td\n'
  }

  content += 'ET\n'

  // Comments section
  if (options.includeComments && comments.length > 0) {
    content += 'BT\n'
    content += '/F1 14 Tf\n'
    content += '50 400 Td\n'
    content += `(Kommentare (${comments.length}):) Tj\n`
    content += 'ET\n'

    let yPos = 380
    for (const comment of comments.slice(0, 10)) {
      const categoryLabels: Record<string, string> = {
        grammar: '[Grammatik]',
        style: '[Stil]',
        clarity: '[Klarheit]',
        fact: '[Fakten]',
        logic: '[Logik]',
        consistency: '[Konsistenz]',
      }

      const label = categoryLabels[comment.category] || ''
      const commentText = `${label} ${comment.comment}`.slice(0, 70).replace(/[()\\]/g, '\\$&')

      content += 'BT\n'
      content += '/F1 9 Tf\n'
      content += `50 ${yPos} Td\n`
      content += `(${commentText}) Tj\n`
      content += 'ET\n'

      yPos -= 14
      if (yPos < 100) break
    }
  }

  // Annotations (highlight boxes)
  if (options.includeAnnotations) {
    content += '0.9 0.9 0.9 rg\n'
    content += '50 50 495 300 re f\n'
    content += '0 0 0 rg\n'
  }

  return content
}

// ═══════════════════════════════════════════════════════════════
// Download Helper
// ═══════════════════════════════════════════════════════════════

export async function downloadPdf(
  reviewedText: string,
  comments: ReviewComment[],
  filename: string = 'lektorat-export.pdf'
): Promise<void> {
  const blob = await exportToPdf(reviewedText, comments)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
