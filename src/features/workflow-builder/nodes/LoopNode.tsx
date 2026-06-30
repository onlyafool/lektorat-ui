import { Handle, Position, type NodeProps } from 'reactflow'
import { Repeat, Settings } from 'lucide-react'
import { useState } from 'react'

export interface LoopNodeData {
  label: string
  type: 'for-each' | 'while' | 'repeat'
  iteratee?: string
  condition?: string
  count?: number
  maxIterations: number
  description?: string
}

export function LoopNode({ data, selected }: NodeProps & { data: LoopNodeData }) {
  const [loopType, setLoopType] = useState(data.type || 'for-each')
  const [count, setCount] = useState(data.count || 3)
  const maxIter = data.maxIterations || 10

  return (
    <div className={`rounded-lg border-2 bg-surface px-4 py-3 shadow-md ${selected ? 'border-primary' : 'border-cyan-500'}`}>
      <Handle type="target" position={Position.Top} className="!bg-cyan-500" />

      <div className="flex items-center gap-2 mb-2">
        <div className="rounded-lg bg-cyan-500/20 p-1">
          <Repeat className="h-4 w-4 text-cyan-500" />
        </div>
        <div>
          <div className="text-sm font-medium">{data.label}</div>
          <div className="text-xs text-text-muted">Schleife</div>
        </div>
      </div>

      {/* Loop Type */}
      <div className="mb-2">
        <label className="mb-1 block text-xs text-text-muted">Typ:</label>
        <select
          value={loopType}
          onChange={(e) => setLoopType(e.target.value as typeof loopType)}
          className="w-full rounded border border-border bg-surface-hover px-2 py-1 text-xs text-text outline-none focus:border-cyan-500"
        >
          <option value="for-each">Für jedes Element</option>
          <option value="while">Solange</option>
          <option value="repeat">Wiederholen</option>
        </select>
      </div>

      {/* Configuration based on type */}
      {loopType === 'repeat' && (
        <div className="mb-2">
          <label className="mb-1 block text-xs text-text-muted">Anzahl:</label>
          <input
            type="number"
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value) || 1)}
            min={1}
            max={100}
            className="w-full rounded border border-border bg-surface-hover px-2 py-1 text-xs text-text outline-none focus:border-cyan-500"
          />
        </div>
      )}

      {/* Max Iterations Safety */}
      <div className="flex items-center gap-2 text-xs text-text-muted">
        <Settings className="h-3 w-3" />
        <span>Max: {maxIter} Iterationen</span>
      </div>

      {/* Output Handles */}
      <div className="relative">
        <Handle
          type="source"
          position={Position.Bottom}
          id="loop-body"
          style={{ left: '30%' }}
          className="!bg-cyan-500"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          id="exit"
          style={{ left: '70%' }}
          className="!bg-text-muted"
        />
      </div>
    </div>
  )
}
