import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Sidebar } from '@/components/layout/Sidebar'
import { useTextStore } from '@/store/text-store'

vi.mock('@/store/text-store')

describe('Sidebar', () => {
  const mockOnViewModeChange = vi.fn()

  beforeEach(() => {
    vi.mocked(useTextStore).mockImplementation(((selector: any) => {
      const state = {
        texts: [],
        activeTextId: null,
        setActiveText: vi.fn(),
        addText: vi.fn().mockResolvedValue({
          id: 'new-text-id',
          name: 'Neuer Text',
          content: '',
          metadata: {
            wordCount: 0,
            characterCount: 0,
            lineCount: 1,
          },
        }),
      }
      if (typeof selector === 'function') {
        return selector(state)
      }
      return state
    }) as any)
  })

  it('renders navigation items', () => {
    render(<Sidebar viewMode="editor" onViewModeChange={mockOnViewModeChange} />)
    
    expect(screen.getByText('Texte')).toBeInTheDocument()
    expect(screen.getByText('Personas')).toBeInTheDocument()
    expect(screen.getByText('Workflows')).toBeInTheDocument()
    expect(screen.getByText('Einstellungen')).toBeInTheDocument()
  })

  it('shows texts section by default', () => {
    render(<Sidebar viewMode="editor" onViewModeChange={mockOnViewModeChange} />)
    
    expect(screen.getByText('Einzelne Texte')).toBeInTheDocument()
  })

  it('shows empty state when no texts', () => {
    render(<Sidebar viewMode="editor" onViewModeChange={mockOnViewModeChange} />)
    
    expect(screen.getByText(/Noch keine Texte/)).toBeInTheDocument()
  })

  it('calls onViewModeChange when clicking Workflows', () => {
    render(<Sidebar viewMode="editor" onViewModeChange={mockOnViewModeChange} />)
    
    fireEvent.click(screen.getByText('Workflows'))
    
    expect(mockOnViewModeChange).toHaveBeenCalledWith('workflow')
  })

  it('calls onViewModeChange when clicking Texte', () => {
    render(<Sidebar viewMode="workflow" onViewModeChange={mockOnViewModeChange} />)
    
    fireEvent.click(screen.getByText('Texte'))
    
    expect(mockOnViewModeChange).toHaveBeenCalledWith('editor')
  })

  it('creates new text when clicking +', async () => {
    const mockAddText = vi.fn().mockResolvedValue({
      id: 'new-id',
      name: 'Neuer Text',
    })
    const mockSetActiveText = vi.fn()

    vi.mocked(useTextStore).mockImplementation(((selector: any) => {
      const state = {
        texts: [],
        activeTextId: null,
        setActiveText: mockSetActiveText,
        addText: mockAddText,
      }
      if (typeof selector === 'function') {
        return selector(state)
      }
      return state
    }) as any)

    render(<Sidebar viewMode="editor" onViewModeChange={mockOnViewModeChange} />)
    
    // Find the + button next to "Einzelne Texte" label
    const sectionLabel = screen.getByText('Einzelne Texte')
    const sectionHeader = sectionLabel.closest('div')
    const addButton = sectionHeader?.querySelector('button')
    
    if (addButton) {
      await fireEvent.click(addButton)
      expect(mockAddText).toHaveBeenCalled()
    }
  })

  it('renders search input', () => {
    render(<Sidebar viewMode="editor" onViewModeChange={mockOnViewModeChange} />)
    
    expect(screen.getByPlaceholderText('Suchen...')).toBeInTheDocument()
  })
})
