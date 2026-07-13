import { callsignForPlatform } from './capabilityLibrary.js'

const LOCATIONS = [
  { city:'Redding', county:'Shasta County', zone:'northern Sacramento Valley', tz:'America/Los_Angeles' },
  { city:'Red Bluff', county:'Tehama County', zone:'western foothills', tz:'America/Los_Angeles' },
  { city:'Chico', county:'Butte County', zone:'Sierra foothills', tz:'America/Los_Angeles' },
  { city:'Paradise', county:'Butte County', zone:'ridge communities', tz:'America/Los_Angeles' },
  { city:'Oroville', county:'Butte County', zone:'Feather River corridor', tz:'America/Los_Angeles' },
  { city:'Quincy', county:'Plumas County', zone:'American Valley', tz:'America/Los_Angeles' },
  { city:'Susanville', county:'Lassen County', zone:'Honey Lake region', tz:'America/Los_Angeles' },
  { city:'Weaverville', county:'Trinity County', zone:'Trinity Alps foothills', tz:'America/Los_Angeles' },
  { city:'Ukiah', county:'Mendocino County', zone:'Russian River valley', tz:'America/Los_Angeles' },
  { city:'Willits', county:'Mendocino County', zone:'redwood interior', tz:'America/Los_Angeles' },
  { city:'Yreka', county:'Siskiyou County', zone:'Shasta Valley', tz:'America/Los_Angeles' },
  { city:'Alturas', county:'Modoc County', zone:'Modoc Plateau', tz:'America/Los_Angeles' },
]

const INCIDENT_SUFFIXES = ['North', 'East', 'Ridge', 'Creek', 'Foothill', 'Valley', 'Pass', 'Bench']
const CONDITIONS = [
  'Wind-driven spread is pressing toward a transportation corridor.',
  'Heavy smoke is reducing visual collection quality during part of the day.',
  'Fire behavior is moderate now but forecast winds could increase afternoon spread.',
  'Multiple spot fires are creating uncertainty along the incident perimeter.',
  'Steep terrain and isolated communities are complicating access and collection geometry.',
  'Utility infrastructure and evacuation-route status are becoming decision-critical.',
]
const CUSTOMERS = [
  'County Emergency Management',
  'CAL FIRE Incident Management Team',
  'County Sheriff Emergency Services',
  'County Public Works',
  'Local Emergency Operations Center',
  'Utility Emergency Coordination Center',
  'Tribal Emergency Management',
]
const NEEDS = [
  { title:'Evacuation route status', product:'Assessed route-status update', eeis:['Visible road blockage or fire impact', 'Fire proximity to designated route', 'Alternate route condition'] },
  { title:'Perimeter change assessment', product:'Assessed perimeter-change product', eeis:['Current visible fire edge', 'Direction of spread', 'New spot-fire activity'] },
  { title:'Critical infrastructure exposure', product:'Infrastructure exposure assessment', eeis:['Visible fire impact', 'Access condition', 'Threatened facilities'] },
  { title:'Structure impact overview', product:'Assessed structure-impact package', eeis:['Visible major damage', 'Access constraints', 'Affected community sectors'] },
  { title:'Public information map support', product:'Releasable GIS map layer', eeis:['Major closures', 'General impact area', 'Approved public-information boundaries'] },
]

function randomSeed() {
  const cryptoObject = globalThis.crypto
  if (cryptoObject?.getRandomValues) {
    const values = new Uint32Array(2)
    cryptoObject.getRandomValues(values)
    return values[0] ^ values[1] ^ Date.now()
  }
  return Math.floor(Math.random()*0x7fffffff) ^ Date.now()
}

