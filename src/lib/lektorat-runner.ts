import type { Persona, ReviewComment } from '@/types'
import { orchestrator } from '@/lib/orchestrator'
import { chunkText, type ChunkingOptions } from '@/lib/chunking'
import { useSettingsStore } from '@/store/settings-store'
import { generateId } from '@/lib/utils'

export interface LektoratAgent {
  id: string
  name: string
  persona: Persona
  role: 'korrektor' | 'stilistin' | 'logiker' | 'dramaturg' | 'profiler'
}

export interface LektoratResult {
  id: string
  agentResults: AgentResult[]
  mergedComments: ReviewComment[]
  overallScore: number
  categoryScores: Record<string, number>
  styleProfileUsed: boolean
  chunkCount: number
  duration: number
  completedAt: string
}

export interface AgentResult {
  agentId: string
  agentName: string
  role: string
  comments: ReviewComment[]
  rawOutput: string
  score: number
  duration: number
  status: 'completed' | 'error' | 'aborted'
  error?: string
  chunkId?: string
}

export interface LektoratProgress {
  totalAgents: number
  completedAgents: number
  runningAgent: string | null
  agentStatuses: Record<string, 'pending' | 'running' | 'completed' | 'error'>
  currentChunk: number
  totalChunks: number
}

export interface LektoratOptions {
  chunking?: Partial<ChunkingOptions>
  maxChunkWords?: number
}

const AGENT_DEFINITIONS: Omit<LektoratAgent, 'persona'>[] = [
  { id: 'korrektor', name: 'Korrektor Erik', role: 'korrektor' },
  { id: 'stilistin', name: 'Stilistin Luna', role: 'stilistin' },
  { id: 'logiker', name: 'Logikerin Nora', role: 'logiker' },
  { id: 'dramaturg', name: 'Dramaturg Leo Lektor', role: 'dramaturg' },
  { id: 'profiler', name: 'Profiler Luna', role: 'profiler' },
]

function buildAgentPrompt(
  role: LektoratAgent['role'],
  text: string,
  styleProfile?: string
): { role: string; content: string }[] {
  const styleContext = styleProfile
    ? `\n\n--- STILPROFIL DES AUTORS ---\n${styleProfile}\n--- ENDE STILPROFIL ---\n\nBeachte das Stilprofil: Ändere nur Vorschläge, die zum Stil des Autors passen. Generisches KI-Deutsch vermeiden.`
    : ''

  const systemPrompts: Record<LektoratAgent['role'], string> = {
    korrektor: `Du bist Korrektor Erik. Du prüfst deutsche Texte auf Rechtschreibung, Grammatik und Zeichensetzung.
Fokus: Orthografie, Grammatik, Kommas, Satzzeichen, Groß-/Kleinschreibung.
Gib strukturierte Kommentare mit Position, Kategorie, Schweregrad und Vorschlag.
Antworte auf Deutsch.${styleContext}`,

    stilistin: `Du bist Stilistin Luna. Du analysierst den Schreibstil und schlägst Verbesserungen vor.
Fokus: Satzlänge, Lesbarkeit, Füllwörter, Wortwiederholungen, Adjektiv-Dichte.
Gib strukturierte Kommentare mit Position, Kategorie, Schweregrad und Vorschlag.
Antworte auf Deutsch.${styleContext}`,

    logiker: `Du bist Logikerin Nora. Du prüfst Texte auf inhaltliche Konsistenz.
Fokus: Widersprüche, Timeline, Charakter-Konsistenz, Logikfehler.
Gib strukturierte Kommentare mit Position, Kategorie, Schweregrad und Vorschlag.
Antworte auf Deutsch.${styleContext}`,

    dramaturg: `Du bist Dramaturg Leo Lektor. Du bewertest die erzählerische Qualität.
Fokus: Show Don't Tell, Spannungsbogen, Dialogqualität, Figurenstimmen, Schlusssätze.
Gib strukturierte Kommentare mit Position, Kategorie, Schweregrad und Vorschlag.
Antworte auf Deutsch.${styleContext}`,

    profiler: `Du bist Profiler Luna. Du analysierst Zielgruppe und Genre.
Fokus: Zielgruppen-Erwartungen, Genre-Konventionen, Marktpotenzial.
Gib eine Zusammenfassung mit Stärken, Schwächen und Empfehlungen.
Antworte auf Deutsch.${styleContext}`,
  }

  return [
    { role: 'system', content: systemPrompts[role] },
    { role: 'user', content: `Bitte überprüfe folgenden Text:\n\n${text}` },
  ]
}

