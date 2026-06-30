import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useWorkflowStore } from '@/store/workflow-store'

vi.mock('@/lib/indexeddb', () => ({
  getAll: vi.fn().mockResolvedValue([]),
  put: vi.fn().mockResolvedValue(undefined),
  deleteById: vi.fn().mockResolvedValue(undefined),
}))

describe('WorkflowStore', () => {
  beforeEach(() => {
    useWorkflowStore.setState({
      nodes: [],
      edges: [],
      activeWorkflowId: null,
      workflows: [],
      isLoading: false,
    })
  })

  it('has initial state', () => {
    const state = useWorkflowStore.getState()
    expect(state.nodes).toEqual([])
    expect(state.edges).toEqual([])
    expect(state.activeWorkflowId).toBeNull()
    expect(state.workflows).toEqual([])
    expect(state.isLoading).toBe(false)
  })

  it('setNodes updates nodes', () => {
    const nodes = [
      { id: 'n1', type: 'persona', position: { x: 0, y: 0 }, data: { label: 'Test' } },
    ]
    useWorkflowStore.getState().setNodes(nodes)
    expect(useWorkflowStore.getState().nodes).toEqual(nodes)
  })

  it('setEdges updates edges', () => {
    const edges = [{ id: 'e1', source: 'n1', target: 'n2' }]
    useWorkflowStore.getState().setEdges(edges)
    expect(useWorkflowStore.getState().edges).toEqual(edges)
  })

  it('clearCanvas resets everything', () => {
    useWorkflowStore.setState({
      nodes: [{ id: 'n1', type: 'persona', position: { x: 0, y: 0 }, data: {} }],
      edges: [{ id: 'e1', source: 'n1', target: 'n2' }],
      activeWorkflowId: 'wf-1',
    })

    useWorkflowStore.getState().clearCanvas()

    const state = useWorkflowStore.getState()
    expect(state.nodes).toEqual([])
    expect(state.edges).toEqual([])
    expect(state.activeWorkflowId).toBeNull()
  })

  it('exportWorkflow returns null when no nodes', () => {
    const result = useWorkflowStore.getState().exportWorkflow()
    expect(result).toBeNull()
  })

  it('exportWorkflow returns JSON string when nodes exist', () => {
    useWorkflowStore.setState({
      nodes: [{ id: 'n1', type: 'persona', position: { x: 0, y: 0 }, data: { label: 'Test' } }],
      edges: [],
    })

    const result = useWorkflowStore.getState().exportWorkflow()
    expect(result).not.toBeNull()
    const parsed = JSON.parse(result!)
    expect(parsed.version).toBe('1.0.0')
    expect(parsed.nodes).toHaveLength(1)
  })

  it('importWorkflow rejects invalid JSON', async () => {
    const result = await useWorkflowStore.getState().importWorkflow('not json')
    expect(result).toBe(false)
  })

  it('importWorkflow rejects workflow without nodes', async () => {
    const result = await useWorkflowStore.getState().importWorkflow('{"edges":[]}')
    expect(result).toBe(false)
  })

  it('importWorkflow rejects workflow without edges', async () => {
    const result = await useWorkflowStore.getState().importWorkflow('{"nodes":[]}')
    expect(result).toBe(false)
  })

  it('importWorkflow accepts valid workflow', async () => {
    const workflow = {
      nodes: [{ id: 'n1', type: 'persona', position: { x: 0, y: 0 }, data: {} }],
      edges: [{ id: 'e1', source: 'n1', target: 'n2' }],
    }
    const result = await useWorkflowStore.getState().importWorkflow(JSON.stringify(workflow))
    expect(result).toBe(true)
    expect(useWorkflowStore.getState().nodes).toHaveLength(1)
    expect(useWorkflowStore.getState().edges).toHaveLength(1)
  })

  it('loadWorkflow loads from stored workflows', () => {
    useWorkflowStore.setState({
      workflows: [
        {
          id: 'wf-1',
          name: 'Test',
          nodes: [{ id: 'n1', type: 'persona' as const, position: { x: 0, y: 0 }, data: {} }],
          edges: [{ id: 'e1', source: 'n1', target: 'n2', animated: false }],
          executionOrder: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    })

    useWorkflowStore.getState().loadWorkflow('wf-1')

    const state = useWorkflowStore.getState()
    expect(state.nodes).toHaveLength(1)
    expect(state.edges).toHaveLength(1)
    expect(state.activeWorkflowId).toBe('wf-1')
  })

  it('loadWorkflow does nothing if id not found', () => {
    useWorkflowStore.getState().loadWorkflow('nonexistent')
    expect(useWorkflowStore.getState().activeWorkflowId).toBeNull()
  })
})
