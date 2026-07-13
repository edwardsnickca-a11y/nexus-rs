const list=value=>Array.isArray(value)?value:[]
const code=name=>(String(name).trim().split(/\s+/).filter(Boolean).map(word=>word[0]).join('').toUpperCase()||'INC').slice(0,4)
const parseWindow=value=>{
 const parts=String(value||'').match(/\d{4}/g)||[]
 const hour=text=>{const n=Number(text);return Math.floor(n/100)+(n%100)/60}
 return {start:parts[0]?hour(parts[0]):8,end:parts[1]?hour(parts[1]):12}
}

export function buildSyncMatrixFromState(state){
 const requirements=list(state.requirements?.items)
 const missions=list(state.currentOps?.missions)
 const deliveries=list(state.dissemination?.deliveries)
 const reqById=new Map(requirements.map(item=>[item.id,item]))
 const deliveryByMission=new Map(deliveries.map(item=>[item.missionId,item]))
 const sequence={}
 const sorties=missions.map(mission=>{
  const incident=mission.incident||mission.fire||'Regional'
  const incidentCode=code(incident)
  sequence[incidentCode]=(sequence[incidentCode]||0)+1
  const callsign=mission.callsign||mission.platform||'ASSET'
  const req=reqById.get(mission.requirementId)||{}
  const delivery=deliveryByMission.get(mission.id)||{}
  const window=parseWindow(mission.window)
  return {
   id:`${incidentCode}-${String(callsign).replace(/[^A-Z0-9]/gi,'').toUpperCase()}-${String(sequence[incidentCode]).padStart(2,'0')}`,
   missionId:mission.id,
   asset:callsign,
   identifier:callsign,
   start:window.start,
   end:window.end,
   fire:incident,
   requirement:req.title||req.what||'Collection requirement',
   requirementId:req.id||mission.requirementId,
   objective:mission.objective||req.requiredEffect||req.title||'Collection support',
   upad:delivery.assignedUpad||'Unassigned',
   productStatus:String(delivery.processingStatus||delivery.deliveryStatus||'not started').replaceAll('_',' ').toUpperCase(),
   missionStatus:String(mission.status||'planned').replaceAll('_',' ').toUpperCase(),
   protected:Boolean(mission.protected),
   airspace:'COORDINATING',
   coordination:mission.coordinatorNotified?'CONFIRMED':'PENDING',
  }
 })
 return {
  version:1,status:'COORDINATING',
  asOf:state.exercise?.localIncidentTime||state.asOf||'CURRENT LOCAL',
  operationalPeriod:`Operational Period ${state.exercise?.activeOperationalPeriod||1}`,
  date:'',coordinatorApprovalStatus:'pending',
  deadlines:list(state.currentOps?.deadlines).map(item=>[item.label||item.title||'Decision deadline',item.time||item.deadline||'TBD']),
  sorties,
  unmetNeeds:requirements.filter(item=>!item.taskable&&item.status!=='taskable').map((item,index)=>({
   id:`need-${index+1}`,requirement:item.title||'Requirement development',requirementId:item.id,
   fire:item.incident||item.fire||'Regional',window:item.when||'TBD',
   reason:(item.missingFields||[]).length?`Missing ${item.missingFields.join(', ')}`:'Requirement is not taskable',
   deadline:item.when||'TBD',status:'OPEN',
  })),
  coverageGaps:missions.filter(item=>/risk|gap|pending/i.test(`${item.status||''} ${item.risk||''}`)).map((item,index)=>({
   id:`gap-${index+1}`,fire:item.incident||item.fire||'Regional',window:item.window||'TBD',
   requirement:reqById.get(item.requirementId)?.title||item.objective||'Mission requirement',
   consequence:item.risk||'Execution risk requires assessment',status:'AT RISK',
  })),
  partnerAssets:[],airspaceIssues:[],
  leadershipNotes:[],
  changeHistory:[{version:1,asOf:state.exercise?.localIncidentTime||state.asOf||'CURRENT LOCAL',updatedBy:'Scenario Controller',note:'Generated from current exercise state.'}],
 }
}
