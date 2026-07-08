export const MATRIX = {
  version: 1,
  status: 'COORDINATING',
  asOf: '0930 PT',
  operationalPeriod: 'Operational Period 1',
  date: '12 August 2026',
  deadlines: [
    ['Leadership Brief', '1000'],
    ['Planning Deadline', '1600 Local'],
    ['Publication Deadline', '1800 Local'],
  ],
  sorties: [
    { id: 's1', asset: 'MQ-9', identifier: 'MQ9-01', start: 7, end: 13, fire: 'Fire Alpha', requirement: 'REQ-014', upad: 'UPAD-CA', protected: true },
    { id: 's2', asset: 'LUH-72', identifier: 'LUH72-01', start: 10, end: 14, fire: 'Fire Bravo', requirement: 'REQ-021', upad: 'UPAD-NW', protected: false },
    { id: 's3', asset: 'CAP', identifier: 'CAP-01', start: 16, end: 19, fire: 'Fire Charlie', requirement: 'REQ-008', upad: 'UPAD-SW', protected: false },
  ],
}
