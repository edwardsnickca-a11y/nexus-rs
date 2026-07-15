import crypto from 'node:crypto'

const MODEL=process.env.OPENAI_SCENARIO_MODEL||process.env.OPENAI_MODEL||'gpt-5-mini'
const MAX_BODY_BYTES=450_000

const SEVERITIES=['low','medium','high','critical']
const ROLES=['remote_sensing_coordinator','remote_sensing_manager','collection_manager','upad_lno','all']

const initializationSchema={
  type:'object',
  additionalProperties:false,
  required:[
    'worldJson','hiddenWorldJson','advisorVisibleFacts',
    'initialInjects','initialDecisionPressure','aarObservations',
  ],
  properties:{
    worldJson:{type:'string',description:'Complete generated visible-world JSON encoded as a compact string.'},
    hiddenWorldJson:{type:'string',description:'Hidden continuity state JSON encoded as a compact string.'},
    advisorVisibleFacts:{type:'array',items:{type:'string'}},
    initialInjects:{
      type:'array',
      items:{
        type:'object',
        additionalProperties:false,
        required:['title','text','priority','relatedRole','relatedIncident'],
        properties:{
          title:{type:'string'},
          text:{type:'string'},
          priority:{type:'string',enum:SEVERITIES},
          relatedRole:{type:'string',enum:ROLES},
          relatedIncident:{type:'string'},
        },
      },
    },
    initialDecisionPressure:{type:'string'},
    aarObservations:{type:'array',items:{type:'string'}},
  },
}

const advanceSchema={
  type:'object',
  additionalProperties:false,
  required:[
    'nextIncidentTime','nextDecisionReason','scenarioSummary','hiddenWorldJson',
    'visibleFacts','injects','patches','consequences','advisorVisibleFacts','aarObservations',
  ],
  properties:{
    nextIncidentTime:{type:'string'},
    nextDecisionReason:{type:'string'},
    scenarioSummary:{type:'string'},
    hiddenWorldJson:{type:'string'},
    visibleFacts:{
      type:'array',
      items:{
        type:'object',
        additionalProperties:false,
        required:['audienceRole','incident','severity','text'],
        properties:{
          audienceRole:{type:'string',enum:ROLES},
          incident:{type:'string'},
          severity:{type:'string',enum:SEVERITIES},
          text:{type:'string'},
        },
      },
    },
    injects:{
      type:'array',
      items:{
        type:'object',
        additionalProperties:false,
        required:['title','text','priority','relatedRole','relatedIncident'],
        properties:{
          title:{type:'string'},
          text:{type:'string'},
          priority:{type:'string',enum:SEVERITIES},
          relatedRole:{type:'string',enum:ROLES},
          relatedIncident:{type:'string'},
        },
      },
    },
    patches:{
      type:'array',
      items:{
        type:'object',
        additionalProperties:false,
        required:['collection','operation','id','changesJson','reason'],
        properties:{
          collection:{type:'string',enum:['requirements','missions','assets','deliveries','oversight','exercise']},
          operation:{type:'string',enum:['merge','append']},
          id:{type:'string'},
          changesJson:{type:'string'},
          reason:{type:'string'},
        },
      },
    },
    consequences:{
      type:'array',
      items:{
        type:'object',
        additionalProperties:false,
        required:['severity','incident','text','causedBy'],
        properties:{
          severity:{type:'string',enum:SEVERITIES},
          incident:{type:'string'},
          text:{type:'string'},
          causedBy:{type:'string'},
        },
      },
    },
    advisorVisibleFacts:{type:'array',items:{type:'string'}},
    aarObservations:{type:'array',items:{type:'string'}},
  },
}

const difficultyRules={
  Introductory:'Use clearer signals, slower tempo, fewer concurrent problems, more complete requirements, responsive customers, and generous recovery opportunities.',
  Standard:'Use normal ambiguity, competing requirements, realistic delays, moderate resource friction, and recoverable consequences.',
  Advanced:'Use fragmented information, concurrent issues, tighter decision windows, stronger production and coordination pressure, and reduced recovery time.',
  Expert:'Use high tempo, subtle indicators, logical cascading consequences, interagency friction, changing customer needs, and limited recovery opportunities while remaining fair.',
  Adaptive:'Infer demonstrated performance and adjust ambiguity, tempo, concurrency, customer responsiveness, and consequence sensitivity without arbitrary punishment.',
}

