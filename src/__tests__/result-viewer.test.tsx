import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ResultViewer } from '@/features/result-viewer/ResultViewer'
import { useExecutionStore } from '@/store/execution-store'
import { usePersonaStore } from '@/store/persona-store'
import { useTextStore } from '@/store/text-store'

vi.mock('@/store/execution-store')
vi.mock('@/store/persona-store')
vi.mock('@/store/text-store')

describe('ResultViewer', () => {
  beforeEach(() => {
    vi.mocked(useExecutionStore).mockImplementation(((selector: any) => {
      const state = {
        executions: [],
        activeExecutionId: null,
        abortExecution: vi.fn(),
        clearExecution: vi.fn(),
      }
      if (typeof selector === 'function') return selector(state)
      return state
    }) as any)

    vi.mocked(usePersonaStore).mockImplementation(((selector: any) => {
      const state = { personas: [] }
      if (typeof selector === 'function') return selector(state)
      return state
    }) as any)

    vi.mocked(useTextStore).mockImplementation(((selector: any) => {
      const state = { texts: [] }
      if (typeof selector === 'function') return selector(state)
      return state
    }) as any)
  })

  it('shows empty state when no active execution', () => {
    render(<ResultViewer />)
    expect(screen.getByText('Keine Ausführung aktiv')).toBeInTheDocument()
  })

  it('shows running status', () => {
    vi.mocked(useExecutionStore).mockImplementation(((selector: any) => {
      const state = {
        executions: [
          {
            id: 'exec-1',
            personaId: 'p-1',
            textId: 't-1',
            status: 'running',
            stream: '',
            startedAt: new Date().toISOString(),
          },
        ],
        activeExecutionId: 'exec-1',
        abortExecution: vi.fn(),
        clearExecution: vi.fn(),
      }
      if (typeof selector === 'function') return selector(state)
      return state
    }) as any)

    render(<ResultViewer />)
    expect(screen.getByText('running')).toBeInTheDocument()
  })

  it('shows stream content when running', () => {
    vi.mocked(useExecutionStore).mockImplementation(((selector: any) => {
      const state = {
        executions: [
          {
            id: 'exec-1',
            personaId: 'p-1',
            textId: 't-1',
            status: 'running',
            stream: 'Dies ist der Fortschritt',
            startedAt: new Date().toISOString(),
          },
        ],
        activeExecutionId: 'exec-1',
        abortExecution: vi.fn(),
        clearExecution: vi.fn(),
      }
      if (typeof selector === 'function') return selector(state)
      return state
    }) as any)

    render(<ResultViewer />)
    expect(screen.getByText('Dies ist der Fortschritt')).toBeInTheDocument()
  })

  it('shows error status', () => {
    vi.mocked(useExecutionStore).mockImplementation(((selector: any) => {
      const state = {
        executions: [
          {
            id: 'exec-1',
            personaId: 'p-1',
            textId: 't-1',
            status: 'error',
            stream: '',
            error: 'Verbindung fehlgeschlagen',
            startedAt: new Date().toISOString(),
          },
        ],
        activeExecutionId: 'exec-1',
        abortExecution: vi.fn(),
        clearExecution: vi.fn(),
      }
      if (typeof selector === 'function') return selector(state)
      return state
    }) as any)

    render(<ResultViewer />)
    expect(screen.getByText('Verbindung fehlgeschlagen')).toBeInTheDocument()
  })

  it('shows score when completed', () => {
    vi.mocked(useExecutionStore).mockImplementation(((selector: any) => {
      const state = {
        executions: [
          {
            id: 'exec-1',
            personaId: 'p-1',
            textId: 't-1',
            status: 'completed',
            stream: 'Ergebnis',
            result: {
              score: 85,
              comments: [{ id: 'c1' }, { id: 'c2' }],
            },
            startedAt: new Date().toISOString(),
          },
        ],
        activeExecutionId: 'exec-1',
        abortExecution: vi.fn(),
        clearExecution: vi.fn(),
      }
      if (typeof selector === 'function') return selector(state)
      return state
    }) as any)

    render(<ResultViewer />)
    expect(screen.getByText('85/100')).toBeInTheDocument()
  })
})
