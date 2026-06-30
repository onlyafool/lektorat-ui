import { Handle, Position, type NodeProps } from 'reactflow'
import { Layers, Clock } from 'lucide-react'
import { useState } from 'react'

export interface ParallelNodeData {
  label: string
  strategy: 'all' | 'any' | 'race'
  timeout?: number
  description?: string
}

export function ParallelNode({ data, selected }: NodeProps & { data: ParallelNodeData }) {
  const [strategy, setStrategy] = useState(data.strategy || 'all')
  const [timeout, setTimeout_] = useState(data.timeout || 30000)

  return (
    <div className={`rounded-lg border-2 bg-surface px-4 py-3 shadow-md ${selected ? 'border-primary' : 'border-purple-500'}`}>
      <Handle type="target" position={Position.Top} className="!bg-purple-500" />

      <div className="flex items-center gap-2 mb-2">
        <div className="rounded-lg bg-purple-500/20 p-1">
          <Layers className="h-4 w-4 text-purple-500" />
        </div>
        <div>
          <div className="text-sm font-medium">{data.label}</div>
          <div className="text-xs text-text-muted">Parallele Ausführung</div>
        </div>
      </div>

      {/* Strategy */}
      <div className="mb-2">
        <label className="mb-1 block text-xs text-text-muted">Strategie:</label>
        <select
          value={strategy}
          onChange={(e) => setStrategy(e.target.value as typeof strategy)}
          className="w-full rounded border border-border bg-surface-hover px-2 py-1 text-xs text-text outline-none focus:border-purple-500"
        >
          <option value="all">Alle warten</option>
          <option value="any">Beliebige beenden</option>
          <option value="race">Schnellster gewinnt</option>
        </select>
      </div>

      {/* Timeout */}
      <div className="mb-2">
        <label className="mb-1 block text-xs text-text-muted">Timeout (ms):</label>
        <input
          type="number"
          value={timeout}
          onChange={(e) => setTimeout_(parseInt(e.target.value) || 30000)}
          min={1000}
          max={300000}
          className="w-full rounded border border-border bg-surface-hover px-2 py-1 text-xs text-text outline-none focus:border-purple-500"
        />
      </div>

      {/* Timeout Indicator */}
      <div className="flex items-center gap-2 text-xs text-text-muted">
        <Clock className="h-3 w-3" />
        <span>{timeout / 1000}s Timeout</span>
      </div>

      {/* Output Handles (multiple for parallel branches) */}
      <div className="relative">
        <Handle
          type="source"
          position={Position.Bottom}
          id="branch-1"
          style={{ left: '20%' }}
          className="!bg-purple-500"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          id="branch-2"
          style={{ left: '40%' }}
          className="!bg-purple-500"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          id="branch-3"
          style={{ left: '60%' }}
          className="!bg-purple-500"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          id="merged"
          style={{ left: '80%' }}
          className="!bg-text-muted"
        />
      </div>
    </div>
  )
}
