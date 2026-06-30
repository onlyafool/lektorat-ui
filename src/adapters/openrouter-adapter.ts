import type { ModelConfig, ModelResponse } from '@/types'
import { type ModelAdapter, AdapterError } from './index'

export class OpenRouterAdapter implements ModelAdapter {
  provider = 'openrouter' as const

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        signal: AbortSignal.timeout(5000),
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
      const baseUrl = config.baseUrl || 'https://openrouter.ai'
      const response = await fetch(`${baseUrl}/api/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiKey ?? ''}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Lektorat UI',
        },
        body: JSON.stringify({
          model: config.modelId,
          messages,
          temperature: config.temperature,
          max_tokens: config.maxTokens,
          top_p: config.topP,
          stop: config.stop,
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new AdapterError('openrouter', error.error?.message ?? `HTTP ${response.status}`)
      }

      const data = await response.json()
      const choice = data.choices?.[0]

      return {
        content: choice?.message?.content ?? '',
        model: data.model ?? config.modelId,
        provider: 'openrouter',
        usage: {
          promptTokens: data.usage?.prompt_tokens ?? 0,
          completionTokens: data.usage?.completion_tokens ?? 0,
          totalTokens: data.usage?.total_tokens ?? 0,
        },
        finishReason: choice?.finish_reason ?? 'stop',
      }
    } catch (error) {
      if (error instanceof AdapterError) throw error
      throw new AdapterError('openrouter', 'Request failed', error as Error)
    }
  }

  async *chatStream(
    messages: { role: string; content: string }[],
    config: ModelConfig
  ): AsyncGenerator<string> {
    const baseUrl = config.baseUrl || 'https://openrouter.ai'
    const response = await fetch(`${baseUrl}/api/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey ?? ''}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Lektorat UI',
      },
      body: JSON.stringify({
        model: config.modelId,
        messages,
        temperature: config.temperature,
        max_tokens: config.maxTokens,
        top_p: config.topP,
        stop: config.stop,
        stream: true,
      }),
    })

    if (!response.ok) {
      throw new AdapterError('openrouter', `HTTP ${response.status}`)
    }

    const reader = response.body?.getReader()
    if (!reader) throw new AdapterError('openrouter', 'No response body')

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
        const data = line.slice(6)
        if (data === '[DONE]') break
        try {
          const parsed = JSON.parse(data)
          const content = parsed.choices?.[0]?.delta?.content
          if (content) yield content
        } catch {
          // Skip invalid JSON lines
        }
      }
    }
  }
}
