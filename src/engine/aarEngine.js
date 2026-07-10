import { AUTHORITY_MODEL, ROLE_DIMENSIONS, ROLE_NAMES } from '../data/aarCriteria.js'
import { PLATFORM_LIBRARY } from '../data/platformLibrary.js'
import { buildAarEvidence } from './integrationEngine.js'

const EMPTY = 'Not recorded'
const ok = (value) => Boolean(value && String(value).trim())
const arr = (value) => Array.isArray(value) ? value : []
const text = (value, fallback = EMPTY) => ok(value) ? String(value) : fallback
const roleName = (role) => ROLE_NAMES[role] || role || EMPTY

function statusLabel(value) {
  return text(value, 'not recorded').replaceAll('_', ' ')
}

function evidence(source, detail) {
  return { source, detail: text(detail) }
}

function hasRoleDecision(state, role, match) {
  return arr(state.decisions).some((decision) => decision.role === role && match(decision))
}

function relatedDelivery(state, reqId) {
  return arr(state.dissemination?.deliveries).find((delivery) => delivery.requirementId === reqId)
}

function relatedMission(state, delivery) {
  return arr(state.currentOps?.missions).find((mission) => mission.id === delivery?.missionId)
}

function requirementComplete(req) {
  return Boolean(req.what && req.where && req.when && req.why && req.who && req.decisionToSupport && req.eeis?.length)
}

function deriveRequirementResult(req, delivery) {
  if (['cancelled', 'canceled'].includes(req.status)) return ['Cancelled', 'Requirement was cancelled in mission state.']
  if (req.status === 'superseded') return ['Superseded', 'Requirement was superseded in mission state.']
  if (!requirementComplete(req) || req.status === 'needs_clarification') {
    return ['Still Open', 'Requirement remains incomplete or needs clarification before it can be closed.']
  }
  if (!delivery) return ['Still Open', 'No linked product or dissemination record is present.']
  if (delivery.collectionComplete && delivery.processingStatus === 'complete' && delivery.assessmentStatus === 'complete' && delivery.deliveryStatus === 'delivered' && delivery.receiptStatus === 'verified') {
    return ['Satisfied', 'Collection, processing, assessment, dissemination, and customer receipt verification are complete.']
  }
  if (delivery.collectionComplete || delivery.processingStatus === 'complete' || delivery.assessmentStatus === 'complete' || delivery.deliveryStatus === 'ready_to_send') {
    return ['Partially Satisfied', 'Some PCPAD steps are complete, but closure is not supported until dissemination and receipt verification are complete.']
  }
  return ['Still Open', 'The requirement has not completed the PCPAD chain.']
}

