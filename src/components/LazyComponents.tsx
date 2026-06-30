import { lazy, Suspense } from 'react'
import { Loader } from 'lucide-react'

// ═══════════════════════════════════════════════════════════════
// Lazy Loaded Components (Code Splitting)
// ═══════════════════════════════════════════════════════════════

export const LazyWorkflowBuilder = lazy(() =>
  import('@/features/workflow-builder/WorkflowBuilder').then((m) => ({
    default: m.WorkflowBuilder,
  }))
)

export const LazyExecutionInspector = lazy(() =>
  import('@/features/execution-inspector/ExecutionInspector').then((m) => ({
    default: m.ExecutionInspector,
  }))
)

export const LazyHistoryPanel = lazy(() =>
  import('@/features/history-panel/HistoryPanel').then((m) => ({
    default: m.HistoryPanel,
  }))
)

export const LazyCommandPalette = lazy(() =>
  import('@/features/command-palette/CommandPalette').then((m) => ({
    default: m.CommandPalette,
  }))
)

export const LazyDiffView = lazy(() =>
  import('@/features/diff-view/DiffView').then((m) => ({
    default: m.DiffView,
  }))
)

// ═══════════════════════════════════════════════════════════════
// Loading Fallback
// ═══════════════════════════════════════════════════════════════

export function LoadingFallback() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader className="h-6 w-6 animate-spin text-primary" />
        <span className="text-sm text-text-muted">Wird geladen...</span>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Suspense Wrapper
// ═══════════════════════════════════════════════════════════════

export function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
}
