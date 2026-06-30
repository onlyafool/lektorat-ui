import { useCallback, useRef } from 'react'
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
  type Connection,
  type Node,
  type NodeTypes,
  Handle,
  Position,
} from 'reactflow'
import { useWorkflowStore } from '@/store/workflow-store'
import { usePersonaStore } from '@/store/persona-store'
import { cn } from '@/lib/utils'
import {
  User,
  Pen,
  Shield,
  FileOutput,
} from 'lucide-react'

// ═══════════════════════════════════════════════════════════════
// Custom Node Components
// ═══════════════════════════════════════════════════════════════

function PersonaNode({ data }: { data: { label: string; color: string; description: string } }) {
  return (
    <div className="rounded-lg border-2 bg-surface px-4 py-3 shadow-md" style={{ borderColor: data.color }}>
      <Handle type="target" position={Position.Top} className="!bg-primary" />
      <div className="flex items-center gap-2">
        <div className="rounded-lg p-1" style={{ backgroundColor: `${data.color}20` }}>
          <User className="h-4 w-4" style={{ color: data.color }} />
        </div>
        <div>
          <div className="text-sm font-medium">{data.label}</div>
          {data.description && (
            <div className="text-xs text-text-muted">{data.description}</div>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-primary" />
    </div>
  )
}

function WritingNode({ data }: { data: { label: string; color: string; description: string } }) {
  return (
    <div className="rounded-lg border-2 bg-surface px-4 py-3 shadow-md" style={{ borderColor: data.color }}>
      <Handle type="target" position={Position.Top} className="!bg-secondary" />
      <div className="flex items-center gap-2">
        <div className="rounded-lg p-1" style={{ backgroundColor: `${data.color}20` }}>
          <Pen className="h-4 w-4" style={{ color: data.color }} />
        </div>
        <div>
          <div className="text-sm font-medium">{data.label}</div>
          {data.description && (
            <div className="text-xs text-text-muted">{data.description}</div>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-secondary" />
    </div>
  )
}

function ControlNode({ data }: { data: { label: string; color: string; description: string } }) {
  return (
    <div className="rounded-lg border-2 bg-surface px-4 py-3 shadow-md" style={{ borderColor: data.color }}>
      <Handle type="target" position={Position.Top} className="!bg-accent" />
      <div className="flex items-center gap-2">
        <div className="rounded-lg p-1" style={{ backgroundColor: `${data.color}20` }}>
          <Shield className="h-4 w-4" style={{ color: data.color }} />
        </div>
        <div>
          <div className="text-sm font-medium">{data.label}</div>
          {data.description && (
            <div className="text-xs text-text-muted">{data.description}</div>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-accent" />
    </div>
  )
}

function InputNode({ data }: { data: { label: string } }) {
  return (
    <div className="rounded-lg border-2 border-border bg-surface px-4 py-3 shadow-md">
      <Handle type="source" position={Position.Bottom} className="!bg-primary" />
      <div className="flex items-center gap-2">
        <FileOutput className="h-4 w-4 text-text-muted" />
        <div className="text-sm font-medium">{data.label}</div>
      </div>
    </div>
  )
}

function OutputNode({ data }: { data: { label: string } }) {
  return (
    <div className="rounded-lg border-2 border-border bg-surface px-4 py-3 shadow-md">
      <Handle type="target" position={Position.Top} className="!bg-primary" />
      <div className="flex items-center gap-2">
        <FileOutput className="h-4 w-4 text-text-muted" />
        <div className="text-sm font-medium">{data.label}</div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Workflow Builder Component
// ═══════════════════════════════════════════════════════════════

const nodeTypes: NodeTypes = {
  persona: PersonaNode,
  writing: WritingNode,
  control: ControlNode,
  input: InputNode,
  output: OutputNode,
}

function WorkflowBuilderInner() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const { screenToFlowPosition } = useReactFlow()

  const nodes = useWorkflowStore((s) => s.nodes)
  const edges = useWorkflowStore((s) => s.edges)
  const onNodesChange = useWorkflowStore((s) => s.onNodesChange)
  const onEdgesChange = useWorkflowStore((s) => s.onEdgesChange)
  const setNodes = useWorkflowStore((s) => s.setNodes)
  const setEdges = useWorkflowStore((s) => s.setEdges)

  const personas = usePersonaStore((s) => s.personas)

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges(addEdge(params, edges))
    },
    [edges, setEdges]
  )

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      const type = event.dataTransfer.getData('application/reactflow/type')
      const label = event.dataTransfer.getData('application/reactflow/label')
      const color = event.dataTransfer.getData('application/reactflow/color')

      if (!type) return

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { label, color, description: '' },
      }

      setNodes([...nodes, newNode])
    },
    [screenToFlowPosition, nodes, setNodes]
  )

  return (
    <div className="flex h-full">
      {/* Node Palette */}
      <div className="w-64 border-r border-border bg-surface p-4">
        <h3 className="mb-4 text-sm font-semibold">Node-Bibliothek</h3>

        {/* Personas */}
        <div className="mb-4">
          <h4 className="mb-2 text-xs font-medium text-text-muted">Personas</h4>
          <div className="space-y-2">
            {personas.slice(0, 5).map((persona) => (
              <NodePaletteItem
                key={persona.id}
                type="persona"
                id={persona.id}
                label={persona.name}
                color={persona.color}
                icon={<User className="h-4 w-4" />}
              />
            ))}
          </div>
        </div>

        {/* Writing Skills */}
        <div className="mb-4">
          <h4 className="mb-2 text-xs font-medium text-text-muted">Schreib-Kompetenzen</h4>
          <div className="space-y-2">
            <NodePaletteItem
              type="writing"
              id="generation"
              label="Generierung"
              color="#10b981"
              icon={<Pen className="h-4 w-4" />}
            />
            <NodePaletteItem
              type="writing"
              id="derivate"
              label="Derivate"
              color="#10b981"
              icon={<Pen className="h-4 w-4" />}
            />
          </div>
        </div>

        {/* Control Skills */}
        <div className="mb-4">
          <h4 className="mb-2 text-xs font-medium text-text-muted">Kontroll-Kompetenzen</h4>
          <div className="space-y-2">
            <NodePaletteItem
              type="control"
              id="rules"
              label="Regel-Checker"
              color="#f59e0b"
              icon={<Shield className="h-4 w-4" />}
            />
            <NodePaletteItem
              type="control"
              id="consistency"
              label="Konsistenz"
              color="#f59e0b"
              icon={<Shield className="h-4 w-4" />}
            />
          </div>
        </div>

        {/* I/O */}
        <div>
          <h4 className="mb-2 text-xs font-medium text-text-muted">Ein-/Ausgabe</h4>
          <div className="space-y-2">
            <NodePaletteItem
              type="input"
              id="input"
              label="Text-Eingabe"
              color="#2563eb"
              icon={<FileOutput className="h-4 w-4" />}
            />
            <NodePaletteItem
              type="output"
              id="output"
              label="Ergebnis"
              color="#2563eb"
              icon={<FileOutput className="h-4 w-4" />}
            />
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div ref={reactFlowWrapper} className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDragOver={onDragOver}
          onDrop={onDrop}
          nodeTypes={nodeTypes}
          fitView
          className="bg-surface"
        >
          <Controls className="!bg-surface !border-border" />
          <MiniMap
            className="!bg-surface !border-border"
            nodeColor={(node) => {
              switch (node.type) {
                case 'persona':
                  return node.data.color
                case 'writing':
                  return '#10b981'
                case 'control':
                  return '#f59e0b'
                default:
                  return '#2563eb'
              }
            }}
          />
          <Background gap={16} size={1} color="#374151" />
        </ReactFlow>
      </div>
    </div>
  )
}

function NodePaletteItem({
  type,
  id,
  label,
  color,
  icon,
}: {
  type: string
  id: string
  label: string
  color: string
  icon: React.ReactNode
}) {
  const onDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData('application/reactflow/type', type)
    event.dataTransfer.setData('application/reactflow/id', id)
    event.dataTransfer.setData('application/reactflow/label', label)
    event.dataTransfer.setData('application/reactflow/color', color)
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className={cn(
        'flex items-center gap-2 rounded-lg border border-border bg-surface-hover p-2',
        'cursor-grab text-sm transition-colors hover:bg-surface-active'
      )}
    >
      <div className="rounded p-1" style={{ backgroundColor: `${color}20` }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <span className="truncate">{label}</span>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Export with Provider
// ═══════════════════════════════════════════════════════════════

export function WorkflowBuilder() {
  return (
    <ReactFlowProvider>
      <WorkflowBuilderInner />
    </ReactFlowProvider>
  )
}
