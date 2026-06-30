import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ModelOrchestrator } from '@/lib/orchestrator'

vi.mock('@/adapters', () => ({
  createAdapter: vi.fn().mockResolvedValue({
    isAvailable: vi.fn().mockResolvedValue(true),
    chat: vi.fn().mockResolvedValue({
      content: 'Test response',
      model: 'test-model',
      provider: 'ollama',
      usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
      finishReason: 'stop',
    }),
    chatStream: vi.fn(),
  }),
  AdapterError: class AdapterError extends Error {
    provider: string
    constructor(provider: string, message: string) {
      super(message)
      this.provider = provider
      this.name = 'AdapterError'
    }
  },
}))

describe('ModelOrchestrator', () => {
  let orchestrator: ModelOrchestrator

  beforeEach(() => {
    orchestrator = new ModelOrchestrator()
  })

  it('creates instance', () => {
    expect(orchestrator).toBeDefined()
  })

  it('has chat method', () => {
    expect(typeof orchestrator.chat).toBe('function')
  })

  it('has chatStream method', () => {
    expect(typeof orchestrator.chatStream).toBe('function')
  })

  it('has getAdapter method', () => {
    expect(typeof orchestrator.getAdapter).toBe('function')
  })

  it('has checkHealth method', () => {
    expect(typeof orchestrator.checkHealth).toBe('function')
  })

  it('has getHealthStatus method', () => {
    expect(typeof orchestrator.getHealthStatus).toBe('function')
  })

  it('returns health status map', () => {
    const status = orchestrator.getHealthStatus()
    expect(status).toBeInstanceOf(Map)
  })
})
