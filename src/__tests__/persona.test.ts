import { describe, it, expect, beforeEach, vi } from 'vitest'
import { usePersonaStore } from '@/store/persona-store'
import type { Persona } from '@/types'

// Mock IndexedDB
vi.mock('idb', () => ({
  openDB: vi.fn().mockResolvedValue({
    transaction: vi.fn().mockReturnValue({
      store: {
        put: vi.fn(),
        get: vi.fn(),
        getAll: vi.fn().mockResolvedValue([]),
        delete: vi.fn(),
        clear: vi.fn(),
        count: vi.fn().mockResolvedValue(0),
      },
      done: Promise.resolve(),
    }),
    get: vi.fn(),
    getAll: vi.fn().mockResolvedValue([]),
    put: vi.fn(),
    delete: vi.fn(),
    clear: vi.fn(),
    count: vi.fn().mockResolvedValue(0),
  }),
}))

describe('PersonaStore', () => {
  beforeEach(() => {
    usePersonaStore.setState({ personas: [], activePersonaIds: [], isLoading: false })
  })

  describe('addPersona', () => {
    it('adds a new custom persona', async () => {
      const { addPersona } = usePersonaStore.getState()
      
      const newPersona = {
        name: 'Meine Persona',
        description: 'Eine Test-Persona',
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
      }
      
      const result = await addPersona(newPersona)
      
      expect(result.id).toBeDefined()
      expect(result.name).toBe('Meine Persona')
      expect(result.isBuiltIn).toBe(false)
      expect(result.createdAt).toBeDefined()
      expect(result.updatedAt).toBeDefined()
    })

    it('adds persona to store', async () => {
      const { addPersona } = usePersonaStore.getState()
      
      await addPersona({
        name: 'Test',
        description: 'Test',
        systemPrompt: 'Test',
        model: {
          provider: 'ollama',
          modelId: 'qwen2.5:7b',
          temperature: 0.7,
          maxTokens: 4096,
          topP: 1,
          stop: [],
        },
        color: '#2563eb',
        icon: 'user',
        isBuiltIn: false,
      })
      
      const { personas } = usePersonaStore.getState()
      expect(personas.length).toBe(1)
      expect(personas[0].name).toBe('Test')
    })
  })

  describe('updatePersona', () => {
    it('updates an existing persona', async () => {
      const { addPersona, updatePersona } = usePersonaStore.getState()
      
      const persona = await addPersona({
        name: 'Original',
        description: 'Original',
        systemPrompt: 'Original',
        model: {
          provider: 'ollama',
          modelId: 'qwen2.5:7b',
          temperature: 0.7,
          maxTokens: 4096,
          topP: 1,
          stop: [],
        },
        color: '#2563eb',
        icon: 'user',
        isBuiltIn: false,
      })
      
      await updatePersona(persona.id, { name: 'Aktualisiert' })
      
      const { personas } = usePersonaStore.getState()
      expect(personas[0].name).toBe('Aktualisiert')
    })

    it('updates updatedAt timestamp', async () => {
      const { addPersona, updatePersona } = usePersonaStore.getState()
      
      const persona = await addPersona({
        name: 'Test',
        description: 'Test',
        systemPrompt: 'Test',
        model: {
          provider: 'ollama',
          modelId: 'qwen2.5:7b',
          temperature: 0.7,
          maxTokens: 4096,
          topP: 1,
          stop: [],
        },
        color: '#2563eb',
        icon: 'user',
        isBuiltIn: false,
      })
      
      const originalUpdatedAt = persona.updatedAt
      
      // Wait a bit to ensure timestamp changes
      await new Promise(resolve => setTimeout(resolve, 10))
      
      await updatePersona(persona.id, { name: 'Updated' })
      
      const { personas } = usePersonaStore.getState()
      expect(new Date(personas[0].updatedAt).getTime()).toBeGreaterThan(new Date(originalUpdatedAt).getTime())
    })
  })

  describe('deletePersona', () => {
    it('deletes a custom persona', async () => {
      const { addPersona, deletePersona } = usePersonaStore.getState()
      
      const persona = await addPersona({
        name: 'Zu löschen',
        description: 'Test',
        systemPrompt: 'Test',
        model: {
          provider: 'ollama',
          modelId: 'qwen2.5:7b',
          temperature: 0.7,
          maxTokens: 4096,
          topP: 1,
          stop: [],
        },
        color: '#2563eb',
        icon: 'user',
        isBuiltIn: false,
      })
      
      await deletePersona(persona.id)
      
      const { personas } = usePersonaStore.getState()
      expect(personas.length).toBe(0)
    })

    it('cannot delete built-in personas', async () => {
      const builtInPersona: Persona = {
        id: 'built-in-1',
        name: 'Built-in',
        description: 'Test',
        systemPrompt: 'Test',
        model: {
          provider: 'ollama',
          modelId: 'qwen2.5:7b',
          temperature: 0.7,
          maxTokens: 4096,
          topP: 1,
          stop: [],
        },
        color: '#2563eb',
        icon: 'user',
        isBuiltIn: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      
      usePersonaStore.setState({ personas: [builtInPersona] })
      
      const { deletePersona } = usePersonaStore.getState()
      await deletePersona(builtInPersona.id)
      
      const { personas } = usePersonaStore.getState()
      expect(personas.length).toBe(1)
    })
  })

  describe('togglePersona', () => {
    it('toggles persona selection', async () => {
      const { addPersona, togglePersona } = usePersonaStore.getState()
      
      const persona = await addPersona({
        name: 'Toggle Test',
        description: 'Test',
        systemPrompt: 'Test',
        model: {
          provider: 'ollama',
          modelId: 'qwen2.5:7b',
          temperature: 0.7,
          maxTokens: 4096,
          topP: 1,
          stop: [],
        },
        color: '#2563eb',
        icon: 'user',
        isBuiltIn: false,
      })
      
      // Toggle on
      togglePersona(persona.id)
      expect(usePersonaStore.getState().activePersonaIds).toContain(persona.id)
      
      // Toggle off
      togglePersona(persona.id)
      expect(usePersonaStore.getState().activePersonaIds).not.toContain(persona.id)
    })
  })

  describe('getActivePersonas', () => {
    it('returns only active personas', async () => {
      const { addPersona, togglePersona, getActivePersonas } = usePersonaStore.getState()
      
      const persona1 = await addPersona({
        name: 'Active',
        description: 'Test',
        systemPrompt: 'Test',
        model: {
          provider: 'ollama',
          modelId: 'qwen2.5:7b',
          temperature: 0.7,
          maxTokens: 4096,
          topP: 1,
          stop: [],
        },
        color: '#2563eb',
        icon: 'user',
        isBuiltIn: false,
      })
      
      await addPersona({
        name: 'Inactive',
        description: 'Test',
        systemPrompt: 'Test',
        model: {
          provider: 'ollama',
          modelId: 'qwen2.5:7b',
          temperature: 0.7,
          maxTokens: 4096,
          topP: 1,
          stop: [],
        },
        color: '#2563eb',
        icon: 'user',
        isBuiltIn: false,
      })
      
      togglePersona(persona1.id)
      
      const activePersonas = getActivePersonas()
      expect(activePersonas.length).toBe(1)
      expect(activePersonas[0].id).toBe(persona1.id)
    })
  })
})
