import { deriveMissionAlerts, deriveOperationalSummary } from './integrationEngine.js'

const list = (value) => Array.isArray(value) ? value : []
const take = (items, count = 8) => list(items).slice(0, count)

export const AUTHORITY = {
  remote_sensing_coordinator: {
    owns: [
      'Regional prioritization',
      'Allocation of already-approved assets',
      'Protected missions',
      'Collection-plan approval',
      'Unmet-needs and partner coordination',
      'Requests to State J3',
    ],
    limits: [
      'Cannot allocate or recall state-controlled assets on behalf of State J3',
      'Does not directly execute or retask sorties',
      'Does not manage individual UPAD production assignments',
    ],
    advisorFocus: [
      'Regional trade-offs',
      'Protected priorities',
      'Partner and State J3 coordination',
      'Leadership-ready decisions',
    ],
  },
  remote_sensing_manager: {
    owns: [
      'Approved mission execution',
      'Sortie timing',
      'Airspace and execution impacts',
      'Operational retasking with gain-loss assessment',
    ],
    limits: [
      'Cannot allocate state assets',
      'Does not validate customer requirements',
      'Does not approve the regional collection plan',
    ],
    advisorFocus: [
      'Execution impact',
      'Gain-loss assessment',
      'What must be protected',
      'What must be reported to the Coordinator',
    ],
  },
  collection_manager: {
    owns: [
      'Incoming-request clarification',
      'Customer and refined collection requirements',
      'EEIs and taskability',
      'Collection-option recommendation',
      'Sortie-deck assignment and sequence',
      'Collection-result evaluation',
    ],
    limits: [
      'Cannot command or retask aircraft',
      'Cannot allocate state assets',
      'Cannot approve the regional collection plan',
    ],
    advisorFocus: [
      'Decision to support',
      'Location, timing, LTIOV, and EEIs',
      'Taskability and sortie fit',
      'Practical route sequence',
      'Effect on tomorrow’s sync',
    ],
  },
  upad_lno: {
    owns: [
      'Whole-sortie UPAD production assignment',
      'Specialty-driven task exceptions',
      'UPAD shifts, capacity, and workload',
      'Processing, assessment, production, and dissemination',
      'Delivery risk and customer verification',
      'Escalation of unmet UPAD needs',
    ],
    limits: [
      'Cannot command or retask aircraft',
      'Cannot change collection priority',
      'Cannot allocate state assets',
      'Cannot approve the regional collection plan',
    ],
    advisorFocus: [
      'Sortie-level assignment by default',
      'Imagery, FMV, GIS, satellite, all-source, and public-information specialties',
      'Shift and manning limits',
      'Expected products and timely delivery',
      'UPAD advocacy through the proper chain',
    ],
  },
}

function referencedByText(exactText, item) {
  const candidate = String(
    item?.id ||
    item?.identifier ||
    item?.title ||
    item?.label ||
    ''
  ).toLowerCase()

  return Boolean(candidate && exactText.toLowerCase().includes(candidate))
}

