export const INITIAL_MATRIX = {
  version: 1,
  status: 'COORDINATING',
  asOf: '0930 PT',
  operationalPeriod: 'Operational Period 1',
  date: '12 August 2026',
  coordinatorApprovalStatus: 'pending',
  deadlines: [
    ['Leadership Brief', '1000'],
    ['Planning Deadline', '1600 Local'],
    ['Publication Deadline', '1800 Local'],
  ],
  sorties: [
    { id: 's1', asset: 'MQ-9', identifier: 'MQ9-01', start: 7, end: 13, fire: 'Pine Ridge', requirement: 'REQ-014', objective: 'Fire perimeter / evacuation route', upad: 'UPAD-CA', productStatus: 'IN PRODUCTION', missionStatus: 'ACTIVE', protected: true, airspace: 'APPROVED', coordination: 'CONFIRMED' },
    { id: 's2', asset: 'UH-72', identifier: 'UH72-01', start: 10, end: 14, fire: 'Bear Creek', requirement: 'REQ-021', objective: 'Route and structure impacts', upad: 'UPAD-NW', productStatus: 'QUEUED', missionStatus: 'PLANNED', protected: false, airspace: 'COORDINATING', coordination: 'PENDING' },
    { id: 's3', asset: 'CAP', identifier: 'CAP-01', start: 16, end: 19, fire: 'Eagle Peak', requirement: 'REQ-008', objective: 'Damage overview', upad: 'UPAD-SW', productStatus: 'NOT STARTED', missionStatus: 'PLANNED', protected: false, airspace: 'APPROVED', coordination: 'CONFIRMED' },
  ],
  unmetNeeds: [
    { id: 'u1', requirement: 'REQ-024', fire: 'Eagle Peak', window: '1400–1700', reason: 'No NEXUS-controlled asset available', deadline: '1230 Local', status: 'OPEN' },
  ],
  coverageGaps: [
    { id: 'g1', fire: 'Pine Ridge', window: '1300–1600', requirement: 'REQ-014', consequence: 'Loss of persistent coverage during evacuation window', status: 'AT RISK' },
  ],
  partnerAssets: [
    { id: 'p1', agency: 'US Forest Service', asset: 'Forest Service Asset', window: '1100–1600 Local', status: 'SUPPORT REQUESTED' },
    { id: 'p2', agency: 'BLM', asset: 'BLM Asset', window: '1400–1800 Local', status: 'VISIBLE ONLY' },
  ],
  airspaceIssues: [
    { id: 'a1', fire: 'Bear Creek', issue: 'UH-72 coordination update', deadline: '1045 Local', status: 'ACTION' },
  ],
  leadershipNotes: [
    'Eagle Peak has an unmet afternoon collection need.',
    'Pine Ridge protected coverage may conflict with life-safety retask.',
    'UPAD-NW delivery estimate requires confirmation before brief.',
  ],
  changeHistory: [
    { version: 1, asOf: '0930 PT', updatedBy: 'RS Manager', note: 'Initial operational matrix established.' },
  ],
}
