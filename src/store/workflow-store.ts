import { create } from 'zustand'
import type { Node, Edge, OnNodesChange, OnEdgesChange } from 'reactflow'
import { applyNodeChanges, applyEdgeChanges } from 'reactflow'
import type { Workflow } from '@/types'
import { getAll, put, deleteById } from '@/lib/indexeddb'
import { generateId } from '@/lib/utils'

interface WorkflowState {
  // Current workflow being edited
  nodes: Node[]
  edges: Edge[]
  activeWorkflowId: string | null

  // All saved workflows
  workflows: Workflow[]
  isLoading: boolean

  // Actions
  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  setNodes: (nodes: Node[]) => void
  setEdges: (edges: Edge[]) => void
  saveWorkflow: (name: string, description?: string) => Promise<Workflow>
  loadWorkflow: (id: string) => void
  deleteWorkflow: (id: string) => Promise<void>
  loadAllWorkflows: () => Promise<void>
  exportWorkflow: () => string | null
  importWorkflow: (json: string) => Promise<boolean>
  clearCanvas: () => void
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: [],
  edges: [],
  activeWorkflowId: null,
  workflows: [],
  isLoading: false,

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) })
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) })
  },

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  saveWorkflow: async (name, description) => {
    const { nodes, edges, activeWorkflowId } = get()

    const workflow: Workflow = {
      id: activeWorkflowId ?? generateId(),
      name,
      description,
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.type as 'persona' | 'writing' | 'control' | 'input' | 'output',
        position: n.position,
        data: n.data,
      })),
      edges: edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        animated: e.animated ?? false,
      })),
      executionOrder: [], // Will be computed during execution
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await put('workflows', workflow)

    set((state) => ({
      workflows: state.workflows.filter((w) => w.id !== workflow.id).concat(workflow),
      activeWorkflowId: workflow.id,
    }))

    return workflow
  },

  loadWorkflow: (id) => {
    const { workflows } = get()
    const workflow = workflows.find((w) => w.id === id)
    if (!workflow) return

    set({
      nodes: workflow.nodes.map((n) => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: n.data,
      })),
      edges: workflow.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        animated: e.animated,
      })),
      activeWorkflowId: id,
    })
  },

  deleteWorkflow: async (id) => {
    await deleteById('workflows', id)
    set((state) => ({
      workflows: state.workflows.filter((w) => w.id !== id),
      activeWorkflowId: state.activeWorkflowId === id ? null : state.activeWorkflowId,
      nodes: state.activeWorkflowId === id ? [] : state.nodes,
      edges: state.activeWorkflowId === id ? [] : state.edges,
    }))
  },

  loadAllWorkflows: async () => {
    set({ isLoading: true })
    try {
      const workflows = await getAll<Workflow>('workflows')
      set({ workflows, isLoading: false })
    } catch (error) {
      console.error('Failed to load workflows:', error)
      set({ isLoading: false })
    }
  },

  exportWorkflow: () => {
    const { nodes, edges } = get()
    if (nodes.length === 0) return null

    const workflow = {
      version: '1.0.0',
      name: 'Exported Workflow',
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: n.data,
      })),
      edges: edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        animated: e.animated,
      })),
    }

    return JSON.stringify(workflow, null, 2)
  },

  importWorkflow: async (json) => {
    try {
      const workflow = JSON.parse(json)

      // Validate structure
      if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
        return false
      }
      if (!workflow.edges || !Array.isArray(workflow.edges)) {
        return false
      }

      // Convert to React Flow format
      const nodes: Node[] = workflow.nodes.map((n: Workflow['nodes'][0]) => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: n.data,
      }))

      const edges: Edge[] = workflow.edges.map((e: Workflow['edges'][0]) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        animated: e.animated,
      }))

      set({ nodes, edges })
      return true
    } catch (error) {
      console.error('Failed to import workflow:', error)
      return false
    }
  },

  clearCanvas: () => {
    set({ nodes: [], edges: [], activeWorkflowId: null })
  },
}))
