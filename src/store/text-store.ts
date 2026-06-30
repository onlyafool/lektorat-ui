import { create } from 'zustand'
import type { UnifiedTextObject } from '@/types'
import { getAll, put, deleteById } from '@/lib/indexeddb'
import { generateId } from '@/lib/utils'

interface TextState {
  texts: UnifiedTextObject[]
  activeTextId: string | null
  isLoading: boolean

  // Actions
  loadTexts: () => Promise<void>
  addText: (name: string, content: string, format: UnifiedTextObject['metadata']['originalFormat']) => Promise<UnifiedTextObject>
  updateText: (id: string, updates: Partial<UnifiedTextObject>) => Promise<void>
  deleteText: (id: string) => Promise<void>
  setActiveText: (id: string | null) => void
  getActiveText: () => UnifiedTextObject | null
}

export const useTextStore = create<TextState>((set, get) => ({
  texts: [],
  activeTextId: null,
  isLoading: false,

  loadTexts: async () => {
    set({ isLoading: true })
    try {
      const texts = await getAll<UnifiedTextObject>('texts')
      set({ texts, isLoading: false })
    } catch (error) {
      console.error('Failed to load texts:', error)
      set({ isLoading: false })
    }
  },

  addText: async (name, content, format) => {
    const now = new Date().toISOString()
    const text: UnifiedTextObject = {
      id: generateId(),
      name,
      content,
      metadata: {
        originalFormat: format,
        wordCount: content.trim() ? content.trim().split(/\s+/).length : 0,
        characterCount: content.length,
        lineCount: content.split('\n').length,
        createdAt: now,
        updatedAt: now,
      },
      tags: [],
    }

    await put('texts', text)
    set((state) => ({ texts: [...state.texts, text] }))
    return text
  },

  updateText: async (id, updates) => {
    const { texts } = get()
    const existing = texts.find((t) => t.id === id)
    if (!existing) return

    const newContent = updates.content ?? existing.content
    const updated: UnifiedTextObject = {
      ...existing,
      ...updates,
      metadata: {
        ...existing.metadata,
        ...updates.metadata,
        wordCount: newContent.trim() ? newContent.trim().split(/\s+/).length : 0,
        characterCount: newContent.length,
        lineCount: newContent.split('\n').length,
        updatedAt: new Date().toISOString(),
      },
    }

    await put('texts', updated)
    set((state) => ({
      texts: state.texts.map((t) => (t.id === id ? updated : t)),
    }))
  },

  deleteText: async (id) => {
    await deleteById('texts', id)
    set((state) => ({
      texts: state.texts.filter((t) => t.id !== id),
      activeTextId: state.activeTextId === id ? null : state.activeTextId,
    }))
  },

  setActiveText: (id) => set({ activeTextId: id }),

  getActiveText: () => {
    const { texts, activeTextId } = get()
    return texts.find((t) => t.id === activeTextId) ?? null
  },
}))
