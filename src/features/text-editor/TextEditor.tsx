import { useTextStore } from '@/store/text-store'
import { useCallback, useEffect, useState } from 'react'
import { Save, Trash2 } from 'lucide-react'
import { debounce } from '@/lib/utils'

export function TextEditor() {
  const texts = useTextStore((s) => s.texts)
  const activeTextId = useTextStore((s) => s.activeTextId)
  const updateText = useTextStore((s) => s.updateText)
  const deleteText = useTextStore((s) => s.deleteText)
  const [content, setContent] = useState('')

  const activeText = texts.find((t) => t.id === activeTextId) ?? null

  useEffect(() => {
    if (activeText) {
      setContent(activeText.content)
    } else {
      setContent('')
    }
  }, [activeText])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSave = useCallback(
    debounce((id: string, newContent: string) => {
      updateText(id, { content: newContent })
    }, 500),
    [updateText]
  )

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setContent(newContent)
    if (activeText) {
      debouncedSave(activeText.id, newContent)
    }
  }

  const handleSave = () => {
    if (activeText) {
      updateText(activeText.id, { content })
    }
  }

  const handleDelete = () => {
    if (activeText && confirm('Text wirklich löschen?')) {
      deleteText(activeText.id)
    }
  }

  if (!activeText) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-text-muted">
        <div className="text-6xl">📝</div>
        <h2 className="text-xl font-semibold">Kein Text ausgewählt</h2>
        <p className="text-sm">
          Wähle einen Text aus der Seitenleiste oder lade eine Datei hoch.
        </p>
      </div>
    )
  }

  const wordCount = content.split(/\s+/).filter(Boolean).length
  const charCount = content.length
  const lineCount = content.split('\n').length

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex items-center gap-4 text-xs text-text-muted">
          <span>{wordCount} Wörter</span>
          <span>{charCount} Zeichen</span>
          <span>{lineCount} Zeilen</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-1 rounded-lg bg-surface-hover px-2 py-1 text-xs text-text transition-colors hover:bg-surface-active"
          >
            <Save className="h-3 w-3" />
            Speichern
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-danger transition-colors hover:bg-danger/10"
          >
            <Trash2 className="h-3 w-3" />
            Löschen
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 overflow-hidden">
        <textarea
          value={content}
          onChange={handleContentChange}
          placeholder="Text eingeben oder Datei laden..."
          className="h-full w-full resize-none bg-transparent p-4 font-mono text-sm leading-relaxed text-text outline-none placeholder:text-text-muted"
          spellCheck={false}
        />
      </div>
    </div>
  )
}
