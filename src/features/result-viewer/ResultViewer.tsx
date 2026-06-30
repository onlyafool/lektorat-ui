import { useExecutionStore } from '@/store/execution-store'
import { usePersonaStore } from '@/store/persona-store'
import { useTextStore } from '@/store/text-store'
import { downloadDocx } from '@/lib/export/docx-export'
import { downloadMarkdown } from '@/lib/export/markdown-export'
import { X, Copy, Check, AlertCircle, Clock, CheckCircle, Download } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import type { ReviewComment } from '@/types'

export function ResultViewer() {
  const executions = useExecutionStore((s) => s.executions)
  const activeExecutionId = useExecutionStore((s) => s.activeExecutionId)
  const abortExecution = useExecutionStore((s) => s.abortExecution)
  const clearExecution = useExecutionStore((s) => s.clearExecution)
  const personas = usePersonaStore((s) => s.personas)
  const texts = useTextStore((s) => s.texts)

  const activeExecution = executions.find((e) => e.id === activeExecutionId)
  const persona = personas.find((p) => p.id === activeExecution?.personaId)
  const text = texts.find((t) => t.id === activeExecution?.textId)

  const scrollRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)

  // Auto-scroll during streaming
  useEffect(() => {
    if (scrollRef.current && activeExecution?.status === 'running') {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [activeExecution?.stream, activeExecution?.status])

  const handleCopy = async () => {
    if (activeExecution?.stream) {
      await navigator.clipboard.writeText(activeExecution.stream)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleExport = (format: 'docx' | 'md') => {
    if (!text || !activeExecution?.result) return
    const comments: ReviewComment[] = activeExecution.result.comments
    switch (format) {
      case 'docx':
        downloadDocx(text.content, activeExecution.stream, comments)
        break
      case 'md':
        downloadMarkdown(text.content, activeExecution.stream, comments)
        break
    }
    setExportOpen(false)
  }

  if (!activeExecution) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-text-muted">
        <AlertCircle className="mb-4 h-12 w-12" />
        <h3 className="text-lg font-medium">Keine Ausführung aktiv</h3>
        <p className="text-sm">Klicke auf eine Persona, um den Lektorat zu starten.</p>
      </div>
    )
  }

  const comments: ReviewComment[] = activeExecution.result?.comments ?? []
  const groupedComments = comments.reduce(
    (acc, c) => {
      ;(acc[c.category] ??= []).push(c)
      return acc
    },
    {} as Record<string, ReviewComment[]>
  )

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          {persona && (
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: persona.color }}
            />
          )}
          <div>
            <h3 className="text-sm font-medium">
              {persona?.name ?? 'Unbekannte Persona'}
            </h3>
            <p className="text-xs text-text-muted">
              {text?.name ?? 'Unbekannter Text'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Status Badge */}
          <StatusBadge status={activeExecution.status} />

          {/* Actions */}
          {activeExecution.status === 'running' && (
            <button
              onClick={() => abortExecution(activeExecution.id)}
              className="flex items-center gap-1 rounded-lg bg-danger/10 px-2 py-1 text-xs text-danger hover:bg-danger/20"
            >
              <X className="h-3 w-3" />
              Abbrechen
            </button>
          )}
          {activeExecution.status === 'completed' && (
            <>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 rounded-lg bg-surface-hover px-2 py-1 text-xs text-text hover:bg-surface-active"
              >
                {copied ? (
                  <Check className="h-3 w-3 text-secondary" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                {copied ? 'Kopiert!' : 'Kopieren'}
              </button>
              <div className="relative">
                <button
                  onClick={() => setExportOpen(!exportOpen)}
                  className="flex items-center gap-1 rounded-lg bg-primary/10 px-2 py-1 text-xs text-primary hover:bg-primary/20"
                >
                  <Download className="h-3 w-3" />
                  Export
                </button>
                {exportOpen && (
                  <div className="absolute right-0 top-full z-10 mt-1 w-36 rounded-lg border border-border bg-surface shadow-lg">
                    <button
                      onClick={() => handleExport('docx')}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-surface-hover"
                    >
                      DOCX (Track Changes)
                    </button>
                    <button
                      onClick={() => handleExport('md')}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-surface-hover"
                    >
                      Markdown (Diff)
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
          <button
            onClick={() => clearExecution(activeExecution.id)}
            className="rounded-lg p-1 text-text-muted hover:bg-surface-hover hover:text-text"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
        {activeExecution.status === 'running' && !activeExecution.stream && (
          <div className="flex items-center gap-2 text-text-muted">
            <Clock className="h-4 w-4 animate-pulse" />
            <span className="text-sm">Verbindung wird hergestellt...</span>
          </div>
        )}

        {/* Progress or stream */}
        {activeExecution.status === 'running' && (
          <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
            {activeExecution.stream || (
              <span className="text-text-muted">Warte auf Antwort...</span>
            )}
            <span className="ml-1 inline-block h-4 w-2 animate-pulse bg-primary" />
          </div>
        )}

        {activeExecution.status === 'error' && (
          <div className="mt-4 rounded-lg bg-danger/10 p-4">
            <p className="text-sm text-danger">{activeExecution.error}</p>
          </div>
        )}

        {/* Completed: Score + Comments */}
        {activeExecution.status === 'completed' && activeExecution.result && (
          <div className="space-y-4">
            {/* Score */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-text-muted">Bewertung:</span>
              <span
                className={cn(
                  'font-medium',
                  activeExecution.result.score >= 80
                    ? 'text-secondary'
                    : activeExecution.result.score >= 60
                    ? 'text-accent'
                    : 'text-danger'
                )}
              >
                {activeExecution.result.score}/100
              </span>
              <span className="text-text-muted">
                ({comments.length} Kommentare)
              </span>
            </div>

            {/* Comments by Category */}
            {Object.entries(groupedComments).map(([category, categoryComments]) => {
              const labels: Record<string, string> = {
                grammar: 'Grammatik',
                style: 'Stil',
                clarity: 'Klarheit',
                fact: 'Fakten',
                logic: 'Logik',
                consistency: 'Konsistenz',
              }
              const severityColors: Record<string, string> = {
                error: 'border-danger bg-danger/5',
                warning: 'border-accent bg-accent/5',
                info: 'border-border bg-surface',
              }
              return (
                <div key={category}>
                  <h4 className="mb-2 text-xs font-medium text-text-muted uppercase">
                    {labels[category] ?? category} ({categoryComments.length})
                  </h4>
                  <div className="space-y-2">
                    {categoryComments.map((comment) => (
                      <div
                        key={comment.id}
                        className={cn(
                          'rounded-lg border-l-2 p-3 text-xs',
                          severityColors[comment.severity] ?? 'border-border'
                        )}
                      >
                        <p className="text-text">{comment.comment}</p>
                        {comment.originalText && (
                          <p className="mt-1 text-text-muted line-through">
                            {comment.originalText}
                          </p>
                        )}
                        {comment.suggestedText && (
                          <p className="mt-1 text-secondary">
                            → {comment.suggestedText}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}

            {comments.length === 0 && (
              <p className="text-sm text-text-muted">
                Keine Kommentare gefunden. Der Text scheint einwandfrei zu sein.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    pending: { icon: Clock, color: 'text-text-muted', bg: 'bg-surface-hover' },
    running: { icon: Clock, color: 'text-primary', bg: 'bg-primary/10' },
    completed: { icon: CheckCircle, color: 'text-secondary', bg: 'bg-secondary/10' },
    error: { icon: AlertCircle, color: 'text-danger', bg: 'bg-danger/10' },
    aborted: { icon: X, color: 'text-accent', bg: 'bg-accent/10' },
  }

  const { icon: Icon, color, bg } = config[status as keyof typeof config] || config.pending

  return (
    <span className={cn('flex items-center gap-1 rounded-full px-2 py-0.5 text-xs', color, bg)}>
      <Icon className="h-3 w-3" />
      {status}
    </span>
  )
}