function dimensionLabel(dimension, state, role) {
  const reqs = arr(state.requirements?.items)
  const deliveries = arr(state.dissemination?.deliveries)
  const assets = arr(state.assetControl?.assets)
  const missions = arr(state.currentOps?.missions)
  const decisions = arr(state.decisions).filter((d) => d.role === role)

  const rules = {
    'Requirement validation': [reqs.some((r) => r.validation), reqs.some((r) => r.status === 'needs_clarification')],
    'WHAT / WHERE / WHEN / WHY / WHO completeness': [reqs.some(requirementComplete), reqs.some((r) => !requirementComplete(r))],
    'PIR / EEI linkage': [reqs.some((r) => r.pir && r.eeis?.length), reqs.some((r) => !r.pir || !r.eeis?.length)],
    'NAI development': [reqs.some((r) => r.nai), reqs.some((r) => !r.nai)],
    'Effects-based collection requests': [reqs.some((r) => r.requiredEffect), reqs.some((r) => r.requestedPlatform && !r.requiredEffect)],
    'Existing-source checks': [reqs.some((r) => r.existingSourceCheck), reqs.some((r) => !r.existingSourceCheck)],
    'Organic asset suitability': [reqs.some((r) => r.organicSuitability), reqs.some((r) => !r.organicSuitability)],
    'Requirement prioritization': [reqs.some((r) => r.priority), false],
    'Duplicate and conflicting requirement management': [reqs.some((r) => r.duplicateStatus && r.duplicateStatus !== 'unknown'), reqs.some((r) => r.duplicateStatus === 'unknown')],
    'Collection result evaluation': [deliveries.some((d) => d.feedbackStatus === 'received' || d.receiptStatus === 'verified'), deliveries.some((d) => d.collectionComplete && d.receiptStatus !== 'verified')],
    'Recollection decisions': [deliveries.some((d) => /recollect|gap/i.test(`${d.notes || ''} ${d.customerNeed || ''}`)), false],
    'Regional prioritization': [missions.some((m) => m.protected) || reqs.some((r) => r.priority === 1), false],
    'Asset allocation': [assets.some((a) => a.status === 'assigned' || a.status === 'reserve' || a.status === 'released'), false],
    'Coordination with State J3': [arr(state.assetControl?.requests).length > 0 || arr(state.assetControl?.history).some((h) => /State J3/i.test(h.actor || h.action)), false],
    'Partner-agency coordination': [arr(state.crossPeriodImpacts).some((x) => /partner/i.test(x.impact || '')) || reqs.some((r) => /partner/i.test(`${r.alternateSource || ''} ${r.organicSuitability || ''}`)), false],
    'Approval of collection plans': [state.tomorrowPlan?.approved || arr(state.operationalPeriodHistory).length > 0, !state.tomorrowPlan?.approved],
    'Management of unmet needs': [arr(state.crossPeriodImpacts).length > 0 || arr(state.assetControl?.requests).length > 0, state.tomorrowPlan?.blockers?.length > 0],
    'Protection of higher-priority missions': [missions.some((m) => m.protected), missions.some((m) => m.status === 'asset_released' && m.protected)],
    'Operational period transition': [arr(state.operationalPeriodHistory).length > 0 || hasRoleDecision(state, role, (d) => d.type === 'op_transition'), !state.tomorrowPlan?.approved],
    'Shared situational awareness': [arr(state.crossPeriodImpacts).length > 0 || decisions.length > 0, false],
    'Mission execution': [missions.some((m) => ['active', 'planned', 'carry_forward'].includes(m.status)), missions.some((m) => /risk|at_risk|released/i.test(m.status || m.risk || ''))],
    'Sortie management': [missions.length > 0, false],
    'Retasking discipline': [decisions.some((d) => /retask|gain-loss|gain loss/i.test(`${d.detail || ''} ${d.exactText || ''}`)), decisions.some((d) => /retask/i.test(`${d.detail || ''} ${d.exactText || ''}`))],
    'Gain-loss assessment': [decisions.some((d) => /gain-loss|gain loss/i.test(`${d.detail || ''} ${d.exactText || ''}`)), decisions.some((d) => /retask/i.test(`${d.detail || ''} ${d.exactText || ''}`))],
    'Airspace and timing coordination': [missions.some((m) => m.window), missions.some((m) => /TFR|airspace/i.test(m.risk || ''))],
    'Platform constraint awareness': [decisions.some((d) => /constraint|availability|capability|platform/i.test(`${d.detail || ''} ${d.exactText || ''}`)) || assets.some((a) => a.recallRisk), false],
    'Protection of approved missions': [missions.some((m) => m.protected), false],
    'Communication with the Coordinator and Collection Manager': [decisions.some((d) => /coordinator|collection manager|requirement/i.test(`${d.detail || ''} ${d.exactText || ''}`)), false],
    'Execution risk management': [missions.some((m) => m.risk), false],
    'Production prioritization': [deliveries.some((d) => d.deliveryDeadline || d.estimatedDelivery), false],
    'Product burden awareness': [deliveries.some((d) => d.assignedUpad), deliveries.some((d) => d.assignedUpad === 'Unassigned')],
    'PAD architecture management': [deliveries.some((d) => d.disseminationMethod), deliveries.some((d) => !d.disseminationMethod)],
    'Analyst assignment': [deliveries.some((d) => d.assignedUpad && d.assignedUpad !== 'Unassigned'), deliveries.some((d) => d.assignedUpad === 'Unassigned')],
    'Timeliness': [deliveries.some((d) => d.estimatedDelivery && d.estimatedDelivery !== 'Unknown'), deliveries.some((d) => d.estimatedDelivery === 'Unknown')],
    'Product quality': [deliveries.some((d) => d.assessmentStatus === 'complete'), deliveries.some((d) => d.assessmentStatus === 'not_started')],
    'Dissemination method': [deliveries.some((d) => d.disseminationMethod), deliveries.some((d) => !d.disseminationMethod)],
    'Customer receipt verification': [deliveries.some((d) => d.receiptStatus === 'verified'), deliveries.some((d) => d.receiptStatus !== 'verified')],
    'Customer feedback': [arr(state.dissemination?.feedback).length > 0, deliveries.some((d) => d.feedbackStatus !== 'received')],
    'Identification of remaining information gaps': [deliveries.some((d) => /gap|risk|unknown/i.test(`${d.notes || ''} ${d.deliveryStatus || ''} ${d.estimatedDelivery || ''}`)), false],
  }
  const [positive, negative] = rules[dimension] || [false, false]
  if (positive && !negative) return 'Effective'
  if (positive && negative) return 'Generally Effective'
  if (!positive && negative) return 'Needs Improvement'
  return 'Not Observed'
}

