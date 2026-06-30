import { useExecutionStore } from '@/store/execution-store'
import { useTextStore } from '@/store/text-store'
import { usePersonaStore } from '@/store/persona-store'
import { History, Trash2, RotateCcw, CheckCircle, XCircle, Loader } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'

export function HistoryPanel() {
  const executions = useExecutionStore((s) => s.executions)
  const clearAllExecutions = useExecutionStore((s) => s.clearAllExecutions)
  const texts = useTextStore((s) => s.texts)
  const personas = usePersonaStore((s) => s.personas)

  // Sort by most recent first
  const sortedExecutions = [...executions].sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  )

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-text-muted" />
          <h3 className="text-sm font-semibold">Ausführungsverlauf</h3>
        </div>
        {executions.length > 0 && (
          <button
            onClick={clearAllExecutions}
            className="rounded p-1 text-text-muted hover:bg-surface-hover hover:text-danger"
            title="Verlauf löschen"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Execution List */}
      <div className="flex-1 overflow-y-auto p-2">
        {sortedExecutions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-text-muted">
            <History className="mb-2 h-8 w-8" />
            <p className="text-sm">Noch keine Ausführungen</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedExecutions.map((execution) => {
              const text = texts.find((t) => t.id === execution.textId)
              const persona = personas.find((p) => p.id === execution.personaId)

              return (
                <ExecutionCard
                  key={execution.id}
                  execution={execution}
                  textName={text?.name}
                  personaName={persona?.name}
                  personaColor={persona?.color}
                />
              )
            })}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="border-t border-border px-4 py-2 text-center text-xs text-text-muted">
        {executions.length} Ausführungen
      </div>
    </div>
  )
}

function ExecutionCard({
  execution,
  textName,
  personaName,
  personaColor,
}: {
  execution: {
    id: string
    status: string
    startedAt: string
    completedAt?: string
    stream: string
    result?: { score: number; comments: { length: number } }
  }
  textName?: string
  personaName?: string
  personaColor?: string
}) {
  const StatusIcon = {
    running: <Loader className="h-4 w-4 text-primary animate-spin" />,
    completed: <CheckCircle className="h-4 w-4 text-secondary" />,
    error: <XCircle className="h-4 w-4 text-danger" />,
    aborted: <XCircle className="h-4 w-4 text-text-muted" />,
  }

  return (
    <div className="group rounded-lg border border-border bg-surface-hover p-3 transition-colors hover:bg-surface-active">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {personaColor && (
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: personaColor }}
            />
          )}
          <div>
            <div className="text-sm font-medium">{personaName || 'Unbekannt'}</div>
            <div className="text-xs text-text-muted">{textName || 'Unbekannter Text'}</div>
          </div>
        </div>
        {StatusIcon[execution.status as keyof typeof StatusIcon]}
      </div>

      {/* Preview */}
      <div className="mt-2 line-clamp-2 text-xs text-text-muted">
        {execution.stream.slice(0, 100) || 'Kein Output'}
      </div>

      {/* Meta */}
      <div className="mt-2 flex items-center justify-between text-xs text-text-muted">
        <span>{formatDate(execution.startedAt)}</span>
        {execution.result && (
          <span className="flex items-center gap-2">
            <span
              className={cn(
                'font-medium',
                execution.result.score >= 80
                  ? 'text-secondary'
                  : execution.result.score >= 60
                  ? 'text-accent'
                  : 'text-danger'
              )}
            >
              {execution.result.score}/100
            </span>
            <span>{execution.result.comments.length} Kommentare</span>
          </span>
        )}
      </div>

      {/* Hover Actions */}
      <div className="mt-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="flex items-center gap-1 rounded bg-surface px-2 py-1 text-xs text-text-muted hover:bg-surface-hover">
          <RotateCcw className="h-3 w-3" />
          Wiederholen
        </button>
      </div>
    </div>
  )
}
