import { APPROVED_PLATFORM_TYPES, callsignForPlatform } from './capabilityLibrary.js'
import { locationsForGacc, distanceMiles, incidentMatchesGacc } from '../data/californiaGaccLocations.js'
import { allocateRegionalAssets } from './assetAllocation.js'
import { FTA_REFERENCE_TABLE } from '../data/airspaceReference.js'

const REQUIRED_WORLD_ARRAYS = [
  'incidents','customers','requirements','missions','assets','sorties',
  'collectionDecks','upads','products','deliveries',
  'oversightIssues','initialInjects',
]

const list = (value) => Array.isArray(value) ? value : []


const AIRSPACE_RESTRICTION_STATUSES=new Set(['ACTIVE','UPCOMING','PENDING','EXPIRED','CHANGED','CANCELLED'])
const AIRSPACE_COORD_STATUSES=new Set(['UNCOORDINATED','IN_PROGRESS','COORDINATED','ESCALATED','UNRESOLVED'])
const AIRSPACE_CONFLICT_STATUSES=new Set(['NOT_STARTED','IN_PROGRESS','RESOLVED','UNABLE_TO_RESOLVE','ESCALATED'])
const AIRSPACE_TIERS=new Set(['1_FEASIBILITY','2_ENTRY_COORDINATION','3_ALTITUDE_ALLOCATION'])

function sameFtaBand(actual,expected){
  return String(actual?.band||'')===String(expected?.band||'') && String(actual?.occupant||'')===String(expected?.occupant||'') && String(actual?.status||'')===String(expected?.status||'')
}
function recomputeAirspaceSummary(airspace){
  const restrictions=list(airspace?.restrictions)
  const conflicts=list(airspace?.conflicts)
  const unresolved=new Set(['NOT_STARTED','IN_PROGRESS','ESCALATED','UNRESOLVED'])
  return {
    activeTfrs:restrictions.filter(x=>String(x.status).toUpperCase()==='ACTIVE').length,
    upcomingTfrs:restrictions.filter(x=>String(x.status).toUpperCase()==='UPCOMING').length,
    unresolvedConflicts:conflicts.filter(x=>unresolved.has(String(x.status).toUpperCase())).length,
    missionsAtRisk:new Set(conflicts.filter(x=>unresolved.has(String(x.status).toUpperCase())).map(x=>x.missionId).filter(Boolean)).size,
    upcomingChanges:restrictions.filter(x=>['UPCOMING','CHANGED','PENDING'].includes(String(x.status).toUpperCase())).length,
  }
}

