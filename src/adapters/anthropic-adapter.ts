import type { ModelConfig, ModelResponse } from '@/types'
import { type ModelAdapter, AdapterError } from './index'

export class AnthropicAdapter implements ModelAdapter {
  provider = 'anthropic' as const

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'test',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-haiku-20241022',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'test' }],
        }),
        signal: AbortSignal.timeout(5000),
      })
      // Even a 401 means the API is reachable
      return response.status === 401 || response.ok
    } catch {
      return false
    }
  }

  async chat(
    messages: { role: string; content: string }[],
    config: ModelConfig
  ): Promise<ModelResponse> {
    try {
      const baseUrl = config.baseUrl || 'https://api.anthropic.com'
      const response = await fetch(`${baseUrl}/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.apiKey ?? '',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: config.modelId,
          max_tokens: config.maxTokens,
          temperature: config.temperature,
          top_p: config.topP,
          stop_sequences: config.stop,
          messages,
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new AdapterError('anthropic', error.error?.message ?? `HTTP ${response.status}`)
      }

      const data = await response.json()
      const content = data.content?.[0]?.text ?? ''

      return {
        content,
        model: data.model ?? config.modelId,
        provider: 'anthropic',
        usage: {
          promptTokens: data.usage?.input_tokens ?? 0,
          completionTokens: data.usage?.output_tokens ?? 0,
          totalTokens: (data.usage?.input_tokens ?? 0) + (data.usage?.output_tokens ?? 0),
        },
        finishReason: data.stop_reason ?? 'stop',
      }
    } catch (error) {
      if (error instanceof AdapterError) throw error
      throw new AdapterError('anthropic', 'Request failed', error as Error)
    }
  }

  async *chatStream(
    messages: { role: string; content: string }[],
    config: ModelConfig
  ): AsyncGenerator<string> {
    const baseUrl = config.baseUrl || 'https://api.anthropic.com'
    const response = await fetch(`${baseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey ?? '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: config.modelId,
        max_tokens: config.maxTokens,
        temperature: config.temperature,
        top_p: config.topP,
        stop_sequences: config.stop,
        messages,
        stream: true,
      }),
    })

    if (!response.ok) {
      throw new AdapterError('anthropic', `HTTP ${response.status}`)
    }

    const reader = response.body?.getReader()
    if (!reader) throw new AdapterError('anthropic', 'No response body')

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        try {
          const data = JSON.parse(line.slice(6))
          if (data.type === 'content_block_delta') {
            yield data.delta?.text ?? ''
          }
        } catch {
          // Skip invalid JSON lines
        }
      }
    }
  }
}
