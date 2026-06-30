import { useState, useRef } from 'react'
import { X, Save, Trash2, FileDown, Plus, BookOpen } from 'lucide-react'
import { useStyleProfileStore, type StyleProfile } from '@/store/style-profile-store'

interface StyleProfileEditorProps {
  profile?: StyleProfile | null
  onClose: () => void
}

export function StyleProfileEditor({ profile, onClose }: StyleProfileEditorProps) {
  const { addProfile, updateProfile, deleteProfile } = useStyleProfileStore()

  const [name, setName] = useState(profile?.name ?? '')
  const [content, setContent] = useState(profile?.content ?? '')
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSave = async () => {
    if (!name.trim() || !content.trim()) return

    setSaving(true)
    try {
      if (profile) {
        await updateProfile(profile.id, { name: name.trim(), content: content.trim() })
      } else {
        await addProfile({ name: name.trim(), content: content.trim() })
      }
      onClose()
    } catch (error) {
      console.error('Failed to save style profile:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!profile) return
    if (confirm('Möchtest du dieses Stilprofil wirklich löschen?')) {
      await deleteProfile(profile.id)
      onClose()
    }
  }

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const text = reader.result as string
      setContent(text)
      if (!name.trim()) {
        setName(file.name.replace(/\.md$/i, ''))
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const lineCount = content.split('\n').length
  const charCount = content.length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="flex h-[90vh] w-full max-w-3xl flex-col rounded-xl border border-border bg-surface shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold">
            {profile ? 'Stilprofil bearbeiten' : 'Neues Stilprofil'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-text-muted transition-colors hover:bg-surface-hover hover:text-text"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-medium">Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="z.B. Der Preis der Sichtbarkeit"
                className="w-full rounded-lg border border-border bg-surface-hover px-4 py-2 text-text placeholder-text-muted focus:border-primary focus:outline-none"
              />
            </div>

            {/* Import + Info */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-text-muted transition-colors hover:bg-surface-hover hover:text-text"
              >
                <FileDown className="h-4 w-4" />
                .md Datei importieren
              </button>
              <span className="text-xs text-text-muted">
                {lineCount} Zeilen · {charCount.toLocaleString('de-DE')} Zeichen
              </span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".md"
              onChange={handleFileImport}
              className="hidden"
            />

            {/* Content Editor */}
            <div>
              <label className="mb-2 block text-sm font-medium">Stilregeln *</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="# Stil meines Romans&#10;&#10;## Grundton&#10;...&#10;&#10;## Verbotene Wörter&#10;...&#10;&#10;## Rote Flaggen&#10;..."
                rows={20}
                className="w-full rounded-lg border border-border bg-surface-hover px-4 py-3 font-mono text-sm text-text placeholder-text-muted focus:border-primary focus:outline-none"
              />
              <p className="mt-1 text-xs text-text-muted">
                Markdown-Format. Wird den Agenten als Kontext beim Lektorat mitgegeben.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-6 py-4">
          <div>
            {profile && (
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
              disabled={saving || !name.trim() || !content.trim()}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Speichern...' : 'Speichern'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface StyleProfileListProps {
  onSelectProfile?: (profile: StyleProfile) => void
}

export function StyleProfileList({ onSelectProfile }: StyleProfileListProps) {
  const { profiles } = useStyleProfileStore()
  const [editing, setEditing] = useState<StyleProfile | null>(null)
  const [creating, setCreating] = useState(false)

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-text-muted uppercase">Stilprofile</span>
        <button
          onClick={() => setCreating(true)}
          className="rounded p-1 text-text-muted hover:bg-surface-hover hover:text-text"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Liste */}
      {profiles.length === 0 ? (
        <p className="px-2 py-4 text-center text-sm text-text-muted">
          Noch keine Stilprofile angelegt
        </p>
      ) : (
        <div className="space-y-1">
          {profiles.map((profile) => (
            <button
              key={profile.id}
              onClick={() => onSelectProfile?.(profile) ?? setEditing(profile)}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors hover:bg-surface-hover"
            >
              <BookOpen className="h-4 w-4 shrink-0 text-text-muted" />
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{profile.name}</div>
                <div className="truncate text-xs text-text-muted">
                  {profile.content.split('\n').length} Zeilen
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Edit/Create Modal */}
      {(editing || creating) && (
        <StyleProfileEditor
          profile={editing}
          onClose={() => {
            setEditing(null)
            setCreating(false)
          }}
        />
      )}
    </div>
  )
}
