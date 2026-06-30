import { openDB, type IDBPDatabase } from 'idb'
import type { UnifiedTextObject, Persona, WritingSkill, ControlSkill, Workflow, Project } from '@/types'
import type { StyleProfile } from '@/store/style-profile-store'

const DB_NAME = 'lektorat-ui'
const DB_VERSION = 2

interface LektoratDB {
  texts: UnifiedTextObject
  personas: Persona
  writingSkills: WritingSkill
  controlSkills: ControlSkill
  workflows: Workflow
  projects: Project
  styleProfiles: StyleProfile
}

let dbInstance: IDBPDatabase<LektoratDB> | null = null

export async function getDB(): Promise<IDBPDatabase<LektoratDB>> {
  if (dbInstance) return dbInstance

  dbInstance = await openDB<LektoratDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Texts Store
      if (!db.objectStoreNames.contains('texts')) {
        const textStore = db.createObjectStore('texts', { keyPath: 'id' })
        textStore.createIndex('name', 'name')
        textStore.createIndex('createdAt', 'metadata.createdAt')
      }

      // Personas Store
      if (!db.objectStoreNames.contains('personas')) {
        const personaStore = db.createObjectStore('personas', { keyPath: 'id' })
        personaStore.createIndex('name', 'name')
        personaStore.createIndex('isBuiltIn', 'isBuiltIn')
      }

      // Writing Skills Store
      if (!db.objectStoreNames.contains('writingSkills')) {
        const writingStore = db.createObjectStore('writingSkills', { keyPath: 'id' })
        writingStore.createIndex('name', 'name')
        writingStore.createIndex('type', 'type')
      }

      // Control Skills Store
      if (!db.objectStoreNames.contains('controlSkills')) {
        const controlStore = db.createObjectStore('controlSkills', { keyPath: 'id' })
        controlStore.createIndex('name', 'name')
        controlStore.createIndex('type', 'type')
      }

      // Workflows Store
      if (!db.objectStoreNames.contains('workflows')) {
        const workflowStore = db.createObjectStore('workflows', { keyPath: 'id' })
        workflowStore.createIndex('name', 'name')
      }

      // Projects Store
      if (!db.objectStoreNames.contains('projects')) {
        const projectStore = db.createObjectStore('projects', { keyPath: 'id' })
        projectStore.createIndex('name', 'name')
      }

      // Style Profiles Store
      if (!db.objectStoreNames.contains('styleProfiles')) {
        const styleStore = db.createObjectStore('styleProfiles', { keyPath: 'id' })
        styleStore.createIndex('name', 'name')
      }
    },
  })

  return dbInstance
}

// Generic CRUD operations
export async function getAll<T extends { id: string }>(
  storeName: keyof LektoratDB
): Promise<T[]> {
  const db = await getDB()
  return db.getAll(storeName as never) as Promise<T[]>
}

export async function getById<T extends { id: string }>(
  storeName: keyof LektoratDB,
  id: string
): Promise<T | undefined> {
  const db = await getDB()
  return db.get(storeName as never, id) as Promise<T | undefined>
}

export async function put<T extends { id: string }>(
  storeName: keyof LektoratDB,
  value: T
): Promise<void> {
  const db = await getDB()
  await db.put(storeName as never, value as never)
}

export async function putAll<T extends { id: string }>(
  storeName: keyof LektoratDB,
  values: T[]
): Promise<void> {
  const db = await getDB()
  const tx = db.transaction(storeName as never, 'readwrite')
  await Promise.all([
    ...values.map((value) => tx.store.put(value as never)),
    tx.done,
  ])
}

export async function deleteById(
  storeName: keyof LektoratDB,
  id: string
): Promise<void> {
  const db = await getDB()
  await db.delete(storeName as never, id)
}

export async function clearStore(storeName: keyof LektoratDB): Promise<void> {
  const db = await getDB()
  await db.clear(storeName as never)
}

export async function count(storeName: keyof LektoratDB): Promise<number> {
  const db = await getDB()
  return db.count(storeName as never)
}
