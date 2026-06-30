import { describe, it, expect } from 'vitest'
import { validateFile } from '@/processors/file-parser'

describe('FileParser', () => {
  describe('validateFile', () => {
    it('accepts valid txt file', () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' })
      const result = validateFile(file)
      expect(result.valid).toBe(true)
    })

    it('accepts valid md file', () => {
      const file = new File(['content'], 'test.md', { type: 'text/markdown' })
      const result = validateFile(file)
      expect(result.valid).toBe(true)
    })

    it('accepts valid docx file', () => {
      const file = new File(['content'], 'test.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      })
      const result = validateFile(file)
      expect(result.valid).toBe(true)
    })

    it('accepts valid pdf file', () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
      const result = validateFile(file)
      expect(result.valid).toBe(true)
    })

    it('accepts valid rtf file', () => {
      const file = new File(['content'], 'test.rtf', { type: 'text/rtf' })
      const result = validateFile(file)
      expect(result.valid).toBe(true)
    })

    it('rejects file exceeding 10MB', () => {
      const largeContent = 'x'.repeat(10 * 1024 * 1024 + 1)
      const file = new File([largeContent], 'large.txt', { type: 'text/plain' })
      const result = validateFile(file)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Datei zu groß (max. 10MB)')
    })

    it('treats unknown extensions as txt', () => {
      const file = new File(['content'], 'malware.exe', { type: 'application/octet-stream' })
      const result = validateFile(file)
      expect(result.valid).toBe(true)
    })
  })
})
