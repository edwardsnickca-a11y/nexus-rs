export const FTA_REFERENCE_TABLE = Object.freeze([
  Object.freeze({ band: '2,500+ ft AGL', occupant: 'ATGS / Aerial Supervision', status: 'RESERVED' }),
  Object.freeze({ band: '1,500–2,000 ft AGL', occupant: 'Airtankers / Scoopers', status: 'OCCUPIED' }),
  Object.freeze({ band: '1,000 ft AGL', occupant: 'Lead planes / ASM', status: 'OCCUPIED' }),
  Object.freeze({ band: '500 ft AGL & below', occupant: 'Rotary-wing operations', status: 'OCCUPIED' }),
])

export const AIRSPACE_PRINCIPLES = Object.freeze([
  'Maintain at least 500 ft vertical separation between operational layers.',
  'Aircraft check in with ATGS / Air Attack before entering the Fire Traffic Area.',
  'Incident Command manages airspace supporting ground operations.',
  'Temporary flight restrictions may be protected under FAR 91.137.',
  'Account for smoke, terrain, wires, and other aviation hazards.',
])

export const AIRSPACE_STATUS_OPTIONS = Object.freeze([
  'NOT_STARTED',
  'IN_PROGRESS',
  'RESOLVED',
  'UNABLE_TO_RESOLVE',
  'ESCALATED',
])
