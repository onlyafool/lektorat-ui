import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth-store'

export interface SavedLektoratResult {
  id: string
  textId: string
  textName: string
  score: number
  commentCount: number
  agentCount: number
  chunkCount: number
  summary: string
  comments: string
  duration: number
  createdAt: string
}

export async function saveLektoratResult(
  textId: string,
  textName: string,
  score: number,
  commentCount: number,
  agentCount: number,
  chunkCount: number,
  summary: string,
  comments: string,
  duration: number
): Promise<SavedLektoratResult | null> {
  if (!supabase) return null
  const userId = useAuthStore.getState().user?.id
  if (!userId) return null

  const { data, error } = await supabase
    .from('lektorat_results')
    .insert({
      user_id: userId,
      manuscript_id: textId,
      score,
      summary,
      comments,
      duration_ms: duration,
      status: 'completed',
      model_used: 'multi-agent',
      tokens_used: 0,
    })
    .select()
    .single()

  if (error) {
    console.error('[Supabase] Save lektorat result failed:', error.message)
    return null
  }

  return {
    id: data.id,
    textId,
    textName,
    score,
    commentCount,
    agentCount,
    chunkCount,
    summary,
    comments,
    duration,
    createdAt: data.created_at,
  }
}

export async function loadLektoratResults(): Promise<SavedLektoratResult[]> {
  if (!supabase) return []
  const userId = useAuthStore.getState().user?.id
  if (!userId) return []

  const { data, error } = await supabase
    .from('lektorat_results')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('[Supabase] Load lektorat results failed:', error.message)
    return []
  }

  return (data ?? []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    textId: row.manuscript_id as string,
    textName: '',
    score: (row.score as number) ?? 0,
    commentCount: Array.isArray(row.comments) ? (row.comments as unknown[]).length : 0,
    agentCount: 0,
    chunkCount: 0,
    summary: (row.summary as string) ?? '',
    comments: JSON.stringify(row.comments ?? []),
    duration: (row.duration_ms as number) ?? 0,
    createdAt: row.created_at as string,
  }))
}

export async function deleteLektoratResult(id: string): Promise<boolean> {
  if (!supabase) return false

  const { error } = await supabase
    .from('lektorat_results')
    .delete()
    .eq('id', id)

  return !error
}
