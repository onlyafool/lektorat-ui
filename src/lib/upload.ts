import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export interface UploadProgress {
  file: string
  status: 'pending' | 'uploading' | 'done' | 'error'
  progress: number
  error?: string
}

export interface ManuscriptFile {
  name: string
  path: string
  content: string
  wordCount: number
}

/**
 * Zählt Wörter in einem Text
 */
function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length
}

/**
 * Liest einen Ordner über File System Access API
 */
export async function readFolder(): Promise<{ name: string; files: ManuscriptFile[] } | null> {
  // Feature Detection
  if (!('showDirectoryPicker' in window)) {
    console.warn('[Upload] File System Access API nicht unterstützt')
    return null
  }

  try {
    const dirHandle = await window.showDirectoryPicker({
      mode: 'read',
    })

    const files: ManuscriptFile[] = []

    for await (const entry of dirHandle.values()) {
      if (entry.kind === 'file') {
        const file = await entry.getFile()
        const ext = file.name.split('.').pop()?.toLowerCase()

        // Nur Text-Dateien lesen
        if (['txt', 'md', 'rtf'].includes(ext ?? '')) {
          const content = await file.text()
          files.push({
            name: file.name,
            path: entry.name,
            content,
            wordCount: countWords(content),
          })
        }
      }
    }

    return { name: dirHandle.name, files }
  } catch (error) {
    // User hat abgebrochen
    if ((error as Error).name === 'AbortError') return null
    console.error('[Upload] Ordner lesen fehlgeschlagen:', error)
    return null
  }
}

/**
 * Liest Dateien von einem Drag & Drop Event
 */
export async function readDroppedFiles(dataTransfer: DataTransfer): Promise<ManuscriptFile[]> {
  const files: ManuscriptFile[] = []

  for (const item of Array.from(dataTransfer.items)) {
    if (item.kind === 'file') {
      const file = item.getAsFile()
      if (!file) continue

      const ext = file.name.split('.').pop()?.toLowerCase()
      if (['txt', 'md', 'rtf'].includes(ext ?? '')) {
        const content = await file.text()
        files.push({
          name: file.name,
          path: file.name,
          content,
          wordCount: countWords(content),
        })
      }
    }
  }

  return files
}

/**
 * Uploadet Dateien zu Supabase Storage und speichert Metadaten
 */
export async function uploadManuscript(
  folderName: string,
  files: ManuscriptFile[],
  userId: string,
  onProgress?: (progress: UploadProgress[]) => void
): Promise<{ manuscriptId: string | null; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { manuscriptId: null, error: 'Supabase nicht konfiguriert.' }
  }

  // Progress initialisieren
  const progress: UploadProgress[] = files.map((f) => ({
    file: f.name,
    status: 'pending',
    progress: 0,
  }))
  onProgress?.(progress)

  // 1. Manuscript-Eintrag erstellen
  const totalWords = files.reduce((sum, f) => sum + f.wordCount, 0)
  const { data: manuscript, error: manuscriptError } = await supabase
    .from('manuscripts')
    .insert({
      user_id: userId,
      name: folderName,
      file_count: files.length,
      total_words: totalWords,
      status: 'uploaded',
    })
    .select('id')
    .single()

  if (manuscriptError || !manuscript) {
    return { manuscriptId: null, error: manuscriptError?.message ?? 'Manuscript erstellen fehlgeschlagen.' }
  }

  const manuscriptId = manuscript.id

  // 2. Dateien einzeln hochladen
  for (let i = 0; i < files.length; i++) {
    const file = files[i]

    // Progress aktualisieren
    progress[i] = { ...progress[i], status: 'uploading', progress: 0 }
    onProgress?.([...progress])

    try {
      // Datei zu Supabase Storage hochladen
      const storagePath = `${userId}/${manuscriptId}/${file.name}`
      const { error: uploadError } = await supabase.storage
        .from('manuscripts')
        .upload(storagePath, new Blob([file.content], { type: 'text/plain' }), {
          contentType: 'text/plain',
          upsert: true,
        })

      if (uploadError) throw uploadError

      // Metadaten in PostgreSQL speichern
      const { error: fileError } = await supabase
        .from('manuscript_files')
        .insert({
          manuscript_id: manuscriptId,
          user_id: userId,
          name: file.name,
          path: file.path,
          content: file.content,
          word_count: file.wordCount,
          storage_path: storagePath,
        })

      if (fileError) throw fileError

      // Progress abschließen
      progress[i] = { ...progress[i], status: 'done', progress: 100 }
    } catch (error) {
      progress[i] = {
        ...progress[i],
        status: 'error',
        error: (error as Error).message ?? 'Upload fehlgeschlagen',
      }
    }

    onProgress?.([...progress])
  }

  // 3. Status aktualisieren
  const allDone = progress.every((p) => p.status === 'done')
  await supabase
    .from('manuscripts')
    .update({ status: allDone ? 'uploaded' : 'error' })
    .eq('id', manuscriptId)

  return { manuscriptId }
}

/**
 * Lädt alle Manuscripts eines Users
 */
export async function loadManuscripts(userId: string) {
  if (!isSupabaseConfigured || !supabase) return []

  const { data, error } = await supabase
    .from('manuscripts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[Upload] Manuscripts laden fehlgeschlagen:', error)
    return []
  }

  return data ?? []
}

/**
 * Lädt die Dateien eines Manuscripts
 */
export async function loadManuscriptFiles(manuscriptId: string) {
  if (!isSupabaseConfigured || !supabase) return []

  const { data, error } = await supabase
    .from('manuscript_files')
    .select('*')
    .eq('manuscript_id', manuscriptId)
    .order('name')

  if (error) {
    console.error('[Upload] Manuscript Files laden fehlgeschlagen:', error)
    return []
  }

  return data ?? []
}
