export async function requestAdvisorInterpretation({ exactText, role, context, signal }) {
  const response = await fetch('/api/advisor', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({exactText,role,context}),
    signal,
  })
  const body = await response.json().catch(()=>({}))
  if (!response.ok) {
    const error = new Error(body.error || 'Advisor service unavailable')
    error.code = body.code || `http_${response.status}`
    throw error
  }
  return body
}
