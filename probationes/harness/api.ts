// OpenRouter API client

import OpenAI from 'openai'

const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': 'https://github.com/ianzepp/faber-trials',
    'X-Title': 'Faber Language Trials',
  },
})

export interface APIResponse {
  content: string
  tokens_in: number
  tokens_out: number
  latency_ms: number
}

const MAX_RETRIES = 5
const BASE_DELAY_MS = 1000

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function callModel(
  modelName: string,
  prompt: string,
  temperature: number,
  maxTokens: number,
  seed?: number
): Promise<APIResponse> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const startTime = Date.now()

      const completion = await client.chat.completions.create({
        model: modelName,
        messages: [{ role: 'user', content: prompt }],
        temperature,
        max_tokens: maxTokens,
        seed,
      })

      const latency_ms = Date.now() - startTime

      return {
        content: completion.choices[0]?.message?.content || '',
        tokens_in: completion.usage?.prompt_tokens || 0,
        tokens_out: completion.usage?.completion_tokens || 0,
        latency_ms,
      }
    }
    catch (error: any) {
      lastError = error

      // Retry on rate limit (429) or server errors (5xx)
      const status = error?.status || error?.response?.status
      if (status === 429 || (status >= 500 && status < 600)) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt)
        await sleep(delay)
        continue
      }

      // Don't retry other errors
      throw error
    }
  }

  throw lastError || new Error('Max retries exceeded')
}
