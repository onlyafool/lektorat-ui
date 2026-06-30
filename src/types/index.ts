import { z } from 'zod'

// ═══════════════════════════════════════════════════════════════
// Unified Text Object - Das zentrale Datenmodell
// ═══════════════════════════════════════════════════════════════

export const UnifiedTextObjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  content: z.string(),
  metadata: z.object({
    originalFormat: z.enum(['txt', 'md', 'docx', 'pdf', 'rtf']),
    wordCount: z.number(),
    characterCount: z.number(),
    lineCount: z.number(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  }),
  sections: z.array(z.object({
    id: z.string().uuid(),
    title: z.string(),
    content: z.string(),
    startIndex: z.number(),
    endIndex: z.number(),
    level: z.number().min(1).max(6),
  })).optional(),
  tags: z.array(z.string()).default([]),
})

export type UnifiedTextObject = z.infer<typeof UnifiedTextObjectSchema>

// ═══════════════════════════════════════════════════════════════
// Persona - Redakteur/Experten-Profil
// ═══════════════════════════════════════════════════════════════

export const PersonaSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string(),
  systemPrompt: z.string(),
  model: z.object({
    provider: z.enum(['ollama', 'lmstudio', 'anthropic', 'openrouter']),
    modelId: z.string(),
    temperature: z.number().min(0).max(2).default(0.7),
    maxTokens: z.number().min(1).max(100000).default(4096),
    topP: z.number().min(0).max(1).default(1),
    stop: z.array(z.string()).default([]),
  }),
  color: z.string().default('#2563eb'),
  icon: z.string().default('user'),
  isBuiltIn: z.boolean().default(false),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type Persona = z.infer<typeof PersonaSchema>

// ═══════════════════════════════════════════════════════════════
// Writing Skill - Generierung/Derivate/Recherche
// ═══════════════════════════════════════════════════════════════

export const WritingSkillSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string(),
  type: z.enum(['generation', 'derivate', 'research', 'logic']),
  systemPrompt: z.string(),
  model: z.object({
    provider: z.enum(['ollama', 'lmstudio', 'anthropic', 'openrouter']),
    modelId: z.string(),
    temperature: z.number().min(0).max(2).default(0.7),
    maxTokens: z.number().min(1).max(100000).default(4096),
  }),
  inputSchema: z.record(z.string(), z.string()).optional(),
  color: z.string().default('#10b981'),
  icon: z.string().default('pen'),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type WritingSkill = z.infer<typeof WritingSkillSchema>

// ═══════════════════════════════════════════════════════════════
// Control Skill - Regeln/Konsistenz/Logik/Metriken
// ═══════════════════════════════════════════════════════════════

export const ControlSkillSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string(),
  type: z.enum(['rules', 'consistency', 'logic', 'metrics']),
  systemPrompt: z.string(),
  model: z.object({
    provider: z.enum(['ollama', 'lmstudio', 'anthropic', 'openrouter']),
    modelId: z.string(),
    temperature: z.number().min(0).max(2).default(0.3),
    maxTokens: z.number().min(1).max(100000).default(2048),
  }),
  validationRules: z.array(z.string()).optional(),
  color: z.string().default('#f59e0b'),
  icon: z.string().default('shield'),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type ControlSkill = z.infer<typeof ControlSkillSchema>

// ═══════════════════════════════════════════════════════════════
// Workflow - Visual Node/Edge Definition
// ═══════════════════════════════════════════════════════════════

export const WorkflowNodeSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['persona', 'writing', 'control', 'input', 'output']),
  position: z.object({ x: z.number(), y: z.number() }),
  data: z.record(z.string(), z.unknown()),
})

export type WorkflowNode = z.infer<typeof WorkflowNodeSchema>

export const WorkflowEdgeSchema = z.object({
  id: z.string().uuid(),
  source: z.string(),
  target: z.string(),
  animated: z.boolean().default(false),
})

export type WorkflowEdge = z.infer<typeof WorkflowEdgeSchema>

export const WorkflowSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  nodes: z.array(WorkflowNodeSchema),
  edges: z.array(WorkflowEdgeSchema),
  executionOrder: z.array(z.string()),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type Workflow = z.infer<typeof WorkflowSchema>

// ═══════════════════════════════════════════════════════════════
// Model Provider Types
// ═══════════════════════════════════════════════════════════════

export type ModelProvider = 'ollama' | 'lmstudio' | 'anthropic' | 'openrouter'

export interface ModelConfig {
  provider: ModelProvider
  modelId: string
  temperature: number
  maxTokens: number
  topP?: number
  stop?: string[]
  apiKey?: string
  baseUrl?: string
}

export interface ModelResponse {
  content: string
  model: string
  provider: ModelProvider
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  finishReason: string
}

// ═══════════════════════════════════════════════════════════════
// Project Types
// ═══════════════════════════════════════════════════════════════

export interface Project {
  id: string
  name: string
  description?: string
  textIds: string[]
  activeWorkflowId?: string
  settings: ProjectSettings
  createdAt: string
  updatedAt: string
}

export interface ProjectSettings {
  defaultModel: ModelConfig
  exportFormat: 'docx' | 'pdf' | 'txt' | 'md'
  autoSave: boolean
  theme: 'light' | 'dark' | 'system'
}

// ═══════════════════════════════════════════════════════════════
// Review Result Types
// ═══════════════════════════════════════════════════════════════

export interface ReviewComment {
  id: string
  textId: string
  personaId: string
  startIndex: number
  endIndex: number
  originalText: string
  suggestedText?: string
  comment: string
  category: 'grammar' | 'style' | 'clarity' | 'fact' | 'logic' | 'consistency'
  severity: 'info' | 'warning' | 'error'
  resolved: boolean
  createdAt: string
}

export interface ReviewResult {
  id: string
  textId: string
  workflowId: string
  comments: ReviewComment[]
  summary: string
  score: number
  executedAt: string
  duration: number
}
