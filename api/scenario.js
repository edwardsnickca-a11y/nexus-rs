const MAX_BODY_BYTES = 350_000
const DEFAULT_MODEL = process.env.OPENAI_SCENARIO_MODEL || process.env.OPENAI_MODEL || 'gpt-5-mini'

const ROLE_IDS = [
  'remote_sensing_coordinator',
  'remote_sensing_manager',
  'collection_manager',
  'upad_lno',
  'all',
]

const COLLECTIONS = [
  'requirements',
  'missions',
  'assets',
  'deliveries',
  'oversight',
  'exercise',
]

const SEVERITIES = ['low', 'medium', 'high', 'critical']
const PATCH_OPERATIONS = ['merge', 'append']

const responseSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'nextIncidentTime',
    'nextDecisionReason',
    'scenarioSummary',
    'hiddenWorldJson',
    'visibleFacts',
    'injects',
    'patches',
    'consequences',
    'advisorVisibleFacts',
    'aarObservations',
  ],
  properties: {
    nextIncidentTime: { type: 'string' },
    nextDecisionReason: { type: 'string' },
    scenarioSummary: { type: 'string' },
    hiddenWorldJson: {
      type: 'string',
      description: 'Compact JSON string containing continuity facts known only to the simulation controller.',
    },
    visibleFacts: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['audienceRole', 'incident', 'severity', 'text'],
        properties: {
          audienceRole: { type: 'string', enum: ROLE_IDS },
          incident: { type: 'string' },
          severity: { type: 'string', enum: SEVERITIES },
          text: { type: 'string' },
        },
      },
    },
    injects: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['title', 'text', 'priority', 'relatedRole', 'relatedIncident'],
        properties: {
          title: { type: 'string' },
          text: { type: 'string' },
          priority: { type: 'string', enum: SEVERITIES },
          relatedRole: { type: 'string', enum: ROLE_IDS },
          relatedIncident: { type: 'string' },
        },
      },
    },
    patches: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['collection', 'operation', 'id', 'changesJson', 'reason'],
        properties: {
          collection: { type: 'string', enum: COLLECTIONS },
          operation: { type: 'string', enum: PATCH_OPERATIONS },
          id: { type: 'string' },
          changesJson: {
            type: 'string',
            description: 'Compact JSON object encoded as a string.',
          },
          reason: { type: 'string' },
        },
      },
    },
    consequences: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['severity', 'incident', 'text', 'causedBy'],
        properties: {
          severity: { type: 'string', enum: SEVERITIES },
          incident: { type: 'string' },
          text: { type: 'string' },
          causedBy: { type: 'string' },
        },
      },
    },
    advisorVisibleFacts: {
      type: 'array',
      items: { type: 'string' },
    },
    aarObservations: {
      type: 'array',
      items: { type: 'string' },
    },
  },
}

const DIFFICULTY_GUIDANCE = {
  Introductory: `
Use clearer signals, slower tempo, fewer simultaneous pressures, responsive customers,
and generous recovery opportunities. Consequences should teach without removing agency.`,
  Standard: `
Use normal operational ambiguity, competing requirements, realistic delays, resource friction,
and consequences that are recoverable when the trainee coordinates effectively.`,
  Advanced: `
Use fragmented information, concurrent issues, tighter decision windows, changing resource
availability, and stronger production or coordination pressure. Do not become arbitrary.`,
  Expert: `
Use high tempo, subtle indicators, cascading but logical consequences, interagency friction,
changing customer needs, and limited recovery time. Remain fair and professionally realistic.`,
  Adaptive: `
Infer demonstrated trainee performance from the action record. Increase or decrease ambiguity,
tempo, concurrency, and consequence sensitivity without manufacturing random punishment.`,
}

function buildInstructions(mode, difficulty) {
  return `You are the NEXUS RS Simulation Controller.

You operate a dynamic remote-sensing coordination exercise. You are not Lt Col Edwards and you
do not speak directly to the trainee. You own hidden scenario truth, continuity, elapsed simulated
time, inject generation, and logical consequences.

SCENARIO SEED:
Generate and evolve an original Northern California multi-fire operating environment informed by
recurring patterns from historical wildfire operations in that region. Use realistic pressures such
as rapid fire growth, wind changes, smoke obscuration, evacuation-route concerns, isolated
communities, utility and infrastructure impacts, airspace restrictions, temporary flight restrictions,
competition for aviation resources, incomplete customer requirements, partner coordination,
sensor limitations, collection geometry, UPAD capacity, processing burden, dissemination delays,
and changing customer priorities.

Do not recreate a named historical fire unless the supplied scenario explicitly requires it.
Do not use a fixed turn count, fixed operational-period count, predetermined timeline, or single
correct solution. No two runs should be identical. Maintain continuity with hiddenWorldJson and
the current mission state.

MODE: ${mode}
- initialize: establish an original hidden world and vary the starting pressures while preserving
  the supplied application entities and role authority.
- advance: evaluate every recorded action since the last scenario evaluation, including what the
  trainee addressed, ignored, delayed, misunderstood, or coordinated effectively. Advance to a
  plausible next decision point; elapsed time may vary.

DIFFICULTY:
${DIFFICULTY_GUIDANCE[difficulty] || DIFFICULTY_GUIDANCE.Standard}

RULES:
- Developments must follow logically from hidden truth, elapsed time, current conditions, and
  trainee actions. Do not create random failures merely to increase difficulty.
- Allow multiple professionally reasonable approaches.
- Preserve role authority. State J3 controls allocation or recall of state-controlled assets.
- The RS Coordinator manages regional priorities, approved asset allocation, partner support,
  unmet needs, and collection-plan approval.
- The RS Manager manages execution for the assigned incident and its tasked assets. Other
  incidents matter only when they create a direct asset, priority, customer, or coordination impact.
- The Collection Manager develops requirements, EEIs, taskability, collection options, sortie decks,
  and collection-result evaluation.
- The UPAD LNO assigns whole sortie decks by default, manages specialty exceptions, shifts,
  production capacity, dissemination, delivery, and customer verification.
- Hidden truth must never be placed in visibleFacts, injects, advisorVisibleFacts, or scenarioSummary
  until the trainee has a plausible way to know it.
- Use GARGOYLE for MQ-9 callsign references, BEAR for UH-72 callsign references, and CAP for CAP.
- Do not leak raw application IDs in trainee-visible text unless operational ambiguity requires one.
- Patches may only modify supplied entities or append a new entity when logically necessary.
- changesJson must always encode a JSON object.
- Return only the required structured JSON.`
}

