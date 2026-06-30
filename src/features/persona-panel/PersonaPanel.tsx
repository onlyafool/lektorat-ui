import { usePersonaStore } from '@/store/persona-store'
import { Check, Plus, Settings, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import type { Persona } from '@/types'
import { PersonaEditor } from './PersonaEditor'

export function PersonaPanel() {
  const personas = usePersonaStore((s) => s.personas)
  const activePersonaIds = usePersonaStore((s) => s.activePersonaIds)
  const togglePersona = usePersonaStore((s) => s.togglePersona)
  const deletePersona = usePersonaStore((s) => s.deletePersona)
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold">Personas</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="rounded-lg p-1 text-text-muted transition-colors hover:bg-surface-hover hover:text-text"
          title="Neue Persona erstellen"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {/* Persona List */}
        <div className="space-y-1">
          {personas.map((persona) => (
            <PersonaCard
              key={persona.id}
              persona={persona}
              isActive={activePersonaIds.includes(persona.id)}
              onToggle={() => togglePersona(persona.id)}
              onEdit={() => setEditingPersona(persona)}
              onDelete={() => deletePersona(persona.id)}
            />
          ))}
        </div>
      </div>

      {/* Active Count */}
      <div className="border-t border-border px-4 py-2 text-center text-xs text-text-muted">
        {activePersonaIds.length} von {personas.length} aktiv
      </div>

      {/* Persona Editor Modal */}
      {(editingPersona || isCreating) && (
        <PersonaEditor
          persona={editingPersona}
          onClose={() => {
            setEditingPersona(null)
            setIsCreating(false)
          }}
        />
      )}
    </div>
  )
}

function PersonaCard({
  persona,
  isActive,
  onToggle,
  onEdit,
  onDelete,
}: {
  persona: Persona
  isActive: boolean
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div
      className={cn(
        'group flex items-start gap-3 rounded-lg p-3 transition-colors',
        isActive
          ? 'bg-primary/10 ring-1 ring-primary/30'
          : 'bg-surface-hover hover:bg-surface-active'
      )}
    >
      <button
        onClick={onToggle}
        className={cn(
          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors',
          isActive
            ? 'border-primary bg-primary text-white'
            : 'border-border bg-transparent text-transparent hover:border-text-muted'
        )}
      >
        {isActive && <Check className="h-3 w-3" />}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: persona.color }}
          />
          <span className="text-sm font-medium">{persona.name}</span>
        </div>
        {persona.description && (
          <p className="mt-0.5 text-xs text-text-muted line-clamp-2">
            {persona.description}
          </p>
        )}
        <div className="mt-1 flex items-center gap-2 text-xs text-text-muted">
          <span>{persona.model.provider}</span>
          <span>·</span>
          <span>temp {persona.model.temperature}</span>
        </div>
      </div>

      <div className="flex shrink-0 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="rounded p-1 text-text-muted hover:bg-surface-hover hover:text-text"
          title="Bearbeiten"
        >
          <Settings className="h-3 w-3" />
        </button>
        {!persona.isBuiltIn && (
          <button
            onClick={onDelete}
            className="rounded p-1 text-text-muted hover:bg-danger/10 hover:text-danger"
            title="Löschen"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  )
}
