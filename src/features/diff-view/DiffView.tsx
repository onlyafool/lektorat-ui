import { useState } from 'react'
import { Columns, Rows, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ReviewComment } from '@/types'

interface DiffViewProps {
  originalText: string
  reviewedText: string
  comments: ReviewComment[]
}

export function DiffView({ originalText, reviewedText, comments }: DiffViewProps) {
  const [mode, setMode] = useState<'side-by-side' | 'unified'>('side-by-side')
  const [showComments, setShowComments] = useState(true)

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode('side-by-side')}
            className={cn(
              'flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition-colors',
              mode === 'side-by-side'
                ? 'bg-primary/20 text-primary'
                : 'text-text-muted hover:bg-surface-hover'
            )}
          >
            <Columns className="h-3 w-3" />
            Nebeneinander
          </button>
          <button
            onClick={() => setMode('unified')}
            className={cn(
              'flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition-colors',
              mode === 'unified'
                ? 'bg-primary/20 text-primary'
                : 'text-text-muted hover:bg-surface-hover'
            )}
          >
            <Rows className="h-3 w-3" />
            Einheitlich
          </button>
        </div>
        <button
          onClick={() => setShowComments(!showComments)}
          className={cn(
            'flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition-colors',
            showComments
              ? 'bg-accent/20 text-accent'
              : 'text-text-muted hover:bg-surface-hover'
          )}
        >
          <MessageSquare className="h-3 w-3" />
          Kommentare ({comments.length})
        </button>
      </div>

      {/* Diff Content */}
      <div className="flex-1 overflow-hidden">
        {mode === 'side-by-side' ? (
          <SideBySideView
            original={originalText}
            reviewed={reviewedText}
            comments={comments}
            showComments={showComments}
          />
        ) : (
          <UnifiedView
            original={originalText}
            reviewed={reviewedText}
            comments={comments}
            showComments={showComments}
          />
        )}
      </div>
    </div>
  )
}

function SideBySideView({
  original,
  reviewed,
}: {
  original: string
  reviewed: string
  comments: ReviewComment[]
  showComments: boolean
}) {
  const originalLines = original.split('\n')
  const reviewedLines = reviewed.split('\n')

  return (
    <div className="flex h-full">
      {/* Original */}
      <div className="flex-1 overflow-y-auto border-r border-border">
        <div className="sticky top-0 bg-surface px-4 py-2 text-xs font-medium text-text-muted">
          Original
        </div>
        <div className="p-4">
          {originalLines.map((line, i) => (
            <div key={i} className="flex font-mono text-sm">
              <span className="w-8 shrink-0 text-right text-text-muted">
                {i + 1}
              </span>
              <span className="ml-4 flex-1 whitespace-pre-wrap">{line}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reviewed */}
      <div className="flex-1 overflow-y-auto">
        <div className="sticky top-0 bg-surface px-4 py-2 text-xs font-medium text-text-muted">
          Überarbeitet
        </div>
        <div className="p-4">
          {reviewedLines.map((line, i) => (
            <div key={i} className="flex font-mono text-sm">
              <span className="w-8 shrink-0 text-right text-text-muted">
                {i + 1}
              </span>
              <span className="ml-4 flex-1 whitespace-pre-wrap">{line}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function UnifiedView({
  original,
  reviewed,
  comments,
  showComments,
}: {
  original: string
  reviewed: string
  comments: ReviewComment[]
  showComments: boolean
}) {
  // Simple unified diff view
  const originalLines = original.split('\n')
  const reviewedLines = reviewed.split('\n')

  // Create a simple diff by comparing lines
  const diffLines: { type: 'same' | 'removed' | 'added'; content: string; lineNum: number }[] = []

  const maxLines = Math.max(originalLines.length, reviewedLines.length)
  for (let i = 0; i < maxLines; i++) {
    const origLine = originalLines[i]
    const revLine = reviewedLines[i]

    if (origLine === revLine) {
      diffLines.push({ type: 'same', content: origLine || '', lineNum: i + 1 })
    } else {
      if (origLine !== undefined) {
        diffLines.push({ type: 'removed', content: origLine, lineNum: i + 1 })
      }
      if (revLine !== undefined) {
        diffLines.push({ type: 'added', content: revLine, lineNum: i + 1 })
      }
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4">
        {diffLines.map((line, i) => (
          <div
            key={i}
            className={cn(
              'flex font-mono text-sm',
              line.type === 'removed' && 'bg-danger/10 text-danger',
              line.type === 'added' && 'bg-secondary/10 text-secondary'
            )}
          >
            <span className="w-8 shrink-0 text-right text-text-muted">
              {line.lineNum}
            </span>
            <span className="ml-2 w-4 shrink-0">
              {line.type === 'removed' && '-'}
              {line.type === 'added' && '+'}
            </span>
            <span className="flex-1 whitespace-pre-wrap">{line.content}</span>
          </div>
        ))}
      </div>

      {/* Comments */}
      {showComments && comments.length > 0 && (
        <div className="border-t border-border p-4">
          <h4 className="mb-2 text-sm font-medium">Kommentare</h4>
          <div className="space-y-2">
            {comments.map((comment) => (
              <CommentCard key={comment.id} comment={comment} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function CommentCard({ comment }: { comment: ReviewComment }) {
  const categoryColors = {
    grammar: 'bg-danger/10 text-danger',
    style: 'bg-primary/10 text-primary',
    clarity: 'bg-secondary/10 text-secondary',
    fact: 'bg-accent/10 text-accent',
    logic: 'bg-purple-500/10 text-purple-500',
    consistency: 'bg-cyan-500/10 text-cyan-500',
  }

  const categoryLabels = {
    grammar: 'Grammatik',
    style: 'Stil',
    clarity: 'Klarheit',
    fact: 'Fakten',
    logic: 'Logik',
    consistency: 'Konsistenz',
  }

  return (
    <div className="rounded-lg border border-border p-3">
      <div className="mb-2 flex items-center gap-2">
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-xs',
            categoryColors[comment.category]
          )}
        >
          {categoryLabels[comment.category]}
        </span>
        <span className="text-xs text-text-muted">
          {new Date(comment.createdAt).toLocaleTimeString('de-DE')}
        </span>
      </div>
      <p className="text-sm">{comment.comment}</p>
    </div>
  )
}
