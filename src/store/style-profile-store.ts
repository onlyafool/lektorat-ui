import { create } from 'zustand'
import { getAll, put, deleteById } from '@/lib/indexeddb'
import { generateId } from '@/lib/utils'

export interface StyleProfile {
  id: string
  name: string
  manuscriptId?: string
  content: string
  createdAt: string
  updatedAt: string
}

interface StyleProfileState {
  profiles: StyleProfile[]
  isLoading: boolean

  loadProfiles: () => Promise<void>
  addProfile: (profile: Omit<StyleProfile, 'id' | 'createdAt' | 'updatedAt'>) => Promise<StyleProfile>
  updateProfile: (id: string, updates: Partial<StyleProfile>) => Promise<void>
  deleteProfile: (id: string) => Promise<void>
  getProfileForManuscript: (manuscriptId?: string) => StyleProfile | undefined
}

const STORE_NAME = 'styleProfiles'

export const useStyleProfileStore = create<StyleProfileState>((set, get) => ({
  profiles: [],
  isLoading: false,

  loadProfiles: async () => {
    set({ isLoading: true })
    try {
      const profiles = await getAll<StyleProfile>(STORE_NAME)
      set({ profiles: profiles.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)) })
    } catch (error) {
      console.error('[StyleProfileStore] Load failed:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  addProfile: async (profileData) => {
    const now = new Date().toISOString()
    const profile: StyleProfile = {
      ...profileData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    }
    await put(STORE_NAME, profile)
    set((state) => ({
      profiles: [profile, ...state.profiles],
    }))
    return profile
  },

  updateProfile: async (id, updates) => {
    const existing = get().profiles.find((p) => p.id === id)
    if (!existing) return

    const updated: StyleProfile = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    await put(STORE_NAME, updated)
    set((state) => ({
      profiles: state.profiles.map((p) => (p.id === id ? updated : p)),
    }))
  },

  deleteProfile: async (id) => {
    await deleteById(STORE_NAME, id)
    set((state) => ({
      profiles: state.profiles.filter((p) => p.id !== id),
    }))
  },

  getProfileForManuscript: (manuscriptId) => {
    const profiles = get().profiles
    if (manuscriptId) {
      return profiles.find((p) => p.manuscriptId === manuscriptId)
    }
    return profiles[0]
  },
}))
