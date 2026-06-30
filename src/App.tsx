import { useEffect, useState, useCallback } from 'react'
import 'reactflow/dist/style.css'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { TextEditor } from '@/features/text-editor/TextEditor'
import { ResultViewer } from '@/features/result-viewer/ResultViewer'
import { LoginPanel } from '@/features/auth/LoginPanel'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import {
  LazyWorkflowBuilder,
  LazyExecutionInspector,
  LazyCommandPalette,
  SuspenseWrapper,
} from '@/components/LazyComponents'
import { useTextStore } from '@/store/text-store'
import { usePersonaStore } from '@/store/persona-store'
import { useWorkflowStore } from '@/store/workflow-store'
import { useExecutionStore } from '@/store/execution-store'
import { useAuthStore } from '@/store/auth-store'
import { useStyleProfileStore } from '@/store/style-profile-store'
import { useResultsStore } from '@/store/results-store'
import { downloadDocx } from '@/lib/export/docx-export'
import { downloadPdf } from '@/lib/export/pdf-export'
import { downloadMarkdown } from '@/lib/export/markdown-export'
import type { ReviewComment } from '@/types'

type ViewMode = 'editor' | 'workflow'

export default function App() {
  const loadTexts = useTextStore((s) => s.loadTexts)
  const loadPersonas = usePersonaStore((s) => s.loadPersonas)
  const loadAllWorkflows = useWorkflowStore((s) => s.loadAllWorkflows)
  const loadProfiles = useStyleProfileStore((s) => s.loadProfiles)
  const loadResults = useResultsStore((s) => s.loadResults)
  const { initialize: initAuth, user, isLoading: authLoading, isConfigured } = useAuthStore()
  const [viewMode, setViewMode] = useState<ViewMode>('editor')
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)

  // Initialize auth
  useEffect(() => {
    initAuth()
  }, [initAuth])

  // Load data when authenticated or in offline mode
  useEffect(() => {
    if (authLoading) return
    if (isConfigured && !user) return // Wait for login

    loadTexts()
    loadPersonas()
    loadAllWorkflows()
    loadProfiles()
    loadResults()
  }, [authLoading, isConfigured, user, loadTexts, loadPersonas, loadAllWorkflows, loadProfiles, loadResults])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K: Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen((prev) => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleExport = useCallback((format: 'docx' | 'pdf' | 'md') => {
    const activeText = useTextStore.getState().getActiveText()
    if (!activeText) {
      alert('Bitte wähle einen Text aus.')
      return
    }

    const executions = useExecutionStore.getState().executions
    const completedExecution = executions.find(
      (e) => e.textId === activeText.id && e.status === 'completed'
    )

    if (!completedExecution) {
      alert('Bitte führe zuerst ein Lektorat durch.')
      return
    }

    const comments: ReviewComment[] = completedExecution.result?.comments ?? []

    switch (format) {
      case 'docx':
        downloadDocx(activeText.content, completedExecution.stream, comments)
        break
      case 'pdf':
        downloadPdf(completedExecution.stream, comments)
        break
      case 'md':
        downloadMarkdown(activeText.content, completedExecution.stream, comments)
        break
    }
  }, [])

  // Show loading
  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-sm text-text-muted">Wird geladen...</div>
      </div>
    )
  }

  // Show login if Supabase configured but not authenticated
  if (isConfigured && !user) {
    return (
      <ErrorBoundary>
        <LoginPanel />
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <div className="flex h-screen overflow-hidden">
        <Sidebar viewMode={viewMode} onViewModeChange={setViewMode} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header onExport={handleExport} />
          <main className="flex flex-1 overflow-hidden">
            {viewMode === 'editor' ? (
              <>
                <div className="flex flex-1 flex-col overflow-hidden border-r border-border">
                  <TextEditor />
                </div>
                <aside className="w-96 overflow-y-auto border-l border-border bg-surface">
                  <ResultViewer />
                </aside>
              </>
            ) : (
              <div className="flex flex-1 overflow-hidden">
                <div className="flex-1">
                  <SuspenseWrapper>
                    <LazyWorkflowBuilder />
                  </SuspenseWrapper>
                </div>
                <aside className="w-80 overflow-y-auto border-l border-border bg-surface">
                  <SuspenseWrapper>
                    <LazyExecutionInspector />
                  </SuspenseWrapper>
                </aside>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Command Palette */}
      <SuspenseWrapper>
        <LazyCommandPalette
          isOpen={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
          onExport={handleExport}
        />
      </SuspenseWrapper>
    </ErrorBoundary>
  )
}
