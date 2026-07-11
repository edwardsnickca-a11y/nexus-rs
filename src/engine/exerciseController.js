const ROLE_NAMES = {
  remote_sensing_coordinator: 'Remote Sensing Coordinator',
  remote_sensing_manager: 'Remote Sensing Manager',
  collection_manager: 'Collection Manager',
  upad_lno: 'UPAD LNO',
}

export const EXERCISE_STATUS = {
  NOT_STARTED: 'not_started',
  BRIEFING: 'briefing',
  ROLE_SELECTION: 'role_selection',
  READY: 'ready',
  ACTIVE_OP1: 'active_op1',
  TRANSITION: 'transition_to_op2',
  ACTIVE_OP2: 'active_op2',
  ENDED: 'ended',
}

export const DEFAULT_EXERCISE = {
  status: EXERCISE_STATUS.NOT_STARTED,
  scenarioId: null,
  scenarioName: '',
  selectedRole: null,
  startedAtLocal: null,
  endedAtLocal: null,
  activeOperationalPeriod: null,
  turnNumber: 0,
  currentPhase: 'Mission Portal',
  startExAcknowledged: false,
  transitionApproved: false,
  endExReason: '',
  isFinalAarAvailable: false,
  localIncidentTime: '0930 PT',
  baselinePreserved: false,
  decisionWindows: [],
  endStateSnapshot: null,
}

const SCENARIO = {
  id: 'regional-multi-fire-response',
  name: 'Regional Multi-Fire Response',
  location: 'Regional wildfire incident area',
  description: 'Coordinate limited remote-sensing assets, collection requirements, production capacity, and dissemination across simultaneous wildfire incidents.',
  scope: 'Two controlled operational periods using local incident time only.',
  periods: ['Operational Period 1', 'Operational Period 2'],
  objective: 'Move customer needs through PCPAD while preserving role authority, operational priorities, and transition continuity.',
}

const minutesByTurn = 45

function safeArray(value) {
  return Array.isArray(value) ? value : []
}

function pad(value) {
  return String(value).padStart(2, '0')
}

export function localTimeForTurn(turnNumber = 0) {
  const baseMinutes = 9 * 60 + 30
  const total = baseMinutes + Math.max(0, turnNumber - 1) * minutesByTurn
  return `${pad(Math.floor(total / 60) % 24)}${pad(total % 60)} PT`
}

function historyEvent(state, eventType, description) {
  const exercise = state.exercise || DEFAULT_EXERCISE
  return {
    id: `exercise-history-${Date.now()}-${safeArray(state.exerciseHistory).length + 1}`,
    eventType,
    timestampLocal: exercise.localIncidentTime || state.asOf || 'CURRENT LOCAL',
    operationalPeriod: exercise.activeOperationalPeriod || state.operationalPeriod || null,
    turnNumber: exercise.turnNumber || 0,
    description,
  }
}

function decisionRecord(state, type, detail, extra = {}) {
  const exercise = state.exercise || DEFAULT_EXERCISE
  return {
    id: `decision-${safeArray(state.decisions).length + 1}`,
    type,
    detail,
    asOf: exercise.localIncidentTime || state.asOf || 'CURRENT LOCAL',
    role: exercise.selectedRole || state.activeRole || 'exercise_controller',
    operationalPeriod: exercise.activeOperationalPeriod || state.operationalPeriod || null,
    turn: exercise.turnNumber || 0,
    ...extra,
  }
}

function missionUpdate(state, title, message, category = 'exercise') {
  const exercise = state.exercise || DEFAULT_EXERCISE
  return {
    id: `mission-update-${Date.now()}-${safeArray(state.missionUpdates).length + 1}`,
    time: exercise.localIncidentTime || state.asOf || 'CURRENT LOCAL',
    operationalPeriod: exercise.activeOperationalPeriod || state.operationalPeriod || null,
    turn: exercise.turnNumber || 0,
    title,
    message,
    category,
  }
}

function unresolvedSummary(state) {
  const openRequirements = safeArray(state.requirements?.items).filter((r) => !['satisfied', 'cancelled', 'canceled', 'superseded'].includes(r.status))
  const incompleteProducts = safeArray(state.dissemination?.deliveries).filter((d) => d.deliveryStatus !== 'delivered' || d.receiptStatus !== 'verified')
  const pendingStateJ3 = safeArray(state.assetControl?.requests).filter((r) => /pending/i.test(r.status || ''))
  const openOversight = safeArray(state.oversight?.cases).filter((c) => !['closed', 'resolved'].includes(c.status))
  const unverifiedDissemination = safeArray(state.dissemination?.deliveries).filter((d) => d.receiptStatus !== 'verified')
  return { openRequirements, incompleteProducts, pendingStateJ3, openOversight, unverifiedDissemination }
}

