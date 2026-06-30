import type { ModelConfig, ModelResponse, ModelProvider } from '@/types'

export interface ModelAdapter {
  provider: ModelProvider
  isAvailable(): Promise<boolean>
  chat(messages: { role: string; content: string }[], config: ModelConfig): Promise<ModelResponse>
  chatStream(messages: { role: string; content: string }[], config: ModelConfig): AsyncGenerator<string>
}

export class AdapterError extends Error {
  provider: ModelProvider
  cause?: Error

  constructor(provider: ModelProvider, message: string, cause?: Error) {
    super(`[${provider}] ${message}`)
    this.name = 'AdapterError'
    this.provider = provider
    this.cause = cause
  }
}
