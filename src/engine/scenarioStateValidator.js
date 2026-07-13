import { APPROVED_PLATFORM_TYPES, callsignForPlatform } from './capabilityLibrary.js'

const REQUIRED_WORLD_ARRAYS = [
  'incidents','customers','requirements','missions','assets','sorties',
  'collectionDecks','upads','products','deliveries','airspace',
  'oversightIssues','initialInjects',
]

const list = (value) => Array.isArray(value) ? value : []

const REQUIRED_INCIDENT_FIELDS = [
  'id','name','incidentNumber','city','county','location','startDateTime',
  'sizeAcres','containmentPercent','significantEvents','lifeSafety',
  'weatherConcerns','projectedActivity','threatSummary',
  'strategicObjectives','plannedActions','status',
]

function hasMeaningfulValue(value) {
  if (typeof value === 'number') return Number.isFinite(value)
  if (Array.isArray(value)) return value.some(Boolean)
  return String(value || '').trim().length > 0
}
const isObject = (value) => Boolean(value && typeof value === 'object' && !Array.isArray(value))

function uniqueIds(items) {
  const ids=items.map(item=>item?.id).filter(Boolean)
  return ids.length===new Set(ids).size
}

function validLocalTime(value) {
  return /^\d{4}\s(?:PT|Local)$/.test(String(value||''))
}

export function validateInitialWorld(world) {
  const errors=[]
  if(!isObject(world)) return {ok:false,errors:['Generated world is not an object.']}
  if(world.mode!=='initialize') errors.push('Initialization response mode must be initialize.')
  if(!Number.isInteger(world.incidentCount)||world.incidentCount<2||world.incidentCount>5) errors.push('Incident count must be 2–5.')
  if(list(world.incidents).length!==world.incidentCount) errors.push('Incident array does not match incident count.')
  const prohibitedDemoNames=new Set(['Pine Ridge','Bear Creek','Eagle Peak'])
  if(list(world.incidents).some(item=>prohibitedDemoNames.has(item.name))) errors.push('Generated world reused static demo incidents.')
  if(!validLocalTime(world.scenarioTime)) errors.push('Scenario time must use local incident time.')
  for(const key of REQUIRED_WORLD_ARRAYS){
    if(!Array.isArray(world[key])) errors.push(`${key} must be an array.`)
  }
  for(const key of ['incidents','customers','requirements','missions','assets','deliveries','upads']){
    if(!uniqueIds(list(world[key]))) errors.push(`${key} contains duplicate or missing IDs.`)
  }

  for(const incident of list(world.incidents)){
    for(const field of REQUIRED_INCIDENT_FIELDS){
      if(!hasMeaningfulValue(incident?.[field])) errors.push(`Incident ${incident?.name||incident?.id||'unknown'} is missing required situation field ${field}.`)
    }
    if(!Number.isFinite(Number(incident.sizeAcres))||Number(incident.sizeAcres)<0) errors.push(`Incident ${incident?.name||incident?.id||'unknown'} sizeAcres must be a non-negative number.`)
    if(!Number.isFinite(Number(incident.containmentPercent))||Number(incident.containmentPercent)<0||Number(incident.containmentPercent)>100) errors.push(`Incident ${incident?.name||incident?.id||'unknown'} containmentPercent must be between 0 and 100.`)
  }

  const incidentIds=new Set(list(world.incidents).map(item=>item.id))
  const requirementIds=new Set(list(world.requirements).map(item=>item.id))
  const missionIds=new Set(list(world.missions).map(item=>item.id))
  const assetIds=new Set(list(world.assets).map(item=>item.id))

  for(const requirement of list(world.requirements)){
    if(!incidentIds.has(requirement.incidentId)) errors.push(`Requirement ${requirement.id} references an unknown incident.`)
  }
  for(const mission of list(world.missions)){
    if(!incidentIds.has(mission.incidentId)) errors.push(`Mission ${mission.id} references an unknown incident.`)
    if(!requirementIds.has(mission.requirementId)) errors.push(`Mission ${mission.id} references an unknown requirement.`)
    if(!assetIds.has(mission.assetId)) errors.push(`Mission ${mission.id} references an unknown asset.`)
  }
  for(const delivery of list(world.deliveries)){
    if(!requirementIds.has(delivery.requirementId)) errors.push(`Delivery ${delivery.id} references an unknown requirement.`)
    if(!missionIds.has(delivery.missionId)) errors.push(`Delivery ${delivery.id} references an unknown mission.`)
  }
  for(const asset of list(world.assets)){
    if(!APPROVED_PLATFORM_TYPES.includes(asset.type)) errors.push(`Asset ${asset.id} uses unsupported platform type ${asset.type}.`)
    if(asset.callsign!==callsignForPlatform(asset.type)) errors.push(`Asset ${asset.id} uses an unsupported callsign.`)
  }

  return {ok:errors.length===0,errors,value:world}
}

