import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '@/App'
import { useTextStore } from '@/store/text-store'
import { usePersonaStore } from '@/store/persona-store'
import { useWorkflowStore } from '@/store/workflow-store'
import { useExecutionStore } from '@/store/execution-store'
import { useSettingsStore } from '@/store/settings-store'

vi.mock('@/store/text-store')
vi.mock('@/store/persona-store')
vi.mock('@/store/workflow-store')
vi.mock('@/store/execution-store')
vi.mock('@/store/settings-store')
vi.mock('@/processors/file-parser', () => ({
  parseFile: vi.fn(),
  validateFile: vi.fn().mockReturnValue({ valid: true }),
}))

describe('Integration: User Flow', () => {
  beforeEach(() => {
    vi.mocked(useTextStore).mockImplementation(((selector: any) => {
      const state = {
        texts: [],
        activeTextId: null,
        getActiveText: vi.fn().mockReturnValue(null),
        addText: vi.fn().mockResolvedValue({ id: 'new-id', name: 'Neuer Text' }),
        setActiveText: vi.fn(),
        loadTexts: vi.fn(),
      }
      if (typeof selector === 'function') return selector(state)
      return state
    }) as any)

    vi.mocked(usePersonaStore).mockImplementation(((selector: any) => {
      const state = {
        personas: [
          {
            id: 'persona-1',
            name: 'Korrektor Erik',
            description: 'Grammatik-Experte',
            color: '#ef4444',
            model: { provider: 'ollama', temperature: 0.1 },
            isBuiltIn: true,
          },
        ],
        activePersonaIds: [],
        togglePersona: vi.fn(),
        getActivePersonas: vi.fn().mockReturnValue([]),
        loadPersonas: vi.fn(),
      }
      if (typeof selector === 'function') return selector(state)
      return state
    }) as any)

    vi.mocked(useWorkflowStore).mockImplementation(((selector: any) => {
      const state = {
        nodes: [],
        edges: [],
        loadAllWorkflows: vi.fn(),
      }
      if (typeof selector === 'function') return selector(state)
      return state
    }) as any)

    vi.mocked(useExecutionStore).mockImplementation(((selector: any) => {
      const state = {
        isRunning: false,
        executions: [],
      }
      if (typeof selector === 'function') return selector(state)
      return state
    }) as any)

    vi.mocked(useSettingsStore).mockImplementation(((selector: any) => {
      const state = {
        theme: 'dark',
        setTheme: vi.fn(),
      }
      if (typeof selector === 'function') return selector(state)
      return state
    }) as any)
  })

  it('renders the app', () => {
    render(<App />)
    
    expect(screen.getByText('Lektorat')).toBeInTheDocument()
  })

  it('shows navigation', () => {
    render(<App />)
    
    expect(screen.getByText('Texte')).toBeInTheDocument()
    expect(screen.getAllByText('Personas').length).toBeGreaterThanOrEqual(1)
  })

  it('shows empty state for texts', () => {
    render(<App />)
    
    expect(screen.getByText(/Noch keine Texte/)).toBeInTheDocument()
  })

  it('shows Lektorat starten button as disabled', () => {
    render(<App />)
    
    const button = screen.getByText('Lektorat starten')
    expect(button).toBeDisabled()
  })

  it('shows theme toggle', () => {
    render(<App />)
    
    expect(screen.getByLabelText('Theme wechseln')).toBeInTheDocument()
  })
})
