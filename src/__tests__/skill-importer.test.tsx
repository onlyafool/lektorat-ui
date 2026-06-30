import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SkillImporter } from '@/features/persona-panel/SkillImporter'

// Mock readSkillFile
vi.mock('@/lib/skill-parser', () => ({
  parseSkillMd: vi.fn((content: string) => {
    if (content.includes('name:')) {
      const nameMatch = content.match(/name:\s*(.+)/)
      const descMatch = content.match(/description:\s*(.+)/)
      const bodyStart = content.indexOf('---', 3) + 3
      return {
        name: nameMatch?.[1]?.trim() || 'Test Skill',
        description: descMatch?.[1]?.trim() || '',
        systemPrompt: content.slice(bodyStart).trim(),
      }
    }
    return { name: 'Importierte Skill', description: '', systemPrompt: content.trim() }
  }),
  readSkillFile: vi.fn(),
}))

describe('SkillImporter', () => {
  it('renders drop zone', () => {
    const onImport = vi.fn()
    const onClose = vi.fn()

    render(<SkillImporter onImport={onImport} onClose={onClose} />)

    expect(screen.getByText(/SKILL.md hierher ziehen/)).toBeInTheDocument()
  })

  it('shows cancel button', () => {
    const onImport = vi.fn()
    const onClose = vi.fn()

    render(<SkillImporter onImport={onImport} onClose={onClose} />)

    expect(screen.getByText('Abbrechen')).toBeInTheDocument()
  })

  it('calls onClose when cancel clicked', () => {
    const onImport = vi.fn()
    const onClose = vi.fn()

    render(<SkillImporter onImport={onImport} onClose={onClose} />)

    fireEvent.click(screen.getByText('Abbrechen'))
    expect(onClose).toHaveBeenCalled()
  })

  it('import button is disabled when no skill loaded', () => {
    const onImport = vi.fn()
    const onClose = vi.fn()

    render(<SkillImporter onImport={onImport} onClose={onClose} />)

    const importBtn = screen.getByText('Importieren').closest('button')
    expect(importBtn).toBeDisabled()
  })
})
