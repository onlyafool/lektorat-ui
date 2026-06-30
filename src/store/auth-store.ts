import { create } from 'zustand'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  isLoading: boolean
  isConfigured: boolean

  // Actions
  initialize: () => Promise<void>
  signUp: (email: string, password: string) => Promise<{ error?: string }>
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signInWithGoogle: () => Promise<{ error?: string }>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isConfigured: isSupabaseConfigured,

  initialize: async () => {
    if (!isSupabaseConfigured || !supabase) {
      set({ isLoading: false, user: null })
      return
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()
      set({ user: session?.user ?? null, isLoading: false })

      // Listen for auth changes
      supabase.auth.onAuthStateChange((_event, session) => {
        set({ user: session?.user ?? null })
      })
    } catch (error) {
      console.error('[Auth] Initialize failed:', error)
      set({ isLoading: false })
    }
  },

  signUp: async (email, password) => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: 'Supabase nicht konfiguriert.' }
    }

    const { error } = await supabase.auth.signUp({ email, password })
    if (error) return { error: error.message }
    return {}
  },

  signIn: async (email, password) => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: 'Supabase nicht konfiguriert.' }
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    return {}
  },

  signInWithGoogle: async () => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: 'Supabase nicht konfiguriert.' }
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/lektorat-ui/',
      },
    })
    if (error) return { error: error.message }
    return {}
  },

  signOut: async () => {
    if (!isSupabaseConfigured || !supabase) return
    await supabase.auth.signOut()
  },
}))
