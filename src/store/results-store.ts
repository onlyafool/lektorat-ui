import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import {
  loadLektoratResults,
  deleteLektoratResult,
  type SavedLektoratResult,
} from '@/lib/supabase-results'

interface ResultsState {
  results: SavedLektoratResult[]
  isLoading: boolean
  loadResults: () => Promise<void>
  deleteResult: (id: string) => Promise<void>
}

export const useResultsStore = create<ResultsState>((set) => ({
  results: [],
  isLoading: false,

  loadResults: async () => {
    if (!supabase) {
      set({ results: [] })
      return
    }
    set({ isLoading: true })
    const results = await loadLektoratResults()
    set({ results, isLoading: false })
  },

  deleteResult: async (id: string) => {
    const ok = await deleteLektoratResult(id)
    if (ok) {
      set((state) => ({
        results: state.results.filter((r) => r.id !== id),
      }))
    }
  },
}))
