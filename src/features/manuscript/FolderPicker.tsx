import { useState, useCallback } from 'react'
import { FolderOpen, Upload, Check, AlertCircle, Loader } from 'lucide-react'
import { cn } from '@/lib/utils'
import { readFolder, uploadManuscript, type UploadProgress, type ManuscriptFile } from '@/lib/upload'
import { useAuthStore } from '@/store/auth-store'
import { isSupabaseConfigured } from '@/lib/supabase'

interface FolderPickerProps {
  onUploadComplete?: () => void
}

export function FolderPicker({ onUploadComplete }: FolderPickerProps) {
  const user = useAuthStore((s) => s.user)
  const [isReading, setIsReading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState<UploadProgress[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [folderName, setFolderName] = useState<string | null>(null)
  const [fileCount, setFileCount] = useState(0)

  const startUpload = useCallback(async (name: string, files: ManuscriptFile[], userId: string) => {
    setIsUploading(true)
    setProgress([])

    const { manuscriptId, error: uploadError } = await uploadManuscript(
      name,
      files,
      userId,
      setProgress
    )

    setIsUploading(false)

    if (uploadError) {
      setError(uploadError)
    } else if (manuscriptId) {
      setSuccess(true)
      onUploadComplete?.()
    }
  }, [onUploadComplete])

  const handleSelectFolder = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setError('Supabase nicht konfiguriert. Backend benötigt für Upload.')
      return
    }

    if (!user) {
      setError('Nicht angemeldet.')
      return
    }

    setIsReading(true)
    setError(null)
    setSuccess(false)

    const result = await readFolder()

    if (!result) {
      setIsReading(false)
      return // User hat abgebrochen
    }

    if (result.files.length === 0) {
      setError('Keine Textdateien (.txt, .md, .rtf) im Ordner gefunden.')
      setIsReading(false)
      return
    }

    setFolderName(result.name)
    setFileCount(result.files.length)
    setIsReading(false)

    // Upload starten
    await startUpload(result.name, result.files, user.id)
  }, [user, startUpload])

  const totalFiles = progress.length
  const doneFiles = progress.filter((p) => p.status === 'done').length
  const errorFiles = progress.filter((p) => p.status === 'error').length

  return (
    <div className="space-y-2">
      {/* Ordner auswählen Button */}
      <button
        onClick={handleSelectFolder}
        disabled={isReading || isUploading}
        className={cn(
          'flex w-full items-center gap-2 rounded-lg border border-dashed border-border p-3 text-sm transition-colors',
          isReading || isUploading
            ? 'cursor-not-allowed opacity-50'
            : 'hover:border-primary hover:bg-primary/5'
        )}
      >
        {isReading ? (
          <>
            <Loader className="h-4 w-4 animate-spin text-primary" />
            <span>Ordner wird gelesen...</span>
          </>
        ) : isUploading ? (
          <>
            <Upload className="h-4 w-4 animate-pulse text-primary" />
            <span>Upload läuft...</span>
          </>
        ) : success ? (
          <>
            <Check className="h-4 w-4 text-secondary" />
            <span>Upload abgeschlossen</span>
          </>
        ) : (
          <>
            <FolderOpen className="h-4 w-4 text-text-muted" />
            <span>Obsidian Vault auswählen</span>
          </>
        )}
      </button>

      {/* Fortschritt */}
      {isUploading && totalFiles > 0 && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span>{folderName}</span>
            <span>{doneFiles}/{totalFiles}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-hover">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(doneFiles / totalFiles) * 100}%` }}
            />
          </div>
          {errorFiles > 0 && (
            <p className="text-xs text-danger">{errorFiles} Dateien fehlgeschlagen</p>
          )}
        </div>
      )}

      {/* Erfolg */}
      {success && folderName && (
        <div className="rounded-lg bg-secondary/10 p-2 text-xs text-secondary">
          <Check className="mr-1 inline h-3 w-3" />
          {fileCount} Dateien aus "{folderName}" hochgeladen.
        </div>
      )}

      {/* Fehler */}
      {error && (
        <div className="rounded-lg bg-danger/10 p-2 text-xs text-danger">
          <AlertCircle className="mr-1 inline h-3 w-3" />
          {error}
        </div>
      )}

      {/* Kein Supabase */}
      {!isSupabaseConfigured && (
        <p className="text-xs text-text-muted italic">
          Upload nur im Online-Modus (Supabase konfigurieren).
        </p>
      )}
    </div>
  )
}
