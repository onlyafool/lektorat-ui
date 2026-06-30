import { describe, it, expect, vi } from 'vitest'
import { getAgentsWithPersonas, runLektorat } from '@/lib/lektorat-runner'
import type { Persona } from '@/types'

// Mock orchestrator
vi.mock('@/lib/orchestrator', () => ({
  orchestrator: {
    chat: vi.fn().mockResolvedValue({
      response: { content: 'Keine Fehler gefunden. Text ist gut geschrieben.' },
      provider: 'ollama',
      model: 'test',
      fallbackUsed: false,
    }),
    chatStream: vi.fn(),
  },
}))

// Mock settings store
vi.mock('@/store/settings-store', () => ({
  useSettingsStore: {
    getState: vi.fn().mockReturnValue({
      providers: {
        ollama: { apiKey: '', baseUrl: '' },
      },
    }),
  },
}))

const mockPersonas: Persona[] = [
  {
    id: 'p1',
    name: 'Korrektor Erik',
    description: 'Korrektor',
    systemPrompt: 'Test',
    model: { provider: 'ollama', modelId: 'test', temperature: 0.3, maxTokens: 4096, topP: 0.85, stop: [] },
    color: '#ef4444',
    icon: 'user',
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'p2',
    name: 'Stilistin Luna',
    description: 'Stilistin',
    systemPrompt: 'Test',
    model: { provider: 'ollama', modelId: 'test', temperature: 0.5, maxTokens: 4096, topP: 0.9, stop: [] },
    color: '#3b82f6',
    icon: 'user',
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'p3',
    name: 'Logikerin Nora',
    description: 'Logikerin',
    systemPrompt: 'Test',
    model: { provider: 'ollama', modelId: 'test', temperature: 0.3, maxTokens: 4096, topP: 0.85, stop: [] },
    color: '#10b981',
    icon: 'user',
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'p4',
    name: 'Leo Lektor',
    description: 'Dramaturg',
    systemPrompt: 'Test',
    model: { provider: 'ollama', modelId: 'test', temperature: 0.3, maxTokens: 4096, topP: 0.85, stop: [] },
    color: '#2563eb',
    icon: 'pen-tool',
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'p5',
    name: 'Profiler Luna',
    description: 'Profiler',
    systemPrompt: 'Test',
    model: { provider: 'ollama', modelId: 'test', temperature: 0.5, maxTokens: 4096, topP: 0.9, stop: [] },
    color: '#06b6d4',
    icon: 'target',
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

describe('getAgentsWithPersonas', () => {
  it('maps personas to agent definitions', () => {
    const agents = getAgentsWithPersonas(mockPersonas)

    expect(agents.length).toBe(5)
    expect(agents.map((a) => a.role).sort()).toEqual(['dramaturg', 'korrektor', 'logiker', 'profiler', 'stilistin'])
  })

  it('returns empty when no matching personas', () => {
    const agents = getAgentsWithPersonas([])

    expect(agents.length).toBe(0)
  })

  it('returns partial results when some personas missing', () => {
    const agents = getAgentsWithPersonas([mockPersonas[0]]) // Only Korrektor Erik

    expect(agents.length).toBe(1)
    expect(agents[0].role).toBe('korrektor')
  })
})

describe('runLektorat', () => {
  it('runs all agents and returns merged results', async () => {
    const agents = getAgentsWithPersonas(mockPersonas)
    const onProgress = vi.fn()

    const result = await runLektorat(
      'Test Text zum Lektorat.',
      'text-1',
      agents,
      undefined,
      onProgress
    )

    expect(result.id).toBeDefined()
    expect(result.agentResults.length).toBe(5)
    expect(result.overallScore).toBeGreaterThanOrEqual(0)
    expect(result.overallScore).toBeLessThanOrEqual(100)
    expect(result.styleProfileUsed).toBe(false)
    expect(result.duration).toBeGreaterThan(0)
  })

  it('includes style profile when provided', async () => {
    const agents = getAgentsWithPersonas(mockPersonas)

    const result = await runLektorat(
      'Test Text.',
      'text-1',
      agents,
      '# Mein Stil\nKeine Füllwörter.'
    )

    expect(result.styleProfileUsed).toBe(true)
  })

  it('reports errors for failed agents', async () => {
    const { orchestrator } = await import('@/lib/orchestrator')
    vi.mocked(orchestrator.chat).mockRejectedValueOnce(new Error('Connection failed'))

    const agents = getAgentsWithPersonas([mockPersonas[0]]) // Only one agent
    const result = await runLektorat('Test', 'text-1', agents)

    expect(result.agentResults[0].status).toBe('error')
    expect(result.agentResults[0].error).toContain('Connection failed')
  })
})
