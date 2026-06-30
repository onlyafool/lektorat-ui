import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PersonaPanel } from '@/features/persona-panel/PersonaPanel'
import { usePersonaStore } from '@/store/persona-store'

vi.mock('@/store/persona-store')

const mockPersonas = [
  {
    id: 'p-1',
    name: 'Erik',
    description: 'Der gründliche Korrektor',
    systemPrompt: 'Du bist Erik.',
    color: '#2563eb',
    icon: 'user',
    model: { provider: 'ollama' as const, modelId: 'qwen2.5:7b', temperature: 0.3, maxTokens: 4096, topP: 1, stop: [] },
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'p-2',
    name: 'Luna',
    description: 'Die kreative Lektorin',
    systemPrompt: 'Du bist Luna.',
    color: '#ec4899',
    icon: 'user',
    model: { provider: 'ollama' as const, modelId: 'qwen2.5:7b', temperature: 0.9, maxTokens: 4096, topP: 1, stop: [] },
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

describe('PersonaPanel', () => {
  const mockTogglePersona = vi.fn()
  const mockDeletePersona = vi.fn()

  beforeEach(() => {
    vi.mocked(usePersonaStore).mockImplementation(((selector: any) => {
      const state = {
        personas: mockPersonas,
        activePersonaIds: ['p-1'],
        togglePersona: mockTogglePersona,
        deletePersona: mockDeletePersona,
      }
      if (typeof selector === 'function') {
        return selector(state)
      }
      return state
    }) as any)
    mockTogglePersona.mockClear()
    mockDeletePersona.mockClear()
  })

  it('renders persona names', () => {
    render(<PersonaPanel />)
    expect(screen.getByText('Erik')).toBeInTheDocument()
    expect(screen.getByText('Luna')).toBeInTheDocument()
  })

  it('shows active count', () => {
    render(<PersonaPanel />)
    expect(screen.getByText('1 von 2 aktiv')).toBeInTheDocument()
  })

  it('calls togglePersona when clicking checkbox', () => {
    const { container } = render(<PersonaPanel />)
    const toggleBtns = container.querySelectorAll('.rounded.border-2')
    fireEvent.click(toggleBtns[0])
    expect(mockTogglePersona).toHaveBeenCalledWith('p-1')
  })

  it('does not show delete button for built-in personas', () => {
    render(<PersonaPanel />)
    expect(screen.queryByTitle('Löschen')).not.toBeInTheDocument()
  })

  it('shows persona provider and temperature', () => {
    render(<PersonaPanel />)
    expect(screen.getAllByText('ollama').length).toBeGreaterThanOrEqual(1)
  })

  it('opens PersonaEditor when clicking +', () => {
    render(<PersonaPanel />)
    const addButtons = screen.getAllByRole('button')
    const addButton = addButtons.find((btn) => btn.getAttribute('title') === 'Neue Persona erstellen')
    expect(addButton).toBeDefined()
    fireEvent.click(addButton!)
    expect(screen.getByText('Neue Persona erstellen')).toBeInTheDocument()
  })
})
