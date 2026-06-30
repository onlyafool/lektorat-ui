import { create } from 'zustand'
import type { Persona, ReviewResult, ReviewComment } from '@/types'
import { orchestrator } from '@/lib/orchestrator'
import { runLektorat, getAgentsWithPersonas, type LektoratProgress } from '@/lib/lektorat-runner'
import { generateId } from '@/lib/utils'
import { useSettingsStore } from './settings-store'
import { usePersonaStore } from './persona-store'
import { useTextStore } from './text-store'

export interface Execution {
  id: string
  personaId: string
  textId: string
  status: 'pending' | 'running' | 'completed' | 'error' | 'aborted'
  stream: string
  result?: ReviewResult
  error?: string
  startedAt: string
  completedAt?: string
}

interface ExecutionState {
  executions: Execution[]
  activeExecutionId: string | null
  isRunning: boolean
  lektoratProgress: LektoratProgress | null

  // Actions
  startExecution: (persona: Persona, textId: string, textContent: string) => Promise<string>
  startLektorat: (textId: string, textContent: string, styleProfile?: string) => Promise<string>
  abortExecution: (id: string) => void
  clearExecution: (id: string) => void
  clearAllExecutions: () => void
}

export const useExecutionStore = create<ExecutionState>((set, get) => ({
  executions: [],
  activeExecutionId: null,
  isRunning: false,
  lektoratProgress: null,

  startExecution: async (persona, textId, textContent) => {
    const executionId = generateId()
    const execution: Execution = {
      id: executionId,
      personaId: persona.id,
      textId,
      status: 'running',
      stream: '',
      startedAt: new Date().toISOString(),
    }

    set((state) => ({
      executions: [...state.executions, execution],
      activeExecutionId: executionId,
      isRunning: true,
    }))

    // Start streaming in background
    try {
      const messages = [
        { role: 'system', content: persona.systemPrompt },
        { role: 'user', content: `Bitte überprüfe folgenden Text:\n\n${textContent}` },
      ]

      // Inject apiKey and baseUrl from settings
      const providerConfig = useSettingsStore.getState().providers[persona.model.provider]
      const enrichedModel = {
        ...persona.model,
        apiKey: providerConfig?.apiKey ?? '',
        baseUrl: providerConfig?.baseUrl ?? '',
      }

      let fullStream = ''

      for await (const chunk of orchestrator.chatStream(messages, enrichedModel)) {
        // Check if execution was aborted
        const currentExecution = get().executions.find((e) => e.id === executionId)
        if (currentExecution?.status === 'aborted') {
          break
        }

        fullStream += chunk
        set((state) => ({
          executions: state.executions.map((e) =>
            e.id === executionId ? { ...e, stream: fullStream } : e
          ),
        }))
      }

      // Check if aborted
      const finalExecution = get().executions.find((e) => e.id === executionId)
      if (finalExecution?.status === 'aborted') {
        return executionId
      }

      // Parse the result
      const result = parseReviewResult(executionId, textId, persona.id, fullStream)

      set((state) => ({
        executions: state.executions.map((e) =>
          e.id === executionId
            ? {
                ...e,
                status: 'completed',
                stream: fullStream,
                result,
                completedAt: new Date().toISOString(),
              }
            : e
        ),
        isRunning: false,
      }))
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unbekannter Fehler'
      let friendlyError = msg

      if (msg.includes('All providers failed') || msg.includes('Connection failed')) {
        const provider = persona.model.provider
        if (provider === 'ollama' || provider === 'lmstudio') {
          friendlyError = `${provider} ist nicht erreichbar. Bitte starte ${provider} auf localhost und versuche es erneut.`
        } else {
          friendlyError = `Kein Zugriff auf ${provider}. Bitte API-Key und Verbindung prüfen.`
        }
      }

      set((state) => ({
        executions: state.executions.map((e) =>
          e.id === executionId
            ? {
                ...e,
                status: 'error',
                error: friendlyError,
                completedAt: new Date().toISOString(),
              }
            : e
        ),
        isRunning: false,
      }))
    }

    return executionId
  },

  startLektorat: async (textId, textContent, styleProfile) => {
    const executionId = generateId()
    const execution: Execution = {
      id: executionId,
      personaId: 'lektorat-all',
      textId,
      status: 'running',
      stream: '',
      startedAt: new Date().toISOString(),
    }

    set((state) => ({
      executions: [...state.executions, execution],
      activeExecutionId: executionId,
      isRunning: true,
      lektoratProgress: null,
    }))

    try {
      const allPersonas = usePersonaStore.getState().personas
      const agents = getAgentsWithPersonas(allPersonas)

      if (agents.length === 0) {
        throw new Error('Keine passenden Personas für das 5-Agenten-Lektorat gefunden.')
      }

      const lektoratResult = await runLektorat(
        textContent,
        textId,
        agents,
        styleProfile,
        (progress) => {
          set({ lektoratProgress: progress })
          // Update stream with progress
          const chunkInfo = progress.totalChunks > 1
            ? `Kapitel ${progress.currentChunk}/${progress.totalChunks}\n`
            : ''
          const statusText = chunkInfo + Object.entries(progress.agentStatuses)
            .map(([key, status]) => {
              const agentId = key.split('-')[0]
              const agent = agents.find((a) => a.id === agentId)
              const icon = status === 'completed' ? '✓' : status === 'running' ? '⟳' : status === 'error' ? '✗' : '○'
              return `${icon} ${agent?.name ?? agentId}`
            })
            .join('\n')

          set((state) => ({
            executions: state.executions.map((e) =>
              e.id === executionId ? { ...e, stream: statusText } : e
            ),
          }))
        }
      )

      // Check if aborted
      const currentExec = get().executions.find((e) => e.id === executionId)
      if (currentExec?.status === 'aborted') {
        return executionId
      }

      // Convert to ReviewResult
      const result: ReviewResult = {
        id: generateId(),
        textId,
        workflowId: executionId,
        comments: lektoratResult.mergedComments,
        summary: `5-Agenten-Lektorat abgeschlossen.\n\n` +
          `Gesamtbewertung: ${lektoratResult.overallScore}/100\n` +
          `Kommentare: ${lektoratResult.mergedComments.length}\n` +
          `Kapitel: ${lektoratResult.chunkCount}\n` +
          `Dauer: ${(lektoratResult.duration / 1000).toFixed(1)}s\n\n` +
          lektoratResult.agentResults
            .filter((r) => r.chunkId === lektoratResult.agentResults.find((a) => a.agentId === r.agentId)?.chunkId)
            .reduce((acc, r) => {
              const existing = acc.find((a) => a.agentId === r.agentId)
              if (existing) {
                existing.score = Math.round((existing.score + r.score) / 2)
                existing.comments = [...existing.comments, ...r.comments]
              } else {
                acc.push({ ...r })
              }
              return acc
            }, [] as typeof lektoratResult.agentResults)
            .map((r) => `${r.status === 'completed' ? '✓' : '✗'} ${r.agentName}: ${r.score}/100 (${r.comments.length} Kommentare)`)
            .join('\n'),
        score: lektoratResult.overallScore,
        executedAt: lektoratResult.completedAt,
        duration: lektoratResult.duration,
      }

      set((state) => ({
        executions: state.executions.map((e) =>
          e.id === executionId
            ? {
                ...e,
                status: 'completed',
                stream: result.summary,
                result,
                completedAt: new Date().toISOString(),
              }
            : e
        ),
        isRunning: false,
        lektoratProgress: null,
      }))

      // Save to Supabase
      const { saveLektoratResult } = await import('@/lib/supabase-results')
      const textName = useTextStore.getState().texts.find((t) => t.id === textId)?.name ?? ''
      await saveLektoratResult(
        textId,
        textName,
        lektoratResult.overallScore,
        lektoratResult.mergedComments.length,
        lektoratResult.agentResults.length,
        lektoratResult.chunkCount,
        result.summary,
        JSON.stringify(lektoratResult.mergedComments),
        lektoratResult.duration
      )
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unbekannter Fehler'
      let friendlyError = msg

      if (msg.includes('All providers failed') || msg.includes('Connection failed')) {
        friendlyError = 'Modelle sind nicht erreichbar. Bitte starte Ollama/LM Studio oder prüfe API-Keys.'
      }

      set((state) => ({
        executions: state.executions.map((e) =>
          e.id === executionId
            ? {
                ...e,
                status: 'error',
                error: friendlyError,
                completedAt: new Date().toISOString(),
              }
            : e
        ),
        isRunning: false,
        lektoratProgress: null,
      }))
    }

    return executionId
  },

  abortExecution: (id) => {
    set((state) => ({
      executions: state.executions.map((e) =>
        e.id === id ? { ...e, status: 'aborted' } : e
      ),
      isRunning: false,
    }))
  },

  clearExecution: (id) => {
    set((state) => ({
      executions: state.executions.filter((e) => e.id !== id),
      activeExecutionId: state.activeExecutionId === id ? null : state.activeExecutionId,
    }))
  },

  clearAllExecutions: () => {
    set({ executions: [], activeExecutionId: null, isRunning: false })
  },
}))

