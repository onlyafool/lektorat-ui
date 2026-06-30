import { Moon, Sun, Upload, Play, Download } from 'lucide-react'
import { useTextStore } from '@/store/text-store'
import { usePersonaStore } from '@/store/persona-store'
import { useExecutionStore } from '@/store/execution-store'
import { useSettingsStore } from '@/store/settings-store'
import { useStyleProfileStore } from '@/store/style-profile-store'
import { parseFile, validateFile } from '@/processors/file-parser'
import { useRef, useState, useEffect } from 'react'

interface HeaderProps {
  onExport: (format: 'docx' | 'pdf' | 'md') => void
}

export function Header({ onExport }: HeaderProps) {
  const texts = useTextStore((s) => s.texts)
  const activeTextId = useTextStore((s) => s.activeTextId)
  const addText = useTextStore((s) => s.addText)
  const setActiveText = useTextStore((s) => s.setActiveText)
  const personas = usePersonaStore((s) => s.personas)
  const activePersonaIds = usePersonaStore((s) => s.activePersonaIds)
  const startExecution = useExecutionStore((s) => s.startExecution)
  const startLektorat = useExecutionStore((s) => s.startLektorat)
  const isRunning = useExecutionStore((s) => s.isRunning)
  const getProfileForManuscript = useStyleProfileStore((s) => s.getProfileForManuscript)
  const theme = useSettingsStore((s) => s.theme)
  const setTheme = useSettingsStore((s) => s.setTheme)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showExportMenu, setShowExportMenu] = useState(false)

  const activeText = texts.find((t) => t.id === activeTextId) ?? null

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
    } else if (theme === 'light') {
      root.classList.add('light')
      root.classList.remove('dark')
    } else {
      // System preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (prefersDark) {
        root.classList.add('dark')
        root.classList.remove('light')
      } else {
        root.classList.add('light')
        root.classList.remove('dark')
      }
    }
  }, [theme])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateFile(file)
    if (!validation.valid) {
      alert(validation.error)
      return
    }

    try {
      const text = await parseFile(file)
      await addText(text.name, text.content, text.metadata.originalFormat)
      setActiveText(text.id)
    } catch (error) {
      console.error('File upload failed:', error)
      alert('Fehler beim Laden der Datei')
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleStartReview = async () => {
    if (!activeText) return

    const activePersonaList = personas.filter((p) => activePersonaIds.includes(p.id))
    if (activePersonaList.length === 0) {
      alert('Bitte wähle mindestens eine Persona aus.')
      return
    }

    // Get style profile if available
    const styleProfile = getProfileForManuscript()

    if (activePersonaList.length >= 2) {
      // Multiple personas: use 5-agent runner
      await startLektorat(activeText.id, activeText.content, styleProfile?.content)
    } else {
      // Single persona: use direct execution
      await startExecution(activePersonaList[0], activeText.id, activeText.content)
    }
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-surface px-4">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold">
          {activeText?.name ?? 'Lektorat UI'}
        </h1>
        {activeText && (
          <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">
            {activeText.metadata.wordCount} Wörter
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Upload Button */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md,.docx,.pdf,.rtf"
          onChange={handleFileUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 rounded-lg bg-surface-hover px-3 py-2 text-sm text-text transition-colors hover:bg-surface-active"
        >
          <Upload className="h-4 w-4" />
          Datei laden
        </button>

        {/* Run Button */}
        <button
          onClick={handleStartReview}
          disabled={!activeText || activePersonaIds.length === 0 || isRunning}
          className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="h-4 w-4" />
          {isRunning ? 'Wird ausgeführt...' : 'Lektorat starten'}
        </button>

        {/* Export Menu */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-secondary/80"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          {showExportMenu && (
            <div className="absolute right-0 top-full z-50 mt-1 w-40 rounded-lg border border-border bg-surface shadow-lg">
              <button
                onClick={() => { onExport('docx'); setShowExportMenu(false) }}
                className="flex w-full items-center gap-2 rounded-t-lg px-3 py-2 text-sm text-text hover:bg-surface-hover"
              >
                📄 DOCX (Word)
              </button>
              <button
                onClick={() => { onExport('pdf'); setShowExportMenu(false) }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-text hover:bg-surface-hover"
              >
                📕 PDF
              </button>
              <button
                onClick={() => { onExport('md'); setShowExportMenu(false) }}
                className="flex w-full items-center gap-2 rounded-b-lg px-3 py-2 text-sm text-text hover:bg-surface-hover"
              >
                📝 Markdown
              </button>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Theme wechseln"
          className="rounded-lg p-2 text-text-muted transition-colors hover:bg-surface-hover hover:text-text"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </div>
    </header>
  )
}
