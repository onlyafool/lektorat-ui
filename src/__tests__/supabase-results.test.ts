import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase', () => ({
  supabase: null,
  isSupabaseConfigured: () => false,
}))

vi.mock('@/store/auth-store', () => ({
  useAuthStore: {
    getState: () => ({ user: null }),
  },
}))

describe('supabase-results', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns null when supabase not configured', async () => {
    const { saveLektoratResult } = await import('@/lib/supabase-results')
    const result = await saveLektoratResult(
      't-1', 'Text', 85, 12, 5, 3, 'summary', '[]', 45000
    )
    expect(result).toBeNull()
  })

  it('returns empty array when supabase not configured', async () => {
    const { loadLektoratResults } = await import('@/lib/supabase-results')
    const results = await loadLektoratResults()
    expect(results).toEqual([])
  })

  it('returns false when supabase not configured', async () => {
    const { deleteLektoratResult } = await import('@/lib/supabase-results')
    const ok = await deleteLektoratResult('r-1')
    expect(ok).toBe(false)
  })
})