function dimensionEvidence(dimension, state) {
  const req = arr(state.requirements?.items).find((r) => {
    const s = `${r.title} ${r.status} ${r.requiredEffect} ${r.requestedPlatform} ${r.nai} ${r.pir} ${arr(r.eeis).join(' ')}`
    return /taskable|needs_clarification|EO|IR|route|NAI|PIR|platform/i.test(s)
  })
  const delivery = arr(state.dissemination?.deliveries).find((d) => d.receiptStatus !== 'verified' || d.deliveryStatus || d.assignedUpad)
  const asset = arr(state.assetControl?.assets).find((a) => a.status)
  const mission = arr(state.currentOps?.missions).find((m) => m.risk || m.protected || m.status)
  if (/Requirement|WHAT|PIR|NAI|Effects|Existing|Organic|Duplicate|Collection result|Recollection/.test(dimension) && req) {
    return evidence(`Requirement ${req.id}`, `${req.title}: ${statusLabel(req.status)}; ${req.requiredEffect || req.requestedPlatform || 'no required effect recorded'}.`)
  }
  if (/Product|PAD|Analyst|Timeliness|Dissemination|Customer|Production|information gaps/.test(dimension) && delivery) {
    return evidence(`Delivery ${delivery.id}`, `${delivery.productType}: delivery ${statusLabel(delivery.deliveryStatus)}, receipt ${statusLabel(delivery.receiptStatus)}, UPAD ${text(delivery.assignedUpad)}.`)
  }
  if (/Asset|State J3|Regional|Protection|Mission|Sortie|Airspace|Platform|Execution/.test(dimension) && (asset || mission)) {
    return evidence(asset ? `Asset ${asset.identifier}` : `Mission ${mission.id}`, asset ? `${asset.status} for ${asset.assignment}; recall risk ${asset.recallRisk}.` : `${mission.objective}: ${statusLabel(mission.status)}; risk ${text(mission.risk)}.`)
  }
  return evidence('Mission state', 'No specific trainee action was recorded for this dimension.')
}

function buildDecisionTimeline(state) {
  return arr(state.decisions).map((decision, index) => ({
    id: decision.id || `decision-${index + 1}`,
    time: decision.asOf || decision.time || 'CURRENT LOCAL',
    operationalPeriod: decision.operationalPeriod || state.operationalPeriod || 1,
    role: roleName(decision.role),
    originalInput: decision.exactText || decision.detail || EMPTY,
    interpretedDecision: decision.interpretedDecision || decision.detail || decision.type || EMPTY,
    authorityAssessment: decision.authorityAssessment || (decision.withinRoleAuthority === false ? 'Outside role authority' : decision.withinRoleAuthority === true ? 'Within role authority' : 'Authority not explicitly evaluated'),
    immediateConsequence: decision.immediateConsequence || EMPTY,
    planningConsequence: decision.planningImpact || decision.delayedConsequence || EMPTY,
    relatedRecord: decision.requirementId || decision.assetId || decision.deliveryId || decision.type || EMPTY,
    finalStatus: decision.finalStatus || decision.status || 'Recorded',
  }))
}

function buildRolePerformance(state, role) {
  return arr(ROLE_DIMENSIONS[role]).map((dimension) => ({
    dimension,
    label: dimensionLabel(dimension, state, role),
    evidence: dimensionEvidence(dimension, state),
  }))
}

