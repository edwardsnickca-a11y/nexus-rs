import { PLATFORM_LIBRARY } from '../data/platformLibrary.js'

const list = (value) => Array.isArray(value) ? value : []
const nowLocal = (state) => state.exercise?.localIncidentTime || state.asOf || 'CURRENT LOCAL'
const nextId = (prefix) => `${prefix}-${Date.now()}`
const role = (state) => state.exercise?.selectedRole || state.activeRole || 'remote_sensing_coordinator'

export function validateMissionLinks(state) {
  const requirementIds = new Set(list(state.requirements?.items).map((x) => x.id))
  const assetIds = new Set(list(state.assetControl?.assets).map((x) => x.id))
  const missionIds = new Set(list(state.currentOps?.missions).map((x) => x.id))
  const issues = []
  list(state.currentOps?.missions).forEach((mission) => {
    if (mission.requirementId && !requirementIds.has(mission.requirementId)) issues.push(`Mission ${mission.id} references missing requirement ${mission.requirementId}.`)
    if (mission.assetId && !assetIds.has(mission.assetId)) issues.push(`Mission ${mission.id} references missing asset ${mission.assetId}.`)
  })
  list(state.dissemination?.deliveries).forEach((product) => {
    if (product.requirementId && !requirementIds.has(product.requirementId)) issues.push(`Product ${product.id} references missing requirement ${product.requirementId}.`)
    if (product.missionId && !missionIds.has(product.missionId)) issues.push(`Product ${product.id} references missing mission ${product.missionId}.`)
  })
  return issues
}

export function deriveOperationalSummary(state) {
  const requirements = list(state.requirements?.items)
  const missions = list(state.currentOps?.missions)
  const assets = list(state.assetControl?.assets)
  const deliveries = list(state.dissemination?.deliveries)
  return {
    openRequirements: requirements.filter((x) => !['satisfied','cancelled','superseded'].includes(x.status)).length,
    taskableRequirements: requirements.filter((x) => ['taskable','sent_forward','approved_for_collection'].includes(x.status)).length,
    activeMissions: missions.filter((x) => ['approved','tasked','active','executing','collecting','planned','at_risk'].includes(x.status)).length,
    assetsAvailable: assets.filter((x) => ['available','reserve','reserved'].includes(x.status)).length,
    assetsAssigned: assets.filter((x) => ['assigned','collecting','returning'].includes(x.status)).length,
    assetsUnavailable: assets.filter((x) => ['unavailable','released','released_to_state','recalled'].includes(x.status)).length,
    productsInProduction: deliveries.filter((x) => ['in_progress','processing','assessment','quality_review'].includes(x.processingStatus) || ['in_progress','quality_review'].includes(x.assessmentStatus)).length,
    productsAwaitingDelivery: deliveries.filter((x) => ['ready_to_send','ready','sent','delivered_unverified'].includes(x.deliveryStatus)).length,
    unverifiedDeliveries: deliveries.filter((x) => x.deliveryStatus && x.receiptStatus !== 'verified').length,
    openOversightCases: list(state.oversight?.cases).filter((x) => !['resolved','closed_no_issue'].includes(x.status)).length,
    pendingStateJ3Requests: list(state.assetControl?.requests).filter((x) => ['draft','submitted','under_review','PENDING STATE J3'].includes(x.status)).length,
    protectedMissionsAtRisk: missions.filter((x) => x.protected && /risk|delay|unable|cancel/i.test(`${x.status} ${x.risk}`)).length,
    transitionCarryForwardCount: Object.values(state.carriedForwardIssues || {}).flat().length,
  }
}

