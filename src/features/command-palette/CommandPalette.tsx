import { useState, useEffect, useRef } from 'react'
import { Search, FileText, Users, Settings, Workflow, Play, Download, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTextStore } from '@/store/text-store'
import { usePersonaStore } from '@/store/persona-store'
import { useWorkflowStore } from '@/store/workflow-store'
import { useExecutionStore } from '@/store/execution-store'

interface Command {
  id: string
  label: string
  description?: string
  icon: React.ReactNode
  action: () => void
  shortcut?: string
  category: 'text' | 'persona' | 'workflow' | 'export' | 'view' | 'system'
}

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  onExport?: (format: 'docx' | 'pdf' | 'md') => void
}

export function CommandPalette({ isOpen, onClose, onExport }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const texts = useTextStore((s) => s.texts)
  const personas = usePersonaStore((s) => s.personas)
  const workflows = useWorkflowStore((s) => s.workflows)
  const startExecution = useExecutionStore((s) => s.startExecution)

  // Build commands list
  const commands: Command[] = [
    // Text commands
    ...texts.map((text) => ({
      id: `text-${text.id}`,
      label: text.name,
      description: `${text.metadata.wordCount} Wörter`,
      icon: <FileText className="h-4 w-4" />,
      action: () => {
        useTextStore.getState().setActiveText(text.id)
        onClose()
      },
      category: 'text' as const,
    })),

    // Persona commands
    ...personas.map((persona) => ({
      id: `persona-${persona.id}`,
      label: persona.name,
      description: persona.description,
      icon: <Users className="h-4 w-4" style={{ color: persona.color }} />,
      action: () => {
        usePersonaStore.getState().togglePersona(persona.id)
        onClose()
      },
      category: 'persona' as const,
    })),

    // Workflow commands
    ...workflows.map((workflow) => ({
      id: `workflow-${workflow.id}`,
      label: workflow.name,
      description: workflow.description,
      icon: <Workflow className="h-4 w-4" />,
      action: () => {
        useWorkflowStore.getState().loadWorkflow(workflow.id)
        onClose()
      },
      category: 'workflow' as const,
    })),

    // System commands
    {
      id: 'start-review',
      label: 'Lektorat starten',
      description: 'Führt das Lektorat mit aktiven Personas durch',
      icon: <Play className="h-4 w-4" />,
      action: async () => {
        const activeText = useTextStore.getState().getActiveText()
        const activePersonas = usePersonaStore.getState().getActivePersonas()
        if (activeText && activePersonas.length > 0) {
          for (const persona of activePersonas) {
            await startExecution(persona, activeText.id, activeText.content)
          }
        }
        onClose()
      },
      shortcut: '⌘Enter',
      category: 'system' as const,
    },
    {
      id: 'export-docx',
      label: 'Als DOCX exportieren',
      description: 'Exportiert mit Track Changes',
      icon: <Download className="h-4 w-4" />,
      action: () => {
        onExport?.('docx')
        onClose()
      },
      category: 'export' as const,
    },
    {
      id: 'export-pdf',
      label: 'Als PDF exportieren',
      description: 'Exportiert mit Annotationen',
      icon: <Download className="h-4 w-4" />,
      action: () => {
        onExport?.('pdf')
        onClose()
      },
      category: 'export' as const,
    },
    {
      id: 'export-md',
      label: 'Als Markdown exportieren',
      description: 'Exportiert mit Diff-Markern',
      icon: <Download className="h-4 w-4" />,
      action: () => {
        onExport?.('md')
        onClose()
      },
      category: 'export' as const,
    },
    {
      id: 'toggle-theme',
      label: 'Theme wechseln',
      description: 'Zwischen Hell und Dunkel wechseln',
      icon: <Moon className="h-4 w-4" />,
      action: () => {
        // Toggle theme logic
        onClose()
      },
      shortcut: '⌘D',
      category: 'view' as const,
    },
    {
      id: 'settings',
      label: 'Einstellungen öffnen',
      description: 'Öffnet die Einstellungen',
      icon: <Settings className="h-4 w-4" />,
      action: () => {
        // Open settings
        onClose()
      },
      shortcut: '⌘,',
      category: 'system' as const,
    },
  ]

  // Filter commands
  const filteredCommands = commands.filter((cmd) => {
    const searchQuery = query.toLowerCase()
    return (
      cmd.label.toLowerCase().includes(searchQuery) ||
      cmd.description?.toLowerCase().includes(searchQuery)
    )
  })

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
      setQuery('')
    }
  }, [isOpen])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        filteredCommands[selectedIndex]?.action()
        break
      case 'Escape':
        onClose()
        break
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Palette */}
      <div className="relative w-full max-w-lg rounded-xl border border-border bg-surface shadow-2xl">
        {/* Search Input */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search className="h-5 w-5 text-text-muted" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Befehl suchen..."
            className="flex-1 bg-transparent text-sm text-text outline-none placeholder:text-text-muted"
          />
          <kbd className="rounded border border-border bg-surface-hover px-2 py-0.5 text-xs text-text-muted">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="py-8 text-center text-sm text-text-muted">
              Keine Befehle gefunden
            </div>
          ) : (
            filteredCommands.map((cmd, index) => (
              <button
                key={cmd.id}
                onClick={cmd.action}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors',
                  index === selectedIndex
                    ? 'bg-primary/10 text-primary'
                    : 'text-text hover:bg-surface-hover'
                )}
              >
                <span className="shrink-0">{cmd.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{cmd.label}</div>
                  {cmd.description && (
                    <div className="text-xs text-text-muted truncate">
                      {cmd.description}
                    </div>
                  )}
                </div>
                {cmd.shortcut && (
                  <kbd className="shrink-0 rounded border border-border bg-surface-hover px-2 py-0.5 text-xs text-text-muted">
                    {cmd.shortcut}
                  </kbd>
                )}
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-4 py-2 text-xs text-text-muted">
          <span>{filteredCommands.length} Befehle</span>
          <div className="flex items-center gap-2">
            <span>↑↓ Navigieren</span>
            <span>↵ Ausführen</span>
          </div>
        </div>
      </div>
    </div>
  )
}