function buildAuthorityFindings(state, role) {
  const findings = []
  arr(state.decisions).forEach((decision) => {
    if (decision.withinRoleAuthority === false || /outside|bypass|required approval|state j3|authority/i.test(`${decision.authorityAssessment || ''} ${decision.detail || ''} ${decision.exactText || ''}`)) {
      findings.push({
        title: decision.withinRoleAuthority === false ? 'Potential authority issue' : 'Authority relationship noted',
        whatHappened: decision.exactText || decision.detail || decision.type,
        correctRelationship: AUTHORITY_MODEL.map((item) => `${item.role}: ${item.authority}`).join(' '),
        consequence: decision.immediateConsequence || decision.planningImpact || 'Operational consequence was not separately recorded.',
        betterApproach: decision.requiredFollowUp || 'Use the established role relationship and document the coordination step in the mission record.',
      })
    }
  })
  if (arr(state.assetControl?.requests).length) {
    findings.push({
      title: 'State J3 asset request coordination',
      whatHappened: `${state.assetControl.requests.length} additional asset request(s) are recorded.`,
      correctRelationship: 'Additional or different state-controlled asset support is requested through State J3.',
      consequence: 'The request remains pending until State J3 records an outcome.',
      betterApproach: 'Track the pending request in the transition and Sync Matrix until approved, denied, or superseded.',
    })
  }
  if (arr(state.oversight?.cases).some((c) => c.status !== 'closed')) {
    findings.push({
      title: 'Intelligence Oversight uncertainty remains open',
      whatHappened: `${arr(state.oversight?.cases).filter((c) => c.status !== 'closed').length} oversight case(s) remain open or coordinating.`,
      correctRelationship: 'Operational roles document uncertainty and elevate through the proper oversight process rather than making automatic legal conclusions.',
      consequence: 'Collection or dissemination may remain constrained until the uncertainty is resolved.',
      betterApproach: 'Record known facts, uncertainty, selected action, and resolution note before closing the issue.',
    })
  }
  if (!findings.length) {
    findings.push({
      title: 'No authority exception recorded',
      whatHappened: 'The current decision log does not show a recorded role-authority violation.',
      correctRelationship: AUTHORITY_MODEL.find((item) => item.role === roleName(role))?.authority || 'Use the approved authority model.',
      consequence: 'No additional authority consequence is evidenced in state.',
      betterApproach: 'Continue documenting approvals, elevations, and coordination handoffs as decisions occur.',
    })
  }
  return findings
}

function buildRequirementOutcomes(state) {
  return arr(state.requirements?.items).map((req) => {
    const delivery = relatedDelivery(state, req.id)
    const [finalResult, explanation] = deriveRequirementResult(req, delivery)
    return {
      id: req.id,
      title: req.title || req.id,
      customer: req.customer || req.who || EMPTY,
      decisionSupported: req.decisionToSupport || EMPTY,
      pirEei: `${text(req.pir)} / ${arr(req.eeis).length ? req.eeis.join('; ') : EMPTY}`,
      nai: req.nai || EMPTY,
      priority: req.priority ?? EMPTY,
      validationStatus: statusLabel(req.status),
      collectionStatus: delivery ? (delivery.collectionComplete ? 'complete' : 'not complete') : 'no delivery record',
      productStatus: delivery ? `${statusLabel(delivery.processingStatus)} / ${statusLabel(delivery.assessmentStatus)}` : 'no product record',
      disseminationStatus: delivery ? statusLabel(delivery.deliveryStatus) : 'no dissemination record',
      receiptStatus: delivery ? statusLabel(delivery.receiptStatus) : 'not verified',
      feedback: delivery ? statusLabel(delivery.feedbackStatus) : 'not recorded',
      finalResult,
      explanation,
    }
  })
}

function buildAssetFindings(state) {
  const assets = arr(state.assetControl?.assets)
  const requests = arr(state.assetControl?.requests)
  const missions = arr(state.currentOps?.missions)
  const controlledTypes = PLATFORM_LIBRARY.map((p) => p.type)
  return {
    startEx: arr(state.assetControl?.history).find((h) => /Initial allocation/i.test(h.action))?.action || `${assets.length} state-controlled assets currently recorded.`,
    assigned: assets.filter((a) => a.status === 'assigned'),
    reserve: assets.filter((a) => a.status === 'reserve'),
    released: assets.filter((a) => a.status === 'released'),
    additionalRequests: requests,
    missions,
    retaskingEvents: arr(state.decisions).filter((d) => /retask/i.test(`${d.detail || ''} ${d.exactText || ''}`)),
    protectedMissions: missions.filter((m) => m.protected),
    recallImpacts: assets.filter((a) => /high|medium/i.test(a.recallRisk || '')).map((a) => `${a.identifier}: ${a.recallRisk} recall risk`),
    capabilityGaps: arr(state.requirements?.items).filter((r) => !r.requiredEffect || r.status === 'needs_clarification').map((r) => `${r.id}: ${r.title}`),
    underusedAssets: assets.filter((a) => a.status === 'reserve'),
    poorSuitability: assets.filter((a) => !controlledTypes.includes(a.type)).map((a) => `${a.identifier}: type not in controlled platform library`),
  }
}

