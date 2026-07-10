const ACTIONS = new Set([
  'clarify_requirement','reprioritize_requirement','request_asset_support','assign_available_asset',
  'propose_mission','approve_collection_plan','retask_mission','initiate_gain_loss_review',
  'update_product_priority','record_dissemination','verify_customer_receipt','request_recollection',
  'elevate_oversight_case','add_coordination_note','no_state_action',
])
const STATUSES = new Set(['within_authority','requires_coordination','outside_authority','unclear'])
const list = (value) => Array.isArray(value) ? value.filter((x)=>typeof x === 'string') : []
const clean = (value, fallback='') => typeof value === 'string' ? value.slice(0,4000) : fallback

function entitySets(state) {
  return {
    requirementIds:new Set((state.requirements?.items || []).map((x)=>x.id)),
    assetIds:new Set((state.assetControl?.assets || []).map((x)=>x.id)),
    missionIds:new Set((state.currentOps?.missions || []).map((x)=>x.id)),
    productIds:new Set((state.dissemination?.deliveries || []).map((x)=>x.id)),
    oversightCaseIds:new Set((state.oversight?.cases || []).map((x)=>x.id)),
  }
}

export function validateAdvisorResponse(raw, state) {
  let value = raw
  if (typeof raw === 'string') {
    try { value = JSON.parse(raw) } catch { return { ok:false, error:'invalid_json' } }
  }
  if (!value || typeof value !== 'object') return { ok:false,error:'invalid_shape' }
  const authority = value.authorityAssessment || {}
  const entities = value.referencedEntities || {}
  const sets = entitySets(state)
  const sanitizedEntities = {}
  for (const key of Object.keys(sets)) {
    const values = list(entities[key])
    if (values.some((id)=>!sets[key].has(id))) return { ok:false,error:`unknown_${key}` }
    sanitizedEntities[key]=values
  }
  const action = value.proposedAction || {type:'no_state_action',payload:{}}
  if (!ACTIONS.has(action.type)) return { ok:false,error:'action_not_allowed' }
  const status = STATUSES.has(authority.status) ? authority.status : 'unclear'
  const result = {
    advisorMessage:clean(value.advisorMessage,'I need you to clarify the intended operational effect and affected record before I can assess the decision.'),
    interpretedIntent:clean(value.interpretedIntent),
    decisionType:clean(value.decisionType,'advisory'),
    authorityAssessment:{
      status,
      explanation:clean(authority.explanation,'Authority could not be confirmed from the response.'),
      requiredCoordination:list(authority.requiredCoordination),
    },
    referencedEntities:sanitizedEntities,
    missingInformation:list(value.missingInformation),
    operationalConsiderations:list(value.operationalConsiderations),
    possibleConsequences:list(value.possibleConsequences),
    recommendedNextStep:clean(value.recommendedNextStep),
    requiresUserConfirmation:Boolean(value.requiresUserConfirmation || action.type !== 'no_state_action'),
    proposedAction:{type:action.type,payload:action.payload && typeof action.payload==='object' ? action.payload : {}},
  }
  return {ok:true,value:result}
}

export function deterministicFallback(exactText, state, activeRole, evaluated) {
  const lower=exactText.toLowerCase()
  let status='unclear'
  let explanation='The local advisor could not confidently map this statement to a controlled state action.'
  const coordination=[]
  if (activeRole==='collection_manager' && /launch|fly|retask|assign.*(mq|luh|cap)|command/i.test(lower)) {
    status='outside_authority'
    explanation='The Collection Manager may develop, validate, and prioritize the requirement, but may not command or retask aircraft.'
    coordination.push('Remote Sensing Manager','Remote Sensing Coordinator')
  } else if (activeRole==='upad_lno' && /priority|product|disseminat|receipt/i.test(lower)) {
    status='within_authority'
    explanation='Product prioritization and dissemination coordination are within the UPAD LNO role, subject to linked record validation.'
  } else if (evaluated?.decisionRecord?.withinRoleAuthority === false) {
    status='outside_authority'
    explanation=evaluated.decisionRecord.authorityAssessment || 'The requested action exceeds the active role authority.'
  } else if (evaluated) {
    status=evaluated.decisionRecord?.requiredFollowUp ? 'requires_coordination' : 'within_authority'
    explanation=evaluated.decisionRecord?.authorityAssessment || 'The deterministic advisor evaluated the statement against the active role.'
  }
  return {
    advisorMessage:evaluated?.advisorText || `${explanation} Identify the requirement, mission, asset, or product you intend to affect and the coordination path you will use.`,
    interpretedIntent:evaluated?.decisionRecord?.interpretedDecision || exactText,
    decisionType:evaluated?.decisionRecord?.type || 'free_text_decision',
    authorityAssessment:{status,explanation,requiredCoordination:coordination},
    referencedEntities:{requirementIds:[],assetIds:[],missionIds:[],productIds:[],oversightCaseIds:[]},
    missingInformation:status==='unclear'?['Affected record ID','Intended operational effect']:[],
    operationalConsiderations:[],
    possibleConsequences:[],
    recommendedNextStep:'Clarify or confirm the decision before changing authoritative mission state.',
    requiresUserConfirmation:false,
    proposedAction:{type:'no_state_action',payload:{}},
  }
}
