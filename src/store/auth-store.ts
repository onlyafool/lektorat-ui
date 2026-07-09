import { create } from 'zustand'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  isLoading: boolean
  isConfigured: boolean

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
      const sessionPromise = supabase.auth.getSession()
      const timeoutPromise = new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), 5000)
      )

      const result = await Promise.race([sessionPromise, timeoutPromise])

      if (result === null) {
        console.warn('[Auth] getSession timed out after 5s, continuing without auth')
        set({ user: null, isLoading: false })
      } else {
        set({ user: result.data.session?.user ?? null, isLoading: false })
      }

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

    let redirectTo: string
    const isElectron = typeof window !== 'undefined' && 
      !window.navigator.userAgent.includes('Chrome') &&
      window.location.protocol === 'file:'

    if (isElectron) {
      redirectTo = 'lektorat://auth/callback'
    } else if (window.location.origin.startsWith('file:')) {
      redirectTo = 'lektorat://auth/callback'
    } else {
      redirectTo = window.location.origin + '/lektorat-ui/'
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectTo,
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