const list = (value) => Array.isArray(value) ? value : []

function mergeById(items,id,changes) {
  let found=false
  const next=list(items).map(item=>{
    if(item.id!==id) return item
    found=true
    return {...item,...changes,id:item.id}
  })
  return {found,items:next}
}

function deriveTomorrowRequirements(requirements) {
  return list(requirements).map(item=>({
    id:item.id,
    incidentId:item.incidentId,
    fire:item.fire||item.incident,
    incident:item.incident||item.fire,
    title:item.title,
    taskable:Boolean(item.taskable||item.status==='taskable'),
    platform:item.requestedPlatform||'Unassigned',
    upad:item.assignedUpad||'Unassigned',
    status:item.status==='taskable'?'ready':'draft',
  }))
}

function deriveBlockers(requirements,deliveries) {
  const blockers=[]
  for(const item of list(requirements)){
    if(!item.taskable&&item.status!=='taskable') blockers.push(`${item.incident||item.fire} requirement needs clarification`)
  }
  for(const item of list(deliveries)){
    if(item.assignedUpad==='Unassigned') blockers.push(`${item.incident||item.fire} UPAD support is not assigned`)
  }
  return blockers.slice(0,8)
}

export function applyInitialWorld(baseState,world) {
  const now=world.scenarioTime
  const requirements=list(world.requirements)
  const missions=list(world.missions)
  const assets=list(world.assets)
  const deliveries=list(world.deliveries)
  const oversight=list(world.oversightIssues)
  const openingUpdates=[
    ...list(world.initialInjects).map((item,index)=>({
      id:`opening-inject-${Date.now()}-${index}`,
      time:now,
      title:item.title,
      message:item.text,
      category:'scenario',
      severity:item.priority,
      audienceRole:item.relatedRole,
    })),
  ]

  return {
    ...baseState,
    incidents:list(world.incidents),
    customers:list(world.customers),
    sorties:list(world.sorties),
    collectionDecks:list(world.collectionDecks),
    upads:list(world.upads),
    products:list(world.products),
    airspace:list(world.airspace),
    asOf:now,
    localTimeLabel:'Pacific Time',
    activeRole:baseState.exercise?.selectedRole||world.selectedRole,
    operationalPeriod:1,
    scenario:{
      ...(baseState.scenario||{}),
      name:world.scenarioTitle,
      location:(baseState.exercise?.gaccRegion||baseState.scenario?.gaccRegion)==='South Ops'?'Southern California':'Northern California',
      gaccRegion:baseState.exercise?.gaccRegion||baseState.scenario?.gaccRegion||world.gaccRegion||'North Ops',
      localTimeZone:world.localTimeZone,
      generated:true,
      generationSeed:world.generationSeed||'',
    },
    exercise:{
      ...(baseState.exercise||{}),
      scenarioName:world.scenarioTitle,
      localIncidentTime:now,
      turnNumber:1,
      activeOperationalPeriod:1,
      currentPhase:'Current Operations',
      status:'active_op1',
      startExAcknowledged:true,
      assignedIncident:null,
    },
    currentOps:{
      ...(baseState.currentOps||{}),
      status:'active',
      protectedMissionId:missions.find(item=>item.protected)?.id||null,
      missions,
      deadlines:list(world.deadlines),
    },
    tomorrowPlan:{
      ...(baseState.tomorrowPlan||{}),
      status:'developing',
      readiness:Math.max(15,Math.min(85,Math.round(requirements.filter(item=>item.taskable||item.status==='taskable').length/Math.max(1,requirements.length)*100))),
      requirements:deriveTomorrowRequirements(requirements),
      blockers:deriveBlockers(requirements,deliveries),
      planningDeadline:'',
      publicationDeadline:'',
      approved:false,
    },
    requirements:{
      items:requirements,
      history:[{id:`req-history-${Date.now()}`,time:now,actor:'Scenario Controller',action:'Fresh AI-generated requirement queue established at STARTEX.'}],
    },
    assetControl:{
      ...(baseState.assetControl||{}),
      stateAuthority:'State J3',
      allocationStatus:'ACTIVE STATE ALLOCATION',
      assets,
      requests:[],
      history:[{id:`asset-history-${Date.now()}`,time:now,actor:'Scenario Controller',action:'Fresh generated asset posture established at STARTEX.'}],
    },
    dissemination:{
      deliveries,
      feedback:[],
      history:[{id:`delivery-history-${Date.now()}`,time:now,actor:'Scenario Controller',action:'Fresh generated production and delivery picture established at STARTEX.'}],
    },
    oversight:{
      cases:oversight,
      history:[{id:`io-history-${Date.now()}`,time:now,actor:'Scenario Controller',action:'Generated oversight queue established.'}],
    },
    missionUpdates:openingUpdates,
    crossPeriodImpacts:[],
    operationalPeriodHistory:[],
    decisions:[],
    lastAdvisorUpdate:null,
    simulation:{
      ...(baseState.simulation||{}),
      turn:1,
      injects:list(world.initialInjects).map((item,index)=>({
        id:`scenario-inject-${Date.now()}-${index}`,
        ...item,
        createdAt:now,
        source:'scenario_controller',
      })),
      advisorHistory:[],
      activeDecisionPoint:world.initialDecisionPressure||null,
      scenarioDirector:{
        status:'ready',
        hiddenWorld:world.hiddenWorld||{},
        lastScenarioSummary:world.visibleOpeningState?.summary||'',
        nextDecisionReason:world.initialDecisionPressure||'',
        revealedFacts:[],
        advisorVisibleFacts:list(world.advisorVisibleFacts),
        aarObservations:list(world.aarObservations),
        lastEvaluatedDecisionCount:0,
        lastEvaluatedAt:now,
        generationSeed:world.generationSeed||'',
        lastMode:'initialize',
      },
    },
  }
}

