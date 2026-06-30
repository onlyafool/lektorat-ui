import {
  FileText,
  Users,
  Settings,
  Workflow,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTextStore } from '@/store/text-store'
import { useResultsStore } from '@/store/results-store'
import { useState } from 'react'
import { PersonaPanel } from '@/features/persona-panel/PersonaPanel'
import { SettingsPanel } from '@/features/settings-panel/SettingsPanel'
import { FolderPicker } from '@/features/manuscript/FolderPicker'
import { StyleProfileList } from '@/features/style-profile/StyleProfilePanel'

type ViewMode = 'editor' | 'workflow'

const navItems = [
  { icon: FileText, label: 'Texte', id: 'texts' },
  { icon: Users, label: 'Personas', id: 'personas' },
  { icon: Workflow, label: 'Workflows', id: 'workflows' },
  { icon: Settings, label: 'Einstellungen', id: 'settings' },
]

interface SidebarProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
}

export function Sidebar({ onViewModeChange }: SidebarProps) {
  const [activeNav, setActiveNav] = useState('texts')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const texts = useTextStore((s) => s.texts)
  const activeTextId = useTextStore((s) => s.activeTextId)
  const setActiveText = useTextStore((s) => s.setActiveText)
  const addText = useTextStore((s) => s.addText)
  const results = useResultsStore((s) => s.results)
  const deleteResult = useResultsStore((s) => s.deleteResult)

  const handleNewText = async () => {
    const text = await addText('Neuer Text', '', 'txt')
    setActiveText(text.id)
    onViewModeChange('editor')
  }

  const handleNavClick = (id: string) => {
    if (id === 'settings') {
      setSettingsOpen(true)
      return
    }
    setActiveNav(id)
    if (id === 'workflows') {
      onViewModeChange('workflow')
    } else {
      onViewModeChange('editor')
    }
  }

  return (
    <aside className="flex w-64 flex-col border-r border-border bg-surface">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
          L
        </div>
        <span className="text-lg font-semibold">Lektorat</span>
      </div>

      {/* Navigation */}
      <nav className="flex gap-1 p-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            className={cn(
              'flex flex-1 flex-col items-center gap-1 rounded-lg p-2 text-xs transition-colors',
              activeNav === item.id
                ? 'bg-primary/20 text-primary'
                : 'text-text-muted hover:bg-surface-hover hover:text-text'
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2">
        {activeNav === 'texts' && (
          <div className="space-y-3">
            {/* Ordner auswählen */}
            <FolderPicker />

            {/* Trennlinie */}
            <div className="h-px bg-border" />

            {/* Stilprofil */}
            <StyleProfileList />

            {/* Trennlinie */}
            <div className="h-px bg-border" />

            {/* Lektorat-Ergebnisse */}
            {results.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center justify-between px-2 py-1">
                  <span className="text-xs font-medium text-text-muted uppercase">
                    Lektorate
                  </span>
                </div>
                {results.map((result) => (
                  <div
                    key={result.id}
                    className="group flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-surface-hover"
                  >
                    <div className="flex-1 truncate">
                      <div className="truncate font-medium">{result.textName || 'Lektorat'}</div>
                      <div className="text-xs text-text-muted">
                        {result.score}/100 · {result.commentCount} Kommentare
                      </div>
                    </div>
                    <button
                      onClick={() => deleteResult(result.id)}
                      data-testid={`delete-result-${result.id}`}
                      className="hidden rounded p-1 text-text-muted hover:text-danger group-hover:block"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Trennlinie */}
            {results.length > 0 && <div className="h-px bg-border" />}

            {/* Texte Liste */}
            <div className="space-y-1">
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-xs font-medium text-text-muted uppercase">
                  Einzelne Texte
                </span>
                <button
                  onClick={handleNewText}
                  className="rounded p-1 text-text-muted hover:bg-surface-hover hover:text-text"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              {texts.map((text) => (
                <button
                  key={text.id}
                  onClick={() => {
                    setActiveText(text.id)
                    onViewModeChange('editor')
                  }}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors',
                    activeTextId === text.id
                      ? 'bg-primary/20 text-primary'
                      : 'text-text hover:bg-surface-hover'
                  )}
                >
                  <FileText className="h-4 w-4 shrink-0" />
                  <span className="truncate">{text.name}</span>
                </button>
              ))}
              {texts.length === 0 && (
                <p className="px-2 py-4 text-center text-xs text-text-muted">
                  Noch keine Texte. Klicke + um einen neuen zu erstellen.
                </p>
              )}
            </div>
          </div>
        )}

        {activeNav === 'personas' && <PersonaPanel />}

        {activeNav === 'workflows' && (
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-xs font-medium text-text-muted uppercase">
                Workflows
              </span>
            </div>
            <p className="px-2 py-4 text-center text-xs text-text-muted">
              Workflow-Builder ist im Hauptfenster verfügbar.
            </p>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="border-t border-border p-2">
        <div className="flex items-center gap-2 rounded-lg bg-surface-hover px-3 py-2">
          <Search className="h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="Suchen..."
            className="w-full bg-transparent text-sm text-text outline-none placeholder:text-text-muted"
          />
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </aside>
  )
}