export function validateAdvanceResult(result,state) {
  const errors=[]
  if(!isObject(result)) return {ok:false,errors:['Scenario advance result is not an object.']}
  if(!validLocalTime(result.nextIncidentTime)) errors.push('Next incident time must use local incident time.')
  for(const key of ['visibleFacts','injects','patches','consequences','advisorVisibleFacts','aarObservations']){
    if(!Array.isArray(result[key])) errors.push(`${key} must be an array.`)
  }

  const allowedCollections=new Set(['incidents','requirements','missions','assets','deliveries','oversight','exercise'])
  const existing={
    incidents:new Set(list(state.incidents).map(item=>item.id)),
    requirements:new Set(list(state.requirements?.items).map(item=>item.id)),
    missions:new Set(list(state.currentOps?.missions).map(item=>item.id)),
    assets:new Set(list(state.assetControl?.assets).map(item=>item.id)),
    deliveries:new Set(list(state.dissemination?.deliveries).map(item=>item.id)),
    oversight:new Set(list(state.oversight?.cases).map(item=>item.id)),
  }

  for(const patch of list(result.patches)){
    if(!allowedCollections.has(patch.collection)) errors.push(`Unsupported patch collection ${patch.collection}.`)
    if(!['merge','append'].includes(patch.operation)) errors.push(`Unsupported patch operation ${patch.operation}.`)
    if(patch.operation==='merge'&&patch.collection!=='exercise'&&!existing[patch.collection]?.has(patch.id)){
      errors.push(`Patch references unknown ${patch.collection} entity ${patch.id}.`)
    }
    if(!isObject(patch.changes)) errors.push(`Patch ${patch.id} changes must be an object.`)
    if(patch.changes?.id&&patch.changes.id!==patch.id) errors.push(`Patch ${patch.id} may not change an entity ID.`)
  }

  return {ok:errors.length===0,errors,value:result}
}


function incidentCode(name='INC') {
  const initials=String(name).trim().split(/\s+/).filter(Boolean).map(word=>word[0]).join('').toUpperCase()
  return (initials||'INC').slice(0,4)
}

function cleanCallsign(value='ASSET') {
  return String(value).replace(/[^A-Z0-9]/gi,'').toUpperCase()||'ASSET'
}

