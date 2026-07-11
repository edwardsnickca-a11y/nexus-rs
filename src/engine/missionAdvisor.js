const ROLE_RULES = {
  remote_sensing_coordinator: {
    title: 'Remote Sensing Coordinator',
    allowed: ['allocate', 'approve', 'protect', 'release', 'request', 'resolve', 'brief', 'prioritize'],
    prohibited: [/\bretask\b/i, /assign\s+(an )?analyst/i, /direct\s+the\s+aircraft/i],
    chain: 'Give the regional decision, identify the trade-off, and provide the leadership-ready rationale.',
  },
  remote_sensing_manager: {
    title: 'Remote Sensing Manager',
    allowed: ['execute', 'retask', 'recommend', 'delay', 'cancel', 'notify', 'adjust'],
    prohibited: [/approve.*regional/i, /publish.*plan/i, /allocate.*across/i, /release.*state/i],
    chain: 'Notify the Remote Sensing Coordinator and pass the mission impact and recommendation up.',
  },
  collection_manager: {
    title: 'Collection Manager',
    allowed: ['clarify', 'refine', 'validate', 'develop', 'recommend', 'defer', 'flag'],
    prohibited: [/\bretask\b/i, /approve.*plan/i, /allocate.*asset/i, /release.*asset/i],
    chain: 'Refine the requirement, document the EEIs and decision to support, and send the recommendation to the RS Manager.',
  },
  upad_lno: {
    title: 'UPAD LNO',
    allowed: ['assign production', 'reassign', 'report', 'deliver', 'coordinate handoff', 'split product'],
    prohibited: [/\bretask\b/i, /change.*priority/i, /allocate.*asset/i, /approve.*plan/i],
    chain: 'Take the production action inside the UPAD and pass collection or priority impacts to the RS Manager.',
  },
}

const includesAny = (text, terms) => terms.some((term) => text.toLowerCase().includes(term))

function summarizePressure(state) {
  const openReqs = state.requirements?.items?.filter((r) => r.status !== 'taskable').length || 0
  const riskyDeliveries = state.dissemination?.deliveries?.filter((d) => ['at_risk', 'delayed'].includes(d.deliveryStatus)).length || 0
  const openOversight = state.oversight?.cases?.filter((c) => c.status !== 'resolved').length || 0
  const pendingRequests = state.assetControl?.requests?.filter((r) => r.status?.includes('PENDING')).length || 0
  return { openReqs, riskyDeliveries, openOversight, pendingRequests }
}

function selectNextInject(state, role, decisionText) {
  const used = new Set((state.simulation?.injects || []).map((i) => i.code))
  const candidates = {
    remote_sensing_coordinator: [
      { code:'COORD-GAP', title:'Partner Coverage Opportunity', priority:'HIGH', deadline:'1230 Local', text:'A coordinated partner asset may cover the Eagle Peak gap, but support is not confirmed. Decide whether to pursue the partner option, protect another mission, or accept the gap.' },
      { code:'COORD-J3', title:'State J3 Allocation Decision', priority:'HIGH', deadline:'1300 Local', text:'State J3 asks whether the second CAP aircraft can be released. Holding it preserves flexibility; releasing it returns capacity to the state.' },
      { code:'COORD-BRIEF', title:'Leadership Brief Readiness', priority:'MEDIUM', deadline:'1400 Local', text:'The leadership brief is approaching and the matrix still shows an unresolved requirement-to-UPAD gap.' },
    ],
    remote_sensing_manager: [
      { code:'RSM-RETASK', title:'Life-Safety Retask Request', priority:'HIGH', deadline:'1015 Local', text:'Bear Creek requests immediate route-status collection. Retasking now creates a coverage loss over Pine Ridge during an evacuation window.' },
      { code:'RSM-AIRSPACE', title:'Airspace Constraint', priority:'HIGH', deadline:'1045 Local', text:'The UH-72 mission window may slip because the TFR update is not complete. Provide the execution impact and recommendation to the Coordinator.' },
      { code:'RSM-WEATHER', title:'Smoke Degradation', priority:'MEDIUM', deadline:'1130 Local', text:'Smoke is reducing useful collection over Pine Ridge. Decide how to preserve mission value and what impact must be passed up.' },
    ],
    collection_manager: [
      { code:'CM-VAGUE', title:'Incomplete Customer Request', priority:'HIGH', deadline:'1100 Local', text:'The Bear Creek customer asks for “MQ-9 imagery of blocked roads” but has not identified the decision, NAI, latest time of value, or required effect.' },
      { code:'CM-DUP', title:'Possible Duplicate Requirement', priority:'MEDIUM', deadline:'1200 Local', text:'A state request and county request appear to seek the same route-status information with different deadlines. Deconflict before tasking.' },
      { code:'CM-ALT', title:'Existing-Source Opportunity', priority:'MEDIUM', deadline:'1230 Local', text:'A state transportation source may answer part of the requirement without airborne collection. Determine what remains unanswered.' },
    ],
    upad_lno: [
      { code:'UPAD-SURGE', title:'Simultaneous Data Arrival', priority:'HIGH', deadline:'1430 Local', text:'Two collections will arrive within fifteen minutes. Current staffing cannot complete both products by their customer cutoffs.' },
      { code:'UPAD-TRANSFER', title:'Data Transfer Delay', priority:'HIGH', deadline:'1500 Local', text:'The Pine Ridge dataset transfer is slower than planned. The delivery estimate will slip unless workload or product scope changes.' },
      { code:'UPAD-REL', title:'Releasability Coordination', priority:'MEDIUM', deadline:'1730 Local', text:'Partner imagery has not cleared the planned dissemination path. Identify the production action and report the delivery risk.' },
    ],
  }[role] || []
  return candidates.find((item) => !used.has(item.code)) || {
    code:`FOLLOW-${(state.simulation?.turn || 0)+1}`,
    title:'Follow-On Coordination Pressure',
    priority:'MEDIUM',
    deadline:'Next coordination window',
    text:`The previous decision changed the mission picture. Reassess Current Ops, Tomorrow’s Plan, and the Sync Matrix before the next update.`,
  }
}

