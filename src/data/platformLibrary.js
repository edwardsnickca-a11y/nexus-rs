export const PLATFORM_LIBRARY = [
  {
    id: 'platform-mq9',
    type: 'MQ-9',
    displayName: 'MQ-9 Remote Sensing Platform',
    category: 'Persistent Airborne Collection',
    approvedCapabilities: [
      'Electro-optical imagery',
      'Infrared imagery',
      'Full-motion video',
      'Persistent observation',
      'Near-real-time reporting when approved architecture is available',
      'Still-frame and video-clip production support',
    ],
    supportedEffects: [
      'Persistent perimeter monitoring',
      'Evacuation route observation',
      'Change detection over time',
      'Wide-area situational awareness',
      'Time-sensitive visual confirmation',
    ],
    bestFitRequirements: [
      'Long-duration observation',
      'Repeated observation of the same NAI',
      'EO/IR or FMV requirements with tight decision windows',
      'Requirements where persistence is more important than rapid post-flight still delivery',
    ],
    constraints: [
      'Requires approved airspace and mission coordination',
      'Smoke, clouds, terrain, and sensor geometry may reduce collection quality',
      'Near-real-time access depends on the approved PAD and communications architecture',
      'Creates sustained UPAD workload when continuous or high-volume data is collected',
      'Availability and control remain subject to state allocation and recall',
    ],
    weatherConsiderations: 'Clouds, dense smoke, precipitation, and viewing geometry may degrade or block EO/IR collection.',
    airspaceConsiderations: 'Requires airspace approval, deconfliction, and compliance with applicable TFR or mission restrictions.',
    availabilityAssumption: 'One state-allocated platform in the v0.1 scenario. Additional capacity requires State J3 approval.',
    padArchitecture: {
      collection: 'EO/IR or FMV collection from the assigned NAI.',
      transfer: 'Approved SATCOM, VSAT, or other controlled mission architecture when available.',
      processing: 'Frames, clips, or imagery are prepared for assessment and storage.',
      assessment: 'UPAD analysts assess against the requirement and EEIs.',
      dissemination: 'Low-resolution or near-real-time access may be available through an approved portal; stills and clips may be posted to an approved repository.',
      customerReceipt: 'Receipt must be confirmed with the requesting customer.',
    },
    productTypes: ['Near-real-time reporting', 'FMV-derived observations', 'Still-frame captures', 'Video clips', 'Assessed imagery products'],
    expectedDelivery: 'Near-real-time reporting is possible only when the mission architecture supports it; assessed products require additional processing and UPAD time.',
    productionBurden: 'High during persistent or continuous collection. Product cutoffs must account for analyst capacity and data volume.',
    hardLimits: [
      'Do not claim weapons support, targeting, SIGINT, classified sensors, or unsupported sensor packages.',
      'Do not assume live video is available unless the approved mission architecture explicitly supports it.',
      'Do not treat platform assignment as proof that the requirement is feasible or lawful.',
    ],
    keywords: ['persistent', 'perimeter', 'evacuation', 'route', 'eo', 'ir', 'fmv', 'video', 'change detection', 'wildfire', 'night'],
  },
  {
    id: 'platform-luh72',
    type: 'LUH-72',
    displayName: 'LUH-72 Lakota',
    category: 'Manned Tactical Remote Sensing',
    approvedCapabilities: [
      'Electro-optical imagery',
      'Infrared imagery when configured with an approved sensor package',
      'Visual observation and radio reporting',
      'Still imagery and video collection',
      'Near-real-time line-of-sight reporting when approved ground architecture is available',
    ],
    supportedEffects: [
      'Route and access assessment',
      'Critical infrastructure observation',
      'Focused damage assessment',
      'Rapid visual confirmation',
      'Ground-segment or receiving-site support when required by the architecture',
    ],
    bestFitRequirements: [
      'Focused collection over a defined NAI',
      'Route, bridge, structure, or infrastructure observation',
      'Requirements needing visual reporting and moderate collection flexibility',
      'Requirements where a shorter sortie can satisfy a clear decision window',
    ],
    constraints: [
      'Shorter endurance and persistence than MQ-9',
      'Weather, visibility, terrain, crew duty limits, and airspace can constrain execution',
      'Live or near-real-time video depends on line-of-sight receiving equipment and approved architecture',
      'May require ground segment positioning and communications support',
      'Availability and control remain subject to state allocation and recall',
    ],
    weatherConsiderations: 'Visibility, ceiling, winds, precipitation, terrain, smoke, and daylight may affect mission execution and sensor usefulness.',
    airspaceConsiderations: 'Requires coordination with aviation authorities, TFR deconfliction, and mission-specific airspace approval.',
    availabilityAssumption: 'Two state-allocated aircraft in the v0.1 scenario. One may be held in reserve, assigned, or released.',
    padArchitecture: {
      collection: 'EO/IR, video, still imagery, or visual observation over the assigned NAI.',
      transfer: 'Radio reporting, onboard recording, or approved line-of-sight downlink when the required ground segment is available.',
      processing: 'Collected imagery or video is transferred and prepared for assessment.',
      assessment: 'UPAD or designated analysts assess against the EEIs.',
      dissemination: 'Reports and products are delivered through approved unclassified channels or repositories.',
      customerReceipt: 'Customer receipt and usability must be verified.',
    },
    productTypes: ['Visual observation report', 'Still imagery', 'Video clips', 'Route or structure assessment', 'Assessed imagery product'],
    expectedDelivery: 'Immediate radio observations may be available; imagery delivery timing depends on downlink, transfer, and UPAD availability.',
    productionBurden: 'Moderate. Burden increases when video must be reviewed or multiple NAIs are collected during one sortie.',
    hardLimits: [
      'Do not assume every LUH-72 has the same sensor configuration.',
      'Do not assume a live feed exists without the required receiving architecture.',
      'Do not model cockpit control, detailed routes, or tactical aviation decisions.',
    ],
    keywords: ['route', 'bridge', 'structure', 'infrastructure', 'damage', 'eo', 'ir', 'visual', 'rapid', 'access', 'road'],
  },
  {
    id: 'platform-cap',
    type: 'CAP',
    displayName: 'Civil Air Patrol Aircraft',
    category: 'Manned Still-Imagery Collection',
    approvedCapabilities: [
      'Handheld or approved still photography',
      'Visual observation and radio reporting',
      'Post-flight imagery upload',
      'Limited in-flight image transmission when approved equipment and connectivity are available',
      'Broad damage-assessment coverage using planned collection routes',
    ],
    supportedEffects: [
      'Post-event damage documentation',
      'Route and infrastructure imagery',
      'Broad visual survey',
      'Still-image support to damage assessment',
      'Observed-condition reporting by radio',
    ],
    bestFitRequirements: [
      'Georeferenced or location-associated still imagery',
      'Broad daylight damage assessment',
      'Requirements where post-flight delivery meets the decision window',
      'Requirements that can be satisfied through visual observation and still images',
    ],
    constraints: [
      'Generally less persistent and less suitable for continuous monitoring than MQ-9',
      'Weather, daylight, visibility, airspace, and flight safety strongly affect execution',
      'Full imagery sets may not be available until after landing and upload',
      'In-flight transmission depends on approved communications equipment and connectivity',
      'Large image sets can create processing and upload delay',
    ],
    weatherConsiderations: 'Ceiling, visibility, precipitation, winds, smoke, and daylight may prevent or reduce useful collection.',
    airspaceConsiderations: 'Requires airspace coordination and may be limited by TFRs, congestion, or safety restrictions.',
    availabilityAssumption: 'Two state-allocated aircraft in the v0.1 scenario. Availability remains subject to state tasking and recall.',
    padArchitecture: {
      collection: 'Still photographs and visual observations are collected from the aircraft.',
      transfer: 'Observations may be reported by radio. Selected images may be sent through approved email or satellite connectivity when available.',
      processing: 'Mission imagery is organized and uploaded after flight when required.',
      assessment: 'UPAD or designated analysts assess imagery against the EEIs.',
      dissemination: 'Images and assessed products are posted to an approved repository or sent through approved unclassified channels.',
      customerReceipt: 'The customer is notified and receipt is verified.',
    },
    productTypes: ['Radio observation', 'Still imagery set', 'Damage-assessment imagery package', 'Annotated still image', 'Assessed damage summary'],
    expectedDelivery: 'Radio observations may be immediate. Selected images may be transmitted in flight when equipped; complete imagery is commonly available after landing and upload.',
    productionBurden: 'Moderate to high when many images require sorting, geolocation, assessment, and annotation.',
    hardLimits: [
      'Do not assume every CAP aircraft has identical cameras, connectivity, or specialized kits.',
      'Do not promise near-real-time imagery unless the approved architecture supports it.',
      'Do not use CAP as a substitute for persistent FMV when the decision requires continuous observation.',
    ],
    keywords: ['still', 'imagery', 'damage', 'structure', 'infrastructure', 'route', 'road', 'visual', 'post-flight', 'daylight', 'survey'],
  },
]

