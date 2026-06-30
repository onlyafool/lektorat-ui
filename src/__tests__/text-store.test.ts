import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useTextStore } from '@/store/text-store'

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

describe('TextStore', () => {
  beforeEach(() => {
    useTextStore.setState({ texts: [], activeTextId: null, isLoading: false })
  })

  describe('addText', () => {
    it('adds a new text with metadata', async () => {
      const { addText } = useTextStore.getState()
      const text = await addText('Mein Text', 'Hallo Welt', 'txt')

      expect(text.id).toBeDefined()
      expect(text.name).toBe('Mein Text')
      expect(text.content).toBe('Hallo Welt')
      expect(text.metadata.originalFormat).toBe('txt')
      expect(text.metadata.wordCount).toBe(2)
      expect(text.metadata.characterCount).toBe(10)
      expect(text.metadata.lineCount).toBe(1)
    })

    it('adds text to store', async () => {
      const { addText } = useTextStore.getState()
      await addText('Test', 'Inhalt', 'md')

      const { texts } = useTextStore.getState()
      expect(texts.length).toBe(1)
      expect(texts[0].name).toBe('Test')
    })

    it('calculates word count correctly', async () => {
      const { addText } = useTextStore.getState()
      const text = await addText('Test', ' Eins  zwei   drei ', 'txt')

      expect(text.metadata.wordCount).toBe(3)
    })

    it('handles empty content', async () => {
      const { addText } = useTextStore.getState()
      const text = await addText('Leer', '', 'txt')

      expect(text.metadata.wordCount).toBe(0)
      expect(text.metadata.characterCount).toBe(0)
    })
  })

  describe('updateText', () => {
    it('updates text content', async () => {
      const { addText, updateText } = useTextStore.getState()
      const text = await addText('Original', 'Inhalt', 'txt')

      await updateText(text.id, { content: 'Neuer Inhalt' })

      const { texts } = useTextStore.getState()
      expect(texts[0].content).toBe('Neuer Inhalt')
    })

    it('updates text name', async () => {
      const { addText, updateText } = useTextStore.getState()
      const text = await addText('Alt', 'Inhalt', 'txt')

      await updateText(text.id, { name: 'Neu' })

      const { texts } = useTextStore.getState()
      expect(texts[0].name).toBe('Neu')
    })

    it('updates metadata timestamp', async () => {
      const { addText, updateText } = useTextStore.getState()
      const text = await addText('Test', 'Inhalt', 'txt')
      const originalTime = text.metadata.updatedAt

      await new Promise(resolve => setTimeout(resolve, 10))
      await updateText(text.id, { content: 'Geändert' })

      const { texts } = useTextStore.getState()
      expect(new Date(texts[0].metadata.updatedAt).getTime())
        .toBeGreaterThan(new Date(originalTime).getTime())
    })

    it('recalculates word count on content update', async () => {
      const { addText, updateText } = useTextStore.getState()
      const text = await addText('Test', 'Ein Wort', 'txt')
      
      expect(text.metadata.wordCount).toBe(2)

      await updateText(text.id, { content: 'Eins zwei drei vier fünf' })

      const { texts } = useTextStore.getState()
      expect(texts[0].metadata.wordCount).toBe(5)
      expect(texts[0].metadata.characterCount).toBe(24)
    })

    it('handles empty content in update', async () => {
      const { addText, updateText } = useTextStore.getState()
      const text = await addText('Test', 'Voller Text', 'txt')

      await updateText(text.id, { content: '' })

      const { texts } = useTextStore.getState()
      expect(texts[0].metadata.wordCount).toBe(0)
    })

    it('does not update non-existent text', async () => {
      const { updateText } = useTextStore.getState()
      await updateText('non-existent', { name: 'Test' })

      const { texts } = useTextStore.getState()
      expect(texts.length).toBe(0)
    })
  })

  describe('deleteText', () => {
    it('deletes a text', async () => {
      const { addText, deleteText } = useTextStore.getState()
      const text = await addText('Zum Löschen', 'Inhalt', 'txt')

      await deleteText(text.id)

      const { texts } = useTextStore.getState()
      expect(texts.length).toBe(0)
    })

    it('clears activeTextId if deleted text was active', async () => {
      const { addText, setActiveText, deleteText } = useTextStore.getState()
      const text = await addText('Aktiv', 'Inhalt', 'txt')

      setActiveText(text.id)
      expect(useTextStore.getState().activeTextId).toBe(text.id)

      await deleteText(text.id)
      expect(useTextStore.getState().activeTextId).toBeNull()
    })

    it('keeps activeTextId if deleted text was not active', async () => {
      const { addText, setActiveText, deleteText } = useTextStore.getState()
      const text1 = await addText('Text 1', 'Inhalt', 'txt')
      const text2 = await addText('Text 2', 'Inhalt', 'txt')

      setActiveText(text1.id)
      await deleteText(text2.id)

      expect(useTextStore.getState().activeTextId).toBe(text1.id)
    })
  })

  describe('setActiveText', () => {
    it('sets active text id', async () => {
      const { addText, setActiveText } = useTextStore.getState()
      const text = await addText('Test', 'Inhalt', 'txt')

      setActiveText(text.id)
      expect(useTextStore.getState().activeTextId).toBe(text.id)
    })

    it('clears active text id', async () => {
      const { addText, setActiveText } = useTextStore.getState()
      const text = await addText('Test', 'Inhalt', 'txt')

      setActiveText(text.id)
      setActiveText(null)
      expect(useTextStore.getState().activeTextId).toBeNull()
    })
  })

  describe('getActiveText', () => {
    it('returns active text', async () => {
      const { addText, setActiveText, getActiveText } = useTextStore.getState()
      const text = await addText('Aktiver Text', 'Inhalt', 'txt')

      setActiveText(text.id)
      const active = getActiveText()

      expect(active?.id).toBe(text.id)
      expect(active?.name).toBe('Aktiver Text')
    })

    it('returns null if no active text', async () => {
      const { getActiveText } = useTextStore.getState()
      expect(getActiveText()).toBeNull()
    })

    it('returns null if active text id is invalid', async () => {
      const { setActiveText, getActiveText } = useTextStore.getState()
      setActiveText('invalid-id')
      expect(getActiveText()).toBeNull()
    })
  })
})
