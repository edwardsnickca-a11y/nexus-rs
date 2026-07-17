// Shared, deterministic regional asset allocation.
//
// This models the AI RS Coordinator's prior "knife-fight call": given the set of
// active incidents, produce a realistic regional asset pool and allocate it across
// fires. Runs on BOTH scenario paths (AI-generated and fallback) so the allocation
// model always governs what the player sees, regardless of how the scenario was built.
//
// Real-world allocation rules:
//   - 1 MQ-9 for the region, sent to the highest life-safety fire.
//   - 1 EO/IR satellite, always-on, regional (not tied to a fire).
//   - 4 UH-72 sensor-capable total; 1 ALWAYS held in regional reserve.
//     The 3 allocable go to the top-priority fires. Lower-priority fires may go
//     without (EMAC request to another state would be required for more).
//   - 2 CAP still-imagery per fire (plentiful). Labeled just "CAP".
//   - No CAP FMV or federal assets at start; those are request-only.

const UH72_TOTAL = 4
const UH72_RESERVE = 1

// Rank incidents: life-safety tier first, then size, then lower containment.
export function rankIncidentsByPriority(incidents) {
  return [...incidents].sort((a, b) =>
    ((b.lifeSafetyTier || 0) - (a.lifeSafetyTier || 0)) ||
    ((b.sizeAcres || 0) - (a.sizeAcres || 0)) ||
    ((a.containmentPercent || 0) - (b.containmentPercent || 0))
  )
}

// Produce the regional asset pool + allocation for a set of incidents.
// Returns { assets, primaryAssetByIncidentId } where primaryAssetByIncidentId maps
// each incident id to its highest-value assigned asset (MQ-9 > UH-72 > CAP) for
// mission linkage.
export function allocateRegionalAssets(incidents) {
  const assets = []
  const fires = (incidents || []).filter(Boolean)
  const ranked = rankIncidentsByPriority(fires)
  const uh72Allocable = UH72_TOTAL - UH72_RESERVE
  const uh72IncidentIds = new Set(ranked.slice(0, uh72Allocable).map(i => i.id))
  const topIncident = ranked[0]

  let seq = 0
  const nextId = () => `asset-${String(seq++).padStart(2, '0')}`
  const push = (o) => {
    const a = {
      id: nextId(),
      quantity: 1,
      controlRelationship: 'State Allocated',
      returnable: true,
      recallRisk: 'Low',
      missionId: null,
      ...o,
    }
    assets.push(a)
    return a
  }

  const counters = { mq9: 0, uh72: 0, cap: 0 }
  const pad2 = n => String(n).padStart(2, '0')

  // MQ-9 -> highest life-safety fire
  if (topIncident) {
    push({
      type: 'MQ-9', platformId: 'platform-mq9',
      identifier: `MQ-9-${pad2(++counters.mq9)}`, callsign: 'GARGOYLE-01',
      status: 'assigned', assignment: topIncident.name,
      notes: 'Assigned to the highest life-safety incident; may be dynamically retasked with coordination.',
    })
  }

  // EO/IR satellite -> regional, always-on
  push({
    type: 'EO/IR Satellite', platformId: 'platform-eoir-sat',
    identifier: 'SAT-EOIR', callsign: 'EO/IR SAT',
    status: 'assigned', assignment: 'Regional',
    returnable: false,
    notes: 'Standard regional EO/IR satellite collection; always available for coverage.',
  })

  // UH-72 -> one per top-priority fire (allocable count), plus 1 reserve
  ranked.forEach(incident => {
    if (uh72IncidentIds.has(incident.id)) {
      push({
        type: 'UH-72', platformId: 'platform-uh72',
        identifier: `UH-72-${pad2(++counters.uh72)}`, callsign: `BEAR-${pad2(counters.uh72)}`,
        status: 'assigned', assignment: incident.name,
        recallRisk: 'Medium',
        notes: 'State-allocated sensor support; subject to regional reprioritization.',
      })
    }
  })
  push({
    type: 'UH-72', platformId: 'platform-uh72',
    identifier: `UH-72-${pad2(++counters.uh72)}`, callsign: `BEAR-${pad2(counters.uh72)}`,
    status: 'reserve', assignment: 'Regional Reserve',
    notes: 'Held in regional reserve. Additional UH-72 sensor support would require an EMAC request to another state.',
  })

  // CAP still imagery -> 2 per fire
  fires.forEach(incident => {
    for (let c = 0; c < 2; c++) {
      push({
        type: 'CAP', platformId: 'platform-cap-182',
        identifier: `CAP-${pad2(++counters.cap)}`, callsign: `CAP-${pad2(counters.cap)}`,
        status: 'assigned', assignment: incident.name,
        recallRisk: 'Low',
        notes: 'Civil Air Patrol still-imagery collection.',
      })
    }
  })

  // Primary asset per incident (for mission linkage): MQ-9 > UH-72 > CAP.
  const primaryAssetByIncidentId = {}
  fires.forEach(incident => {
    const forFire = assets.filter(a => a.assignment === incident.name && a.status === 'assigned')
    const primary =
      forFire.find(a => a.type === 'MQ-9') ||
      forFire.find(a => a.type === 'UH-72') ||
      forFire.find(a => a.type === 'CAP') || null
    if (primary) primaryAssetByIncidentId[incident.id] = primary
  })

  return { assets, primaryAssetByIncidentId }
}