export function buildAdvisorContext(state, activeRole, exactText = '') {
  const referenced = (item) => referencedByText(exactText, item)

  const requirements = list(state.requirements?.items)
    .filter((item) =>
      referenced(item) ||
      ['taskable', 'sent_forward', 'needs_clarification', 'approved_for_collection']
        .includes(item.status)
    )

  const assets = list(state.assetControl?.assets)
    .filter((item) =>
      referenced(item) ||
      ['available', 'reserve', 'assigned', 'recalled', 'unavailable']
        .includes(item.status)
    )

  const missions = list(state.currentOps?.missions)
    .filter((item) =>
      referenced(item) ||
      ['active', 'at_risk', 'planned', 'tasked', 'executing', 'collecting']
        .includes(item.status)
    )

  const products = list(state.dissemination?.deliveries)
    .filter((item) => referenced(item) || item.receiptStatus !== 'verified')

  return {
    scenario: state.exercise?.scenarioName || state.scenario?.name || 'NEXUS RS exercise',
    participantName: state.exercise?.participantName || '',
    role: activeRole,
    authority: AUTHORITY[activeRole] || AUTHORITY.remote_sensing_coordinator,
    exerciseStatus: state.exercise?.status,
    operationalPeriod: state.exercise?.activeOperationalPeriod || state.operationalPeriod,
    turn: state.exercise?.turnNumber || state.simulation?.turn || 0,
    localTime: state.exercise?.localIncidentTime || state.asOf,
    operationalContext: state.exercise?.operationalContext || '',
    exerciseFocus: state.exercise?.exerciseFocus || 'Full Mission Cycle',
    priorities: deriveOperationalSummary(state),
    alerts: deriveMissionAlerts(state, activeRole),

    requirements: take(requirements.map((item) => ({
      id: item.id,
      incident: item.fire || item.incident,
      title: item.title,
      status: item.status,
      priority: item.priority,
      customer: item.customer,
      decisionToSupport: item.decisionToSupport,
      requiredEffect: item.requiredEffect,
      location: item.nai || item.where,
      timing: item.when,
      eeis: take(item.eeis, 6),
      missingFields: item.missingFields,
    }))),

    assets: take(assets.map((item) => ({
      id: item.id,
      identifier: item.identifier,
      callsign: item.callsign,
      type: item.type,
      status: item.status,
      assignment: item.assignment,
      missionId: item.missionId,
      recallRisk: item.recallRisk,
    }))),

    missions: take(missions.map((item) => ({
      id: item.id,
      requirementId: item.requirementId,
      assetId: item.assetId,
      callsign: item.callsign || item.platform,
      incident: item.fire || item.incident,
      window: item.window,
      status: item.status,
      protected: item.protected,
      risk: item.risk,
      objective: item.objective,
    }))),

    products: take(products.map((item) => ({
      id: item.id,
      requirementId: item.requirementId,
      missionId: item.missionId,
      assignedUpad: item.assignedUpad,
      productType: item.productType,
      deliveryStatus: item.deliveryStatus,
      processingStatus: item.processingStatus,
      assessmentStatus: item.assessmentStatus,
      receiptStatus: item.receiptStatus,
      estimatedDelivery: item.estimatedDelivery,
      deliveryDeadline: item.deliveryDeadline,
    }))),

    oversight: take(list(state.oversight?.cases)
      .filter((item) => !['resolved', 'closed_no_issue'].includes(item.status))
      .map((item) => ({
        id: item.id,
        status: item.status,
        requirementId: item.requirementId,
        uncertainty: item.uncertainty,
      }))),

    pendingRequests: take(list(state.assetControl?.requests)
      .filter((item) => !['approved', 'denied', 'withdrawn', 'expired'].includes(item.status))
      .map((item) => ({
        id: item.id,
        status: item.status,
        requestedCapability: item.requestType || item.requestedCapability,
        requiredBy: item.requiredBy,
      }))),

    decisionWindows: take(list(state.exercise?.decisionWindows)
      .filter((item) =>
        item.status === 'open' &&
        (!item.relatedRole || item.relatedRole === activeRole)
      )),

    recentDecisions: take(list(state.decisions).slice(-8).map((item) => ({
      id: item.id,
      role: item.role,
      exactText: item.exactText,
      interpretedDecision: item.interpretedDecision || item.detail,
      authorityAssessment: item.authorityAssessment,
    }))),

    conversationHistory: take(
      list(state.simulation?.advisorHistory).slice(-8).map((item) => ({
        traineeText: item.traineeText,
        advisorMessage: item.advisorMessage,
        time: item.time,
      })),
      8
    ),
  }
}

/*
  This remains available for local tools and tests. The deployed Vercel endpoint
  owns the authoritative system instructions so browser users cannot rewrite them.
*/
export function buildSystemPrompt() {
  return `You are Lt Col Edwards, Senior Remote Sensing Mission Advisor in NEXUS RS.
Speak naturally in first person as an experienced advisor sitting beside the trainee.
Be direct, calm, candid, and operational. React to the trainee's exact words and the
controlled mission context. Preserve trainee decision ownership. Do not sound like
a rubric, doctrine manual, chatbot, or interface narrator. Ask at most one useful
follow-up question when essential information is missing. Never invent mission facts,
capabilities, approvals, outcomes, or entity IDs.`
}

export function buildAdvisorMessages(state, activeRole, exactText) {
  const context = buildAdvisorContext(state, activeRole, exactText)

  return {
    system: buildSystemPrompt(),
    messages: [{
      role: 'user',
      content: `Controlled mission context:
${JSON.stringify(context)}

Exact trainee text:
${exactText}`,
    }],
    context,
  }
}
