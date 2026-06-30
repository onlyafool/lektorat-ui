import { create } from 'zustand'
import type { Node, Edge } from 'reactflow'
import { generateId } from '@/lib/utils'

// ═══════════════════════════════════════════════════════════════
// Advanced Pipeline Types
// ═══════════════════════════════════════════════════════════════

export type PipelineNodeType = 'branch' | 'loop' | 'parallel' | 'condition' | 'delay'

export interface BranchConfig {
  condition: string // Expression to evaluate
  truePath: string // Node ID for true branch
  falsePath: string // Node ID for false branch
}

export interface LoopConfig {
  type: 'for-each' | 'while' | 'repeat'
  iteratee?: string // Variable to iterate over
  condition?: string // While condition
  count?: number // Repeat count
  maxIterations: number // Safety limit
}

export interface ParallelConfig {
  strategy: 'all' | 'any' | 'race'
  timeout?: number // Max wait time in ms
}

export interface ConditionConfig {
  expression: string // JavaScript expression to evaluate
  description: string // Human-readable description
}

// ═══════════════════════════════════════════════════════════════
// Execution State
// ═══════════════════════════════════════════════════════════════

export type ExecutionStatus = 'idle' | 'running' | 'paused' | 'completed' | 'error' | 'aborted'

export interface NodeExecutionState {
  nodeId: string
  status: ExecutionStatus
  startTime?: string
  endTime?: string
  output?: string
  error?: string
  iterations?: number // For loop nodes
  branchTaken?: 'true' | 'false' // For branch nodes
}

export interface PipelineExecution {
  id: string
  workflowId: string
  textId: string
  status: ExecutionStatus
  currentNodeId?: string
  nodeStates: Record<string, NodeExecutionState>
  startTime: string
  endTime?: string
  results: Record<string, string> // Node ID -> output
}

// ═══════════════════════════════════════════════════════════════
// Pipeline Store
// ═══════════════════════════════════════════════════════════════

interface PipelineState {
  // Execution state
  currentExecution: PipelineExecution | null
  executionHistory: PipelineExecution[]
  isPaused: boolean

  // Actions
  startExecution: (workflowId: string, textId: string, nodes: Node[], edges: Edge[]) => void
  pauseExecution: () => void
  resumeExecution: () => void
  abortExecution: () => void
  stepOver: () => void
  stepInto: () => void

  // Node state updates
  updateNodeState: (nodeId: string, state: Partial<NodeExecutionState>) => void
  setNodeOutput: (nodeId: string, output: string) => void

  // History
  loadHistory: () => void
  clearHistory: () => void
  restoreExecution: (executionId: string) => void
}

export const usePipelineStore = create<PipelineState>((set, get) => ({
  currentExecution: null,
  executionHistory: [],
  isPaused: false,

  startExecution: (workflowId, textId, nodes, _edges) => {
    const execution: PipelineExecution = {
      id: generateId(),
      workflowId,
      textId,
      status: 'running',
      nodeStates: {},
      startTime: new Date().toISOString(),
      results: {},
    }

    // Initialize all node states
    for (const node of nodes) {
      execution.nodeStates[node.id] = {
        nodeId: node.id,
        status: 'idle',
      }
    }

    set({
      currentExecution: execution,
      isPaused: false,
    })
  },

  pauseExecution: () => {
    const { currentExecution } = get()
    if (!currentExecution || currentExecution.status !== 'running') return

    set({
      currentExecution: {
        ...currentExecution,
        status: 'paused',
      },
      isPaused: true,
    })
  },

  resumeExecution: () => {
    const { currentExecution } = get()
    if (!currentExecution || currentExecution.status !== 'paused') return

    set({
      currentExecution: {
        ...currentExecution,
        status: 'running',
      },
      isPaused: false,
    })
  },

  abortExecution: () => {
    const { currentExecution, executionHistory } = get()
    if (!currentExecution) return

    const completedExecution: PipelineExecution = {
      ...currentExecution,
      status: 'aborted',
      endTime: new Date().toISOString(),
    }

    set({
      currentExecution: null,
      executionHistory: [completedExecution, ...executionHistory].slice(0, 50),
      isPaused: false,
    })
  },

  stepOver: () => {
    // In a real implementation, this would advance to the next node
    console.log('Step over - would advance to next node')
  },

  stepInto: () => {
    // In a real implementation, this would step into a sub-node
    console.log('Step into - would enter sub-node')
  },

  updateNodeState: (nodeId, state) => {
    const { currentExecution } = get()
    if (!currentExecution) return

    set({
      currentExecution: {
        ...currentExecution,
        nodeStates: {
          ...currentExecution.nodeStates,
          [nodeId]: {
            ...currentExecution.nodeStates[nodeId],
            ...state,
          },
        },
      },
    })
  },

  setNodeOutput: (nodeId, output) => {
    const { currentExecution } = get()
    if (!currentExecution) return

    set({
      currentExecution: {
        ...currentExecution,
        results: {
          ...currentExecution.results,
          [nodeId]: output,
        },
      },
    })
  },

  loadHistory: () => {
    // Load from IndexedDB in production
    const history = localStorage.getItem('pipeline-history')
    if (history) {
      try {
        set({ executionHistory: JSON.parse(history) })
      } catch {
        console.error('Failed to load execution history')
      }
    }
  },

  clearHistory: () => {
    set({ executionHistory: [] })
    localStorage.removeItem('pipeline-history')
  },

  restoreExecution: (executionId) => {
    const { executionHistory } = get()
    const execution = executionHistory.find((e) => e.id === executionId)
    if (execution) {
      set({ currentExecution: execution })
    }
  },
}))
