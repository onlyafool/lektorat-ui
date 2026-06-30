import type { UnifiedTextObject } from '@/types'
import { generateId } from '@/lib/utils'

export type FileFormat = 'txt' | 'md' | 'docx' | 'pdf' | 'rtf'

export async function parseFile(file: File): Promise<UnifiedTextObject> {
  const format = getFormatFromExtension(file.name)
  const content = await extractContent(file, format)
  const now = new Date().toISOString()

  return {
    id: generateId(),
    name: file.name,
    content,
    metadata: {
      originalFormat: format,
      wordCount: content.split(/\s+/).filter(Boolean).length,
      characterCount: content.length,
      lineCount: content.split('\n').length,
      createdAt: now,
      updatedAt: now,
    },
    tags: [],
  }
}

function getFormatFromExtension(filename: string): FileFormat {
  const ext = filename.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'txt':
      return 'txt'
    case 'md':
    case 'markdown':
      return 'md'
    case 'docx':
      return 'docx'
    case 'pdf':
      return 'pdf'
    case 'rtf':
      return 'rtf'
    default:
      return 'txt'
  }
}

async function extractContent(file: File, format: FileFormat): Promise<string> {
  switch (format) {
    case 'txt':
    case 'md':
      return readAsText(file)
    case 'docx':
      return parseDocx(file)
    case 'pdf':
      return parsePdf(file)
    case 'rtf':
      return parseRtf(file)
    default:
      return readAsText(file)
  }
}

function readAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
}

async function parseDocx(file: File): Promise<string> {
  // Simple DOCX parser - extracts text from the document.xml
  try {
    const arrayBuffer = await file.arrayBuffer()
    const JSZip = (await import('jszip')).default
    const zip = await JSZip.loadAsync(arrayBuffer)
    const documentXml = await zip.file('word/document.xml')?.async('text')

    if (!documentXml) {
      throw new Error('Could not find document.xml in DOCX file')
    }

    // Extract text from XML tags
    const text = documentXml
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    return text
  } catch (error) {
    console.error('DOCX parsing failed:', error)
    // Fallback: read as plain text
    return readAsText(file)
  }
}

async function parsePdf(file: File): Promise<string> {
  // Simple PDF text extraction
  // For production, use pdf.js or pdf-parse
  try {
    const arrayBuffer = await file.arrayBuffer()
    const text = await extractPdfText(arrayBuffer)
    return text
  } catch (error) {
    console.error('PDF parsing failed:', error)
    return readAsText(file)
  }
}

async function extractPdfText(buffer: ArrayBuffer): Promise<string> {
  // Very basic PDF text extraction
  // In production, use pdf.js or pdf-parse library
  const decoder = new TextDecoder('latin1')
  const content = decoder.decode(buffer)

  // Extract text between BT and ET markers
  const textBlocks: string[] = []
  const btEtRegex = /BT[\s\S]*?ET/g
  let match

  while ((match = btEtRegex.exec(content)) !== null) {
    const block = match[0]
    // Extract text from Tj and TJ operators
    const tjRegex = /\(([^)]*)\)\s*Tj/g
    let tjMatch
    while ((tjMatch = tjRegex.exec(block)) !== null) {
      textBlocks.push(tjMatch[1])
    }
  }

  if (textBlocks.length === 0) {
    throw new Error('No text content found in PDF')
  }

  return textBlocks.join(' ')
}

async function parseRtf(file: File): Promise<string> {
  const content = await readAsText(file)
  // Basic RTF to text conversion
  return content
    .replace(/\{\\[^{}]*\}/g, '') // Remove RTF commands
    .replace(/\\[a-z]+\d*\s?/g, '') // Remove control words
    .replace(/[{}]/g, '') // Remove braces
    .replace(/\\\\/g, '\\') // Unescape backslashes
    .replace(/\\'/g, "'") // Unescape quotes
    .replace(/\n\s*\n/g, '\n\n') // Clean up whitespace
    .trim()
}

export function validateFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedFormats = ['txt', 'md', 'docx', 'pdf', 'rtf']

  if (file.size > maxSize) {
    return { valid: false, error: 'Datei zu groß (max. 10MB)' }
  }

  const format = getFormatFromExtension(file.name)
  if (!allowedFormats.includes(format)) {
    return { valid: false, error: `Nicht unterstütztes Format: .${format}` }
  }

  return { valid: true }
}
