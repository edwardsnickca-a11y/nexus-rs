import { APPROVED_PLATFORM_TYPES, callsignForPlatform } from './capabilityLibrary.js'

const REQUIRED_WORLD_ARRAYS = [
  'incidents','customers','requirements','missions','assets','sorties',
  'collectionDecks','upads','products','deliveries','airspace',
  'oversightIssues','initialInjects',
]

const list = (value) => Array.isArray(value) ? value : []
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
  if(!validLocalTime(world.scenarioTime)) errors.push('Scenario time must use local incident time.')
  for(const key of REQUIRED_WORLD_ARRAYS){
    if(!Array.isArray(world[key])) errors.push(`${key} must be an array.`)
  }
  for(const key of ['incidents','customers','requirements','missions','assets','deliveries','upads']){
    if(!uniqueIds(list(world[key]))) errors.push(`${key} contains duplicate or missing IDs.`)
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

  const allowedCollections=new Set(['requirements','missions','assets','deliveries','oversight','exercise'])
  const existing={
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
