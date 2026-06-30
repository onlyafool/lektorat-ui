import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useTextStore } from '@/store/text-store'
import { useSettingsStore } from '@/store/settings-store'

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
    useTextStore.setState({ texts: [], activeTextId: null })
  })

  it('sets active text', async () => {
    const { addText, setActiveText } = useTextStore.getState()
    const text = await addText('Test', 'Content', 'txt')

    setActiveText(text.id)
    const { activeTextId } = useTextStore.getState()
    expect(activeTextId).toBe(text.id)
  })

  it('gets active text', async () => {
    const { addText, setActiveText } = useTextStore.getState()
    const text = await addText('Test', 'Content', 'txt')

    setActiveText(text.id)
    const { getActiveText } = useTextStore.getState()
    const active = getActiveText()
    expect(active?.name).toBe('Test')
  })
})

describe('SettingsStore', () => {
  it('has default settings', () => {
    const { activeProvider, theme, language } = useSettingsStore.getState()
    expect(activeProvider).toBe('ollama')
    expect(theme).toBe('dark')
    expect(language).toBe('de')
  })

  it('updates theme', () => {
    const { setTheme } = useSettingsStore.getState()
    setTheme('light')
    expect(useSettingsStore.getState().theme).toBe('light')
  })

  it('updates language', () => {
    const { setLanguage } = useSettingsStore.getState()
    setLanguage('en')
    expect(useSettingsStore.getState().language).toBe('en')
  })

  it('updates export format', () => {
    const { setExportFormat } = useSettingsStore.getState()
    setExportFormat('pdf')
    expect(useSettingsStore.getState().exportFormat).toBe('pdf')
  })

  it('updates provider', () => {
    const { setActiveProvider } = useSettingsStore.getState()
    setActiveProvider('anthropic')
    expect(useSettingsStore.getState().activeProvider).toBe('anthropic')
  })
})
