import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { systemPrompt } from '@/app/agent/context/raf-knowledge'

// Rate limiting: Track messages per session (IP-based, simple in-memory store)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const MAX_MESSAGES_PER_SESSION = 10
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour in milliseconds

function checkRateLimit(identifier: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const record = rateLimitMap.get(identifier)

  // Clean up old records
  if (record && now > record.resetAt) {
    rateLimitMap.delete(identifier)
  }

  const current = rateLimitMap.get(identifier)

  if (!current) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
    return { allowed: true, remaining: MAX_MESSAGES_PER_SESSION - 1 }
  }

  if (current.count >= MAX_MESSAGES_PER_SESSION) {
    return { allowed: false, remaining: 0 }
  }

  current.count++
  return { allowed: true, remaining: MAX_MESSAGES_PER_SESSION - current.count }
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    // Simple rate limiting based on session (in production, use proper rate limiting)
    const identifier = req.headers.get('x-forwarded-for') || 'anonymous'
    const rateLimit = checkRateLimit(identifier)

    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded. You\'ve reached the maximum of 10 messages. Try again later or reach out directly at raf@raf.works'
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Call OpenAI API with streaming
    const result = await streamText({
      model: openai('gpt-4-turbo'),
      system: systemPrompt,
      messages,
      temperature: 0.7,
    })

    // Return the stream with rate limit headers
    return result.toTextStreamResponse({
      headers: {
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Limit': MAX_MESSAGES_PER_SESSION.toString()
      }
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response(
      JSON.stringify({
        error: 'Something went wrong. Try again or reach me at raf@raf.works'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
