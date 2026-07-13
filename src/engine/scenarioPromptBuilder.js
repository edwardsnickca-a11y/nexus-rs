import { CAPABILITY_LIBRARY } from './capabilityLibrary.js'
import { ROLE_AUTHORITY } from './roleAuthority.js'
import { GACC_COORDINATION_CENTERS } from '../data/californiaGaccLocations.js'

const list = (value) => Array.isArray(value) ? value : []
const take = (items,count=20) => list(items).slice(-count)

export function buildInitializationContext(state) {
  const role=state.exercise?.selectedRole||state.activeRole||'remote_sensing_coordinator'
  const gaccRegion=state.exercise?.gaccRegion||state.scenario?.gaccRegion||'North Ops'
  const regionLabel=gaccRegion==='South Ops'?'Southern California':'Northern California'
  const scenarioLocations=state.exercise?.scenarioLocations||state.scenario?.scenarioLocations||[]
  const coordinationCenter=state.exercise?.coordinationCenter||state.scenario?.coordinationCenter||GACC_COORDINATION_CENTERS[gaccRegion]
  return {
    mode:'initialize',
    randomizationNonce:`${Date.now()}-${Math.random().toString(36).slice(2)}`,
    scenarioConcept:`${regionLabel} Multi-Fire Remote Sensing Operations`,
    gaccRegion,
    regionLabel,
    scenarioLocations,
    coordinationCenter,
    selectedRole:role,
    difficulty:state.exercise?.difficulty||state.exercise?.selectedDifficulty||state.scenario?.difficulty||'Standard',
    operationalContext:state.exercise?.operationalContext||'',
    exerciseFocus:state.exercise?.exerciseFocus||'Full Mission Cycle',
    geographicConstraint:`Use only the platform-selected real incident seed locations below. Do not substitute another city, county, landmark, or coordinate. Build one wildfire incident around each selected location and preserve its city, county, latitude, longitude, and GACC region exactly.`,
    selectedIncidentLocations:scenarioLocations,
    timeStandard:'Use local Pacific incident time in all trainee-facing fields. Format HHMM PT.',
    platformCapabilities:CAPABILITY_LIBRARY,
    roleAuthority:ROLE_AUTHORITY[role],
    gaccSelectionRequirement:`The application has already selected ${gaccRegion}. Do not change the region. The coordination center is ${coordinationCenter?.city||''}, California. This is the staff location only, not the location of every incident. Every generated incident must use one of the exact platform-selected incident locations and coordinates.`,
    locationDiversityRequirement:'Choose a fresh mix of real incident locations for each exercise. Consider coastal, valley, foothill, mountain, desert, and wildland-urban interface settings appropriate to the selected GACC. Avoid repeatedly defaulting to the same small cluster of locations.',
    gaccPerspective:'The Remote Sensing Coordinator operates from a California GACC-style regional coordination perspective.',
    outputPurpose:'Return a complete fresh world. Do not preserve Pine Ridge, Bear Creek, Eagle Peak, or other static demo entities.',
    incidentSituationRequirements:{
      requiredForEveryIncident:true,
      fields:[
        'incidentNumber','startDateTime','lat','lng','gaccRegion','sizeAcres','containmentPercent','significantEvents',
        'lifeSafety','weatherConcerns','projectedActivity','threatSummary',
        'strategicObjectives','plannedActions'
      ],
      guidance:`Populate every field with concise, operationally useful incident information at STARTEX. Use real ${regionLabel} geography and local Pacific time. Do not use generic placeholders such as Not reported. If a detail is intentionally unavailable, use Pending incident update sparingly and only for optional details.`,
    },
  }
}

export function buildAdvanceContext(state) {
  const director=state.simulation?.scenarioDirector||{}
  const lastCount=Number(director.lastEvaluatedDecisionCount||0)
  const actions=list(state.decisions).slice(lastCount).map(item=>({
    id:item.id,
    role:item.role,
    time:item.asOf,
    type:item.type,
    exactText:item.exactText||'',
    detail:item.interpretedDecision||item.detail||'',
    authorityAssessment:item.authorityAssessment||'',
    userConfirmed:Boolean(item.userConfirmed),
  }))
  const role=state.exercise?.selectedRole||state.activeRole||'remote_sensing_coordinator'
  const gaccRegion=state.exercise?.gaccRegion||state.scenario?.gaccRegion||'North Ops'
  const regionLabel=gaccRegion==='South Ops'?'Southern California':'Northern California'
  const scenarioLocations=state.exercise?.scenarioLocations||state.scenario?.scenarioLocations||[]
  const coordinationCenter=state.exercise?.coordinationCenter||state.scenario?.coordinationCenter||GACC_COORDINATION_CENTERS[gaccRegion]

  return {
    mode:'advance',
    randomizationNonce:`${Date.now()}-${Math.random().toString(36).slice(2)}`,
    difficulty:state.exercise?.difficulty||state.exercise?.selectedDifficulty||state.scenario?.difficulty||'Standard',
    selectedRole:role,
    gaccRegion,
    regionLabel,
    scenarioLocations,
    coordinationCenter,
    assignedIncident:state.exercise?.assignedIncident||state.activeIncident||'',
    currentIncidentTime:state.exercise?.localIncidentTime||state.asOf||'',
    currentTurn:Number(state.exercise?.turnNumber||0),
    roleAuthority:ROLE_AUTHORITY[role],
    gaccSelectionRequirement:`The exercise region is locked to ${gaccRegion}. Do not move incidents into the other GACC. Continue to describe the scenario as ${regionLabel}.`,
    locationDiversityRequirement:'Choose a fresh mix of real incident locations for each exercise. Consider coastal, valley, foothill, mountain, desert, and wildland-urban interface settings appropriate to the selected GACC. Avoid repeatedly defaulting to the same small cluster of locations.',
    gaccPerspective:'The Remote Sensing Coordinator operates from a California GACC-style regional coordination perspective.',
    platformCapabilities:CAPABILITY_LIBRARY,
    hiddenWorld:director.hiddenWorld||{},
    priorScenarioSummary:director.lastScenarioSummary||'',
    priorRevealedFacts:take(director.revealedFacts,30),
    priorInjects:take(state.simulation?.injects,20),
    priorConsequences:take(list(state.missionUpdates).filter(item=>item.category==='consequence'),20),
    actionsSinceLastTurn:actions,
    advisorConversation:take(state.simulation?.advisorHistory,8).map(item=>({
      time:item.time,
      traineeText:item.traineeText,
      advisorMessage:item.advisorMessage,
    })),
    incidentUpdateRequirement:'When conditions materially change, update the affected incident through an incidents merge patch. Keep size, containment, significant events, life safety, weather, projected activity, threats, objectives, and planned actions current and causally consistent.',
    visibleState:{
      incidents:list(state.incidents),
      customers:list(state.customers),
      requirements:list(state.requirements?.items),
      missions:list(state.currentOps?.missions),
      assets:list(state.assetControl?.assets),
      sorties:list(state.sorties),
      collectionDecks:list(state.collectionDecks),
      upads:list(state.upads),
      products:list(state.products),
      deliveries:list(state.dissemination?.deliveries),
      airspace:list(state.airspace),
      oversight:list(state.oversight?.cases),
      decisionWindows:list(state.exercise?.decisionWindows),
    },
  }
}