export function deriveMissionAlerts(state, activeRole = role(state)) {
  const alerts = []
  const summary = deriveOperationalSummary(state)
  if (summary.unverifiedDeliveries) alerts.push({ id:'alert-receipt', roles:['upad_lno','collection_manager','remote_sensing_coordinator'], severity:'high', text:`${summary.unverifiedDeliveries} delivery record(s) still lack verified customer receipt.` })
  if (summary.pendingStateJ3Requests) alerts.push({ id:'alert-j3', roles:['remote_sensing_coordinator'], severity:'medium', text:`${summary.pendingStateJ3Requests} State J3 request(s) remain pending.` })
  if (summary.protectedMissionsAtRisk) alerts.push({ id:'alert-protected', roles:['remote_sensing_coordinator','remote_sensing_manager'], severity:'high', text:`${summary.protectedMissionsAtRisk} protected mission(s) are at risk.` })
  list(state.requirements?.items).filter((x) => x.status === 'needs_clarification').forEach((x) => alerts.push({ id:`alert-${x.id}`, roles:['collection_manager'], severity:'medium', text:`${x.id} requires clarification before mission assignment.` }))
  return alerts.filter((x) => x.roles.includes(activeRole))
}

export function evaluateRequirementOutcome(state, requirementId) {
  const requirement = list(state.requirements?.items).find((x) => x.id === requirementId)
  if (!requirement) return { outcome:'Still Open', explanation:'Requirement record does not exist.' }
  if (requirement.status === 'cancelled') return { outcome:'Cancelled', explanation:'Requirement was cancelled.' }
  if (requirement.status === 'superseded') return { outcome:'Superseded', explanation:'Requirement was superseded.' }
  const product = list(state.dissemination?.deliveries).find((x) => x.requirementId === requirementId)
  if (!product) return { outcome:'Still Open', explanation:'No linked product record exists.' }
  const feedback = list(state.dissemination?.feedback).filter((x) => x.deliveryId === product.id)
  const feedbackText = feedback.map((x) => x.text || x.result || '').join(' ')
  if (/recollection|insufficient|too late|incorrect area|additional question/i.test(feedbackText)) {
    return { outcome:'Partially Satisfied', explanation:'Customer feedback identifies a remaining information gap.' }
  }
  if (product.collectionEvaluation === 'did_not_answer') return { outcome:'Unsatisfied', explanation:'Recorded collection did not answer the requirement.' }
  if (product.collectionEvaluation === 'partially_answered') return { outcome:'Partially Satisfied', explanation:'Collection only partially answered the requirement.' }
  if (product.assessmentStatus === 'complete' && ['delivered','receipt_verified'].includes(product.deliveryStatus) && product.receiptStatus === 'verified') {
    return { outcome:'Satisfied', explanation:'Assessed information was delivered and customer receipt was verified.' }
  }
  if (product.collectionComplete || product.processingStatus === 'complete' || product.assessmentStatus === 'complete') {
    return { outcome:'Partially Satisfied', explanation:'Mission activity occurred, but the customer closure chain is incomplete.' }
  }
  return { outcome:'Still Open', explanation:'The linked PCPAD chain remains incomplete.' }
}

export function deriveSyncMatrixRows(state) {
  const deliveries = list(state.dissemination?.deliveries)
  return list(state.currentOps?.missions).map((mission) => {
    const product = deliveries.find((x) => x.missionId === mission.id)
    const requirement = list(state.requirements?.items).find((x) => x.id === mission.requirementId || x.fire === mission.fire)
    return {
      missionId: mission.id,
      sortieId: mission.sortieId || mission.id,
      assetId: mission.assetId || null,
      asset: mission.platform || 'Unassigned',
      requirementId: requirement?.id || null,
      requirement: requirement?.title || mission.objective,
      objective: mission.objective,
      nai: requirement?.nai || '',
      plannedStart: mission.window || '',
      plannedEnd: mission.window || '',
      actualStatus: mission.status,
      operationalPeriod: state.exercise?.activeOperationalPeriod || state.operationalPeriod,
      pir: requirement?.pir || '',
      eeis: requirement?.eeis || [],
      assignedUpad: product?.assignedUpad || 'Unassigned',
      productStatus: product?.assessmentStatus || 'not_started',
      disseminationStatus: product?.deliveryStatus || 'not_ready',
      protected: Boolean(mission.protected),
      coordinationNotes: mission.risk || '',
    }
  })
}