export function initializeScenario(state) {
  const exercise = {
    ...DEFAULT_EXERCISE,
    status: EXERCISE_STATUS.BRIEFING,
    scenarioId: SCENARIO.id,
    scenarioName: SCENARIO.name,
    currentPhase: 'Scenario Brief',
    localIncidentTime: state.asOf || DEFAULT_EXERCISE.localIncidentTime,
  }
  return {
    ...state,
    scenario: SCENARIO,
    exercise,
    activeRole: null,
    exerciseHistory: [...safeArray(state.exerciseHistory), historyEvent({ ...state, exercise }, 'SCENARIO_INITIALIZED', 'Scenario brief opened and baseline mission package prepared.')],
  }
}

export function selectRole(state, selectedRole) {
  const exercise = {
    ...(state.exercise || DEFAULT_EXERCISE),
    status: EXERCISE_STATUS.READY,
    selectedRole,
    currentPhase: 'STARTEX Ready',
  }
  return {
    ...state,
    activeRole: selectedRole,
    exercise,
    exerciseHistory: [...safeArray(state.exerciseHistory), historyEvent({ ...state, exercise }, 'ROLE_SELECTED', `${ROLE_NAMES[selectedRole] || selectedRole} selected for the exercise.`)],
  }
}

export function startExercise(state) {
  const previous = state.exercise || DEFAULT_EXERCISE
  if (!previous.selectedRole) return state
  const exercise = {
    ...previous,
    status: EXERCISE_STATUS.ACTIVE_OP1,
    activeOperationalPeriod: 1,
    turnNumber: 1,
    currentPhase: 'Operational Period 1',
    startExAcknowledged: true,
    startedAtLocal: previous.startedAtLocal || localTimeForTurn(1),
    localIncidentTime: localTimeForTurn(1),
    baselinePreserved: true,
    decisionWindows: [
      {
        id: 'dw-op1-bravo-clarification',
        title: 'Clarify Bear Creek route-access requirement',
        description: 'Bear Creek request is platform-first and lacks decision, area, timing, and EEIs.',
        openedAtTurn: 1,
        dueByTurn: 3,
        relatedRole: 'collection_manager',
        relatedRequirement: 'bc-022',
        relatedAsset: 'asset-luh72-01',
        status: 'open',
        consequenceIfMissed: 'Collection may enter execution without a complete dissemination-ready requirement.',
      },
      {
        id: 'dw-op1-alpha-receipt',
        title: 'Close Pine Ridge dissemination loop',
        description: 'The Pine Ridge product is ready to send but customer receipt is not verified.',
        openedAtTurn: 1,
        dueByTurn: 4,
        relatedRole: 'upad_lno',
        relatedRequirement: 'pr-018',
        relatedAsset: 'asset-mq9-01',
        status: 'open',
        consequenceIfMissed: 'The requirement remains open at transition because receipt verification is missing.',
      },
    ],
  }
  return {
    ...state,
    operationalPeriod: 1,
    asOf: exercise.localIncidentTime,
    exercise,
    scenarioBaseline: state.scenarioBaseline || JSON.parse(JSON.stringify({
      requirements: state.requirements,
      assetControl: state.assetControl,
      currentOps: state.currentOps,
      tomorrowPlan: state.tomorrowPlan,
      dissemination: state.dissemination,
      syncRequirementLinks: state.syncRequirementLinks || [],
    })),
    missionUpdates: [...safeArray(state.missionUpdates), missionUpdate({ ...state, exercise }, 'STARTEX', 'Exercise started. OP1 current operations, initial requirements, asset package, and decision windows are active.', 'lifecycle')],
    decisions: [...safeArray(state.decisions), decisionRecord({ ...state, exercise }, 'startex', 'STARTEX confirmed and Operational Period 1 opened.', { interpretedDecision: 'Started the exercise with selected role and baseline mission package.', withinRoleAuthority: true, immediateConsequence: 'OP1 mission workspaces are active.', planningImpact: 'Decision windows and transition planning are now time-sensitive.' })],
    exerciseHistory: [...safeArray(state.exerciseHistory), historyEvent({ ...state, exercise }, 'STARTEX', 'STARTEX confirmed; OP1 began.')],
  }
}

