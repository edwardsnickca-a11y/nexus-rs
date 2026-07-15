// Simple advisor endpoint for clarification responses
// Uses OpenAI API — returns plain text in customer's voice

const MAX_BODY_BYTES = 50_000

function sendJson(response, status, body) {
  response.status(status)
  response.setHeader('Content-Type', 'application/json')
  response.setHeader('Cache-Control', 'no-store')
  response.send(JSON.stringify(body))
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return sendJson(response, 405, { error: 'Method not allowed' })
  }

  if (!process.env.OPENAI_API_KEY) {
    return sendJson(response, 503, { error: 'OPENAI_API_KEY not configured' })
  }

  const contentLength = Number(request.headers['content-length'] || 0)
  if (contentLength > MAX_BODY_BYTES) {
    return sendJson(response, 413, { error: 'Request too large' })
  }

  const body = request.body && typeof request.body === 'object' ? request.body : {}
  const exactText = typeof body.exactText === 'string' ? body.exactText.trim().slice(0, 8000) : ''

  if (!exactText) {
    return sendJson(response, 400, { error: 'exactText is required' })
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30_000)

  try {
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: exactText,
          },
        ],
      }),
    })

    const data = await openaiResponse.json().catch(() => ({}))

    if (!openaiResponse.ok) {
      const message = data?.error?.message || 'OpenAI API request failed'
      return sendJson(response, openaiResponse.status, {
        error: message,
        code: data?.error?.type || 'api_error',
      })
    }

    const responseText = data.choices?.[0]?.message?.content || ''
    if (!responseText) {
      return sendJson(response, 502, { error: 'No response text from OpenAI' })
    }

    return sendJson(response, 200, {
      interpretation: responseText,
      model: data.model || 'gpt-4o-mini',
      requestId: data.id || null,
    })
  } catch (error) {
    if (error?.name === 'AbortError') {
      return sendJson(response, 504, { error: 'Request timed out' })
    }
    return sendJson(response, 500, { error: 'Service failed' })
  } finally {
    clearTimeout(timeout)
  }
}
