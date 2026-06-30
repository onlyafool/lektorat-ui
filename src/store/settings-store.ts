import { create } from 'zustand'
import type { ModelConfig, ModelProvider } from '@/types'

interface ProviderConfig {
  enabled: boolean
  baseUrl: string
  apiKey: string
  models: string[]
}

interface SettingsState {
  // Model Settings
  activeProvider: ModelProvider
  providers: Record<ModelProvider, ProviderConfig>

  // Default Model Config
  defaultModel: ModelConfig

  // UI Settings
  theme: 'light' | 'dark' | 'system'
  language: 'de' | 'en'
  autoSave: boolean
  exportFormat: 'docx' | 'pdf' | 'txt' | 'md'

  // Actions
  setActiveProvider: (provider: ModelProvider) => void
  updateProvider: (provider: ModelProvider, updates: Partial<ProviderConfig>) => void
  updateDefaultModel: (updates: Partial<ModelConfig>) => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setLanguage: (language: 'de' | 'en') => void
  setAutoSave: (autoSave: boolean) => void
  setExportFormat: (format: 'docx' | 'pdf' | 'txt' | 'md') => void
}

const STORAGE_KEY = 'lektorat-settings'

function loadPersistedSettings(): Partial<SettingsState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function persistSettings(state: SettingsState) {
  const toSave = {
    activeProvider: state.activeProvider,
    providers: state.providers,
    defaultModel: state.defaultModel,
    theme: state.theme,
    language: state.language,
    autoSave: state.autoSave,
    exportFormat: state.exportFormat,
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
}

const DEFAULT_PROVIDERS: Record<ModelProvider, ProviderConfig> = {
  ollama: {
    enabled: true,
    baseUrl: 'http://localhost:11434',
    apiKey: '',
    models: ['qwen2.5:7b', 'qwen2.5:14b', 'llama3.1:8b', 'mistral:7b'],
  },
  lmstudio: {
    enabled: false,
    baseUrl: 'http://localhost:1234',
    apiKey: '',
    models: [],
  },
  anthropic: {
    enabled: false,
    baseUrl: 'https://api.anthropic.com',
    apiKey: '',
    models: ['claude-sonnet-4-20250514', 'claude-3-5-haiku-20241022'],
  },
  openrouter: {
    enabled: false,
    baseUrl: 'https://openrouter.ai/api',
    apiKey: '',
    models: ['anthropic/claude-sonnet-4', 'openai/gpt-4o', 'google/gemini-2.0-flash-001'],
  },
}

const persisted = loadPersistedSettings()

export const useSettingsStore = create<SettingsState>((set, get) => ({
  activeProvider: persisted.activeProvider ?? 'ollama',
  providers: { ...DEFAULT_PROVIDERS, ...persisted.providers },
  defaultModel: persisted.defaultModel ?? {
    provider: 'ollama',
    modelId: 'qwen2.5:7b',
    temperature: 0.7,
    maxTokens: 4096,
    topP: 1,
  },
  theme: persisted.theme ?? 'dark',
  language: persisted.language ?? 'de',
  autoSave: persisted.autoSave ?? true,
  exportFormat: persisted.exportFormat ?? 'docx',

  setActiveProvider: (provider) => {
    set({ activeProvider: provider })
    persistSettings(get())
  },

  updateProvider: (provider, updates) => {
    set((state) => ({
      providers: {
        ...state.providers,
        [provider]: { ...state.providers[provider], ...updates },
      },
    }))
    persistSettings(get())
  },

  updateDefaultModel: (updates) => {
    set((state) => ({
      defaultModel: { ...state.defaultModel, ...updates },
    }))
    persistSettings(get())
  },

  setTheme: (theme) => {
    set({ theme })
    persistSettings(get())
  },
  setLanguage: (language) => {
    set({ language })
    persistSettings(get())
  },
  setAutoSave: (autoSave) => {
    set({ autoSave })
    persistSettings(get())
  },
  setExportFormat: (format) => {
    set({ exportFormat: format })
    persistSettings(get())
  },
}))