const REQUIRED_INCIDENT_FIELDS = [
  'id','name','incidentNumber','locationSeedId','locationZoneId','city','county','location','lat','lng','gaccRegion','startDateTime',
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
    if(!Number.isFinite(Number(incident.lat))||!Number.isFinite(Number(incident.lng))) errors.push(`Incident ${incident?.name||incident?.id||'unknown'} must include numeric latitude and longitude.`)
    const expectedGacc=world.gaccRegion||incident.gaccRegion
    if(incident.gaccRegion!==expectedGacc) errors.push(`Incident ${incident?.name||incident?.id||'unknown'} does not match the selected GACC region.`)
    if(expectedGacc&&!incidentMatchesGacc(incident,expectedGacc)) errors.push(`Incident ${incident?.name||incident?.id||'unknown'} coordinates are not geographically consistent with ${expectedGacc}.`)
    const approvedZoneId=incident.locationZoneId||String(incident.locationSeedId||'').replace(/-[a-z0-9]+$/i,'')
    const selectedZone=locationsForGacc(expectedGacc).find(item=>item.id===approvedZoneId)
    if(!selectedZone) errors.push(`Incident ${incident?.name||incident?.id||'unknown'} does not reference an approved wildfire terrain zone.`)
    else {
      const distance=distanceMiles(Number(incident.lat),Number(incident.lng),selectedZone.lat,selectedZone.lng)
      const allowedDistance=Math.max(2,Number(selectedZone.radiusMiles)||5)+1
      if(distance>allowedDistance) errors.push(`Incident ${incident?.name||incident?.id||'unknown'} moved outside its approved randomized wildfire terrain zone.`)
      if(String(incident.city||'')!==String(selectedZone.city||'')) errors.push(`Incident ${incident?.name||incident?.id||'unknown'} changed its reference community.`)
      if(String(incident.county||'')!==String(selectedZone.county||'')) errors.push(`Incident ${incident?.name||incident?.id||'unknown'} changed its reference county.`)
    }
    if(!Number.isFinite(Number(incident.sizeAcres))||Number(incident.sizeAcres)<0) errors.push(`Incident ${incident?.name||incident?.id||'unknown'} sizeAcres must be a non-negative number.`)
    if(!Number.isFinite(Number(incident.containmentPercent))||Number(incident.containmentPercent)<0||Number(incident.containmentPercent)>100) errors.push(`Incident ${incident?.name||incident?.id||'unknown'} containmentPercent must be between 0 and 100.`)
  }

  const incidentIds=new Set(list(world.incidents).map(item=>item.id))
  const requirementIds=new Set(list(world.requirements).map(item=>item.id))
  const missionIds=new Set(list(world.missions).map(item=>item.id))
  const assetIds=new Set(list(world.assets).map(item=>item.id))
  const airspace=world.airspace
  if(!isObject(airspace)) errors.push('airspace must be an object with restrictions, conflicts, and summary.')
  const restrictions=list(airspace?.restrictions)
  const conflicts=list(airspace?.conflicts)
  if(!Array.isArray(airspace?.restrictions)) errors.push('airspace.restrictions must be an array.')
  if(!Array.isArray(airspace?.conflicts)) errors.push('airspace.conflicts must be an array.')
  if(!uniqueIds(restrictions)) errors.push('airspace.restrictions contains duplicate or missing IDs.')
  if(!uniqueIds(conflicts)) errors.push('airspace.conflicts contains duplicate or missing IDs.')
  const restrictionIds=new Set(restrictions.map(item=>item.id))
  for(const restriction of restrictions){
    if(!incidentIds.has(restriction.incidentId)) errors.push(`Airspace restriction ${restriction.id} references an unknown incident.`)
    if(!AIRSPACE_RESTRICTION_STATUSES.has(String(restriction.status||'').toUpperCase())) errors.push(`Airspace restriction ${restriction.id} has invalid status.`)
    if(!AIRSPACE_COORD_STATUSES.has(String(restriction.coordinationStatus||'').toUpperCase())) errors.push(`Airspace restriction ${restriction.id} has invalid coordination status.`)
    for(const missionId of list(restriction.affectedMissions)){ if(!missionIds.has(missionId)) errors.push(`Airspace restriction ${restriction.id} references unknown mission ${missionId}.`) }
    const occupancy=list(restriction.altitudeOccupancy)
    if(occupancy.length<FTA_REFERENCE_TABLE.length || !FTA_REFERENCE_TABLE.every((expected,index)=>sameFtaBand(occupancy[index],expected))) errors.push(`Airspace restriction ${restriction.id} does not preserve the controlled FTA reference bands.`)
  }
  for(const conflict of conflicts){
    if(!missionIds.has(conflict.missionId)) errors.push(`Airspace conflict ${conflict.id} references an unknown mission.`)
    if(!restrictionIds.has(conflict.restrictionId)) errors.push(`Airspace conflict ${conflict.id} references an unknown restriction.`)
    if(!AIRSPACE_TIERS.has(String(conflict.tier||''))) errors.push(`Airspace conflict ${conflict.id} has invalid tier.`)
    if(String(conflict.tier)==='3_ALTITUDE_ALLOCATION') errors.push(`Airspace conflict ${conflict.id} may not auto-generate Tier 3 at STARTEX.`)
    if(!AIRSPACE_CONFLICT_STATUSES.has(String(conflict.status||'').toUpperCase())) errors.push(`Airspace conflict ${conflict.id} has invalid status.`)
    if(!hasMeaningfulValue(conflict.impact)) errors.push(`Airspace conflict ${conflict.id} requires an operational impact.`)
  }
  if(isObject(airspace?.summary)){
    const computed=recomputeAirspaceSummary(airspace)
    for(const [key,value] of Object.entries(computed)){ if(Number(airspace.summary[key])!==value) errors.push(`airspace.summary.${key} does not match the records.`) }
  }else errors.push('airspace.summary must be an object.')

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
    const baseType=asset.type
    const isSatellite=baseType==='EO/IR Satellite'
    if(!isSatellite && !APPROVED_PLATFORM_TYPES.includes(baseType)) errors.push(`Asset ${asset.id} uses unsupported platform type ${asset.type}.`)
    // Callsigns may carry a numeric suffix (e.g. GARGOYLE-01, BEAR-02); validate the base.
    if(!isSatellite){
      const base=callsignForPlatform(baseType)
      const callsignBase=String(asset.callsign||'').replace(/-\d+$/,'')
      if(callsignBase!==base) errors.push(`Asset ${asset.id} uses an unsupported callsign.`)
    }
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

  const allowedCollections=new Set(['incidents','requirements','missions','assets','deliveries','oversight','airspace_restrictions','airspace_conflicts','exercise'])
  const existing={
    incidents:new Set(list(state.incidents).map(item=>item.id)),
    requirements:new Set(list(state.requirements?.items).map(item=>item.id)),
    missions:new Set(list(state.currentOps?.missions).map(item=>item.id)),
    assets:new Set(list(state.assetControl?.assets).map(item=>item.id)),
    deliveries:new Set(list(state.dissemination?.deliveries).map(item=>item.id)),
    oversight:new Set(list(state.oversight?.cases).map(item=>item.id)),
    airspace_restrictions:new Set(list(state.airspace?.restrictions).map(item=>item.id)),
    airspace_conflicts:new Set(list(state.airspace?.conflicts).map(item=>item.id)),
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
      missionId:(()=>{const mapped=missionByOldId.get(item.missionId)||item.missionId;return copy.missions.find(m=>m.id===mapped||m.callsign===item.missionId||m.platform===item.missionId)?.id||mapped})(),
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
      missionId:(()=>{const mapped=missionByOldId.get(item.missionId)||item.missionId;return copy.missions.find(m=>m.id===mapped||m.callsign===item.missionId||m.platform===item.missionId)?.id||mapped})(),
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

  // ---- Deterministic regional asset allocation (path-independent) ----
  // Replace whatever assets the AI or fallback produced with the realistic
  // regional allocation model, then relink missions to their incident's primary asset.
  const allocation=allocateRegionalAssets(copy.incidents||[])
  copy.assets=allocation.assets
  const missionIdByPrimaryAsset=new Map()
  copy.missions=(copy.missions||[]).map(mission=>{
    const primary=allocation.primaryAssetByIncidentId[mission.incidentId]
    if(primary && !missionIdByPrimaryAsset.has(primary.id)) missionIdByPrimaryAsset.set(primary.id,mission.id)
    return {
      ...mission,
      assetId:primary?primary.id:null,
      callsign:primary?primary.callsign:mission.callsign,
      platform:primary?primary.identifier:mission.platform,
    }
  })
  // Stamp missionId back onto the primary assets so asset->mission links are consistent.
  copy.assets=copy.assets.map(asset=>
    missionIdByPrimaryAsset.has(asset.id)?{...asset,missionId:missionIdByPrimaryAsset.get(asset.id)}:asset
  )
  // Keep sorties/decks/deliveries callsigns consistent with the reallocated assets.
  const missionById=new Map(copy.missions.map(m=>[m.id,m]))
  copy.sorties=(copy.sorties||[]).map(item=>{
    const mission=missionById.get(item.missionId)
    return mission?{...item,callsign:mission.callsign}:item
  })
  copy.deliveries=(copy.deliveries||[]).map(item=>{
    const mission=missionById.get(item.missionId)
    return mission?{...item,sourcePlatform:mission.callsign}:item
  })


  const rawAirspace=isObject(copy.airspace)?copy.airspace:{restrictions:list(copy.airspace),conflicts:[],summary:{}}
  copy.airspace={
    restrictions:list(rawAirspace.restrictions).map((item,index)=>{
      const incidentId=incidentByOldId.get(item.incidentId)||item.incidentId
      const incident=copy.incidents.find(candidate=>candidate.id===incidentId)
      const affectedMissions=list(item.affectedMissions||item.affectedMissionIds).map(value=>{
        const mapped=missionByOldId.get(value)||value
        const match=copy.missions.find(m=>m.id===mapped||m.callsign===value||m.platform===value)
        return match?.id
      }).filter(Boolean)
      const occupancy=[...FTA_REFERENCE_TABLE,...list(item.altitudeOccupancy).slice(FTA_REFERENCE_TABLE.length)]
      return {
        ...item,
        id:item.id||`AIRSPACE-${String(index+1).padStart(3,'0')}`,
        incidentId,
        incident:item.incident||incident?.name||'Regional',
        operationalLabel:item.operationalLabel||item.name||`${item.type||'TFR'} — ${incident?.name||'Regional'}`,
        centerLat:Number(item.centerLat??incident?.lat),
        centerLng:Number(item.centerLng??incident?.lng),
        affectedMissions,
        status:String(item.status||'PENDING').toUpperCase(),
        coordinationStatus:String(item.coordinationStatus||'UNCOORDINATED').toUpperCase(),
        altitudeOccupancy:occupancy,
        verticalSeparationRule:'500 ft minimum between assigned layers',
      }
    }),
    conflicts:list(rawAirspace.conflicts).map((item,index)=>({
      ...item,
      id:item.id||`AIRSPACE-CONFLICT-${String(index+1).padStart(3,'0')}`,
      missionId:(()=>{const mapped=missionByOldId.get(item.missionId)||item.missionId;return copy.missions.find(m=>m.id===mapped||m.callsign===item.missionId||m.platform===item.missionId)?.id||mapped})(),
      status:String(item.status||'NOT_STARTED').toUpperCase(),
    })),
    summary:{},
  }
  copy.airspace.summary=recomputeAirspaceSummary(copy.airspace)

  return copy
}
