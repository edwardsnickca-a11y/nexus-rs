export const INITIAL_MISSION_STATE = {
  operationalPeriod: 1,
  localTimeLabel: 'Pacific Time',
  asOf: '0930 PT',
  currentOps: {
    status: 'active',
    protectedMissionId: 'mission-alpha',
    missions: [
      { id: 'mission-alpha', fire: 'Fire Alpha', platform: 'MQ-9-01', window: '0700–1300', objective: 'Evacuation corridor and fire perimeter', status: 'active', protected: true, risk: 'Coverage ends before late evacuation window', coordinatorNotified: true },
      { id: 'mission-bravo', fire: 'Fire Bravo', platform: 'LUH-72-01', window: '1000–1400', objective: 'Route and structure impacts', status: 'at_risk', protected: false, risk: 'TFR update pending', coordinatorNotified: false },
      { id: 'mission-charlie', fire: 'Fire Charlie', platform: 'CAP-01', window: '1600–1900', objective: 'Damage overview', status: 'planned', protected: false, risk: 'Afternoon gap remains', coordinatorNotified: false },
    ],
    deadlines: [
      { id: 'd1', label: 'Fire Alpha product cutoff', time: '1500 Local', severity: 'high' },
      { id: 'd2', label: 'Fire Bravo airspace decision', time: '1045 Local', severity: 'high' },
      { id: 'd3', label: 'Fire Charlie partner decision', time: '1230 Local', severity: 'medium' },
    ],
  },
  tomorrowPlan: {
    status: 'not_ready',
    readiness: 62,
    requirements: [
      { id: 'req-alpha', fire: 'Fire Alpha', title: 'Late-period perimeter coverage', taskable: true, platform: 'Unassigned', upad: 'UPAD-CA', status: 'ready' },
      { id: 'req-bravo', fire: 'Fire Bravo', title: 'Change detection / structure threat', taskable: false, platform: 'LUH-72-01', upad: 'Unassigned', status: 'draft' },
      { id: 'req-charlie', fire: 'Fire Charlie', title: 'Damage assessment', taskable: true, platform: 'Partner opportunity', upad: 'UPAD-SW', status: 'gap' },
    ],
    blockers: [
      'Fire Bravo EEIs are not approved',
      'Fire Charlie partner support is not confirmed',
      'UPAD support is not assigned for Fire Bravo',
    ],
    planningDeadline: '1600 Local',
    publicationDeadline: '1800 Local',
    approved: false,
  },
  crossPeriodImpacts: [
    { id: 'x1', source: 'Current Ops', impact: 'Protecting MQ-9-01 through 1300 reduces OP 2 reposition time.', target: "Tomorrow's Plan" },
    { id: 'x2', source: "Tomorrow's Plan", impact: 'Fire Bravo requirement is not taskable, so the OP 2 sortie cannot be finalized.', target: 'Current Ops' },
  ],
  decisions: [],
}
