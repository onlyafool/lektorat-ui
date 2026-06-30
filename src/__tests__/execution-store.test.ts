import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useExecutionStore } from '@/store/execution-store'
import type { Persona } from '@/types'

vi.mock('@/lib/orchestrator', () => ({
  orchestrator: {
    chatStream: vi.fn(),
    chat: vi.fn(),
    getAdapter: vi.fn(),
    checkHealth: vi.fn().mockResolvedValue(true),
    getHealthStatus: vi.fn().mockReturnValue(new Map()),
  },
}))

const mockPersona: Persona = {
  id: 'persona-1',
  name: 'Test Persona',
  description: 'Test',
  systemPrompt: 'Du bist ein Test.',
  model: {
    provider: 'ollama' as const,
    modelId: 'qwen2.5:7b',
    temperature: 0.7,
    maxTokens: 4096,
    topP: 1,
    stop: [],
  },
  color: '#2563eb',
  icon: 'user',
  isBuiltIn: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

describe('ExecutionStore', () => {
  beforeEach(() => {
    useExecutionStore.setState({
      executions: [],
      activeExecutionId: null,
      isRunning: false,
    })
  })

  it('has initial state', () => {
    const state = useExecutionStore.getState()
    expect(state.executions).toEqual([])
    expect(state.activeExecutionId).toBeNull()
    expect(state.isRunning).toBe(false)
  })

  it('abortExecution sets status to aborted and isRunning to false', () => {
    useExecutionStore.setState({
      executions: [
        {
          id: 'exec-1',
          personaId: 'p-1',
          textId: 't-1',
          status: 'running',
          stream: 'test',
          startedAt: new Date().toISOString(),
        },
      ],
      isRunning: true,
    })

    useExecutionStore.getState().abortExecution('exec-1')

    const state = useExecutionStore.getState()
    expect(state.executions[0].status).toBe('aborted')
    expect(state.isRunning).toBe(false)
  })

  it('clearExecution removes execution by id', () => {
    useExecutionStore.setState({
      executions: [
        {
          id: 'exec-1',
          personaId: 'p-1',
          textId: 't-1',
          status: 'completed',
          stream: 'test',
          startedAt: new Date().toISOString(),
        },
      ],
      activeExecutionId: 'exec-1',
    })

    useExecutionStore.getState().clearExecution('exec-1')

    const state = useExecutionStore.getState()
    expect(state.executions).toHaveLength(0)
    expect(state.activeExecutionId).toBeNull()
  })

  it('clearExecution does not clear activeExecutionId if different', () => {
    useExecutionStore.setState({
      executions: [
        {
          id: 'exec-1',
          personaId: 'p-1',
          textId: 't-1',
          status: 'completed',
          stream: '',
          startedAt: new Date().toISOString(),
        },
      ],
      activeExecutionId: 'exec-2',
    })

    useExecutionStore.getState().clearExecution('exec-1')

    expect(useExecutionStore.getState().activeExecutionId).toBe('exec-2')
  })

  it('clearAllExecutions resets everything', () => {
    useExecutionStore.setState({
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
      isRunning: true,
    })

    useExecutionStore.getState().clearAllExecutions()

    const state = useExecutionStore.getState()
    expect(state.executions).toEqual([])
    expect(state.activeExecutionId).toBeNull()
    expect(state.isRunning).toBe(false)
  })

  it('startExecution creates execution and sets running', async () => {
    const { orchestrator } = await import('@/lib/orchestrator')
    async function* mockStream() {
      yield 'Hallo '
      yield 'Welt'
    }
    vi.mocked(orchestrator.chatStream).mockReturnValue(mockStream())

    const id = await useExecutionStore.getState().startExecution(mockPersona, 'text-1', 'Test text')

    const state = useExecutionStore.getState()
    expect(state.executions.length).toBe(1)
    expect(state.executions[0].personaId).toBe('persona-1')
    expect(state.executions[0].textId).toBe('text-1')
    expect(state.executions[0].status).toBe('completed')
    expect(state.executions[0].stream).toBe('Hallo Welt')
    expect(state.isRunning).toBe(false)
    expect(id).toBe(state.executions[0].id)
  })

  it('startExecution handles errors', async () => {
    const { orchestrator } = await import('@/lib/orchestrator')
    vi.mocked(orchestrator.chatStream).mockImplementation(async function* () {
      throw new Error('Connection failed')
    })

    await useExecutionStore.getState().startExecution(mockPersona, 'text-1', 'Test')

    const state = useExecutionStore.getState()
    expect(state.executions[0].status).toBe('error')
    expect(state.executions[0].error).toContain('ollama')
    expect(state.isRunning).toBe(false)
  })
})
