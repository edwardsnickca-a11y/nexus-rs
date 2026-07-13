const list = (value) => Array.isArray(value) ? value : []
const take = (value, count = 12) => list(value).slice(-count)

function safeDifficulty(state) {
  return state.exercise?.difficulty ||
    state.exercise?.selectedDifficulty ||
    state.scenario?.difficulty ||
    'Standard'
}

function compactRequirement(item) {
  return {
    id:item.id,
    incident:item.fire||item.incident||'',
    title:item.title||'',
    customer:item.customer||item.who||'',
    status:item.status||'',
    priority:item.priority||null,
    decisionToSupport:item.decisionToSupport||'',
    where:item.where||item.nai||'',
    when:item.when||'',
    requiredEffect:item.requiredEffect||'',
    eeis:take(item.eeis,6),
    missingFields:item.missingFields||[],
  }
}

function compactMission(item) {
  return {
    id:item.id,
    incident:item.fire||item.incident||'',
    callsign:item.callsign||item.platform||'',
    platform:item.platform||'',
    requirementId:item.requirementId||'',
    assetId:item.assetId||'',
    window:item.window||'',
    objective:item.objective||'',
    status:item.status||'',
    protected:Boolean(item.protected),
    risk:item.risk||'',
    coordinatorNotified:Boolean(item.coordinatorNotified),
  }
}

function compactAsset(item) {
  return {
    id:item.id,
    callsign:item.callsign||item.identifier||'',
    type:item.type||'',
    status:item.status||'',
    assignment:item.assignment||'',
    missionId:item.missionId||'',
    recallRisk:item.recallRisk||'',
    notes:item.notes||'',
  }
}

function compactDelivery(item) {
  return {
    id:item.id,
    incident:item.fire||item.incident||'',
    requirementId:item.requirementId||'',
    missionId:item.missionId||'',
    customer:item.customer||'',
    productType:item.productType||'',
    assignedUpad:item.assignedUpad||'',
    processingStatus:item.processingStatus||'',
    assessmentStatus:item.assessmentStatus||'',
    deliveryStatus:item.deliveryStatus||'',
    receiptStatus:item.receiptStatus||'',
    deliveryDeadline:item.deliveryDeadline||'',
    estimatedDelivery:item.estimatedDelivery||'',
  }
}

export function buildScenarioContext(state, mode = 'advance') {
  const director = state.simulation?.scenarioDirector || {}
  const lastDecisionCount = Number(director.lastEvaluatedDecisionCount || 0)
  const allDecisions = list(state.decisions)
  const actionsSinceLastTurn = allDecisions.slice(lastDecisionCount).map((item) => ({
    id:item.id,
    role:item.role,
    time:item.asOf,
    type:item.type,
    exactText:item.exactText||'',
    detail:item.interpretedDecision||item.detail||'',
    authorityAssessment:item.authorityAssessment||'',
    userConfirmed:Boolean(item.userConfirmed),
  }))

  return {
    mode,
    scenarioSeed: {
      id:state.exercise?.scenarioId||state.scenario?.id||'northern-california-multi-fire',
      name:state.exercise?.scenarioName||state.scenario?.name||'Northern California Multi-Fire Response',
      location:state.scenario?.location||'Northern California',
      description:state.scenario?.description||'Multiple wildfires competing for remote-sensing support.',
      exerciseFocus:state.exercise?.exerciseFocus||'Full Mission Cycle',
      operationalContext:state.exercise?.operationalContext||'',
    },
    difficulty:safeDifficulty(state),
    role:state.exercise?.selectedRole||state.activeRole||'remote_sensing_coordinator',
    assignedIncident:state.exercise?.assignedIncident||state.activeIncident||'',
    currentIncidentTime:state.exercise?.localIncidentTime||state.asOf||'',
    currentTurn:Number(state.exercise?.turnNumber||0),
    hiddenWorld:director.hiddenWorld||{},
    priorScenarioSummary:director.lastScenarioSummary||'',
    priorRevealedFacts:take(director.revealedFacts,20),
    priorInjects:take(state.simulation?.injects,20),
    actionsSinceLastTurn,
    missionState: {
      requirements:list(state.requirements?.items).map(compactRequirement),
      missions:list(state.currentOps?.missions).map(compactMission),
      assets:list(state.assetControl?.assets).map(compactAsset),
      deliveries:list(state.dissemination?.deliveries).map(compactDelivery),
      oversight:list(state.oversight?.cases).map((item)=>({
        id:item.id,
        requirementId:item.requirementId||'',
        status:item.status||'',
        severity:item.severity||'',
        uncertainty:item.uncertainty||'',
      })),
      openDecisionWindows:list(state.exercise?.decisionWindows).filter((item)=>!item.status||item.status==='open'),
      blockers:list(state.tomorrowPlan?.blockers),
      recentMissionUpdates:take(state.missionUpdates,12),
    },
  }
}

function mergeById(items, id, changes) {
  let found = false
  const next = list(items).map((item) => {
    if (item.id !== id) return item
    found = true
    return { ...item, ...changes }
  })
  return { items:next, found }
}