function updateDecisionWindows(state, exercise) {
  const windows = safeArray(exercise.decisionWindows).map((window) => {
    if (window.status !== 'open') return window
    const linkedReq = safeArray(state.requirements?.items).find((r) => r.id === window.relatedRequirement)
    const linkedDelivery = safeArray(state.dissemination?.deliveries).find((d) => d.requirementId === window.relatedRequirement)
    const addressedByReq = linkedReq && ['taskable', 'sent_forward', 'satisfied'].includes(linkedReq.status)
    const addressedByReceipt = linkedDelivery && linkedDelivery.receiptStatus === 'verified'
    if (addressedByReq || addressedByReceipt) return { ...window, status: 'addressed', addressedAtTurn: exercise.turnNumber }
    if (exercise.turnNumber > window.dueByTurn) return { ...window, status: 'expired', expiredAtTurn: exercise.turnNumber }
    return window
  })
  return windows
}

export function advanceTurn(state) {
  const previous = state.exercise || DEFAULT_EXERCISE
  if (![EXERCISE_STATUS.ACTIVE_OP1, EXERCISE_STATUS.TRANSITION, EXERCISE_STATUS.ACTIVE_OP2].includes(previous.status)) return state
  let exercise = {
    ...previous,
    turnNumber: previous.turnNumber + 1,
    localIncidentTime: localTimeForTurn(previous.turnNumber + 1),
  }
  exercise.decisionWindows = updateDecisionWindows(state, exercise)
  const expired = exercise.decisionWindows.filter((w) => w.status === 'expired' && w.expiredAtTurn === exercise.turnNumber)
  const newUpdates = [
    missionUpdate({ ...state, exercise }, 'Exercise advanced', `Turn ${exercise.turnNumber} opened. Pending consequences and role-relevant decision windows were evaluated.`, 'turn'),
    ...expired.map((w) => missionUpdate({ ...state, exercise }, 'Decision window expired', `${w.title}: ${w.consequenceIfMissed}`, 'consequence')),
  ]
  return {
    ...state,
    asOf: exercise.localIncidentTime,
    simulation: { ...(state.simulation || {}), turn: exercise.turnNumber, injects: [...safeArray(state.simulation?.injects), ...newUpdates.map((u) => ({ id: u.id, createdAt: u.time, role: exercise.selectedRole, title: u.title, message: u.message }))] },
    missionUpdates: [...safeArray(state.missionUpdates), ...newUpdates],
    exercise,
    exerciseHistory: [...safeArray(state.exerciseHistory), historyEvent({ ...state, exercise }, 'TURN_ADVANCED', `Advanced to turn ${exercise.turnNumber}.`)],
  }
}

export function beginTransition(state) {
  const previous = state.exercise || DEFAULT_EXERCISE
  if (previous.status !== EXERCISE_STATUS.ACTIVE_OP1) return state
  const exercise = { ...previous, status: EXERCISE_STATUS.TRANSITION, currentPhase: 'Transition Planning' }
  return {
    ...state,
    exercise,
    missionUpdates: [...safeArray(state.missionUpdates), missionUpdate({ ...state, exercise }, 'Transition planning started', 'OP1 remains visible in history while unresolved requirements, products, and asset assumptions are prepared for carry-forward.', 'transition')],
    exerciseHistory: [...safeArray(state.exerciseHistory), historyEvent({ ...state, exercise }, 'TRANSITION_STARTED', 'Transition planning opened for OP2.')],
  }
}

export function approveTransition(state) {
  const previous = state.exercise || DEFAULT_EXERCISE
  const exercise = {
    ...previous,
    status: EXERCISE_STATUS.ACTIVE_OP2,
    activeOperationalPeriod: 2,
    currentPhase: 'Operational Period 2',
    transitionApproved: true,
    localIncidentTime: localTimeForTurn(previous.turnNumber || 1),
  }
  const carryForward = unresolvedSummary(state)
  return {
    ...state,
    operationalPeriod: 2,
    asOf: exercise.localIncidentTime,
    exercise,
    carriedForwardIssues: {
      openRequirements: carryForward.openRequirements.map((r) => r.id),
      incompleteProducts: carryForward.incompleteProducts.map((d) => d.id),
      pendingStateJ3: carryForward.pendingStateJ3.map((r) => r.id),
      openOversight: carryForward.openOversight.map((c) => c.id),
    },
    operationalPeriodHistory: [...safeArray(state.operationalPeriodHistory), { from: 1, to: 2, time: exercise.localIncidentTime, approvedBy: ROLE_NAMES[previous.selectedRole] || previous.selectedRole || 'Exercise Controller', unresolvedCarriedForward: true }],
    missionUpdates: [...safeArray(state.missionUpdates), missionUpdate({ ...state, exercise }, 'Operational Period 2 started', 'Approved transition package moved into OP2. Unresolved OP1 requirements, products, State J3 requests, and oversight cases remain visible.', 'transition')],
    decisions: [...safeArray(state.decisions), decisionRecord({ ...state, exercise }, 'op2_started', 'Transition approved and OP2 started.', { interpretedDecision: 'Started OP2 from the approved transition package.', withinRoleAuthority: true, immediateConsequence: 'OP2 execution is active.', planningImpact: 'Carry-forward items remain unresolved until closed by their owning workflow.' })],
    exerciseHistory: [...safeArray(state.exerciseHistory), historyEvent({ ...state, exercise }, 'OP2_STARTED', 'Transition approved; OP2 began.')],
  }
}