function rng(seed) {
  let value = seed >>> 0
  return () => {
    value += 0x6D2B79F5
    let t = value
    t = Math.imul(t ^ t >>> 15, t | 1)
    t ^= t + Math.imul(t ^ t >>> 7, t | 61)
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

function choose(random, items) {
  return items[Math.floor(random()*items.length)]
}

function shuffled(random, items) {
  return [...items].sort(()=>random()-.5)
}

function timeAt(baseMinutes) {
  const minutes=((baseMinutes%(24*60))+(24*60))%(24*60)
  return `${String(Math.floor(minutes/60)).padStart(2,'0')}${String(minutes%60).padStart(2,'0')} PT`
}

function makeId(prefix,index) {
  return `${prefix}-${String(index+1).padStart(3,'0')}`
}

export function generateFallbackWorld({ role='remote_sensing_coordinator', difficulty='Standard' }={}) {
  const seed=randomSeed()
  const random=rng(seed)
  const incidentCount=2+Math.floor(random()*4)
  const locations=shuffled(random,LOCATIONS).slice(0,incidentCount)
  const startMinutes=360+[0,15,30,45][Math.floor(random()*4)]
  const platformCycle=['MQ-9','UH-72','CAP','CAP','UH-72']

  const incidents=locations.map((location,index)=>{
    const name=`${location.city} ${choose(random,INCIDENT_SUFFIXES)}`
    const acres=Math.round((700+random()*22000)/50)*50
    return {
      id:makeId('incident',index),
      name,
      code:name.split(' ').map(word=>word[0]).join('').slice(0,3).toUpperCase(),
      city:location.city,
      county:location.county,
      location:`${location.city}, ${location.county}`,
      zone:location.zone,
      sizeAcres:acres,
      containmentPercent:Math.floor(random()*24),
      behavior:choose(random,CONDITIONS),
      smoke:choose(random,['Light morning smoke','Moderate smoke with afternoon degradation','Dense smoke in portions of the incident','Variable smoke by drainage']),
      wind:choose(random,['Southwest winds increasing after 1300','Light morning winds with gusty afternoon outflow','North winds creating alignment concerns','Terrain-driven winds with uncertain timing']),
      lifeSafety:choose(random,['Evacuation warning area under review','Isolated community access is a concern','No immediate evacuation expansion, but route monitoring is required','Critical infrastructure protection decision pending']),
      status:'active',
    }
  })

  const customers=[]
  const requirements=[]
  const missions=[]
  const assets=[]
  const deliveries=[]
  const oversightIssues=[]
  const collectionDecks=[]
  const products=[]
  const deadlines=[]

  incidents.forEach((incident,index)=>{
    const customer=choose(random,CUSTOMERS)
    const need=choose(random,NEEDS)
    const requirementId=makeId('req',index)
    const missionId=makeId('mission',index)
    const assetId=makeId('asset',index)
    const deliveryId=makeId('delivery',index)
    const platformType=platformCycle[index%platformCycle.length]
    const callsign=callsignForPlatform(platformType)
    const complete=random()>(difficulty==='Introductory'?.15:.38)
    const collectionStart=startMinutes+75+index*35
    const collectionEnd=collectionStart+60+Math.floor(random()*3)*30
    const deadline=collectionEnd+45+Math.floor(random()*3)*30

    customers.push({
      id:makeId('customer',index),
      name:customer,
      incidentId:incident.id,
      incident:incident.name,
      decisionNeed:complete ? `Support a time-sensitive ${need.title.toLowerCase()} decision.` : 'Customer need requires clarification.',
      responsiveness:choose(random,['responsive','delayed','limited after-hours']),
    })

    requirements.push({
      id:requirementId,
      incidentId:incident.id,
      fire:incident.name,
      incident:incident.name,
      title:need.title,
      requestType:index%2?'ad_hoc':'standing',
      priority:index===0?1:(1+Math.floor(random()*3)),
      customer,
      who:customer,
      decisionToSupport:complete?`Determine whether current conditions require an operational change for ${incident.name}.`:'',
      what:complete?need.title:'',
      where:complete?`${incident.location} operational area`:'',
      when:complete?`Collect ${timeAt(collectionStart)}–${timeAt(collectionEnd)}; product by ${timeAt(deadline)}`:'',
      why:complete?'Supports a current incident-management decision.':'',
      requiredEffect:complete?need.product:'',
      requestedPlatform:'',
      nai:complete?`${incident.code}-NAI-01`:'',
      pir:`${incident.code}-PIR-1`,
      eeis:complete?need.eeis:[],
      disseminationMethod:complete?'Approved shared repository and direct customer notification.':'',
      existingSourceCheck:complete,
      organicSuitability:complete?`${callsign} is one potential source; alternate sources should still be considered.`:'',
      alternateSource:choose(random,['Current perimeter service may partially answer the need.','Ground reporting may answer part of the question.','Commercial imagery may provide comparative context.']),
      duplicateStatus:'unknown',
      oversightFlag:false,
      validation:{acceptable:complete,feasible:complete,complete,existingSourceChecked:complete,organicSuitabilityChecked:complete},
      missingFields:complete?[]:['WHERE','WHEN','decision to support','EEIs'],
      taskable:complete,
      status:complete?'taskable':'needs_clarification',
      lastUpdatedBy:'scenario_controller',
      lastUpdatedAt:timeAt(startMinutes),
    })

    assets.push({
      id:assetId,
      type:platformType,
      identifier:`${platformType}-${index+1}`,
      callsign,
      quantity:1,
      controlRelationship:'State Allocated',
      status:complete?'assigned':'available',
      assignment:complete?incident.name:'Regional Reserve',
      missionId:complete?missionId:null,
      returnable:true,
      recallRisk:choose(random,['Low','Medium','High']),
      notes:choose(random,['Crew availability must be confirmed.','Current allocation is subject to regional reprioritization.','Data transfer may affect product timing.','No immediate limiting factor is reported.']),
    })

    missions.push({
      id:missionId,
      requirementId,
      incidentId:incident.id,
      fire:incident.name,
      incident:incident.name,
      platform:`${platformType}-${index+1}`,
      callsign,
      assetId,
      window:`${timeAt(collectionStart)}–${timeAt(collectionEnd)}`,
      objective:need.title,
      status:complete?choose(random,['planned','active','at_risk']):'pending_requirement',
      protected:index===0&&random()>.45,
      risk:choose(random,['Airspace coordination pending','Smoke may reduce collection quality','Crew follow-on commitment requires confirmation','No immediate execution risk']),
      coordinatorNotified:index===0,
    })

    deliveries.push({
      id:deliveryId,
      missionId,
      requirementId,
      incidentId:incident.id,
      fire:incident.name,
      incident:incident.name,
      customer,
      productType:need.product,
      sourcePlatform:callsign,
      assignedUpad:choose(random,['UPAD-CA','UPAD-SAT','UPAD-GIS','UPAD-SURGE','Unassigned']),
      collectionComplete:false,
      processingStatus:complete?'awaiting_collection':'not_started',
      assessmentStatus:'not_started',
      disseminationMethod:complete?'Approved repository + customer notification':'',
      deliveryDeadline:timeAt(deadline),
      estimatedDelivery:complete?timeAt(deadline-15):'Unknown',
      deliveryStatus:complete?'planned':'at_risk',
      receiptStatus:'not_verified',
      feedbackStatus:'not_requested',
      customerNeed:need.title,
      lastUpdate:timeAt(startMinutes),
      notes:choose(random,['UPAD capacity should be confirmed.','Customer cutoff is sensitive to data-transfer delay.','Releasability review may be required.']),
    })

    products.push({
      id:makeId('product',index),
      requirementId,
      missionId,
      incidentId:incident.id,
      incident:incident.name,
      type:need.product,
      status:'planned',
      customer,
      deadline:timeAt(deadline),
    })

    collectionDecks.push({
      id:`${incident.code}-${callsign}-${String(index+1).padStart(2,'0')}`,
      incidentId:incident.id,
      incident:incident.name,
      callsign,
      missionId,
      taskCount:8+Math.floor(random()*48),
      expectedProducts:1+Math.floor(random()*8),
      productTypes:[need.product],
      status:complete?'draft':'blocked',
    })

    deadlines.push({
      id:makeId('deadline',index),
      label:`${incident.name} ${need.title}`,
      time:timeAt(deadline),
      severity:index===0?'high':choose(random,['medium','high']),
    })

    if(random()<.3){
      oversightIssues.push({
        id:makeId('IO',oversightIssues.length),
        requirementId,
        title:choose(random,['Collection purpose requires clarification','Dissemination scope requires review','Domestic mission nexus requires clarification']),
        owner:'Collection Manager',
        severity:choose(random,['medium','high']),
        deadline:timeAt(collectionStart),
        status:'open',
        concern:'Operational support may continue after the collection purpose and dissemination limits are clarified.',
        knownFacts:`The request supports ${incident.name}, but one element of purpose or dissemination remains unclear.`,
        uncertainty:'Final legal conclusions are not assumed by the scenario.',
        selectedAction:'',
        resolutionNote:'',
      })
    }
  })

  const upads=[
    {id:'UPAD-CA',name:'California UPAD',specialties:['FMV','Still imagery','Wildfire support'],shift:choose(random,['0600–1400 PT','1000–1800 PT']),workload:45+Math.floor(random()*45),manning:choose(random,['normal','reduced','augmented']),status:'active'},
    {id:'UPAD-SAT',name:'Satellite-Focused UPAD',specialties:['MSI','Commercial satellite imagery','Comparative imagery'],shift:choose(random,['0600–1400 PT','1400–2200 PT']),workload:30+Math.floor(random()*55),manning:choose(random,['normal','reduced']),status:'active'},
    {id:'UPAD-GIS',name:'GIS-Focused UPAD',specialties:['GIS','Mapping','Route context'],shift:choose(random,['0800–1600 PT','1200–2000 PT']),workload:35+Math.floor(random()*55),manning:choose(random,['normal','reduced']),status:'active'},
    {id:'UPAD-SURGE',name:'Night-Shift / Surge UPAD',specialties:['Continuity','Overflow'],shift:choose(random,['1800–0200 PT','2200–0600 PT']),workload:10+Math.floor(random()*40),manning:'small',status:choose(random,['available','limited'])},
  ]

  const airspace=incidents.map((incident,index)=>({
    id:makeId('airspace',index),
    incidentId:incident.id,
    incident:incident.name,
    type:choose(random,['TFR','Airspace coordination','Aviation hazard']),
    status:choose(random,['active','pending_update','advisory']),
    text:choose(random,['TFR boundary update is pending.','Manned aviation activity may constrain the collection corridor.','Smoke and aviation activity require route coordination.']),
  }))

  const initialInjects=[{
    title:'Opening regional remote-sensing picture',
    text:`${incidentCount} active fires are competing for collection and production support. Review the generated requirements, missions, and delivery windows before committing resources.`,
    priority:'high',
    relatedRole:'all',
    relatedIncident:'',
  }]

  return {
    mode:'initialize',
    generationSeed:String(seed),
    scenarioTitle:'Northern California Multi-Fire Remote Sensing Operations',
    scenarioTime:timeAt(startMinutes),
    localTimeZone:'America/Los_Angeles',
    difficulty,
    selectedRole:role,
    incidentCount,
    incidents,
    customers,
    requirements,
    missions,
    assets,
    sorties:missions.map((mission,index)=>({id:makeId('sortie',index),missionId:mission.id,incident:mission.incident,callsign:mission.callsign,window:mission.window,status:mission.status})),
    collectionDecks,
    upads,
    products,
    deliveries,
    airspace,
    oversightIssues,
    deadlines,
    hiddenWorld:{
      seed,
      developingConditions:incidents.map((incident,index)=>({
        incidentId:incident.id,
        condition:choose(random,['Afternoon wind alignment may increase spread.','Customer priorities may change after field reconnaissance.','A crew or airspace limitation may become operationally relevant.','A product-delivery bottleneck may emerge.']),
        revealAfterTurns:1+Math.floor(random()*3),
      })),
    },
    visibleOpeningState:{
      summary:`${incidentCount} active Northern California wildfire incidents require regional remote-sensing coordination.`,
    },
    advisorVisibleFacts:[
      `${incidentCount} incidents are active and competing for collection and production capacity.`,
      'The opening requirements vary in completeness and urgency.',
    ],
    initialInjects,
    initialDecisionPressure:'Review the generated incident picture and identify the most important role-appropriate decision before advancing the exercise.',
    aarObservations:[],
  }
}

export function generateFallbackAdvance(state) {
  const director=state.simulation?.scenarioDirector||{}
  const seed=(Number(director.hiddenWorld?.seed)||randomSeed())+Number(state.exercise?.turnNumber||0)+1
  const random=rng(seed)
  const current=String(state.exercise?.localIncidentTime||state.asOf||'0600 PT')
  const match=current.match(/(\d{2})(\d{2})/)
  const base=match?Number(match[1])*60+Number(match[2]):360
  const delta=choose(random,[15,30,45,60,90,120])
  const incidents=state.incidents||[]
  const incident=choose(random,incidents)||{name:'Regional picture',id:''}
  const development=choose(random,[
    'Field reporting changed one customer decision window.',
    'Smoke and airspace conditions changed collection feasibility.',
    'A customer clarified part of an incomplete requirement.',
    'Production workload changed as a new product entered the queue.',
    'A partner resource became available with limitations.',
  ])

  return {
    mode:'advance',
    nextIncidentTime:timeAt(base+delta),
    nextDecisionReason:development,
    scenarioSummary:development,
    hiddenWorld:{...(director.hiddenWorld||{}),seed},
    visibleFacts:[{audienceRole:'all',incident:incident.name||'',severity:'medium',text:development}],
    injects:[{title:`${incident.name||'Regional'} update`,text:development,priority:'medium',relatedRole:'all',relatedIncident:incident.name||''}],
    patches:[],
    consequences:[],
    advisorVisibleFacts:[development],
    aarObservations:['The exercise advanced using the local fallback controller.'],
  }
}