function parseReviewResult(
  executionId: string,
  textId: string,
  personaId: string,
  stream: string
): ReviewResult {
  // Simple parsing of the review result
  // In production, this would be more sophisticated
  const comments: ReviewComment[] = []

  // Try to extract structured comments from the stream
  const lines = stream.split('\n')
  let currentComment: Partial<ReviewComment> | null = null

  for (const line of lines) {
    // Look for common patterns in the output
    if (line.includes('Fehler:') || line.includes('Error:') || line.includes('❌')) {
      if (currentComment) {
        comments.push(createComment(currentComment, executionId, textId, personaId))
      }
      currentComment = {
        comment: line,
        category: 'grammar',
        severity: 'error',
      }
    } else if (line.includes('Verbesserung:') || line.includes('Vorschlag:') || line.includes('⚠️')) {
      if (currentComment) {
        comments.push(createComment(currentComment, executionId, textId, personaId))
      }
      currentComment = {
        comment: line,
        category: 'style',
        severity: 'warning',
      }
    } else if (currentComment) {
      currentComment.comment = (currentComment.comment || '') + '\n' + line
    }
  }

  if (currentComment) {
    comments.push(createComment(currentComment, executionId, textId, personaId))
  }

  // Calculate a simple score based on number of issues
  const score = Math.max(0, 100 - comments.length * 10)

  return {
    id: generateId(),
    textId,
    workflowId: executionId,
    comments,
    summary: stream.slice(0, 500),
    score,
    executedAt: new Date().toISOString(),
    duration: 0,
  }
}

function createComment(
  partial: Partial<ReviewComment>,
  _executionId: string,
  textId: string,
  personaId: string
): ReviewComment {
  return {
    id: generateId(),
    textId,
    personaId,
    startIndex: 0,
    endIndex: 0,
    originalText: '',
    comment: partial.comment || '',
    category: partial.category || 'style',
    severity: partial.severity || 'info',
    resolved: false,
    createdAt: new Date().toISOString(),
  }
}