function pcpadStatus(delivery) {
  const steps = [
    ['Planning', ok(delivery.requirementId)],
    ['Collection', delivery.collectionComplete],
    ['Processing', delivery.processingStatus === 'complete'],
    ['Assessment', delivery.assessmentStatus === 'complete'],
    ['Dissemination', ['ready_to_send', 'delivered'].includes(delivery.deliveryStatus) || ok(delivery.disseminationMethod)],
    ['Customer Receipt', delivery.receiptStatus === 'verified'],
    ['Feedback', delivery.feedbackStatus === 'received'],
  ]
  const firstBreak = steps.find(([, passed]) => !passed)
  return { steps, finding: firstBreak ? `${firstBreak[0]} remains incomplete or unverified.` : 'Full PCPAD chain is complete through feedback.' }
}

function buildPcpadFindings(state) {
  return arr(state.dissemination?.deliveries).map((delivery) => {
    const req = arr(state.requirements?.items).find((r) => r.id === delivery.requirementId)
    return {
      id: delivery.id,
      mission: delivery.fire || delivery.missionId,
      requirement: req?.title || delivery.requirementId,
      steps: pcpadStatus(delivery).steps.map(([name, passed]) => ({ name, status: passed ? 'complete' : 'open' })),
      finding: pcpadStatus(delivery).finding,
      evidence: `${delivery.productType}; delivery ${statusLabel(delivery.deliveryStatus)}; receipt ${statusLabel(delivery.receiptStatus)}.`,
    }
  })
}

function buildTransitionFindings(state) {
  const openReqs = arr(state.requirements?.items).filter((r) => !['satisfied', 'closed'].includes(r.status))
  const incompleteProducts = arr(state.dissemination?.deliveries).filter((d) => d.receiptStatus !== 'verified')
  return [
    {
      topic: 'Tomorrow’s Plan development',
      finding: state.tomorrowPlan?.approved ? 'Approved in current state.' : 'Plan is not approved in current state.',
      evidence: `Readiness ${state.tomorrowPlan?.readiness ?? EMPTY}; blockers: ${arr(state.tomorrowPlan?.blockers).join('; ') || 'none recorded'}.`,
    },
    {
      topic: 'Carry-forward tracking',
      finding: `${openReqs.length} requirement(s) and ${incompleteProducts.length} product(s) remain open or unverified.`,
      evidence: [...openReqs.map((r) => r.id), ...incompleteProducts.map((d) => d.id)].join(', ') || 'No open carry-forward records found.',
    },
    {
      topic: 'Operational-period history',
      finding: arr(state.operationalPeriodHistory).length ? 'A transition record exists.' : 'No completed operational-period transition is recorded.',
      evidence: arr(state.operationalPeriodHistory).map((h) => `OP ${h.from} to OP ${h.to} at ${h.time}`).join('; ') || 'Transition has not occurred.',
    },
  ]
}

function buildSustainsAndImprovements(state, rolePerformance) {
  const positive = rolePerformance.filter((x) => ['Effective', 'Generally Effective'].includes(x.label)).slice(0, 5)
  const weak = rolePerformance.filter((x) => ['Needs Improvement', 'Not Observed'].includes(x.label)).slice(0, 5)
  const sustains = positive.slice(0, Math.max(3, Math.min(5, positive.length))).map((item) => ({
    observation: `${item.dimension} was ${item.label.toLowerCase()}.`,
    evidence: item.evidence.detail,
    operationalEffect: 'This helped preserve a traceable operational basis for the mission decision.',
    recommendedFutureAction: `Continue documenting ${item.dimension.toLowerCase()} with the same evidence discipline.`,
  }))
  const improvements = weak.slice(0, Math.max(3, Math.min(5, weak.length))).map((item) => ({
    observation: `${item.dimension} requires more visible evidence in the mission record.`,
    evidence: item.evidence.detail,
    operationalEffect: item.label === 'Needs Improvement' ? 'The gap created avoidable risk, delay, or uncertainty.' : 'The AAR cannot credit performance that was not observed in state.',
    recommendedFutureAction: `Record the coordination, decision, or follow-up action tied to ${item.dimension.toLowerCase()} before ENDEX.`,
  }))
  return { sustains, improvements }
}

