export async function requestScenarioEvolution({ mode='advance', difficulty='Standard', context, signal }) {
  const response = await fetch('/api/scenario', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({mode,difficulty,context}),
    signal,
  })

  const body = await response.json().catch(()=>({}))
  if (!response.ok) {
    const error = new Error(body.error || 'Scenario service unavailable')
    error.code = body.code || `http_${response.status}`
    throw error
  }

  if (!body.result || typeof body.result !== 'object') {
    const error = new Error('Scenario service returned an invalid result')
    error.code = 'invalid_scenario_result'
    throw error
  }

  return body.result
}