export function endExercise(state, reason = 'Exercise ended by controller.') {
  const previous = state.exercise || DEFAULT_EXERCISE
  const unresolved = unresolvedSummary(state)
  const exercise = {
    ...previous,
    status: EXERCISE_STATUS.ENDED,
    currentPhase: 'ENDEX',
    endedAtLocal: previous.localIncidentTime || state.asOf || 'CURRENT LOCAL',
    endExReason: reason,
    isFinalAarAvailable: true,
    decisionWindows: safeArray(previous.decisionWindows).map((w) => w.status === 'open' ? { ...w, status: 'expired', unresolvedAtEndex: true } : w),
    endStateSnapshot: null,
  }
  const endState = {
    ...state,
    exercise,
    exerciseEnded: true,
    unresolvedAtEndex: {
      openRequirements: unresolved.openRequirements.map((r) => r.id),
      incompleteProducts: unresolved.incompleteProducts.map((d) => d.id),
      unverifiedDissemination: unresolved.unverifiedDissemination.map((d) => d.id),
      pendingStateJ3: unresolved.pendingStateJ3.map((r) => r.id),
      openOversight: unresolved.openOversight.map((c) => c.id),
    },
  }
  endState.exercise = { ...exercise, endStateSnapshot: JSON.parse(JSON.stringify({ ...endState, exercise: { ...exercise, endStateSnapshot: null } })) }
  return {
    ...endState,
    missionUpdates: [...safeArray(state.missionUpdates), missionUpdate(endState, 'ENDEX', 'Exercise ended. Unresolved items were recorded and the final AAR is available.', 'lifecycle')],
    decisions: [...safeArray(state.decisions), decisionRecord(endState, 'endex', reason, { interpretedDecision: 'Ended the exercise and froze the final mission state for AAR generation.', withinRoleAuthority: true, immediateConsequence: 'Operational modules become read-only by default.', planningImpact: 'Final AAR now reflects ENDEX state, including unresolved issues.' })],
    exerciseHistory: [...safeArray(state.exerciseHistory), historyEvent(endState, 'ENDEX', 'ENDEX recorded; final AAR available.')],
  }
}

export function resetExercise(initialState) {
  return JSON.parse(JSON.stringify(initialState))
}

export function buildExerciseStatus(state) {
  const exercise = state.exercise || DEFAULT_EXERCISE
  const labels = {
    not_started: 'NOT STARTED',
    briefing: 'BRIEFING',
    role_selection: 'ROLE SELECTION',
    ready: 'READY FOR STARTEX',
    active_op1: 'ACTIVE — OPERATIONAL PERIOD 1',
    transition_to_op2: 'TRANSITION PLANNING',
    active_op2: 'ACTIVE — OPERATIONAL PERIOD 2',
    ended: 'ENDED',
  }
  return {
    ...exercise,
    label: labels[exercise.status] || 'NOT STARTED',
    scenarioName: exercise.scenarioName || state.scenario?.name || SCENARIO.name,
    roleName: ROLE_NAMES[exercise.selectedRole] || 'Role not selected',
    localIncidentTime: exercise.localIncidentTime || state.asOf || '0930 PT',
  }
}

export function canAccessWorkspace(state, workspaceId) {
  const status = (state.exercise || DEFAULT_EXERCISE).status
  if ([EXERCISE_STATUS.NOT_STARTED, EXERCISE_STATUS.BRIEFING, EXERCISE_STATUS.ROLE_SELECTION, EXERCISE_STATUS.READY].includes(status)) {
    return ['portal', 'brief', 'roles', 'aar'].includes(workspaceId)
  }
  return true
}

export function isWorkspaceReadOnly(state, workspaceId) {
  const status = (state.exercise || DEFAULT_EXERCISE).status
  if (status === EXERCISE_STATUS.ENDED && !['aar', 'log', 'updates', 'portal'].includes(workspaceId)) return true
  if (![EXERCISE_STATUS.ACTIVE_OP1, EXERCISE_STATUS.TRANSITION, EXERCISE_STATUS.ACTIVE_OP2].includes(status) && !['portal', 'brief', 'roles'].includes(workspaceId)) return true
  return false
}

export function scenarioBrief() {
  return SCENARIO
}

export function collectUnresolvedForEndex(state) {
  return unresolvedSummary(state)
}
