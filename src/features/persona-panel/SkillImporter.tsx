import { useState, useRef } from 'react'
import { Upload, FileText, AlertCircle } from 'lucide-react'
import { parseSkillMd, readSkillFile, type ParsedSkill } from '@/lib/skill-parser'
import { cn } from '@/lib/utils'

interface SkillImporterProps {
  onImport: (skill: ParsedSkill) => void
  onClose: () => void
}

export function SkillImporter({ onImport, onClose }: SkillImporterProps) {
  const [skill, setSkill] = useState<ParsedSkill | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.md')) {
      setError('Bitte wähle eine .md Datei aus.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const content = await readSkillFile(file)
      const parsed = parseSkillMd(content)

      if (!parsed.systemPrompt.trim()) {
        setError('Die Datei enthält keinen System-Prompt (Inhalt nach Frontmatter).')
        return
      }

      setSkill(parsed)
    } catch {
      setError('Datei konnte nicht gelesen werden.')
    } finally {
      setLoading(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (!file) return

    if (!file.name.endsWith('.md')) {
      setError('Bitte wähle eine .md Datei aus.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const content = await readSkillFile(file)
      const parsed = parseSkillMd(content)

      if (!parsed.systemPrompt.trim()) {
        setError('Die Datei enthält keinen System-Prompt.')
        return
      }

      setSkill(parsed)
    } catch {
      setError('Datei konnte nicht gelesen werden.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Datei-Auswahl */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors',
          skill
            ? 'border-success bg-success/5'
            : 'border-border hover:border-primary hover:bg-primary/5'
        )}
      >
        {skill ? (
          <>
            <FileText className="h-8 w-8 text-success" />
            <span className="text-sm font-medium text-success">{skill.name}</span>
            <span className="text-xs text-text-muted">Klicke zum Ändern</span>
          </>
        ) : (
          <>
            <Upload className="h-8 w-8 text-text-muted" />
            <span className="text-sm font-medium">
              {loading ? 'Lese Datei...' : 'SKILL.md hierher ziehen oder klicken'}
            </span>
            <span className="text-xs text-text-muted">Nur .md Dateien</span>
          </>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".md"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Fehler */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-danger/10 p-3 text-sm text-danger">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Vorschau */}
      {skill && (
        <div className="space-y-3 rounded-lg border border-border bg-surface-hover p-4">
          <div>
            <span className="text-xs font-medium text-text-muted">Name</span>
            <p className="text-sm">{skill.name}</p>
          </div>
          {skill.description && (
            <div>
              <span className="text-xs font-medium text-text-muted">Beschreibung</span>
              <p className="text-sm">{skill.description}</p>
            </div>
          )}
          <div>
            <span className="text-xs font-medium text-text-muted">
              System-Prompt ({skill.systemPrompt.length} Zeichen)
            </span>
            <pre className="mt-1 max-h-32 overflow-auto rounded bg-surface p-2 text-xs text-text-muted">
              {skill.systemPrompt.slice(0, 500)}
              {skill.systemPrompt.length > 500 && '...'}
            </pre>
          </div>
        </div>
      )}

      {/* Aktionen */}
      <div className="flex justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-lg px-4 py-2 text-sm text-text-muted transition-colors hover:bg-surface-hover"
        >
          Abbrechen
        </button>
        <button
          onClick={() => skill && onImport(skill)}
          disabled={!skill}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
        >
          <FileText className="h-4 w-4" />
          Importieren
        </button>
      </div>
    </div>
  )
}
