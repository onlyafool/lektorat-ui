import { useState } from 'react'
import { X, Save, Trash2, FileDown } from 'lucide-react'
import { usePersonaStore } from '@/store/persona-store'
import { useSettingsStore } from '@/store/settings-store'
import type { Persona, ModelProvider } from '@/types'
import type { ParsedSkill } from '@/lib/skill-parser'
import { cn } from '@/lib/utils'
import { SkillImporter } from './SkillImporter'

interface PersonaEditorProps {
  persona?: Persona | null
  onClose: () => void
}

const COLOR_OPTIONS = [
  { value: '#ef4444', label: 'Rot' },
  { value: '#f97316', label: 'Orange' },
  { value: '#f59e0b', label: 'Gelb' },
  { value: '#84cc16', label: 'Grün' },
  { value: '#10b981', label: 'Emerald' },
  { value: '#06b6d4', label: 'Cyan' },
  { value: '#3b82f6', label: 'Blau' },
  { value: '#2563eb', label: 'Blau' },
  { value: '#8b5cf6', label: 'Violett' },
  { value: '#ec4899', label: 'Pink' },
]

export function PersonaEditor({ persona, onClose }: PersonaEditorProps) {
  const { addPersona, updatePersona, deletePersona } = usePersonaStore()
  const providers = useSettingsStore((s) => s.providers)
  
  const [name, setName] = useState(persona?.name ?? '')
  const [description, setDescription] = useState(persona?.description ?? '')
  const [systemPrompt, setSystemPrompt] = useState(persona?.systemPrompt ?? '')
  const [color, setColor] = useState(persona?.color ?? '#2563eb')
  const [provider, setProvider] = useState<ModelProvider>(persona?.model.provider ?? 'ollama')
  const [modelId, setModelId] = useState(persona?.model.modelId ?? '')
  const [temperature, setTemperature] = useState(persona?.model.temperature ?? 0.7)
  const [maxTokens, setMaxTokens] = useState(persona?.model.maxTokens ?? 4096)
  const [topP, setTopP] = useState(persona?.model.topP ?? 1)
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [showImporter, setShowImporter] = useState(false)

  const availableModels = providers[provider]?.models ?? []

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!name.trim()) {
      newErrors.name = 'Name ist erforderlich'
    }
    if (!systemPrompt.trim()) {
      newErrors.systemPrompt = 'System Prompt ist erforderlich'
    }
    if (!modelId.trim()) {
      newErrors.modelId = 'Modell-ID ist erforderlich'
    }
    if (temperature < 0 || temperature > 2) {
      newErrors.temperature = 'Temperature muss zwischen 0 und 2 liegen'
    }
    if (maxTokens < 1 || maxTokens > 100000) {
      newErrors.maxTokens = 'Max Tokens muss zwischen 1 und 100000 liegen'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    
    setSaving(true)
    try {
      const personaData = {
        name: name.trim(),
        description: description.trim(),
        systemPrompt: systemPrompt.trim(),
        color,
        icon: 'user',
        isBuiltIn: false,
        model: {
          provider,
          modelId: modelId.trim(),
          temperature,
          maxTokens,
          topP,
          stop: [],
        },
      }
      
      if (persona) {
        await updatePersona(persona.id, personaData)
      } else {
        await addPersona(personaData)
      }
      
      onClose()
    } catch (error) {
      console.error('Failed to save persona:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!persona || persona.isBuiltIn) return
    
    if (confirm('Möchtest du diese Persona wirklich löschen?')) {
      await deletePersona(persona.id)
      onClose()
    }
  }

  const handleSkillImport = (skill: ParsedSkill) => {
    setName(skill.name)
    setDescription(skill.description)
    setSystemPrompt(skill.systemPrompt)
    setShowImporter(false)
  }

  return (
    <>
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="flex h-[90vh] w-full max-w-2xl flex-col rounded-xl border border-border bg-surface shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold">
            {persona ? 'Persona bearbeiten' : 'Neue Persona erstellen'}
          </h2>
          <div className="flex items-center gap-2">
            {!persona && (
              <button
                onClick={() => setShowImporter(true)}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-text-muted transition-colors hover:bg-surface-hover hover:text-text"
              >
                <FileDown className="h-4 w-4" />
                Skill importieren
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-text-muted transition-colors hover:bg-surface-hover hover:text-text"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-medium">Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="z.B. Mein Korrektor"
                className={cn(
                  'w-full rounded-lg border bg-surface-hover px-4 py-2 text-text placeholder-text-muted focus:border-primary focus:outline-none',
                  errors.name ? 'border-danger' : 'border-border'
                )}
              />
              {errors.name && <p className="mt-1 text-xs text-danger">{errors.name}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-medium">Beschreibung</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="z.B. Mein persönlicher Korrektor"
                className="w-full rounded-lg border border-border bg-surface-hover px-4 py-2 text-text placeholder-text-muted focus:border-primary focus:outline-none"
              />
            </div>

            {/* System Prompt */}
            <div>
              <label className="mb-2 block text-sm font-medium">System Prompt *</label>
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="Du bist ein erfahrener Korrektor..."
                rows={6}
                className={cn(
                  'w-full rounded-lg border bg-surface-hover px-4 py-2 text-text placeholder-text-muted focus:border-primary focus:outline-none',
                  errors.systemPrompt ? 'border-danger' : 'border-border'
                )}
              />
              {errors.systemPrompt && <p className="mt-1 text-xs text-danger">{errors.systemPrompt}</p>}
            </div>

            {/* Color */}
            <div>
              <label className="mb-2 block text-sm font-medium">Farbe</label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setColor(option.value)}
                    className={cn(
                      'h-8 w-8 rounded-full transition-transform',
                      color === option.value && 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-surface'
                    )}
                    style={{ backgroundColor: option.value }}
                    title={option.label}
                  />
                ))}
              </div>
            </div>

            {/* Model Settings */}
            <div className="rounded-lg border border-border bg-surface-hover p-4">
              <h3 className="mb-4 text-sm font-semibold">Modell-Einstellungen</h3>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Provider */}
                <div>
                  <label className="mb-2 block text-xs font-medium text-text-muted">Provider</label>
                  <select
                    value={provider}
                    onChange={(e) => {
                      setProvider(e.target.value as ModelProvider)
                      setModelId('')
                    }}
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
                  >
                    <option value="ollama">Ollama (lokal)</option>
                    <option value="lmstudio">LM Studio (lokal)</option>
                    <option value="anthropic">Anthropic (Cloud)</option>
                    <option value="openrouter">OpenRouter (Cloud)</option>
                  </select>
                </div>

                {/* Model */}
                <div>
                  <label className="mb-2 block text-xs font-medium text-text-muted">Modell *</label>
                  <input
                    type="text"
                    value={modelId}
                    onChange={(e) => setModelId(e.target.value)}
                    placeholder="z.B. qwen2.5:7b"
                    className={cn(
                      'w-full rounded-lg border bg-surface px-3 py-2 text-sm text-text placeholder-text-muted focus:border-primary focus:outline-none',
                      errors.modelId ? 'border-danger' : 'border-border'
                    )}
                    list={`models-${provider}`}
                  />
                  {availableModels.length > 0 && (
                    <datalist id={`models-${provider}`}>
                      {availableModels.map((model) => (
                        <option key={model} value={model} />
                      ))}
                    </datalist>
                  )}
                  {errors.modelId && <p className="mt-1 text-xs text-danger">{errors.modelId}</p>}
                </div>

                {/* Temperature */}
                <div>
                  <label className="mb-2 block text-xs font-medium text-text-muted">
                    Temperature: {temperature.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.05"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-text-muted">
                    <span>Präzise (0)</span>
                    <span>Kreativ (2)</span>
                  </div>
                  {errors.temperature && <p className="mt-1 text-xs text-danger">{errors.temperature}</p>}
                </div>

                {/* Max Tokens */}
                <div>
                  <label className="mb-2 block text-xs font-medium text-text-muted">Max Tokens</label>
                  <input
                    type="number"
                    min="1"
                    max="100000"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(parseInt(e.target.value) || 4096)}
                    className={cn(
                      'w-full rounded-lg border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none',
                      errors.maxTokens ? 'border-danger' : 'border-border'
                    )}
                  />
                  {errors.maxTokens && <p className="mt-1 text-xs text-danger">{errors.maxTokens}</p>}
                </div>

                {/* Top P */}
                <div>
                  <label className="mb-2 block text-xs font-medium text-text-muted">
                    Top P: {topP.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={topP}
                    onChange={(e) => setTopP(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-6 py-4">
          <div>
            {persona && !persona.isBuiltIn && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-danger transition-colors hover:bg-danger/10"
              >
                <Trash2 className="h-4 w-4" />
                Löschen
              </button>
            )}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm text-text-muted transition-colors hover:bg-surface-hover"
            >
              Abbrechen
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Speichern...' : 'Speichern'}
            </button>
          </div>
        </div>
      </div>
    </div>

      {/* Skill Import Modal */}
      {showImporter && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-xl border border-border bg-surface p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold">Skill importieren</h3>
            <SkillImporter onImport={handleSkillImport} onClose={() => setShowImporter(false)} />
          </div>
        </div>
      )}
    </>
  )
}
