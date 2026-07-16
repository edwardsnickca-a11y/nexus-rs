export const INITIAL_MISSION_STATE = {
  exercise: {
    status: 'not_started',
    scenarioId: null,
    scenarioName: '',
    selectedRole: null,
    assignedIncident: null,
    participantName: '',
    operationalContext: '',
    exerciseFocus: 'Full Mission Cycle',
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
    decisionWindows: [],
    endStateSnapshot: null,
  },
  exerciseHistory: [],
  missionUpdates: [],
  activeRole: null,
  operationalPeriod: 1,
  localTimeLabel: 'Pacific Time',
  asOf: '0930 PT',
  currentOps: {
    status: 'active',
    protectedMissionId: 'mission-alpha',
    missions: [
      { id: 'mission-alpha', requirementId: 'pr-018', fire: 'Pine Ridge', platform: 'MQ-9-01', callsign: 'GARGOYLE', assetId: 'asset-mq9-01', window: '0700–1300', objective: 'Evacuation corridor and fire perimeter', status: 'active', protected: true, risk: 'Coverage ends before late evacuation window', coordinatorNotified: true },
      { id: 'mission-bravo', requirementId: 'bc-022', fire: 'Bear Creek', platform: 'UH-72-01', callsign: 'BEAR', assetId: 'asset-luh72-01', window: '1000–1400', objective: 'Route and structure impacts', status: 'at_risk', protected: false, risk: 'TFR update pending', coordinatorNotified: false },
      { id: 'mission-charlie', requirementId: 'ep-033', fire: 'Eagle Peak', platform: 'CAP-01', assetId: 'asset-cap-01', window: '1600–1900', objective: 'Damage overview', status: 'planned', protected: false, risk: 'Afternoon gap remains', coordinatorNotified: false },
    ],
    deadlines: [
      { id: 'd1', label: 'Pine Ridge product cutoff', time: '1500 Local', severity: 'high' },
      { id: 'd2', label: 'Bear Creek airspace decision', time: '1045 Local', severity: 'high' },
      { id: 'd3', label: 'Eagle Peak partner decision', time: '1230 Local', severity: 'medium' },
    ],
  },
  tomorrowPlan: {
    status: 'not_ready',
    readiness: 62,
    requirements: [
      { id: 'pr-018', fire: 'Pine Ridge', title: 'Late-period perimeter coverage', taskable: true, platform: 'Unassigned', upad: 'UPAD-CA', status: 'ready' },
      { id: 'bc-022', fire: 'Bear Creek', title: 'Change detection / structure threat', taskable: false, platform: 'UH-72-01', upad: 'Unassigned', status: 'draft' },
      { id: 'ep-033', fire: 'Eagle Peak', title: 'Damage assessment', taskable: true, platform: 'Partner opportunity', upad: 'UPAD-SW', status: 'gap' },
    ],
    blockers: [
      'Bear Creek EEIs are not approved',
      'Eagle Peak partner support is not confirmed',
      'UPAD support is not assigned for Bear Creek',
    ],
    planningDeadline: '1600 Local',
    publicationDeadline: '1800 Local',
    approved: false,
  },
  requirements: {
    items: [
      {
        id: 'pr-018', fire: 'Pine Ridge', title: 'Late-period perimeter coverage', requestType: 'standing', priority: 1,
        customer: 'County Emergency Management', who: 'County Emergency Management',
        decisionToSupport: 'Determine whether evacuation routes remain usable through the late operational period.',
        what: 'Report fire perimeter movement and conditions affecting designated evacuation corridors.',
        where: 'Pine Ridge evacuation corridor NAI', when: 'Collect 1200–1400; information no later than 1430 Local',
        why: 'Supports evacuation and road-access decisions before the late-period weather shift.',
        requiredEffect: 'Persistent EO/IR observation and assessed route-status reporting',
        requestedPlatform: '', nai: 'NAI-ALPHA-01', pir: 'PIR-1', eeis: ['Identify fire spread toward evacuation corridors.', 'Report visible obstructions or fire impacts affecting route usability.'],
        disseminationMethod: 'Post assessed product to approved shared repository and notify county EOC POC.',
        existingSourceCheck: true, organicSuitability: 'MQ-9 or UH-72 could satisfy; match effect and timing, not platform preference.',
        alternateSource: 'FireGuard perimeter data may partially answer perimeter movement but not route condition.', duplicateStatus: 'unique', oversightFlag: false,
        validation: {acceptable:true,feasible:true,complete:true,existingSourceChecked:true,organicSuitabilityChecked:true}, missingFields: [], status: 'taskable', lastUpdatedBy: 'collection_manager', lastUpdatedAt: '0915 PT'
      },
      {
        id: 'bc-022', fire: 'Bear Creek', title: 'Blocked roads', requestType: 'ad_hoc', priority: 1,
        customer: 'Bear Creek ICP', who: 'Bear Creek ICP', decisionToSupport: '', what: 'Blocked roads', where: '', when: '', why: '',
        requiredEffect: '', requestedPlatform: 'Use UH-72', nai: '', pir: '', eeis: [], disseminationMethod: '',
        existingSourceCheck: false, organicSuitability: '', alternateSource: '', duplicateStatus: 'unknown', oversightFlag: false,
        validation: {acceptable:false,feasible:false,complete:false,existingSourceChecked:false,organicSuitabilityChecked:false},
        missingFields: ['WHERE','WHEN','WHY','decision to support','EEIs'], status: 'needs_clarification', lastUpdatedBy: 'collection_manager', lastUpdatedAt: '0930 PT'
      },
      {
        id: 'ep-033', fire: 'Eagle Peak', title: 'Damage assessment', requestType: 'standing', priority: 2,
        customer: 'State EOC', who: 'State EOC',
        decisionToSupport: 'Prioritize state debris-removal and infrastructure support.',
        what: 'Identify structures and critical infrastructure with visible major damage.',
        where: 'Eagle Peak impact area NAI', when: '1600–1900; assessed summary by 2100 Local',
        why: 'Supports allocation of debris-removal teams and infrastructure assessment resources.',
        requiredEffect: 'Georeferenced still imagery with assessed damage summary', requestedPlatform: '', nai: 'NAI-CHARLIE-02', pir: 'PIR-3',
        eeis: ['Identify visibly destroyed or major-damage structures.', 'Identify visible damage to critical infrastructure and access routes.'],
        disseminationMethod: 'Deliver assessed imagery package to State EOC and verify receipt.',
        existingSourceCheck: true, organicSuitability: 'CAP still imagery is suitable if weather and daylight permit.', alternateSource: 'Partner imagery may supplement gaps.', duplicateStatus: 'possible_overlap', oversightFlag: false,
        validation: {acceptable:true,feasible:true,complete:true,existingSourceChecked:true,organicSuitabilityChecked:true}, missingFields: [], status: 'taskable', lastUpdatedBy: 'collection_manager', lastUpdatedAt: '0920 PT'
      }
    ],
    history: [
      { id:'req-history-1', time:'0930 PT', actor:'Collection Manager', action:'Initial requirement queue established; Bear Creek request requires clarification.' }
    ]
  },
  syncRequirementLinks: [],
  assetControl: {
    stateAuthority: 'State J3',
    allocationStatus: 'ACTIVE STATE ALLOCATION',
    assets: [
      { id:'asset-mq9-01', type:'MQ-9', platformId:'platform-mq9', identifier:'MQ-9-01', callsign:'GARGOYLE', quantity:1, controlRelationship:'State Allocated', status:'assigned', assignment:'Pine Ridge', missionId:'mission-alpha', returnable:true, recallRisk:'Medium', notes:'Protected current mission.' },
      { id:'asset-luh72-01', type:'UH-72', platformId:'platform-uh72', identifier:'UH-72-01', callsign:'BEAR', quantity:1, controlRelationship:'State Allocated', status:'assigned', assignment:'Bear Creek', missionId:'mission-bravo', returnable:true, recallRisk:'Low', notes:'Current sortie scheduled.' },
      { id:'asset-luh72-02', type:'UH-72', platformId:'platform-uh72', identifier:'UH-72-02', callsign:'BEAR', quantity:1, controlRelationship:'State Allocated', status:'reserve', assignment:'Regional Reserve', missionId:null, returnable:true, recallRisk:'High', notes:'Unassigned state asset held for emerging need.' },
      { id:'asset-cap-01', type:'CAP', platformId:'platform-cap-182', config:'Still Imagery (C-182)', identifier:'CAP-01', quantity:1, controlRelationship:'State Allocated', status:'assigned', assignment:'Eagle Peak', missionId:'mission-charlie', returnable:true, recallRisk:'Medium', notes:'Afternoon collection window.' },
      { id:'asset-cap-02', type:'CAP', platformId:'platform-cap-182', config:'Still Imagery (C-182)', identifier:'CAP-02', quantity:1, controlRelationship:'State Allocated', status:'reserve', assignment:'Regional Reserve', missionId:null, returnable:true, recallRisk:'High', notes:'Available for tasking or release.' },
    ],
    requests: [],
    history: [
      { id:'asset-history-1', time:'0900 PT', actor:'State J3', action:'Initial allocation issued: 1 MQ-9, 2 UH-72, 2 CAP.' }
    ],
  },

  dissemination: {
    deliveries: [
      {
        id: 'delivery-alpha-01', missionId: 'mission-alpha', requirementId: 'pr-018', fire: 'Pine Ridge',
        customer: 'County Emergency Management', productType: 'Assessed perimeter and route-status update',
        sourcePlatform: 'MQ-9-01', assignedUpad: 'UPAD-CA', collectionComplete: true, processingStatus: 'complete',
        assessmentStatus: 'complete', disseminationMethod: 'Approved shared repository + customer notification',
        deliveryDeadline: '1500 Local', estimatedDelivery: '1440 Local', deliveryStatus: 'ready_to_send',
        receiptStatus: 'not_verified', feedbackStatus: 'not_requested', customerNeed: 'Decision-ready route status and perimeter movement',
        lastUpdate: '0930 PT', notes: 'Customer POC and repository access confirmed.'
      },
      {
        id: 'delivery-bravo-01', missionId: 'mission-bravo', requirementId: 'bc-022', fire: 'Bear Creek',
        customer: 'Bear Creek ICP', productType: 'Rapid route and structure-impact report',
        sourcePlatform: 'UH-72-01', assignedUpad: 'Unassigned', collectionComplete: false, processingStatus: 'not_started',
        assessmentStatus: 'not_started', disseminationMethod: '', deliveryDeadline: '1530 Local', estimatedDelivery: 'Unknown',
        deliveryStatus: 'at_risk', receiptStatus: 'not_verified', feedbackStatus: 'not_requested',
        customerNeed: 'Actionable ingress/egress and structure-impact information', lastUpdate: '0930 PT',
        notes: 'Requirement remains incomplete and UPAD support is not assigned.'
      },
      {
        id: 'delivery-charlie-01', missionId: 'mission-charlie', requirementId: 'ep-033', fire: 'Eagle Peak',
        customer: 'State EOC', productType: 'Assessed still-imagery damage package',
        sourcePlatform: 'CAP-01', assignedUpad: 'UPAD-SW', collectionComplete: false, processingStatus: 'awaiting_collection',
        assessmentStatus: 'not_started', disseminationMethod: 'Approved repository + direct State EOC notification',
        deliveryDeadline: '2100 Local', estimatedDelivery: '2045 Local', deliveryStatus: 'planned',
        receiptStatus: 'not_verified', feedbackStatus: 'not_requested', customerNeed: 'Damage summary for debris-removal and infrastructure support',
        lastUpdate: '0930 PT', notes: 'Full imagery package expected after post-flight upload.'
      }
    ],
    feedback: [],
    history: [
      { id: 'delivery-history-1', time: '0930 PT', actor: 'UPAD LNO', action: 'Initial dissemination tracker established for current missions.' }
    ]
  },
  crossPeriodImpacts: [
    { id: 'x1', source: 'Current Ops', impact: 'Protecting MQ-9-01 through 1300 reduces OP 2 reposition time.', target: "Tomorrow's Plan" },
    { id: 'x2', source: "Tomorrow's Plan", impact: 'Bear Creek requirement is not taskable, so the OP 2 sortie cannot be finalized.', target: 'Current Ops' },
  ],

  resources: {
    useHistory: [],
  },
  oversight: {
    cases: [
      {
        id: 'IO-001',
        requirementId: 'bc-022',
        title: 'Collection purpose and scope require clarification',
        owner: 'Collection Manager',
        severity: 'high',
        deadline: '1100 Local',
        status: 'open',
        concern: 'The request names a platform but does not define the authorized decision, collection area, or limits needed to keep the activity within the approved domestic mission purpose.',
        knownFacts: 'The customer needs route-status information near Bear Creek. The collection requirement is incomplete and has not been sent forward.',
        uncertainty: 'The exact area, dissemination audience, and whether existing sources can answer the need are not yet confirmed.',
        selectedAction: '',
        resolutionNote: '',
      },
      {
        id: 'IO-002',
        requirementId: 'ep-033',
        title: 'Releasability review for partner imagery',
        owner: 'UPAD LNO',
        severity: 'medium',
        deadline: '1730 Local',
        status: 'coordinating',
        concern: 'Partner imagery may carry dissemination restrictions that affect delivery to the State EOC.',
        knownFacts: 'The requirement is taskable and the customer needs an assessed damage summary by 2100 Local.',
        uncertainty: 'Partner source terms and approved dissemination path require confirmation.',
        selectedAction: 'Modify dissemination',
        resolutionNote: 'Confirm partner release terms before assigning the final delivery method.',
      },
    ],
    history: [
      { id:'io-history-1', time:'0930 PT', actor:'Collection Manager', action:'Initial oversight queue established.' }
    ],
  },
  operationalPeriodHistory: [],
  simulation: {
    turn: 0,
    injects: [],
    advisorHistory: [],
    activeDecisionPoint: null,
  },
  lastAdvisorUpdate: null,
  decisions: [],
}
