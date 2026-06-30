import { Handle, Position, type NodeProps } from 'reactflow'
import { GitBranch, Check, X } from 'lucide-react'
import { useState } from 'react'

export interface BranchNodeData {
  label: string
  condition: string
  description?: string
}

export function BranchNode({ data, selected }: NodeProps & { data: BranchNodeData }) {
  const [condition, setCondition] = useState(data.condition || '')

  return (
    <div className={`rounded-lg border-2 bg-surface px-4 py-3 shadow-md ${selected ? 'border-primary' : 'border-orange-500'}`}>
      <Handle type="target" position={Position.Top} className="!bg-orange-500" />

      <div className="flex items-center gap-2 mb-2">
        <div className="rounded-lg bg-orange-500/20 p-1">
          <GitBranch className="h-4 w-4 text-orange-500" />
        </div>
        <div>
          <div className="text-sm font-medium">{data.label}</div>
          <div className="text-xs text-text-muted">Bedingte Verzweigung</div>
        </div>
      </div>

      {/* Condition Input */}
      <div className="mb-2">
        <label className="mb-1 block text-xs text-text-muted">Bedingung:</label>
        <input
          type="text"
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          placeholder="z.B. score > 80"
          className="w-full rounded border border-border bg-surface-hover px-2 py-1 text-xs text-text outline-none focus:border-orange-500"
        />
      </div>

      {/* Branch Labels */}
      <div className="flex justify-between text-xs">
        <div className="flex items-center gap-1 text-secondary">
          <Check className="h-3 w-3" />
          <span>Wahr</span>
        </div>
        <div className="flex items-center gap-1 text-danger">
          <X className="h-3 w-3" />
          <span>Falsch</span>
        </div>
      </div>

      {/* Output Handles */}
      <div className="relative">
        <Handle
          type="source"
          position={Position.Bottom}
          id="true"
          style={{ left: '25%' }}
          className="!bg-secondary"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          id="false"
          style={{ left: '75%' }}
          className="!bg-danger"
        />
      </div>
    </div>
  )
}