function parseAgentComments(rawOutput: string, agentId: string, textId: string): ReviewComment[] {
  const comments: ReviewComment[] = []
  const lines = rawOutput.split('\n')

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    // Detect comment patterns
    let severity: ReviewComment['severity'] = 'info'
    let category: ReviewComment['category'] = 'style'

    if (trimmed.includes('❌') || trimmed.includes('Fehler:') || trimmed.includes('Error:')) {
      severity = 'error'
      category = 'grammar'
    } else if (trimmed.includes('⚠️') || trimmed.includes('Vorschlag:') || trimmed.includes('Verbesserung:')) {
      severity = 'warning'
    } else if (trimmed.includes('💡') || trimmed.includes('Tipp:') || trimmed.includes('Hinweis:')) {
      severity = 'info'
    }

    // Skip pure markdown headers or empty-ish lines
    if (trimmed.startsWith('#') || trimmed.length < 5) continue

    comments.push({
      id: generateId(),
      textId,
      personaId: agentId,
      startIndex: 0,
      endIndex: 0,
      originalText: '',
      comment: trimmed,
      category,
      severity,
      resolved: false,
      createdAt: new Date().toISOString(),
    })
  }

  return comments
}

function calculateScore(comments: ReviewComment[]): number {
  if (comments.length === 0) return 100

  let penalty = 0
  for (const c of comments) {
    if (c.severity === 'error') penalty += 15
    else if (c.severity === 'warning') penalty += 8
    else penalty += 3
  }

  return Math.max(0, Math.round(100 - penalty))
}

function mergeComments(agentResults: AgentResult[]): ReviewComment[] {
  const allComments: ReviewComment[] = []
  const seen = new Set<string>()

  for (const result of agentResults) {
    for (const comment of result.comments) {
      // Simple dedup: skip if same comment text already seen
      const key = comment.comment.slice(0, 80).toLowerCase()
      if (!seen.has(key)) {
        seen.add(key)
        allComments.push(comment)
      }
    }
  }

  return allComments
}

function calculateCategoryScores(comments: ReviewComment[]): Record<string, number> {
  const categories: Record<string, { total: number; errors: number }> = {}

  for (const c of comments) {
    if (!categories[c.category]) {
      categories[c.category] = { total: 0, errors: 0 }
    }
    categories[c.category].total++
    if (c.severity === 'error') categories[c.category].errors++
  }

  const scores: Record<string, number> = {}
  for (const [cat, data] of Object.entries(categories)) {
    scores[cat] = Math.max(0, Math.round(100 - data.errors * 20 - data.total * 5))
  }

  return scores
}