export function evaluateMissionDecision({ state, role, exactText }) {
  const rule = ROLE_RULES[role]
  const authorityMatch = (rule?.prohibited || []).find((pattern) => pattern.test(exactText))
  const withinRoleAuthority = !authorityMatch
  const pressure = summarizePressure(state)
  const mentionsCoordination = includesAny(exactText, ['notify', 'coordinate', 'pass', 'brief', 'send', 'j3'])
  const mentionsTradeoff = includesAny(exactText, ['risk', 'impact', 'gap', 'defer', 'delay', 'protect', 'priority', 'trade'])
  const mentionsDeadline = /\b\d{3,4}\b|deadline|window|cutoff|by\s+/i.test(exactText)
  const reasoningProvided = exactText.length > 80 || mentionsTradeoff

  const observations = []
  if (!withinRoleAuthority) observations.push('Attempted action exceeded selected role authority.')
  if (!mentionsCoordination && role !== 'remote_sensing_coordinator') observations.push('Required coordination path was not clearly identified.')
  if (!mentionsTradeoff) observations.push('Mission gain-loss or consequence was not clearly stated.')
  if (!mentionsDeadline) observations.push('Decision timing or closing window was not addressed.')

  let immediateConsequence
  if (!withinRoleAuthority) {
    immediateConsequence = 'The action is not executed. Coordination friction and role-authority risk are recorded.'
  } else if (mentionsTradeoff && mentionsCoordination) {
    immediateConsequence = 'The decision is accepted into the mission state with the stated coordination and trade-off.'
  } else {
    immediateConsequence = 'The decision is recorded, but execution remains incomplete pending clearer coordination or consequence management.'
  }

  const inject = selectNextInject(state, role, exactText)
  const unresolved = []
  if (pressure.openReqs) unresolved.push(`${pressure.openReqs} requirement(s) still need development`)
  if (pressure.riskyDeliveries) unresolved.push(`${pressure.riskyDeliveries} delivery risk(s) remain active`)
  if (pressure.openOversight) unresolved.push(`${pressure.openOversight} oversight case(s) remain unresolved`)
  if (pressure.pendingRequests) unresolved.push(`${pressure.pendingRequests} State J3 request(s) remain pending`)

  const advisorText = !withinRoleAuthority
    ? `That action exceeds your authority as ${rule?.title}. ${rule?.chain} The mission pressure has not gone away: ${inject.text}`
    : `${immediateConsequence} ${unresolved.length ? `You still have ${unresolved.join(', ')}. ` : ''}${inject.text} What is your next role-appropriate action before ${inject.deadline}?`

  return {
    decisionRecord: {
      interpretedDecision: exactText,
      reasoningProvided: reasoningProvided ? exactText : '',
      withinRoleAuthority,
      authorityConcern: withinRoleAuthority ? null : `Action exceeds ${rule?.title} authority.`,
      immediateConsequences: [immediateConsequence],
      delayedConsequences: [inject.text],
      planningImpact: 'Recheck Current Ops, Tomorrow’s Plan, Sync Matrix, requirements, and production status.',
      productionImpact: pressure.riskyDeliveries ? 'Existing delivery risk remains active.' : 'No immediate production change confirmed.',
      oversightImpact: pressure.openOversight ? 'Open oversight concerns remain part of the decision environment.' : 'No new oversight impact identified.',
      requiredFollowUp: rule?.chain,
      aarObservations: observations,
    },
    advisorText,
    inject,
  }
}

export function getInitialAdvisorMessage(role) {
  return {
    remote_sensing_coordinator: 'You own the regional mission picture. The Sync Matrix has a Eagle Peak coverage gap, Pine Ridge is protected, and the State J3 may ask for unused capacity back. Give me the regional decision and the trade-off you are accepting.',
    remote_sensing_manager: 'You own current execution. Pine Ridge is protected, Bear Creek has an emerging need, and the UH-72 window may be affected by airspace coordination. Give the Coordinator your execution recommendation and mission impact.',
    collection_manager: 'You own requirement quality. Bear Creek is not taskable because the request does not yet define the decision, NAI, time of value, or required effect. Refine it and send a defensible recommendation forward.',
    upad_lno: 'You own production linkage. Two products are converging on the same production window and Bear Creek has no confirmed UPAD support. Give the RS Manager a realistic delivery-risk update and workload recommendation.',
  }[role]
}
