import type { ModelConfig, ModelResponse } from '@/types'
import { createAdapter, type ModelAdapter, AdapterError } from '@/adapters'

export interface OrchestrationResult {
  response: ModelResponse
  provider: string
  model: string
  fallbackUsed: boolean
}

export class ModelOrchestrator {
  private adapters: Map<string, ModelAdapter> = new Map()
  private healthStatus: Map<string, boolean> = new Map()

  async getAdapter(provider: ModelConfig['provider']): Promise<ModelAdapter> {
    if (!this.adapters.has(provider)) {
      const adapter = await createAdapter(provider)
      this.adapters.set(provider, adapter)
    }
    return this.adapters.get(provider)!
  }

  async checkHealth(provider: ModelConfig['provider']): Promise<boolean> {
    try {
      const adapter = await this.getAdapter(provider)
      const available = await adapter.isAvailable()
      this.healthStatus.set(provider, available)
      return available
    } catch {
      this.healthStatus.set(provider, false)
      return false
    }
  }

  getHealthStatus(): Map<string, boolean> {
    return new Map(this.healthStatus)
  }

  async chat(
    messages: { role: string; content: string }[],
    config: ModelConfig,
    fallbackProviders: ModelConfig['provider'][] = []
  ): Promise<OrchestrationResult> {
    const allProviders = [config.provider, ...fallbackProviders]

    for (const provider of allProviders) {
      try {
        const adapter = await this.getAdapter(provider)
        const available = await adapter.isAvailable()

        if (!available) {
          console.warn(`[Orchestrator] ${provider} not available, trying next...`)
          continue
        }

        const response = await adapter.chat(messages, {
          ...config,
          provider,
        })

        return {
          response,
          provider,
          model: config.modelId,
          fallbackUsed: provider !== config.provider,
        }
      } catch (error) {
        if (error instanceof AdapterError) {
          console.warn(`[Orchestrator] ${provider} error: ${error.message}`)
          continue
        }
        throw error
      }
    }

    throw new AdapterError(
      config.provider,
      `All providers failed: ${allProviders.join(', ')}`
    )
  }

  async *chatStream(
    messages: { role: string; content: string }[],
    config: ModelConfig,
    fallbackProviders: ModelConfig['provider'][] = []
  ): AsyncGenerator<string> {
    const allProviders = [config.provider, ...fallbackProviders]

    for (const provider of allProviders) {
      try {
        const adapter = await this.getAdapter(provider)
        const available = await adapter.isAvailable()

        if (!available) continue

        yield* adapter.chatStream(messages, {
          ...config,
          provider,
        })
        return
      } catch (error) {
        if (error instanceof AdapterError) {
          console.warn(`[Orchestrator] ${provider} stream error: ${error.message}`)
          continue
        }
        throw error
      }
    }

    throw new AdapterError(
      config.provider,
      `All providers failed for streaming: ${allProviders.join(', ')}`
    )
  }
}

// Singleton
export const orchestrator = new ModelOrchestrator()
