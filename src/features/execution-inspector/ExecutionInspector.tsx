import { usePipelineStore } from '@/store/pipeline-store'
import { useExecutionStore } from '@/store/execution-store'
import {
  Play,
  Pause,
  Square,
  SkipForward,
  SkipBack,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function ExecutionInspector() {
  const currentExecution = usePipelineStore((s) => s.currentExecution)
  const pauseExecution = usePipelineStore((s) => s.pauseExecution)
  const resumeExecution = usePipelineStore((s) => s.resumeExecution)
  const abortExecution = usePipelineStore((s) => s.abortExecution)
  const stepOver = usePipelineStore((s) => s.stepOver)
  const stepInto = usePipelineStore((s) => s.stepInto)

  const executions = useExecutionStore((s) => s.executions)
  const activeExecutionId = useExecutionStore((s) => s.activeExecutionId)
  const activeExecution = executions.find((e) => e.id === activeExecutionId)

  if (!currentExecution && !activeExecution) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-text-muted">
        <Clock className="mb-4 h-12 w-12" />
        <h3 className="text-lg font-medium">Keine aktive Ausführung</h3>
        <p className="text-sm">Starte ein Lektorat um den Inspector zu sehen.</p>
      </div>
    )
  }

  // Use active execution if no pipeline execution
  const execution = currentExecution || {
    id: activeExecution?.id || '',
    status: activeExecution?.status || 'idle',
    nodeStates: {},
    results: {},
    startTime: activeExecution?.startedAt || new Date().toISOString(),
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold">Execution Inspector</h3>
        <StatusBadge status={execution.status} />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-2">
        {execution.status === 'running' && (
          <>
            <button
              onClick={pauseExecution}
              className="rounded-lg bg-accent/10 p-2 text-accent hover:bg-accent/20"
              title="Pause"
            >
              <Pause className="h-4 w-4" />
            </button>
            <button
              onClick={abortExecution}
              className="rounded-lg bg-danger/10 p-2 text-danger hover:bg-danger/20"
              title="Stop"
            >
              <Square className="h-4 w-4" />
            </button>
          </>
        )}

        {execution.status === 'paused' && (
          <>
            <button
              onClick={resumeExecution}
              className="rounded-lg bg-secondary/10 p-2 text-secondary hover:bg-secondary/20"
              title="Fortsetzen"
            >
              <Play className="h-4 w-4" />
            </button>
            <button
              onClick={stepOver}
              className="rounded-lg bg-primary/10 p-2 text-primary hover:bg-primary/20"
              title="Step Over"
            >
              <SkipForward className="h-4 w-4" />
            </button>
            <button
              onClick={stepInto}
              className="rounded-lg bg-primary/10 p-2 text-primary hover:bg-primary/20"
              title="Step Into"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}

        {(execution.status === 'idle' || execution.status === 'completed' || execution.status === 'error') && (
          <button
            onClick={abortExecution}
            className="rounded-lg bg-surface-hover p-2 text-text-muted hover:bg-surface-active"
            title="Zurücksetzen"
          >
            <SkipBack className="h-4 w-4" />
          </button>
        )}

        <div className="ml-auto text-xs text-text-muted">
          {execution.startTime && new Date(execution.startTime).toLocaleTimeString('de-DE')}
        </div>
      </div>

      {/* Node States */}
      <div className="flex-1 overflow-y-auto p-4">
        <h4 className="mb-2 text-xs font-medium text-text-muted uppercase">Knoten-Status</h4>
        <div className="space-y-2">
          {Object.entries(execution.nodeStates).map(([nodeId, state]) => (
            <div
              key={nodeId}
              className={cn(
                'rounded-lg border border-border p-3',
                state.status === 'running' && 'border-primary bg-primary/5',
                state.status === 'completed' && 'border-secondary bg-secondary/5',
                state.status === 'error' && 'border-danger bg-danger/5'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{nodeId}</span>
                <NodeStatusIcon status={state.status} />
              </div>
              {state.output && (
                <pre className="mt-2 max-h-20 overflow-y-auto rounded bg-surface-hover p-2 text-xs text-text-muted">
                  {state.output.slice(0, 200)}
                </pre>
              )}
              {state.error && (
                <p className="mt-2 text-xs text-danger">{state.error}</p>
              )}
            </div>
          ))}
        </div>

        {/* Streaming Output */}
        {activeExecution && activeExecution.status === 'running' && (
          <div className="mt-4">
            <h4 className="mb-2 text-xs font-medium text-text-muted uppercase">Live-Output</h4>
            <div className="rounded-lg border border-border bg-surface-hover p-3">
              <pre className="whitespace-pre-wrap font-mono text-xs text-text">
                {activeExecution.stream || 'Warte auf Antwort...'}
                <span className="inline-block h-3 w-1.5 animate-pulse bg-primary" />
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { icon: React.ElementType; color: string; bg: string; animate?: boolean }> = {
    idle: { icon: Clock, color: 'text-text-muted', bg: 'bg-surface-hover' },
    running: { icon: Loader, color: 'text-primary', bg: 'bg-primary/10', animate: true },
    paused: { icon: Pause, color: 'text-accent', bg: 'bg-accent/10' },
    completed: { icon: CheckCircle, color: 'text-secondary', bg: 'bg-secondary/10' },
    error: { icon: AlertCircle, color: 'text-danger', bg: 'bg-danger/10' },
    aborted: { icon: Square, color: 'text-text-muted', bg: 'bg-surface-hover' },
  }

  const { icon: Icon, color, bg, animate } = config[status] || config.idle

  return (
    <span className={cn('flex items-center gap-1 rounded-full px-2 py-0.5 text-xs', color, bg)}>
      <Icon className={cn('h-3 w-3', animate && 'animate-spin')} />
      {status}
    </span>
  )
}

function NodeStatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'running':
      return <Loader className="h-4 w-4 text-primary animate-spin" />
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-secondary" />
    case 'error':
      return <AlertCircle className="h-4 w-4 text-danger" />
    default:
      return <Clock className="h-4 w-4 text-text-muted" />
  }
}
