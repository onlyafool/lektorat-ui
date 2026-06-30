import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TextEditor } from '@/features/text-editor/TextEditor'
import { useTextStore } from '@/store/text-store'

vi.mock('@/store/text-store')

describe('TextEditor', () => {
  beforeEach(() => {
    vi.mocked(useTextStore).mockImplementation(((selector: any) => {
      const state = {
        texts: [],
        activeTextId: null,
        updateText: vi.fn(),
        deleteText: vi.fn(),
      }
      if (typeof selector === 'function') {
        return selector(state)
      }
      return state
    }) as any)
  })

  it('shows empty state when no active text', () => {
    render(<TextEditor />)
    
    expect(screen.getByText('Kein Text ausgewählt')).toBeInTheDocument()
    expect(screen.getByText(/Wähle einen Text/)).toBeInTheDocument()
  })

  it('shows textarea when active text exists', () => {
    vi.mocked(useTextStore).mockImplementation(((selector: any) => {
      const state = {
        texts: [{ id: 'test-id', name: 'Test', content: 'Test Inhalt' }],
        activeTextId: 'test-id',
        updateText: vi.fn(),
        deleteText: vi.fn(),
      }
      if (typeof selector === 'function') {
        return selector(state)
      }
      return state
    }) as any)

    render(<TextEditor />)
    
    expect(screen.getByDisplayValue('Test Inhalt')).toBeInTheDocument()
  })

  it('displays word count', () => {
    vi.mocked(useTextStore).mockImplementation(((selector: any) => {
      const state = {
        texts: [{ id: 'test-id', name: 'Test', content: 'Eins zwei drei' }],
        activeTextId: 'test-id',
        updateText: vi.fn(),
        deleteText: vi.fn(),
      }
      if (typeof selector === 'function') {
        return selector(state)
      }
      return state
    }) as any)

    render(<TextEditor />)
    
    expect(screen.getByText('3 Wörter')).toBeInTheDocument()
  })

  it('calls updateText on content change', async () => {
    const mockUpdateText = vi.fn()
    
    vi.mocked(useTextStore).mockImplementation(((selector: any) => {
      const state = {
        texts: [{ id: 'test-id', name: 'Test', content: '' }],
        activeTextId: 'test-id',
        updateText: mockUpdateText,
        deleteText: vi.fn(),
      }
      if (typeof selector === 'function') {
        return selector(state)
      }
      return state
    }) as any)

    render(<TextEditor />)
    
    const textarea = screen.getByPlaceholderText('Text eingeben oder Datei laden...')
    fireEvent.change(textarea, { target: { value: 'Neuer Text' } })
    
    await new Promise(resolve => setTimeout(resolve, 600))
    
    expect(mockUpdateText).toHaveBeenCalled()
  })

  it('has save button', () => {
    vi.mocked(useTextStore).mockImplementation(((selector: any) => {
      const state = {
        texts: [{ id: 'test-id', name: 'Test', content: 'Inhalt' }],
        activeTextId: 'test-id',
        updateText: vi.fn(),
        deleteText: vi.fn(),
      }
      if (typeof selector === 'function') {
        return selector(state)
      }
      return state
    }) as any)

    render(<TextEditor />)
    
    expect(screen.getByText('Speichern')).toBeInTheDocument()
  })

  it('has delete button', () => {
    vi.mocked(useTextStore).mockImplementation(((selector: any) => {
      const state = {
        texts: [{ id: 'test-id', name: 'Test', content: 'Inhalt' }],
        activeTextId: 'test-id',
        updateText: vi.fn(),
        deleteText: vi.fn(),
      }
      if (typeof selector === 'function') {
        return selector(state)
      }
      return state
    }) as any)

    render(<TextEditor />)
    
    expect(screen.getByText('Löschen')).toBeInTheDocument()
  })
})