export async function runLektorat(
  text: string,
  textId: string,
  agents: LektoratAgent[],
  styleProfile?: string,
  onProgress?: (progress: LektoratProgress) => void,
  signal?: AbortSignal,
  options?: LektoratOptions
): Promise<LektoratResult> {
  const startTime = Date.now()

  // Chunk the text
  const chunks = chunkText(text, options?.chunking)
  const totalChunks = chunks.length

  const allAgentResults: AgentResult[] = []

  // Process each chunk
  for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
    const chunk = chunks[chunkIndex]

    if (signal?.aborted) break

    const progress: LektoratProgress = {
      totalAgents: agents.length * totalChunks,
      completedAgents: allAgentResults.length,
      runningAgent: null,
      agentStatuses: {},
      currentChunk: chunkIndex + 1,
      totalChunks,
    }

    for (const agent of agents) {
      progress.agentStatuses[`${agent.id}-${chunkIndex}`] = 'pending'
    }

    onProgress?.(progress)

    // Build chunk context
    let chunkContent = chunk.content
    if (chunk.overlapBefore) {
      chunkContent = `[Vorheriger Abschnitt]:\n${chunk.overlapBefore}\n\n[Aktueller Abschnitt]:\n${chunk.content}`
    }
    if (chunk.overlapAfter) {
      chunkContent += `\n\n[Nächster Abschnitt]:\n${chunk.overlapAfter}`
    }

    // Run all agents on this chunk in parallel
    const agentPromises = agents.map(async (agent): Promise<AgentResult> => {
      const agentStart = Date.now()
      const statusKey = `${agent.id}-${chunkIndex}`

      progress.agentStatuses[statusKey] = 'running'
      progress.runningAgent = `${agent.name} (Kapitel ${chunkIndex + 1}/${totalChunks})`
      onProgress?.({ ...progress })

      try {
        if (signal?.aborted) {
          throw new Error('Abgebrochen')
        }

        const messages = buildAgentPrompt(agent.role, chunkContent, styleProfile)

        // Inject API key and base URL
        const providerConfig = useSettingsStore.getState().providers[agent.persona.model.provider]
        const enrichedModel = {
          ...agent.persona.model,
          apiKey: providerConfig?.apiKey ?? '',
          baseUrl: providerConfig?.baseUrl ?? '',
        }

        const result = await orchestrator.chat(messages, enrichedModel)
        const rawOutput = result.response.content
        const comments = parseAgentComments(rawOutput, agent.id, textId)

        // Adjust comment positions to global text offset
        for (const comment of comments) {
          comment.startIndex += chunk.startOffset
          comment.endIndex += chunk.startOffset
        }

        const score = calculateScore(comments)

        progress.agentStatuses[statusKey] = 'completed'
        progress.completedAgents++
        progress.runningAgent = null
        onProgress?.({ ...progress })

        return {
          agentId: agent.id,
          agentName: agent.name,
          role: agent.role,
          comments,
          rawOutput,
          score,
          duration: Date.now() - agentStart,
          status: 'completed',
          chunkId: chunk.id,
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unbekannter Fehler'

        progress.agentStatuses[statusKey] = 'error'
        progress.completedAgents++
        progress.runningAgent = null
        onProgress?.({ ...progress })

        return {
          agentId: agent.id,
          agentName: agent.name,
          role: agent.role,
          comments: [],
          rawOutput: '',
          score: 0,
          duration: Date.now() - agentStart,
          status: 'error',
          error: msg,
          chunkId: chunk.id,
        }
      }
    })

    const chunkResults = await Promise.all(agentPromises)
    allAgentResults.push(...chunkResults)
  }

  // Merge all comments across chunks
  const mergedComments = mergeComments(allAgentResults)
  const overallScore = calculateScore(mergedComments)
  const categoryScores = calculateCategoryScores(mergedComments)

  return {
    id: generateId(),
    agentResults: allAgentResults,
    mergedComments,
    overallScore,
    categoryScores,
    styleProfileUsed: !!styleProfile,
    chunkCount: totalChunks,
    duration: Date.now() - startTime,
    completedAt: new Date().toISOString(),
  }
}

export function getAgentsWithPersonas(
  allPersonas: Persona[]
): LektoratAgent[] {
  return AGENT_DEFINITIONS
    .map((def) => {
      const persona = allPersonas.find((p) =>
        p.name.includes(def.name.split(' ').pop() ?? '') ||
        p.name.toLowerCase().includes(def.role)
      )
      if (!persona) return null
      return { ...def, persona }
    })
    .filter((a): a is LektoratAgent => a !== null)
}
