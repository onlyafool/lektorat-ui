import type { ModelConfig, ModelResponse } from '@/types'
import { type ModelAdapter, AdapterError } from './index'

export class OllamaAdapter implements ModelAdapter {
  provider = 'ollama' as const

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch('http://localhost:11434/api/tags', {
        signal: AbortSignal.timeout(3000),
      })
      return response.ok
    } catch {
      return false
    }
  }

  async chat(
    messages: { role: string; content: string }[],
    config: ModelConfig
  ): Promise<ModelResponse> {
    try {
      const response = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: config.modelId,
          messages,
          options: {
            temperature: config.temperature,
            num_predict: config.maxTokens,
            top_p: config.topP,
            stop: config.stop,
          },
          stream: false,
        }),
      })

      if (!response.ok) {
        throw new AdapterError('ollama', `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      return {
        content: data.message?.content ?? '',
        model: data.model ?? config.modelId,
        provider: 'ollama',
        usage: {
          promptTokens: data.prompt_eval_count ?? 0,
          completionTokens: data.eval_count ?? 0,
          totalTokens: (data.prompt_eval_count ?? 0) + (data.eval_count ?? 0),
        },
        finishReason: data.done ? 'stop' : 'length',
      }
    } catch (error) {
      if (error instanceof AdapterError) throw error
      throw new AdapterError('ollama', 'Connection failed', error as Error)
    }
  }

  async *chatStream(
    messages: { role: string; content: string }[],
    config: ModelConfig
  ): AsyncGenerator<string> {
    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.modelId,
        messages,
        options: {
          temperature: config.temperature,
          num_predict: config.maxTokens,
          top_p: config.topP,
          stop: config.stop,
        },
        stream: true,
      }),
    })

    if (!response.ok) {
      throw new AdapterError('ollama', `HTTP ${response.status}: ${response.statusText}`)
    }

    const reader = response.body?.getReader()
    if (!reader) throw new AdapterError('ollama', 'No response body')

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        if (!line.trim()) continue
        try {
          const data = JSON.parse(line)
          if (data.message?.content) {
            yield data.message.content
          }
        } catch {
          // Skip invalid JSON lines
        }
      }
    }
  }
}
