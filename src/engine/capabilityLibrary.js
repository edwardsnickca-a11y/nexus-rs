export const CAPABILITY_LIBRARY = {
  platforms: {
    'MQ-9': {
      displayName: 'MQ-9',
      callsign: 'GARGOYLE',
      capabilities: [
        'MX-15',
        'Full-motion video',
        'SAR capability',
        'Long-endurance support',
        'Persistent coverage',
        'Dynamic retasking',
      ],
      constraints: [
        'Airspace',
        'Weather',
        'Task saturation',
        'Competing high-priority missions',
        'Processing burden',
        'Crew or mission limitations supplied by scenario state',
      ],
    },
    'UH-72': {
      displayName: 'UH-72',
      callsign: 'BEAR',
      capabilities: [
        'MX-15',
        'Manned airborne collection',
        'Flexible incident-level support',
        'Targeted collection',
        'Visual confirmation',
      ],
      constraints: [
        'Endurance',
        'Weather',
        'Crew availability',
        'Airspace congestion',
        'Mission duration',
        'Follow-on commitments',
      ],
    },
    CAP: {
      displayName: 'Civil Air Patrol Aircraft',
      callsign: 'CAP',
      capabilities: [
        'Still imagery',
        'Limited FMV on selected aircraft',
        'WALDO broad-area imagery on one configured aircraft',
        'Flexible support for selected missions',
      ],
      constraints: [
        'Limited FMV availability',
        'Weather',
        'Crew scheduling',
        'Daylight',
        'Data transfer',
        'Processing timelines',
      ],
    },
  },
  upadProfiles: {
    'UPAD-CA': {
      displayName: 'California UPAD',
      specialties: ['FMV', 'Still imagery', 'Wildfire support', 'Rapid production'],
    },
    'UPAD-SAT': {
      displayName: 'Satellite-Focused UPAD',
      specialties: ['MSI', 'Commercial satellite imagery', 'Large-area coverage', 'Comparative imagery'],
    },
    'UPAD-GIS': {
      displayName: 'GIS-Focused UPAD',
      specialties: ['GIS', 'Mapping', 'Overlays', 'Route context', 'Infrastructure context'],
    },
    'UPAD-SURGE': {
      displayName: 'Night-Shift / Surge UPAD',
      specialties: ['Continuity', 'After-hours support', 'Overflow workload'],
    },
  },
}

export const APPROVED_PLATFORM_TYPES = Object.keys(CAPABILITY_LIBRARY.platforms)

export function callsignForPlatform(type) {
  return CAPABILITY_LIBRARY.platforms[type]?.callsign || type
}