export function normalizeInitialWorld(world) {
  const copy=structuredClone(world)
  const incidentByOldId=new Map()
  const requirementByOldId=new Map()
  const missionByOldId=new Map()
  const assetByOldId=new Map()

  copy.incidents=(copy.incidents||[]).map((incident,index)=>{
    const code=incident.code||incidentCode(incident.name)
    const id=`INC-${code}-${String(index+1).padStart(2,'0')}`
    incidentByOldId.set(incident.id,id)
    return {...incident,id,code}
  })

  const incidentById=new Map(copy.incidents.map(item=>[item.id,item]))
  copy.requirements=(copy.requirements||[]).map((item,index)=>{
    const incidentId=incidentByOldId.get(item.incidentId)||item.incidentId
    const incident=incidentById.get(incidentId)
    const id=`${incident?.code||'REG'}-REQ-${String(index+1).padStart(3,'0')}`
    requirementByOldId.set(item.id,id)
    return {...item,id,incidentId,incident:item.incident||item.fire||incident?.name,fire:item.fire||item.incident||incident?.name}
  })

  copy.assets=(copy.assets||[]).map((item,index)=>{
    const callsign=cleanCallsign(item.callsign||callsignForPlatform(item.type))
    const id=`${callsign}-${String(index+1).padStart(2,'0')}`
    assetByOldId.set(item.id,id)
    return {...item,id,callsign,identifier:item.identifier||id}
  })

  copy.missions=(copy.missions||[]).map((item,index)=>{
    const incidentId=incidentByOldId.get(item.incidentId)||item.incidentId
    const incident=incidentById.get(incidentId)
    const assetId=assetByOldId.get(item.assetId)||item.assetId
    const asset=copy.assets.find(candidate=>candidate.id===assetId)
    const callsign=cleanCallsign(item.callsign||asset?.callsign||item.platform)
    const id=`${incident?.code||'REG'}-${callsign}-${String(index+1).padStart(2,'0')}`
    missionByOldId.set(item.id,id)
    return {
      ...item,
      id,
      incidentId,
      requirementId:requirementByOldId.get(item.requirementId)||item.requirementId,
      assetId,
      callsign,
      incident:item.incident||item.fire||incident?.name,
      fire:item.fire||item.incident||incident?.name,
    }
  })

  copy.assets=copy.assets.map(item=>({
    ...item,
    missionId:missionByOldId.get(item.missionId)||item.missionId||null,
  }))

  copy.deliveries=(copy.deliveries||[]).map((item,index)=>{
    const incidentId=incidentByOldId.get(item.incidentId)||item.incidentId
    const incident=incidentById.get(incidentId)
    return {
      ...item,
      id:`${incident?.code||'REG'}-PROD-${String(index+1).padStart(3,'0')}`,
      incidentId,
      requirementId:requirementByOldId.get(item.requirementId)||item.requirementId,
      missionId:missionByOldId.get(item.missionId)||item.missionId,
      incident:item.incident||item.fire||incident?.name,
      fire:item.fire||item.incident||incident?.name,
    }
  })

  copy.products=(copy.products||[]).map((item,index)=>{
    const incidentId=incidentByOldId.get(item.incidentId)||item.incidentId
    const incident=incidentById.get(incidentId)
    return {
      ...item,
      id:`${incident?.code||'REG'}-PRODUCT-${String(index+1).padStart(3,'0')}`,
      incidentId,
      requirementId:requirementByOldId.get(item.requirementId)||item.requirementId,
      missionId:missionByOldId.get(item.missionId)||item.missionId,
    }
  })

  copy.sorties=(copy.sorties||[]).map((item,index)=>{
    const missionId=missionByOldId.get(item.missionId)||item.missionId
    const mission=copy.missions.find(candidate=>candidate.id===missionId)
    return {
      ...item,
      id:mission?.id||`SORTIE-${String(index+1).padStart(2,'0')}`,
      missionId,
      incident:mission?.incident||item.incident,
      callsign:mission?.callsign||item.callsign,
    }
  })

  copy.collectionDecks=(copy.collectionDecks||[]).map((item,index)=>{
    const missionId=missionByOldId.get(item.missionId)||item.missionId
    const mission=copy.missions.find(candidate=>candidate.id===missionId)
    return {
      ...item,
      id:mission?.id||`DECK-${String(index+1).padStart(2,'0')}`,
      missionId,
      incidentId:mission?.incidentId||item.incidentId,
      incident:mission?.incident||item.incident,
      callsign:mission?.callsign||item.callsign,
    }
  })

  copy.oversightIssues=(copy.oversightIssues||[]).map(item=>({
    ...item,
    requirementId:requirementByOldId.get(item.requirementId)||item.requirementId,
  }))

  return copy
}