function decision(state, type, detail, affectedRecords = [], extra = {}) {
  return {
    id: nextId('decision'),
    type,
    detail,
    exactText: extra.exactText || detail,
    interpretedDecision: extra.interpretedDecision || detail,
    asOf: nowLocal(state),
    role: role(state),
    operationalPeriod: state.exercise?.activeOperationalPeriod || state.operationalPeriod,
    turn: state.exercise?.turnNumber || state.simulation?.turn || 0,
    affectedRecords,
    withinRoleAuthority: extra.withinRoleAuthority ?? true,
    authorityAssessment: extra.authorityAssessment || 'Within role authority',
    immediateConsequence: extra.immediateConsequence || '',
    planningImpact: extra.planningImpact || '',
    advisorInterpretation: extra.advisorInterpretation || null,
    userConfirmed: extra.userConfirmed ?? true,
  }
}

export function createMissionFromRequirement(state, requirementId, values = {}) {
  const requirement = list(state.requirements?.items).find((x) => x.id === requirementId)
  if (!requirement || !['taskable','sent_forward','approved_for_collection'].includes(requirement.status)) return state
  const missionId = values.missionId || nextId('mission')
  const mission = {
    id: missionId,
    requirementId,
    fire: requirement.fire,
    platform: values.platform || 'Capability assignment pending',
    assetId: values.assetId || null,
    sortieId: values.sortieId || null,
    window: values.window || requirement.when || 'TBD Local',
    objective: requirement.requiredEffect || requirement.what,
    status: values.status || 'proposed',
    protected: false,
    risk: values.risk || 'Approval and asset assignment pending',
    coordinatorNotified: false,
  }
  return {
    ...state,
    currentOps: { ...state.currentOps, missions:[...list(state.currentOps?.missions), mission] },
    requirements: { ...state.requirements, items:list(state.requirements?.items).map((x) => x.id === requirementId ? { ...x, missionId, status:'sent_forward' } : x) },
    decisions:[...list(state.decisions), decision(state,'mission_proposed',`Proposed ${missionId} for ${requirementId}.`,[requirementId, missionId])],
  }
}

export function assignAssetToMission(state, assetId, missionId) {
  const asset = list(state.assetControl?.assets).find((x) => x.id === assetId)
  const mission = list(state.currentOps?.missions).find((x) => x.id === missionId)
  if (!asset || !mission || ['released','released_to_state','recalled','unavailable'].includes(asset.status)) return state
  const platform = PLATFORM_LIBRARY.find((x) => x.id === asset.type || x.name === asset.type)
  const requirement = list(state.requirements?.items).find((x) => x.id === mission.requirementId)
  const suitability = requirement?.requiredEffect && platform ? 'Conditionally Suitable' : 'Needs More Information'
  return {
    ...state,
    assetControl:{ ...state.assetControl, assets:list(state.assetControl?.assets).map((x) => x.id === assetId ? { ...x, status:'assigned', missionId, assignment:mission.fire } : x) },
    currentOps:{ ...state.currentOps, missions:list(state.currentOps?.missions).map((x) => x.id === missionId ? { ...x, assetId, platform:asset.identifier, status:'tasked', suitability } : x) },
    decisions:[...list(state.decisions), decision(state,'asset_assigned',`Assigned ${asset.identifier} to ${missionId}.`,[assetId,missionId,mission.requirementId].filter(Boolean))],
  }
}

export function recordCollectionResult(state, missionId, result = {}) {
  const mission = list(state.currentOps?.missions).find((x) => x.id === missionId)
  if (!mission) return state
  const requirementId = mission.requirementId || list(state.requirements?.items).find((x) => x.fire === mission.fire)?.id
  const existing = list(state.dissemination?.deliveries).find((x) => x.missionId === missionId)
  const product = existing || {
    id:nextId('product'), missionId, requirementId, fire:mission.fire, customer:list(state.requirements?.items).find((x)=>x.id===requirementId)?.customer || '',
    productType:'Assessment product', sourcePlatform:mission.platform, assignedUpad:'Unassigned', disseminationMethod:'', deliveryStatus:'not_ready',
    receiptStatus:'not_verified', feedbackStatus:'not_requested',
  }
  const updatedProduct = { ...product, collectionComplete:true, collectionEvaluation:result.evaluation || 'unable_to_assess', rawDataAvailability:result.rawDataAvailability || 'available', transferStatus:result.transferStatus || 'awaiting_transfer', processingStatus:'awaiting_data', assessmentStatus:'not_started', remainingGap:result.remainingGap || '' }
  return {
    ...state,
    currentOps:{ ...state.currentOps, missions:list(state.currentOps?.missions).map((x)=>x.id===missionId?{...x,status:'collection_complete'}:x) },
    dissemination:{ ...state.dissemination, deliveries:existing ? list(state.dissemination?.deliveries).map((x)=>x.id===existing.id?updatedProduct:x) : [...list(state.dissemination?.deliveries),updatedProduct] },
    decisions:[...list(state.decisions), decision(state,'collection_result',`Recorded collection result for ${missionId}; PAD work activated.`,[missionId,requirementId,updatedProduct.id].filter(Boolean))],
  }
}

