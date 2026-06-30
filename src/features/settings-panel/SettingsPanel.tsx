import { useState } from 'react'
import { Settings, Key, Globe, Cpu, FileText } from 'lucide-react'
import { useSettingsStore } from '@/store/settings-store'
import { cn } from '@/lib/utils'
import type { ModelProvider } from '@/types'

type SettingsTab = 'models' | 'display' | 'workflow' | 'export'

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('models')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl rounded-xl border border-border bg-surface shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-text-muted" />
            <h2 className="text-lg font-semibold">Einstellungen</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-text-muted hover:bg-surface-hover hover:text-text"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border px-6">
          {[
            { id: 'models', label: 'Modelle', icon: Cpu },
            { id: 'display', label: 'Anzeige', icon: Globe },
            { id: 'workflow', label: 'Workflow', icon: FileText },
            { id: 'export', label: 'Export', icon: FileText },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              className={cn(
                'flex items-center gap-2 border-b-2 px-4 py-3 text-sm transition-colors',
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-text'
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto p-6">
          {activeTab === 'models' && <ModelSettings />}
          {activeTab === 'display' && <DisplaySettings />}
          {activeTab === 'workflow' && <WorkflowSettings />}
          {activeTab === 'export' && <ExportSettings />}
        </div>
      </div>
    </div>
  )
}

function ModelSettings() {
  const { providers, activeProvider, setActiveProvider, updateProvider } = useSettingsStore()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  const providerInfo: Record<string, { label: string; type: 'lokal' | 'cloud'; hint: string }> = {
    ollama: { label: 'Ollama', type: 'lokal', hint: 'Läuft auf deinem Rechner. Kostenlos.' },
    lmstudio: { label: 'LM Studio', type: 'lokal', hint: 'Läuft auf deinem Rechner. Kostenlos.' },
    anthropic: { label: 'Anthropic (Claude)', type: 'cloud', hint: 'API-Key nötig. Kein Pro-Abo gültig.' },
    openrouter: { label: 'OpenRouter', type: 'cloud', hint: 'API-Key nötig. Zugriff auf viele Modelle.' },
  }

  const fetchModels = async (provider: ModelProvider) => {
    setLoading(true)
    setStatus(null)
    const config = providers[provider]
    try {
      if (provider === 'ollama') {
        const res = await fetch(`${config.baseUrl}/api/tags`, { signal: AbortSignal.timeout(5000) })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        const models = (data.models ?? []).map((m: { name: string }) => m.name)
        if (models.length === 0) {
          setStatus('Keine Modelle gefunden. Lade ein Modell in Ollama.')
        } else {
          updateProvider(provider, { models, enabled: true })
          setStatus(`${models.length} Modell(e) geladen.`)
        }
      } else if (provider === 'lmstudio') {
        const res = await fetch(`${config.baseUrl}/v1/models`, { signal: AbortSignal.timeout(5000) })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        const models = (data.data ?? []).map((m: { id: string }) => m.id)
        if (models.length === 0) {
          setStatus('Keine Modelle gefunden. Lade ein Modell in LM Studio.')
        } else {
          updateProvider(provider, { models, enabled: true })
          setStatus(`${models.length} Modell(e) geladen.`)
        }
      }
    } catch {
      setStatus(`${provider} ist nicht erreichbar. Läuft der Server?`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Info */}
      <div className="rounded-lg border border-accent/30 bg-accent/5 p-3 text-xs text-text-muted">
        <strong className="text-text">Hinweis:</strong> Lokale Modelle (Ollama, LM Studio) laufen auf deinem PC — kostenlos, ohne API-Key.
        Cloud-Modelle (Anthropic, OpenRouter) brauchen einen API-Key mit separatem Guthaben.
        Dein Pro-/Plus-Abo reicht dafür nicht aus.
      </div>

      {/* Active Provider */}
      <div>
        <label className="mb-2 block text-sm font-medium">Aktiver Provider</label>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(providers).map(([name, config]) => {
            const info = providerInfo[name]
            return (
              <button
                key={name}
                onClick={() => setActiveProvider(name as ModelProvider)}
                className={cn(
                  'rounded-lg border p-3 text-left transition-colors',
                  activeProvider === name
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:bg-surface-hover'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{info?.label ?? name}</span>
                  <span
                    className={cn(
                      'h-2 w-2 rounded-full',
                      config.enabled ? 'bg-secondary' : 'bg-text-muted'
                    )}
                  />
                </div>
                <div className="mt-1 text-xs text-text-muted">{info?.hint}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Provider Details */}
      <div className="rounded-lg border border-border p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium">{providerInfo[activeProvider]?.label ?? activeProvider}</h3>
          {providerInfo[activeProvider]?.type === 'lokal' && (
            <button
              onClick={() => fetchModels(activeProvider)}
              disabled={loading}
              className="rounded-lg bg-surface-hover px-3 py-1 text-xs text-text transition-colors hover:bg-surface-active disabled:opacity-50"
            >
              {loading ? 'Lädt...' : 'Modelle laden'}
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs text-text-muted">Base URL</label>
            <input
              type="text"
              value={providers[activeProvider].baseUrl}
              onChange={(e) => updateProvider(activeProvider, { baseUrl: e.target.value })}
              className="w-full rounded-lg border border-border bg-surface-hover px-3 py-2 text-sm text-text outline-none focus:border-primary"
            />
          </div>

          {providerInfo[activeProvider]?.type === 'cloud' && (
            <div>
              <label className="mb-1 block text-xs text-text-muted">
                <Key className="mr-1 inline h-3 w-3" />
                API Key
              </label>
              <input
                type="password"
                value={providers[activeProvider].apiKey}
                onChange={(e) => updateProvider(activeProvider, { apiKey: e.target.value })}
                className="w-full rounded-lg border border-border bg-surface-hover px-3 py-2 text-sm text-text outline-none focus:border-primary"
                placeholder="sk-..."
              />
              <p className="mt-1 text-xs text-text-muted">
                {activeProvider === 'anthropic' && 'Einen neuen Key erstellen auf console.anthropic.com'}
                {activeProvider === 'openrouter' && 'Einen neuen Key erstellen auf openrouter.ai/keys'}
              </p>
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs text-text-muted">Verfügbare Modelle</label>
            <div className="flex flex-wrap gap-2">
              {providers[activeProvider].models.map((model) => (
                <span
                  key={model}
                  className="rounded-full bg-surface-hover px-3 py-1 text-xs text-text"
                >
                  {model}
                </span>
              ))}
              {providers[activeProvider].models.length === 0 && (
                <span className="text-xs text-text-muted italic">Keine Modelle konfiguriert</span>
              )}
            </div>
            {status && (
              <p className={cn('mt-1 text-xs', status.includes('geladen') ? 'text-secondary' : 'text-danger')}>
                {status}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="enabled"
              checked={providers[activeProvider].enabled}
              onChange={(e) => updateProvider(activeProvider, { enabled: e.target.checked })}
              className="rounded border-border"
            />
            <label htmlFor="enabled" className="text-sm text-text">
              Provider aktiviert
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

function DisplaySettings() {
  const { theme, language, setTheme, setLanguage } = useSettingsStore()

  return (
    <div className="space-y-6">
      {/* Theme */}
      <div>
        <label className="mb-2 block text-sm font-medium">Theme</label>
        <div className="flex gap-2">
          {(['light', 'dark', 'system'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={cn(
                'flex-1 rounded-lg border p-3 text-center transition-colors',
                theme === t
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:bg-surface-hover'
              )}
            >
              {t === 'light' && '☀️ Hell'}
              {t === 'dark' && '🌙 Dunkel'}
              {t === 'system' && '💻 System'}
            </button>
          ))}
        </div>
      </div>

      {/* Language */}
      <div>
        <label className="mb-2 block text-sm font-medium">Sprache</label>
        <div className="flex gap-2">
          {([
            { id: 'de', label: 'Deutsch' },
            { id: 'en', label: 'English' },
          ] as const).map((l) => (
            <button
              key={l.id}
              onClick={() => setLanguage(l.id)}
              className={cn(
                'flex-1 rounded-lg border p-3 text-center transition-colors',
                language === l.id
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:bg-surface-hover'
              )}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Auto Save */}
      <div className="flex items-center justify-between rounded-lg border border-border p-4">
        <div>
          <div className="text-sm font-medium">Automatisch speichern</div>
          <div className="text-xs text-text-muted">Änderungen automatisch in IndexedDB speichern</div>
        </div>
        <input
          type="checkbox"
          checked={useSettingsStore.getState().autoSave}
          onChange={(e) => useSettingsStore.getState().setAutoSave(e.target.checked)}
          className="rounded border-border"
        />
      </div>
    </div>
  )
}

function WorkflowSettings() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border p-4">
        <h3 className="mb-3 text-sm font-medium">Standard-Ausführungsmodus</h3>
        <div className="space-y-2">
          {[
            { id: 'sequential', label: 'Sequenziell', description: 'Node für Node ausführen' },
            { id: 'parallel', label: 'Parallel', description: 'Alle Nodes gleichzeitig' },
            { id: 'smart', label: 'Intelligent', description: 'Automatisch optimieren' },
          ].map((mode) => (
            <label
              key={mode.id}
              className="flex items-center gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-surface-hover"
            >
              <input
                type="radio"
                name="execution-mode"
                value={mode.id}
                defaultChecked={mode.id === 'sequential'}
                className="rounded-full border-border"
              />
              <div>
                <div className="text-sm font-medium">{mode.label}</div>
                <div className="text-xs text-text-muted">{mode.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-border p-4">
        <h3 className="mb-3 text-sm font-medium">Token-Budget</h3>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs text-text-muted">Max Tokens pro Node</label>
            <input
              type="number"
              defaultValue={4096}
              min={256}
              max={100000}
              className="w-full rounded-lg border border-border bg-surface-hover px-3 py-2 text-sm text-text outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-text-muted">Timeout (Sekunden)</label>
            <input
              type="number"
              defaultValue={60}
              min={10}
              max={300}
              className="w-full rounded-lg border border-border bg-surface-hover px-3 py-2 text-sm text-text outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function ExportSettings() {
  const { exportFormat, setExportFormat } = useSettingsStore()

  return (
    <div className="space-y-6">
      {/* Default Format */}
      <div>
        <label className="mb-2 block text-sm font-medium">Standard-Exportformat</label>
        <div className="grid grid-cols-3 gap-2">
          {([
            { id: 'docx', label: 'DOCX', description: 'Word mit Track Changes' },
            { id: 'pdf', label: 'PDF', description: 'Mit Annotationen' },
            { id: 'md', label: 'Markdown', description: 'Mit Diff-Markern' },
          ] as const).map((format) => (
            <button
              key={format.id}
              onClick={() => setExportFormat(format.id)}
              className={cn(
                'rounded-lg border p-3 text-center transition-colors',
                exportFormat === format.id
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:bg-surface-hover'
              )}
            >
              <div className="text-sm font-medium">{format.label}</div>
              <div className="mt-1 text-xs text-text-muted">{format.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Export Options */}
      <div className="rounded-lg border border-border p-4">
        <h3 className="mb-3 text-sm font-medium">Export-Optionen</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="rounded border-border" />
            <span className="text-sm">Kommentare einschließen</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="rounded border-border" />
            <span className="text-sm">Track Changes (DOCX)</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="rounded border-border" />
            <span className="text-sm">Diff-Marker (Markdown)</span>
          </label>
        </div>
      </div>
    </div>
  )
}