function buildExecutiveSummary(state, role, requirementOutcomes) {
  const open = requirementOutcomes.filter((r) => r.finalResult !== 'Satisfied')
  const mostConsequential = arr(state.decisions).at(-1)
  const challenge = arr(state.tomorrowPlan?.blockers)[0] || arr(state.currentOps?.missions).find((m) => m.risk)?.risk || 'Maintaining PCPAD closure across active requirements'
  return {
    scenarioName: state.scenarioName || 'NEXUS RS Remote Sensing Coordination and Mission Management Simulator',
    participantName: state.exercise?.participantName || '',
    playedRole: roleName(role),
    operationalPeriodsCompleted: arr(state.operationalPeriodHistory).length,
    exerciseDuration: `${state.simulation?.turn || arr(state.decisions).length || 0} turn(s) / decision record(s)`,
    majorOperationalChallenge: challenge,
    overallMissionOutcome: open.length ? `${open.length} major requirement(s) remain open, partially satisfied, or unsatisfied.` : 'All tracked major requirements are satisfied in the available mission state.',
    mostConsequentialDecision: mostConsequential?.interpretedDecision || mostConsequential?.detail || 'No trainee decision has been recorded yet.',
    largestRemainingRisk: open[0] ? `${open[0].title}: ${open[0].explanation}` : 'No unresolved requirement risk is evidenced in current state.',
    narrative: `${roleName(role)} review reflects ${requirementOutcomes.length} tracked requirement(s). ${open.length ? `${open.length} remain unresolved or only partially satisfied, so closure cannot be claimed before dissemination and customer receipt evidence are complete.` : 'The available state supports closure for all tracked requirements.'}`,
  }
}

function buildAdvisorAssessment(state, role, rolePerformance, improvements) {
  const strong = rolePerformance.find((x) => x.label === 'Effective') || rolePerformance.find((x) => x.label === 'Generally Effective')
  const risk = improvements[0]
  return {
    advisor: 'Lt Col Edwards',
    title: 'Senior Remote Sensing Mission Advisor',
    narrative: `What mattered most was whether ${roleName(role)} decisions moved real mission work through the chain without outrunning authority or evidence. The strongest judgment currently evidenced was ${strong ? strong.dimension.toLowerCase() : 'not clearly observed in the record'}. The avoidable risk is ${risk ? risk.observation.toLowerCase() : 'limited by the absence of recorded unresolved issues'}. In the next exercise, focus on closing the loop: define the requirement, protect the approved mission, document the authority handoff, disseminate the product, and verify the customer actually received what they needed.`,
  }
}

export function buildAfterActionReview({ missionState, syncMatrix, role }) {
  const baseState = missionState || {}
  const state = baseState.exercise?.status === 'ended' && baseState.exercise?.endStateSnapshot ? baseState.exercise.endStateSnapshot : baseState
  const decisionTimeline = buildDecisionTimeline(state)
  const rolePerformance = buildRolePerformance(state, role)
  const requirementOutcomes = buildRequirementOutcomes(state)
  const authorityFindings = buildAuthorityFindings(state, role)
  const assetFindings = buildAssetFindings(state)
  const pcpadFindings = buildPcpadFindings(state)
  const transitionFindings = buildTransitionFindings(state)
  const { sustains, improvements } = buildSustainsAndImprovements(state, rolePerformance)

  return {
    generatedAt: state.asOf || 'CURRENT LOCAL',
    status: baseState.exercise?.status === 'ended' || state.exerciseEnded || state.simulation?.ended ? 'FINAL AAR' : 'PROVISIONAL AAR',
    executiveSummary: buildExecutiveSummary(state, role, requirementOutcomes),
    decisionTimeline,
    rolePerformance,
    authorityFindings,
    requirementOutcomes,
    integrationEvidence: buildAarEvidence(state),
    assetFindings: {
      ...assetFindings,
      syncMatrixStatus: syncMatrix?.status || EMPTY,
      syncMatrixHistory: arr(syncMatrix?.changeHistory),
    },
    pcpadFindings,
    transitionFindings,
    sustains,
    improvements,
    advisorAssessment: buildAdvisorAssessment(state, role, rolePerformance, improvements),
  }
}