function instructions(mode,difficulty){
  return `You are the NEXUS RS Scenario Controller, not Lt Col Edwards.

Operate an unclassified domestic remote-sensing leadership exercise for Northern California wildfire
operations. Maintain hidden truth, continuity, simulated time, injects, consequences, customer
behavior, resource availability, airspace conditions, fire behavior, production pressure, and AAR
observations.

${mode==='initialize'?`
INITIALIZATION MODE:
Generate an entirely fresh world with 2–5 simultaneous incidents. Replace every static incident,
customer, requirement, mission, asset assignment, product, delivery, UPAD condition, airspace issue,
and hidden condition. Do not preserve Pine Ridge, Bear Creek, Eagle Peak, or any demo storyline.
Use real Northern California cities, counties, and recognized operational areas. Do not invent
counties, cities, tribal jurisdictions, or geographic features. Do not recreate a named historical fire.
No two runs should be identical. The supplied randomization nonce must materially affect the world.

The worldJson must encode an object containing:
mode="initialize", generationSeed, scenarioTitle, scenarioTime formatted HHMM PT,
localTimeZone="America/Los_Angeles", difficulty, selectedRole, incidentCount,
incidents, customers, requirements, missions, assets, sorties, collectionDecks, upads,
products, deliveries, airspace, oversightIssues, deadlines, visibleOpeningState.
Each incident-specific entity needs a stable unique ID and valid references.

Create 2–5 incidents. Use only approved platform types MQ-9, UH-72, and CAP.
Use callsigns GARGOYLE, BEAR, and CAP. Do not invent exact endurance, range, resolution,
weather thresholds, or other unsupported specifications. Requirements should vary in quality.
Some may need clarification. Include realistic current-operations and future-planning pressure.
`:`
ADVANCE MODE:
Evaluate every recorded action since the prior scenario evaluation, including what the trainee
completed, ignored, delayed, misunderstood, or coordinated effectively. Advance simulated time
to the next plausible decision point; elapsed time may vary. Developments must logically follow
hidden truth, visible state, elapsed time, difficulty, and trainee action. Do not create random chaos.
Allow multiple professionally reasonable approaches. Preserve entity IDs.
`}

DIFFICULTY:
${difficultyRules[difficulty]||difficultyRules.Standard}

AUTHORITY:
State J3 controls allocation or recall of state-controlled assets.
The RS Coordinator owns regional priority and approved allocation.
The RS Manager owns execution for one assigned incident and coordinates crew feasibility before
recommending regional changes.
The Collection Manager owns requirement development, EEIs, taskability, collection options, and decks.
The UPAD LNO owns sortie-to-UPAD production assignment, specialties, shifts, delivery, and receipt.

VISIBILITY:
Hidden truth must remain hidden until the trainee has a plausible way to learn it.
Edwards receives only advisorVisibleFacts and role-visible state.
Use operational names and callsigns in visible text. Do not expose raw IDs unless ambiguity requires it.
Use local incident time only; no trainee-facing Zulu time.
Return only the required structured JSON.`
}

function extractText(data){
  if(typeof data?.output_text==='string'&&data.output_text.trim()) return data.output_text
  for(const item of data?.output||[]){
    for(const content of item?.content||[]){
      if(content?.type==='output_text'&&typeof content.text==='string') return content.text
    }
  }
  return ''
}

function parseObject(text,fallback={}){
  try{
    const value=JSON.parse(text||'{}')
    return value&&typeof value==='object'&&!Array.isArray(value)?value:fallback
  }catch{
    return fallback
  }
}

function send(res,status,body){
  res.status(status)
  res.setHeader('Content-Type','application/json')
  res.setHeader('Cache-Control','no-store')
  res.send(JSON.stringify(body))
}

export default async function handler(req,res){
  if(req.method!=='POST'){
    res.setHeader('Allow','POST')
    return send(res,405,{error:'Method not allowed',code:'method_not_allowed'})
  }
  if(!process.env.OPENAI_API_KEY){
    return send(res,503,{error:'OPENAI_API_KEY is not configured',code:'missing_openai_key'})
  }
  if(Number(req.headers['content-length']||0)>MAX_BODY_BYTES){
    return send(res,413,{error:'Request too large',code:'request_too_large'})
  }

  const mode=req.body?.mode==='initialize'?'initialize':'advance'
  const context=req.body?.context
  if(!context||typeof context!=='object'){
    return send(res,400,{error:'context is required',code:'missing_context'})
  }
  const difficulty=context.difficulty||'Standard'
  const nonce=context.randomizationNonce||crypto.randomUUID()
  const controller=new AbortController()
  const timeout=setTimeout(()=>controller.abort(),70_000)

  try{
    const response=await fetch('https://api.openai.com/v1/chat/completions',{
      method:'POST',
      headers:{
        Authorization:`Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type':'application/json',
      },
      signal:controller.signal,
      body:JSON.stringify({
        model:MODEL,
        max_tokens:4000,
        temperature:1,
        messages:[{
          role:'user',
          content:`${instructions(mode,difficulty)}

RANDOMIZATION NONCE: ${nonce}

CONTROLLED EXERCISE CONTEXT
${JSON.stringify(context)}

Generate the next authoritative Scenario Controller state.`,
        }],
      }),
    })

    const data=await response.json().catch(()=>({}))
    if(!response.ok){
      return send(res,response.status,{error:data?.error?.message||'OpenAI Scenario Controller failed',code:data?.error?.type||'openai_scenario_failed'})
    }
    const output=data?.choices?.[0]?.message?.content||''
    if(!output) return send(res,502,{error:'OpenAI returned no scenario output',code:'empty_scenario_response'})

    let parsed
    try{ parsed=JSON.parse(output) }
    catch{ return send(res,502,{error:'OpenAI returned invalid scenario JSON',code:'invalid_scenario_json'}) }

    if(mode==='initialize'){
      const world=parseObject(parsed.worldJson,{})
      const hiddenWorld=parseObject(parsed.hiddenWorldJson,{})
      const result={
        ...world,
        mode:'initialize',
        hiddenWorld,
        advisorVisibleFacts:parsed.advisorVisibleFacts||[],
        initialInjects:parsed.initialInjects||[],
        initialDecisionPressure:parsed.initialDecisionPressure||'',
        aarObservations:parsed.aarObservations||[],
      }
      return send(res,200,{result,model:data.model||MODEL,requestId:data.id||null})
    }

    const patches=(parsed.patches||[]).map(patch=>({
      ...patch,
      changes:parseObject(patch.changesJson,{}),
    }))
    const result={
      ...parsed,
      hiddenWorld:parseObject(parsed.hiddenWorldJson,{}),
      patches,
    }
    return send(res,200,{result,model:data.model||MODEL,requestId:data.id||null})
  }catch(error){
    if(error?.name==='AbortError') return send(res,504,{error:'Scenario request timed out',code:'scenario_timeout'})
    return send(res,500,{error:'Scenario service failed',code:'scenario_internal_error'})
  }finally{
    clearTimeout(timeout)
  }
}