export function evaluatePlatformSuitability(requirement, platform) {
  if (!requirement) return { status: 'needs_information', score: 0, reasons: ['No requirement selected.'] }
  if (!['taskable', 'sent_forward'].includes(requirement.status)) {
    return { status: 'needs_information', score: 0, reasons: ['Requirement must be taskable before platform matching.'] }
  }

  const text = [
    requirement.title,
    requirement.what,
    requirement.where,
    requirement.when,
    requirement.why,
    requirement.requiredEffect,
    ...(requirement.eeis || []),
  ].join(' ').toLowerCase()

  const matches = platform.keywords.filter(keyword => text.includes(keyword))
  let score = matches.length
  const reasons = []

  if (matches.length) reasons.push(`Matched requirement language: ${matches.slice(0, 5).join(', ')}.`)
  if (platform.type === 'CAP' && /(persistent|continuous|fmv|near-real-time video)/.test(text)) {
    score -= 4
    reasons.push('CAP is not the preferred choice for continuous or persistent FMV requirements.')
  }
  if (platform.type === 'MQ-9' && /(still imagery|damage assessment|perimeter|persistent|ir|night|fmv)/.test(text)) score += 2
  if (platform.type === 'LUH-72' && /(route|bridge|structure|access|visual|rapid)/.test(text)) score += 2
  if (platform.type === 'CAP' && /(still|damage|structure|infrastructure|survey|daylight)/.test(text)) score += 2

  if (/no later than|cutoff|deadline|immediate|near-real-time|real-time/.test(text)) {
    reasons.push('Delivery architecture and product cutoff must be checked before assignment.')
  }

  if (score >= 4) return { status: 'suitable', score, reasons: reasons.length ? reasons : ['Controlled capability aligns with the requirement.'] }
  if (score >= 1) return { status: 'conditional', score, reasons: reasons.length ? reasons : ['May satisfy the requirement if timing, weather, airspace, and PAD constraints are acceptable.'] }
  return { status: 'not_suitable', score, reasons: reasons.length ? reasons : ['No controlled capability match was identified for the current requirement language.'] }
}