function applyPatch(state,patch) {
  const changes=patch.changes&&typeof patch.changes==='object'?patch.changes:{}
  const append=patch.operation==='append'
  const id=patch.id

  const rootCollections={incidents:'incidents'}
  if(rootCollections[patch.collection]){
    const key=rootCollections[patch.collection]
    const current=list(state[key])
    if(append) return {...state,[key]:[...current,{id,...changes}]}
    const merged=mergeById(current,id,changes)
    return merged.found?{...state,[key]:merged.items}:state
  }

  const configs={
    requirements:{path:['requirements','items']},
    missions:{path:['currentOps','missions']},
    assets:{path:['assetControl','assets']},
    deliveries:{path:['dissemination','deliveries']},
    oversight:{path:['oversight','cases']},
  }

  if(patch.collection==='exercise'){
    return {...state,exercise:{...(state.exercise||{}),...changes}}
  }

  const config=configs[patch.collection]
  if(!config) return state
  const [parent,key]=config.path
  const current=list(state[parent]?.[key])
  if(append){
    return {...state,[parent]:{...(state[parent]||{}),[key]:[...current,{id,...changes}]}}
  }
  const merged=mergeById(current,id,changes)
  return merged.found?{...state,[parent]:{...(state[parent]||{}),[key]:merged.items}}:state
}

export function applyAdvanceResult(baseState,result) {
  let state=baseState
  for(const patch of list(result.patches)) state=applyPatch(state,patch)

  const now=result.nextIncidentTime
  const previous=state.simulation?.scenarioDirector||{}
  const visibleUpdates=list(result.visibleFacts).map((item,index)=>({
    id:`scenario-fact-${Date.now()}-${index}`,
    time:now,
    title:item.incident?`${item.incident} Update`:'Scenario Update',
    message:item.text,
    category:'scenario',
    severity:item.severity,
    audienceRole:item.audienceRole,
  }))
  const consequenceUpdates=list(result.consequences).map((item,index)=>({
    id:`scenario-consequence-${Date.now()}-${index}`,
    time:now,
    title:item.incident?`${item.incident} Consequence`:'Exercise Consequence',
    message:item.text,
    category:'consequence',
    severity:item.severity,
    causedBy:item.causedBy,
  }))
  const injects=list(result.injects).map((item,index)=>({
    id:`scenario-inject-${Date.now()}-${index}`,
    ...item,
    createdAt:now,
    source:'scenario_controller',
  }))

  return {
    ...state,
    asOf:now,
    exercise:{
      ...(state.exercise||{}),
      localIncidentTime:now,
      turnNumber:Number(state.exercise?.turnNumber||0)+1,
    },
    tomorrowPlan:{
      ...(state.tomorrowPlan||{}),
      requirements:deriveTomorrowRequirements(state.requirements?.items),
      blockers:deriveBlockers(state.requirements?.items,state.dissemination?.deliveries),
    },
    missionUpdates:[...(state.missionUpdates||[]),...visibleUpdates,...consequenceUpdates],
    simulation:{
      ...(state.simulation||{}),
      turn:Number(state.simulation?.turn||0)+1,
      injects:[...(state.simulation?.injects||[]),...injects],
      activeDecisionPoint:result.nextDecisionReason||null,
      scenarioDirector:{
        ...previous,
        status:'ready',
        error:'',
        hiddenWorld:result.hiddenWorld||previous.hiddenWorld||{},
        lastScenarioSummary:result.scenarioSummary||'',
        nextDecisionReason:result.nextDecisionReason||'',
        revealedFacts:[...(previous.revealedFacts||[]),...list(result.visibleFacts)].slice(-60),
        advisorVisibleFacts:list(result.advisorVisibleFacts),
        aarObservations:[...(previous.aarObservations||[]),...list(result.aarObservations)].slice(-60),
        lastEvaluatedDecisionCount:list(state.decisions).length,
        lastEvaluatedAt:now,
        lastMode:'advance',
      },
    },
  }
}

export function markScenarioStatus(state,status,error='') {
  return {
    ...state,
    simulation:{
      ...(state.simulation||{}),
      scenarioDirector:{
        ...(state.simulation?.scenarioDirector||{}),
        status,
        error,
      },
    },
  }
}
