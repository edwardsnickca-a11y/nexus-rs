const nowLabel = (state) => state.exercise?.localIncidentTime || state.asOf || 'Current local time'

export function buildTomorrowPlanReviews(state, submittingRole) {
  const plan = state.tomorrowPlan || {}
  const requirements = plan.requirements || []
  const missions = state.currentOps?.missions || []
  const deliveries = state.dissemination?.deliveries || []
  const reviews = []
  const time = nowLabel(state)
  const currentOp = Number(state.exercise?.activeOperationalPeriod || state.operationalPeriod || 1)
  const nextOp = currentOp + 1

  const incomplete = requirements.filter((item) => !item.taskable && item.status !== 'ready')
  const unassignedPlatforms = requirements.filter((item) => !item.platform || item.platform === 'Unassigned')
  const unassignedUpads = requirements.filter((item) => !item.upad || item.upad === 'Unassigned')
  const executionRisks = missions.filter((item) => /risk|pending|delay|airspace|tfr/i.test(`${item.status || ''} ${item.risk || ''}`))
  const deliveryRisks = deliveries.filter((item) => item.assignedUpad === 'Unassigned' || /risk|delay/i.test(`${item.deliveryStatus || ''} ${item.processingStatus || ''}`))

  if (submittingRole !== 'remote_sensing_manager') {
    const conditions = []
    if (unassignedPlatforms.length) conditions.push(`${unassignedPlatforms.length} requirement(s) still need a feasible platform or sortie proposal.`)
    if (executionRisks.length) conditions.push(`${executionRisks.length} current mission or airspace risk(s) could affect OP ${nextOp} feasibility.`)
    reviews.push({
      id: `review-rsm-${Date.now()}`,
      role: 'Remote Sensing Manager',
      time,
      outcome: conditions.length ? 'REVISION REQUIRED' : 'COORDINATED',
      summary: conditions.length ? 'The execution concept is not yet supportable as written.' : 'The proposed timing and mission structure are supportable with the currently visible platform posture.',
      conditions,
    })
  }

  if (submittingRole !== 'upad_lno') {
    const conditions = []
    if (unassignedUpads.length) conditions.push(`${unassignedUpads.length} requirement(s) do not have UPAD support assigned.`)
    if (deliveryRisks.length) conditions.push(`${deliveryRisks.length} product or delivery item(s) remain at risk.`)
    reviews.push({
      id: `review-upad-${Date.now() + 1}`,
      role: 'UPAD LNO',
      time,
      outcome: conditions.length ? 'APPROVED WITH CONDITIONS' : 'COORDINATED',
      summary: conditions.length ? 'Production support is possible, but the plan needs workload or assignment corrections before final approval.' : 'The production and dissemination plan is supportable with the currently visible UPAD posture.',
      conditions,
    })
  }

  if (submittingRole !== 'collection_manager') {
    const conditions = []
    if (incomplete.length) conditions.push(`${incomplete.length} requirement(s) remain incomplete or not taskable.`)
    reviews.push({
      id: `review-cm-${Date.now() + 2}`,
      role: 'Collection Manager',
      time,
      outcome: conditions.length ? 'REVISION REQUIRED' : 'COORDINATED',
      summary: conditions.length ? 'The proposed plan still contains requirements that are not ready for collection planning.' : 'The collection requirements are sufficiently developed for coordination.',
      conditions,
    })
  }

  const allConditions = reviews.flatMap((item) => item.conditions || [])
  reviews.push({
    id: `review-rsc-${Date.now() + 3}`,
    role: 'Remote Sensing Coordinator',
    time,
    outcome: allConditions.length ? 'RETURNED FOR REVISION' : 'COORDINATED',
    summary: allConditions.length ? 'The regional plan is not ready for final approval. Resolve the identified execution, requirement, and production gaps and resubmit.' : 'The regional plan is coordinated and may proceed to final Coordinator approval.',
    conditions: allConditions.slice(0, 6),
  })

  return reviews
}
