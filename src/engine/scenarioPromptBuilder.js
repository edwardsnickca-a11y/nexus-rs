import { CAPABILITY_LIBRARY } from './capabilityLibrary.js'
import { ROLE_AUTHORITY } from './roleAuthority.js'

const list = (value) => Array.isArray(value) ? value : []
const take = (items,count=20) => list(items).slice(-count)

export function buildInitializationContext(state) {
  const role=state.exercise?.selectedRole||state.activeRole||'remote_sensing_coordinator'
  return {
    mode:'initialize',
    randomizationNonce:`${Date.now()}-${Math.random().toString(36).slice(2)}`,
    scenarioConcept:'California GACC Multi-Fire Remote Sensing Operations',
    selectedRole:role,
    difficulty:state.exercise?.difficulty||state.exercise?.selectedDifficulty||state.scenario?.difficulty||'Standard',
    operationalContext:state.exercise?.operationalContext||'',
    exerciseFocus:state.exercise?.exerciseFocus||'Full Mission Cycle',
    geographicConstraint:'Use 2–5 wildfire incidents anywhere in California, distributed across the North Ops (ONCC) and South Ops (OSCC) Geographic Area Coordination Center operating areas. Use real California cities, counties, tribal jurisdictions, national forests, mountain ranges, valleys, or recognized operational areas. Do not invent geographic names. Vary the geography between exercises and avoid repeatedly selecting the same cities or counties.',
    timeStandard:'Use local Pacific incident time in all trainee-facing fields. Format HHMM PT.',
    platformCapabilities:CAPABILITY_LIBRARY,
    roleAuthority:ROLE_AUTHORITY[role],
    locationDiversityRequirement:'Choose a fresh mix of California incident locations for each exercise. Consider both North Ops and South Ops, coastal, valley, foothill, mountain, desert, and wildland-urban interface settings. Do not default repeatedly to Redding, Chico, Ukiah, Quincy, or the same small cluster of Northern California locations.',
    gaccPerspective:'The Remote Sensing Coordinator operates from a California GACC-style regional coordination perspective and may coordinate across either North Ops or South Ops.',
    outputPurpose:'Return a complete fresh world. Do not preserve Pine Ridge, Bear Creek, Eagle Peak, or other static demo entities.',
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

  return {
    mode:'advance',
    randomizationNonce:`${Date.now()}-${Math.random().toString(36).slice(2)}`,
    difficulty:state.exercise?.difficulty||state.exercise?.selectedDifficulty||state.scenario?.difficulty||'Standard',
    selectedRole:role,
    assignedIncident:state.exercise?.assignedIncident||state.activeIncident||'',
    currentIncidentTime:state.exercise?.localIncidentTime||state.asOf||'',
    currentTurn:Number(state.exercise?.turnNumber||0),
    roleAuthority:ROLE_AUTHORITY[role],
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