function applyPatch(state, patch) {
  const changes = patch?.changes && typeof patch.changes === 'object' ? patch.changes : {}
  const id = patch?.id || ''
  const append = patch?.operation === 'append'

  if (patch.collection === 'requirements') {
    const current = list(state.requirements?.items)
    if (append) return { ...state, requirements:{...(state.requirements||{}),items:[...current,{id,...changes}]} }
    const merged = mergeById(current,id,changes)
    return merged.found ? { ...state, requirements:{...(state.requirements||{}),items:merged.items} } : state
  }

  if (patch.collection === 'missions') {
    const current = list(state.currentOps?.missions)
    if (append) return { ...state, currentOps:{...(state.currentOps||{}),missions:[...current,{id,...changes}]} }
    const merged = mergeById(current,id,changes)
    return merged.found ? { ...state, currentOps:{...(state.currentOps||{}),missions:merged.items} } : state
  }

  if (patch.collection === 'assets') {
    const current = list(state.assetControl?.assets)
    if (append) return { ...state, assetControl:{...(state.assetControl||{}),assets:[...current,{id,...changes}]} }
    const merged = mergeById(current,id,changes)
    return merged.found ? { ...state, assetControl:{...(state.assetControl||{}),assets:merged.items} } : state
  }

  if (patch.collection === 'deliveries') {
    const current = list(state.dissemination?.deliveries)
    if (append) return { ...state, dissemination:{...(state.dissemination||{}),deliveries:[...current,{id,...changes}]} }
    const merged = mergeById(current,id,changes)
    return merged.found ? { ...state, dissemination:{...(state.dissemination||{}),deliveries:merged.items} } : state
  }

  if (patch.collection === 'oversight') {
    const current = list(state.oversight?.cases)
    if (append) return { ...state, oversight:{...(state.oversight||{}),cases:[...current,{id,...changes}]} }
    const merged = mergeById(current,id,changes)
    return merged.found ? { ...state, oversight:{...(state.oversight||{}),cases:merged.items} } : state
  }

  if (patch.collection === 'exercise') {
    return { ...state, exercise:{...(state.exercise||{}),...changes} }
  }

  return state
}

export function applyScenarioResult(state, result, mode = 'advance') {
  if (!result || typeof result !== 'object') return state

  let next = state
  for (const patch of list(result.patches)) next = applyPatch(next,patch)

  const previousDirector = next.simulation?.scenarioDirector || {}
  const now = result.nextIncidentTime || next.exercise?.localIncidentTime || next.asOf || 'CURRENT LOCAL'
  const newInjects = list(result.injects).map((item,index)=>({
    id:`scenario-inject-${Date.now()}-${index+1}`,
    code:`AI-${Date.now()}-${index+1}`,
    title:item.title,
    text:item.text,
    priority:String(item.priority||'medium').toUpperCase(),
    relatedRole:item.relatedRole,
    relatedIncident:item.relatedIncident,
    deadline:now,
    createdAt:now,
    source:'scenario_controller',
  }))
  const missionUpdates = [
    ...(next.missionUpdates||[]),
    ...list(result.visibleFacts).map((item,index)=>({
      id:`scenario-fact-${Date.now()}-${index+1}`,
      time:now,
      title:item.incident ? `${item.incident} Update` : 'Scenario Update',
      message:item.text,
      category:'scenario',
      severity:item.severity,
      audienceRole:item.audienceRole,
    })),
    ...list(result.consequences).map((item,index)=>({
      id:`scenario-consequence-${Date.now()}-${index+1}`,
      time:now,
      title:item.incident ? `${item.incident} Consequence` : 'Exercise Consequence',
      message:item.text,
      category:'consequence',
      severity:item.severity,
      causedBy:item.causedBy,
    })),
  ]

  return {
    ...next,
    asOf:now,
    exercise:{
      ...(next.exercise||{}),
      localIncidentTime:now,
      turnNumber:mode==='advance' ? Number(next.exercise?.turnNumber||0)+1 : Number(next.exercise?.turnNumber||1),
    },
    missionUpdates,
    simulation:{
      ...(next.simulation||{}),
      injects:[...(next.simulation?.injects||[]),...newInjects],
      scenarioDirector:{
        ...previousDirector,
        status:'ready',
        hiddenWorld:result.hiddenWorld||previousDirector.hiddenWorld||{},
        lastScenarioSummary:result.scenarioSummary||'',
        nextDecisionReason:result.nextDecisionReason||'',
        revealedFacts:[...(previousDirector.revealedFacts||[]),...list(result.visibleFacts)].slice(-40),
        advisorVisibleFacts:list(result.advisorVisibleFacts),
        aarObservations:[...(previousDirector.aarObservations||[]),...list(result.aarObservations)].slice(-40),
        lastEvaluatedDecisionCount:list(next.decisions).length,
        lastEvaluatedAt:now,
        lastMode:mode,
      },
    },
  }
}

export function markScenarioDirectorStatus(state, status, error = '') {
  return {
    ...state,
    simulation:{
      ...(state.simulation||{}),
      scenarioDirector:{
        ...(state.simulation?.scenarioDirector||{}),
        status,
        error,
      },
    },
  }
}
