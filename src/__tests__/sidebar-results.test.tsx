import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Sidebar } from '@/components/layout/Sidebar'
import { useTextStore } from '@/store/text-store'
import { useResultsStore } from '@/store/results-store'

vi.mock('@/store/text-store')
vi.mock('@/store/persona-store')
vi.mock('@/store/results-store')
vi.mock('@/store/settings-store')
vi.mock('@/store/style-profile-store')
vi.mock('@/store/auth-store')
vi.mock('@/features/persona-panel/PersonaPanel', () => ({
  PersonaPanel: () => <div>PersonaPanel</div>,
}))
vi.mock('@/features/settings-panel/SettingsPanel', () => ({
  SettingsPanel: () => null,
}))
vi.mock('@/features/manuscript/FolderPicker', () => ({
  FolderPicker: () => <div>FolderPicker</div>,
}))
vi.mock('@/features/style-profile/StyleProfilePanel', () => ({
  StyleProfileList: () => <div>StyleProfileList</div>,
}))

describe('Sidebar - Lektorat-Ergebnisse', () => {
  const mockSetViewMode = vi.fn()

  beforeEach(() => {
    vi.mocked(useTextStore).mockImplementation(((selector: any) => {
      const state = {
        texts: [],
        activeTextId: null,
        setActiveText: vi.fn(),
        addText: vi.fn(),
      }
      if (typeof selector === 'function') return selector(state)
      return state
    }) as any)

    vi.mocked(useResultsStore).mockImplementation(((selector: any) => {
      const state = {
        results: [],
        deleteResult: vi.fn(),
      }
      if (typeof selector === 'function') return selector(state)
      return state
    }) as any)
  })

  it('shows no results when empty', () => {
    render(<Sidebar viewMode="editor" onViewModeChange={mockSetViewMode} />)
    expect(screen.queryByText('Lektorate')).not.toBeInTheDocument()
  })

  it('shows results when available', () => {
    vi.mocked(useResultsStore).mockImplementation(((selector: any) => {
      const state = {
        results: [
          {
            id: 'r-1',
            textId: 't-1',
            textName: 'Kapitel 1',
            score: 85,
            commentCount: 12,
            agentCount: 5,
            chunkCount: 3,
            summary: '',
            comments: '[]',
            duration: 45000,
            createdAt: new Date().toISOString(),
          },
        ],
        deleteResult: vi.fn(),
      }
      if (typeof selector === 'function') return selector(state)
      return state
    }) as any)

    render(<Sidebar viewMode="editor" onViewModeChange={mockSetViewMode} />)
    expect(screen.getByText('Lektorate')).toBeInTheDocument()
    expect(screen.getByText('Kapitel 1')).toBeInTheDocument()
    expect(screen.getByText('85/100 · 12 Kommentare')).toBeInTheDocument()
  })

  it('calls deleteResult when delete button clicked', async () => {
    const deleteResult = vi.fn()
    vi.mocked(useResultsStore).mockImplementation(((selector: any) => {
      const state = {
        results: [
          {
            id: 'r-1',
            textId: 't-1',
            textName: 'Kapitel 1',
            score: 85,
            commentCount: 12,
            agentCount: 5,
            chunkCount: 3,
            summary: '',
            comments: '[]',
            duration: 45000,
            createdAt: new Date().toISOString(),
          },
        ],
        deleteResult,
      }
      if (typeof selector === 'function') return selector(state)
      return state
    }) as any)

    render(<Sidebar viewMode="editor" onViewModeChange={mockSetViewMode} />)

    const deleteBtn = screen.getByTestId('delete-result-r-1')
    fireEvent.click(deleteBtn)
    expect(deleteResult).toHaveBeenCalledWith('r-1')
  })
})