export function verifyCustomerReceipt(state, productId) {
  const product = list(state.dissemination?.deliveries).find((x)=>x.id===productId)
  if (!product) return state
  return {
    ...state,
    dissemination:{ ...state.dissemination, deliveries:list(state.dissemination?.deliveries).map((x)=>x.id===productId?{...x,deliveryStatus:'delivered',receiptStatus:'verified',receiptVerifiedAt:nowLocal(state)}:x) },
    decisions:[...list(state.decisions), decision(state,'receipt_verified',`Verified customer receipt for ${productId}.`,[productId,product.requirementId,product.missionId].filter(Boolean))],
  }
}

export function recordCustomerFeedback(state, productId, feedback) {
  const product = list(state.dissemination?.deliveries).find((x)=>x.id===productId)
  if (!product || !feedback) return state
  const item={ id:nextId('feedback'), deliveryId:productId, requirementId:product.requirementId, time:nowLocal(state), actor:role(state), text:feedback }
  const recollect=/recollection|additional question|insufficient|incorrect area|too late/i.test(feedback)
  return {
    ...state,
    dissemination:{ ...state.dissemination, feedback:[...list(state.dissemination?.feedback),item], deliveries:list(state.dissemination?.deliveries).map((x)=>x.id===productId?{...x,feedbackStatus:'received',remainingGap:recollect?feedback:x.remainingGap}:x) },
    requirements:{ ...state.requirements, items:list(state.requirements?.items).map((x)=>x.id===product.requirementId&&recollect?{...x,status:'taskable',recollectionRequested:true}:x) },
    decisions:[...list(state.decisions), decision(state,recollect?'recollection_requested':'customer_feedback',`Recorded customer feedback for ${productId}.`,[productId,product.requirementId].filter(Boolean))],
  }
}

export function buildAarEvidence(state) {
  return list(state.requirements?.items).map((req) => {
    const mission = list(state.currentOps?.missions).find((x)=>x.requirementId===req.id || x.id===req.missionId)
    const product = list(state.dissemination?.deliveries).find((x)=>x.requirementId===req.id)
    const feedback = product ? list(state.dissemination?.feedback).filter((x)=>x.deliveryId===product.id) : []
    return { requirementId:req.id, missionId:mission?.id || null, assetId:mission?.assetId || null, productId:product?.id || null, feedbackIds:feedback.map((x)=>x.id), outcome:evaluateRequirementOutcome(state,req.id) }
  })
}

export function applyIntegratedAction(state, action) {
  if (!action || !action.type) return state
  const payload = action.payload || {}
  switch (action.type) {
    case 'propose_mission': return createMissionFromRequirement(state,payload.requirementId,payload)
    case 'assign_available_asset': return assignAssetToMission(state,payload.assetId,payload.missionId)
    case 'verify_customer_receipt': return verifyCustomerReceipt(state,payload.productId)
    case 'request_recollection': return recordCustomerFeedback(state,payload.productId,payload.feedback || 'Recollection requested.')
    case 'update_product_priority':
      return { ...state, dissemination:{ ...state.dissemination, deliveries:list(state.dissemination?.deliveries).map((x)=>x.id===payload.productId?{...x,priority:payload.priority || 'high'}:x) }, decisions:[...list(state.decisions),decision(state,'product_priority',`Updated priority for ${payload.productId}.`,[payload.productId])] }
    case 'add_coordination_note':
      return { ...state, decisions:[...list(state.decisions),decision(state,'coordination_note',payload.note || 'Coordination note added.',payload.entityIds || [])] }
    default: return state
  }
}