function extractOutputText(data) {
  if (typeof data?.output_text === 'string' && data.output_text.trim()) return data.output_text
  for (const item of data?.output || []) {
    for (const content of item?.content || []) {
      if (content?.type === 'output_text' && typeof content.text === 'string') return content.text
    }
  }
  return ''
}

function sendJson(response, status, body) {
  response.status(status)
  response.setHeader('Content-Type', 'application/json')
  response.setHeader('Cache-Control', 'no-store')
  response.send(JSON.stringify(body))
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return sendJson(response, 405, { error: 'Method not allowed', code: 'method_not_allowed' })
  }

  if (!process.env.OPENAI_API_KEY) {
    return sendJson(response, 503, { error: 'OPENAI_API_KEY is not configured', code: 'missing_openai_key' })
  }

  const contentLength = Number(request.headers['content-length'] || 0)
  if (contentLength > MAX_BODY_BYTES) {
    return sendJson(response, 413, { error: 'Request too large', code: 'request_too_large' })
  }

  const body = request.body && typeof request.body === 'object' ? request.body : {}
  const mode = body.mode === 'initialize' ? 'initialize' : 'advance'
  const difficulty = typeof body.difficulty === 'string' ? body.difficulty : 'Standard'
  const context = body.context && typeof body.context === 'object' ? body.context : null

  if (!context) {
    return sendJson(response, 400, { error: 'context is required', code: 'missing_context' })
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 55_000)

  try {
    const openAIResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        instructions: buildInstructions(mode, difficulty),
        input: [{
          role: 'user',
          content: [{
            type: 'input_text',
            text: `CONTROLLED EXERCISE CONTEXT
${JSON.stringify(context)}

Create the next valid simulation-controller state. Preserve continuity and role scope.`,
          }],
        }],
        text: {
          format: {
            type: 'json_schema',
            name: 'nexus_rs_scenario_controller',
            strict: true,
            schema: responseSchema,
          },
        },
      }),
    })

    const data = await openAIResponse.json().catch(() => ({}))

    if (!openAIResponse.ok) {
      return sendJson(response, openAIResponse.status, {
        error: data?.error?.message || 'OpenAI scenario request failed',
        code: data?.error?.code || 'openai_scenario_failed',
      })
    }

    const outputText = extractOutputText(data)
    if (!outputText) {
      return sendJson(response, 502, { error: 'OpenAI returned no scenario output', code: 'empty_scenario_response' })
    }

    let parsed
    try {
      parsed = JSON.parse(outputText)
    } catch {
      return sendJson(response, 502, { error: 'OpenAI returned invalid scenario JSON', code: 'invalid_scenario_json' })
    }

    const normalizedPatches = (parsed.patches || []).map((patch) => {
      let changes = {}
      try {
        const candidate = JSON.parse(patch.changesJson || '{}')
        if (candidate && typeof candidate === 'object' && !Array.isArray(candidate)) changes = candidate
      } catch {
        changes = {}
      }
      return { ...patch, changes }
    })

    let hiddenWorld = {}
    try {
      const candidate = JSON.parse(parsed.hiddenWorldJson || '{}')
      if (candidate && typeof candidate === 'object' && !Array.isArray(candidate)) hiddenWorld = candidate
    } catch {
      hiddenWorld = {}
    }

    return sendJson(response, 200, {
      result: {
        ...parsed,
        hiddenWorld,
        patches: normalizedPatches,
      },
      model: data.model || DEFAULT_MODEL,
      requestId: data.id || null,
    })
  } catch (error) {
    if (error?.name === 'AbortError') {
      return sendJson(response, 504, { error: 'Scenario request timed out', code: 'scenario_timeout' })
    }
    return sendJson(response, 500, { error: 'Scenario service failed', code: 'scenario_internal_error' })
  } finally {
    clearTimeout(timeout)
  }
}
