import type { ModelProvider } from '@/types'
import { type ModelAdapter, AdapterError } from './types'
export type { ModelAdapter } from './types'
export { AdapterError }

export async function createAdapter(provider: ModelProvider): Promise<ModelAdapter> {
  switch (provider) {
    case 'ollama': {
      const { OllamaAdapter } = await import('./ollama-adapter')
      return new OllamaAdapter()
    }
    case 'lmstudio': {
      const { LMStudioAdapter } = await import('./lmstudio-adapter')
      return new LMStudioAdapter()
    }
    case 'anthropic': {
      const { AnthropicAdapter } = await import('./anthropic-adapter')
      return new AnthropicAdapter()
    }
    case 'openrouter': {
      const { OpenRouterAdapter } = await import('./openrouter-adapter')
      return new OpenRouterAdapter()
    }
    default:
      throw new AdapterError(provider, `Unknown provider: ${provider}`)
  }
}
