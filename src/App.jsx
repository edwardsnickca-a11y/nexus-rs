import React, { useState } from 'react'
import SetupScreen from './components/SetupScreen.jsx'
import Sidebar from './components/Sidebar.jsx'
import Header from './components/Header.jsx'
import AdvisorPanel from './components/AdvisorPanel.jsx'
import Overview from './components/Overview.jsx'
import CurrentOps from './components/CurrentOps.jsx'
import TomorrowPlan from './components/TomorrowPlan.jsx'
import SyncMatrix from './components/SyncMatrix.jsx'
import AssetAllocation from './components/AssetAllocation.jsx'
import Platforms from './components/Platforms.jsx'
import Requirements from './components/Requirements.jsx'
import Dissemination from './components/Dissemination.jsx'
import ResourceDesk from './components/ResourceDesk.jsx'
import IntelligenceOversight from './components/IntelligenceOversight.jsx'
import DecisionLog from './components/DecisionLog.jsx'
import OperationalTransition from './components/OperationalTransition.jsx'
import { INITIAL_MISSION_STATE } from './data/missionState.js'
import { INITIAL_MATRIX } from './data/syncMatrix.js'

function Placeholder({title}){return <section className="panel placeholder"><span className="eyebrow">NEXUS RS v0.1</span><h3>{title}</h3><p>This workspace shell is ready for state-driven data, role permissions, and AI integration in the next development pass.</p></section>}

export default function App(){
 const [started,setStarted]=useState(false)
 const [role,setRole]=useState('remote_sensing_coordinator')
 const [active,setActive]=useState('mission')
 const [missionState,setMissionState]=useState(INITIAL_MISSION_STATE)
 const [syncMatrix,setSyncMatrix]=useState(INITIAL_MATRIX)

 const recordDecision=(type,detail)=>setMissionState(prev=>({...prev,decisions:[...prev.decisions,{id:`decision-${prev.decisions.length+1}`,type,detail,asOf:prev.asOf,role}]}))
 const toggleProtection=(missionId)=>setMissionState(prev=>({...prev,currentOps:{...prev.currentOps,missions:prev.currentOps.missions.map(m=>m.id===missionId?{...m,protected:!m.protected}:m)},crossPeriodImpacts:[...prev.crossPeriodImpacts,{id:`x-${Date.now()}`,source:'Current Ops',target:"Tomorrow's Plan",impact:`Mission protection changed for ${missionId}; OP 2 availability must be rechecked.`}]}))
 const notifyCoordinator=(missionId)=>{setMissionState(prev=>({...prev,currentOps:{...prev.currentOps,missions:prev.currentOps.missions.map(m=>m.id===missionId?{...m,coordinatorNotified:true}:m)}}));recordDecision('coordination',`Coordinator notified of ${missionId} impact`)}
 const markTaskable=(reqId)=>setMissionState(prev=>{const reqs=prev.tomorrowPlan.requirements.map(r=>r.id===reqId?{...r,taskable:true,status:r.upad==='Unassigned'?'draft':'ready'}:r);const blockers=prev.tomorrowPlan.blockers.filter(b=>!b.includes('Fire Bravo EEIs'));return {...prev,tomorrowPlan:{...prev.tomorrowPlan,requirements:reqs,blockers,readiness:Math.min(100,prev.tomorrowPlan.readiness+12)}}})
 const assignUpad=(reqId)=>setMissionState(prev=>{const reqs=prev.tomorrowPlan.requirements.map(r=>r.id===reqId?{...r,upad:'UPAD-NW',status:r.taskable?'ready':'draft'}:r);const blockers=prev.tomorrowPlan.blockers.filter(b=>!b.includes('UPAD support'));return {...prev,tomorrowPlan:{...prev.tomorrowPlan,requirements:reqs,blockers,readiness:Math.min(100,prev.tomorrowPlan.readiness+10)}}})
 const approvePlan=()=>setMissionState(prev=>({...prev,tomorrowPlan:{...prev.tomorrowPlan,approved:true,status:'approved',readiness:100}}))

 const releaseAsset=(assetId)=>setMissionState(prev=>{const asset=prev.assetControl.assets.find(a=>a.id===assetId);if(!asset||asset.status==='released') return prev;const affectedMission=asset.missionId;return {...prev,assetControl:{...prev.assetControl,assets:prev.assetControl.assets.map(a=>a.id===assetId?{...a,status:'released',assignment:'Returned to State',missionId:null}:a),history:[...prev.assetControl.history,{id:`asset-history-${Date.now()}`,time:'CURRENT LOCAL',actor:'Remote Sensing Coordinator',action:`Released ${asset.identifier} back to State J3 control.`}]},currentOps:{...prev.currentOps,missions:prev.currentOps.missions.map(m=>m.id===affectedMission?{...m,status:'asset_released',risk:'Assigned platform released to state control'}:m)},crossPeriodImpacts:[...prev.crossPeriodImpacts,{id:`x-${Date.now()}`,source:'Asset Allocation',target:"Tomorrow's Plan",impact:`${asset.identifier} was released to state control; current and next-period coverage must be revalidated.`}],decisions:[...prev.decisions,{id:`decision-${prev.decisions.length+1}`,type:'asset_release',detail:`Released ${asset.identifier} to State J3`,asOf:'CURRENT LOCAL',role}]}})
 const submitAssetRequest=(request)=>setMissionState(prev=>({...prev,assetControl:{...prev.assetControl,requests:[...prev.assetControl.requests,{...request,id:`asset-request-${Date.now()}`,status:'PENDING STATE J3',submittedAt:'CURRENT LOCAL',submittedBy:'Remote Sensing Coordinator'}],history:[...prev.assetControl.history,{id:`asset-history-${Date.now()}`,time:'CURRENT LOCAL',actor:'Remote Sensing Coordinator',action:`Submitted ${request.quantity} × ${request.requestType} request to State J3.`}]},decisions:[...prev.decisions,{id:`decision-${prev.decisions.length+1}`,type:'asset_request',detail:`Requested ${request.quantity} × ${request.requestType} from State J3`,asOf:'CURRENT LOCAL',role}]}))
 const cancelAssetRequest=(requestId)=>setMissionState(prev=>({...prev,assetControl:{...prev.assetControl,requests:prev.assetControl.requests.filter(r=>r.id!==requestId)}}))

 const updateDelivery=(deliveryId,changes)=>setMissionState(prev=>({...prev,dissemination:{...prev.dissemination,deliveries:prev.dissemination.deliveries.map(d=>d.id===deliveryId?{...d,...changes,lastUpdate:'CURRENT LOCAL'}:d),history:[...prev.dissemination.history,{id:`delivery-history-${Date.now()}`,time:'CURRENT LOCAL',actor:role,action:`Updated delivery ${deliveryId}: ${Object.keys(changes).join(', ')}`} ]},decisions:[...prev.decisions,{id:`decision-${prev.decisions.length+1}`,type:'delivery_update',detail:`Updated ${deliveryId}`,asOf:'CURRENT LOCAL',role}]}))
 const verifyReceipt=(deliveryId)=>setMissionState(prev=>({...prev,dissemination:{...prev.dissemination,deliveries:prev.dissemination.deliveries.map(d=>d.id===deliveryId?{...d,receiptStatus:'verified',deliveryStatus:'delivered',lastUpdate:'CURRENT LOCAL'}:d),history:[...prev.dissemination.history,{id:`delivery-history-${Date.now()}`,time:'CURRENT LOCAL',actor:role,action:`Verified customer receipt for ${deliveryId}.`} ]},decisions:[...prev.decisions,{id:`decision-${prev.decisions.length+1}`,type:'receipt_verified',detail:`Customer receipt verified for ${deliveryId}`,asOf:'CURRENT LOCAL',role}]}))
 const recordCustomerFeedback=(deliveryId,text)=>setMissionState(prev=>({...prev,dissemination:{...prev.dissemination,feedback:[...prev.dissemination.feedback,{id:`feedback-${Date.now()}`,deliveryId,time:'CURRENT LOCAL',actor:role,text}],deliveries:prev.dissemination.deliveries.map(d=>d.id===deliveryId?{...d,feedbackStatus:'received',lastUpdate:'CURRENT LOCAL'}:d),history:[...prev.dissemination.history,{id:`delivery-history-${Date.now()}`,time:'CURRENT LOCAL',actor:role,action:`Recorded customer feedback for ${deliveryId}.`} ]},decisions:[...prev.decisions,{id:`decision-${prev.decisions.length+1}`,type:'customer_feedback',detail:`Feedback recorded for ${deliveryId}`,asOf:'CURRENT LOCAL',role}]}))


 const updateRequirement=(reqId,changes)=>setMissionState(prev=>{
  const current=prev.requirements.items.find(r=>r.id===reqId);
  if(!current) return prev;
  const updated={...current,...changes,lastUpdatedBy:role,lastUpdatedAt:'CURRENT LOCAL'};
  const items=prev.requirements.items.map(r=>r.id===reqId?updated:r);
  const taskableCount=items.filter(r=>r.status==='taskable').length;
  const total=items.length||1;
  const readiness=Math.round((taskableCount/total)*100);
  const linkedTomorrow=prev.tomorrowPlan.requirements.map(r=>r.id===reqId?{...r,taskable:updated.status==='taskable',status:updated.status==='taskable'?(r.upad==='Unassigned'?'draft':'ready'):'draft'}:r);
  return {...prev,requirements:{...prev.requirements,items,history:[...prev.requirements.history,{id:`req-history-${Date.now()}`,time:'CURRENT LOCAL',actor:role,action:`Updated ${reqId}: ${Object.keys(changes).join(', ')}`} ]},tomorrowPlan:{...prev.tomorrowPlan,requirements:linkedTomorrow,readiness:Math.max(prev.tomorrowPlan.readiness,readiness)},decisions:[...prev.decisions,{id:`decision-${prev.decisions.length+1}`,type:'requirement_update',detail:`Updated ${reqId}`,asOf:'CURRENT LOCAL',role}]};
 })
 const validateRequirement=(reqId)=>setMissionState(prev=>{
  const req=prev.requirements.items.find(r=>r.id===reqId);
  if(!req) return prev;
  const checks={
   acceptable:Boolean(req.decisionToSupport&&req.why),
   feasible:Boolean(req.requiredEffect&&req.where&&req.when),
   complete:Boolean(req.what&&req.where&&req.when&&req.why&&req.who&&req.decisionToSupport&&req.eeis?.length),
   existingSourceChecked:Boolean(req.existingSourceCheck),
   organicSuitabilityChecked:Boolean(req.organicSuitability),
  };
  const missing=[];
  if(!req.what) missing.push('WHAT'); if(!req.where) missing.push('WHERE'); if(!req.when) missing.push('WHEN'); if(!req.why) missing.push('WHY'); if(!req.who) missing.push('WHO'); if(!req.decisionToSupport) missing.push('decision to support'); if(!req.eeis?.length) missing.push('EEIs');
  const status=checks.acceptable&&checks.feasible&&checks.complete&&checks.existingSourceChecked&&checks.organicSuitabilityChecked?'taskable':'needs_clarification';
  const items=prev.requirements.items.map(r=>r.id===reqId?{...r,validation:checks,missingFields:missing,status,lastUpdatedBy:role,lastUpdatedAt:'CURRENT LOCAL'}:r);
  const blockers=status==='taskable'?prev.tomorrowPlan.blockers.filter(b=>!b.includes(req.fire)):prev.tomorrowPlan.blockers;
  return {...prev,requirements:{...prev.requirements,items,history:[...prev.requirements.history,{id:`req-history-${Date.now()}`,time:'CURRENT LOCAL',actor:role,action:`Validated ${reqId}: ${status}.`} ]},tomorrowPlan:{...prev.tomorrowPlan,blockers,readiness:status==='taskable'?Math.min(100,prev.tomorrowPlan.readiness+10):prev.tomorrowPlan.readiness},decisions:[...prev.decisions,{id:`decision-${prev.decisions.length+1}`,type:'requirement_validation',detail:`${reqId} marked ${status}`,asOf:'CURRENT LOCAL',role}]};
 })
 const sendRequirementForward=(reqId)=>setMissionState(prev=>{
  const req=prev.requirements.items.find(r=>r.id===reqId);
  if(!req||req.status!=='taskable') return prev;
  return {...prev,requirements:{...prev.requirements,items:prev.requirements.items.map(r=>r.id===reqId?{...r,status:'sent_forward',sentTo:'Remote Sensing Manager',sentAt:'CURRENT LOCAL'}:r),history:[...prev.requirements.history,{id:`req-history-${Date.now()}`,time:'CURRENT LOCAL',actor:role,action:`Sent ${reqId} forward to Remote Sensing Manager.`}]},syncRequirementLinks:[...(prev.syncRequirementLinks||[]),{id:`link-${Date.now()}`,requirementId:reqId,fire:req.fire,decisionToSupport:req.decisionToSupport,eeis:req.eeis,status:'READY FOR MATRIX',linkedAt:'CURRENT LOCAL'}],decisions:[...prev.decisions,{id:`decision-${prev.decisions.length+1}`,type:'requirement_forward',detail:`Sent ${reqId} to RS Manager`,asOf:'CURRENT LOCAL',role}]};
 })
 const addRequirement=(payload)=>setMissionState(prev=>({...prev,requirements:{...prev.requirements,items:[...prev.requirements.items,{...payload,id:`req-${Date.now()}`,status:'needs_clarification',validation:{acceptable:false,feasible:false,complete:false,existingSourceChecked:false,organicSuitabilityChecked:false},missingFields:['WHAT','WHERE','WHEN','WHY','WHO','decision to support','EEIs'],lastUpdatedBy:role,lastUpdatedAt:'CURRENT LOCAL'}],history:[...prev.requirements.history,{id:`req-history-${Date.now()}`,time:'CURRENT LOCAL',actor:role,action:`Added new requirement: ${payload.title||'Untitled requirement'}.`} ]}}))

 const recordResourceUse=(resource,requirement,note)=>setMissionState(prev=>({...prev,resources:{...prev.resources,useHistory:[...prev.resources.useHistory,{id:`resource-use-${Date.now()}`,time:'CURRENT LOCAL',role,resourceId:resource.id,resourceName:resource.name,requirementId:requirement.id,note}]},decisions:[...prev.decisions,{id:`decision-${prev.decisions.length+1}`,type:'resource_use',detail:`Used ${resource.name} for ${requirement.id}`,asOf:'CURRENT LOCAL',role}]}))
 const updateOversightCase=(caseId,changes)=>setMissionState(prev=>({...prev,oversight:{...prev.oversight,cases:prev.oversight.cases.map(c=>c.id===caseId?{...c,...changes,lastUpdated:'CURRENT LOCAL'}:c),history:[...prev.oversight.history,{id:`io-history-${Date.now()}`,time:'CURRENT LOCAL',actor:role,action:`Updated oversight case ${caseId}: ${Object.keys(changes).join(', ')}`} ]},decisions:[...prev.decisions,{id:`decision-${prev.decisions.length+1}`,type:'oversight_update',detail:`Updated ${caseId}`,asOf:'CURRENT LOCAL',role}]}))
 const addOversightCase=(payload)=>setMissionState(prev=>({...prev,oversight:{...prev.oversight,cases:[...prev.oversight.cases,{id:`IO-${String(prev.oversight.cases.length+1).padStart(3,'0')}`,requirementId:'UNLINKED',owner:'Collection Manager',severity:'medium',deadline:'TBD Local',status:'open',knownFacts:'',uncertainty:'Requires clarification.',selectedAction:'',resolutionNote:'',...payload}],history:[...prev.oversight.history,{id:`io-history-${Date.now()}`,time:'CURRENT LOCAL',actor:role,action:`Added oversight concern: ${payload.title}.`} ]}}))


 const submitFreeTextDecision=(exactText)=>setMissionState(prev=>{
  const authorityPatterns={
   remote_sensing_coordinator:[/retask/i,/assign analyst/i],
   remote_sensing_manager:[/approve.*regional/i,/allocate.*across/i,/publish.*plan/i],
   collection_manager:[/retask/i,/approve.*plan/i,/allocate.*asset/i],
   upad_lno:[/retask/i,/change.*priority/i,/allocate.*asset/i,/approve.*plan/i],
  };
  const concern=(authorityPatterns[role]||[]).find(pattern=>pattern.test(exactText));
  const withinRoleAuthority=!concern;
  const chain={
   remote_sensing_coordinator:'Provide the regional decision and leadership-ready rationale.',
   remote_sensing_manager:'Notify the Remote Sensing Coordinator and pass the mission impact up.',
   collection_manager:'Refine the requirement and send the recommendation to the RS Manager.',
   upad_lno:'Take the production action within the UPAD and pass collection impacts to the RS Manager.',
  }[role];
  const record={id:`decision-${prev.decisions.length+1}`,type:'free_text_decision',exactText,interpretedDecision:exactText,detail:exactText,asOf:'CURRENT LOCAL',role,withinRoleAuthority,authorityConcern:withinRoleAuthority?null:'The action appears to exceed the selected role authority.',immediateConsequence:withinRoleAuthority?'Decision entered for mission-state evaluation.':'Coordination friction and trust risk recorded; action requires redirection.',planningImpact:'Current Ops and Tomorrow’s Plan must be checked for downstream effects.',requiredFollowUp:chain};
  return {...prev,decisions:[...prev.decisions,record],lastAdvisorUpdate:{time:'CURRENT LOCAL',text:withinRoleAuthority?'Decision recorded. Mission consequences require follow-up through the role chain.':`You do not hold that authority. ${chain}`}};
 })

 const transitionOperationalPeriod=()=>setMissionState(prev=>{
  if(!prev.tomorrowPlan.approved || role!=='remote_sensing_coordinator') return prev;
  const nextOp=prev.operationalPeriod+1;
  const nextMissions=prev.tomorrowPlan.requirements.filter(r=>r.status==='ready'||r.taskable).map((r,index)=>({id:`op${nextOp}-mission-${index+1}`,fire:r.fire,platform:r.platform||'Capability assignment pending',window:r.window||'TBD Local',objective:r.objective||r.title||'Approved collection requirement',status:'planned',risk:r.upad==='Unassigned'?'Production support unresolved':'Normal',protected:false,coordinatorNotified:false}));
  const transitionRecord={id:`decision-${prev.decisions.length+1}`,type:'op_transition',detail:`Transitioned from OP ${prev.operationalPeriod} to OP ${nextOp}`,interpretedDecision:`Approved operational-period transition to OP ${nextOp}`,asOf:'CURRENT LOCAL',role,withinRoleAuthority:true,immediateConsequence:'Approved tomorrow-plan requirements became current operational commitments.',planningImpact:'Unresolved requirements, products, oversight cases, asset requests, and protected missions carried forward.',requiredFollowUp:'Revalidate mission windows, UPAD support, airspace, and partner commitments at the new OP start.'};
  return {...prev,operationalPeriod:nextOp,asOf:'OP START LOCAL',currentOps:{...prev.currentOps,status:'ACTIVE',missions:nextMissions.length?nextMissions:prev.currentOps.missions.map(m=>({...m,status:'carry_forward'}))},tomorrowPlan:{...prev.tomorrowPlan,status:'development',approved:false,readiness:0,blockers:['New operational-period requirements require development.'],requirements:[]},crossPeriodImpacts:prev.crossPeriodImpacts.map(x=>({...x,carriedIntoOperationalPeriod:nextOp})),decisions:[...prev.decisions,transitionRecord],operationalPeriodHistory:[...(prev.operationalPeriodHistory||[]),{from:prev.operationalPeriod,to:nextOp,time:'CURRENT LOCAL',approvedBy:'Remote Sensing Coordinator'}]};
 })

 const matrixChange=(updatedBy,note,mutate)=>setSyncMatrix(prev=>{const next=mutate(prev);const version=prev.version+1;return {...next,version,asOf:'CURRENT LOCAL',coordinatorApprovalStatus:'pending',status:'UPDATE REQUIRED',changeHistory:[...prev.changeHistory,{version,asOf:'CURRENT LOCAL',updatedBy,note}]}})
 const updateSortie=(sortieId,changes)=>matrixChange(role,`Updated ${sortieId}: ${Object.keys(changes).join(', ')}.`,prev=>({...prev,sorties:prev.sorties.map(s=>s.id===sortieId?{...s,...changes}:s)}))
 const resolveNeed=(id)=>matrixChange(role,`Unmet need ${id} moved to coordinating.`,prev=>({...prev,unmetNeeds:prev.unmetNeeds.map(x=>x.id===id?{...x,status:'COORDINATING'}:x)}))
 const resolveGap=(id)=>matrixChange(role,`Coverage gap ${id} resolved.`,prev=>({...prev,coverageGaps:prev.coverageGaps.map(x=>x.id===id?{...x,status:'RESOLVED'}:x)}))
 const addLeadershipNote=(note)=>matrixChange(role,'Leadership note added.',prev=>({...prev,leadershipNotes:[...prev.leadershipNotes,note]}))
 const approveMatrix=()=>setSyncMatrix(prev=>{const version=prev.version+1;return {...prev,version,status:'APPROVED',coordinatorApprovalStatus:'approved',asOf:'CURRENT LOCAL',changeHistory:[...prev.changeHistory,{version,asOf:'CURRENT LOCAL',updatedBy:'Remote Sensing Coordinator',note:'Regional Sync Matrix approved for leadership brief.'}]}})

 if(!started) return <SetupScreen role={role} setRole={setRole} onStart={()=>setStarted(true)}/>
 const content={
  mission:<Overview role={role}/>,
  current:<CurrentOps role={role} missionState={missionState} onToggleProtection={toggleProtection} onNotifyCoordinator={notifyCoordinator} onOpenTomorrow={()=>setActive('tomorrow')}/>,
  tomorrow:<TomorrowPlan role={role} missionState={missionState} onMarkTaskable={markTaskable} onAssignUpad={assignUpad} onApprovePlan={approvePlan} onOpenCurrent={()=>setActive('current')}/>,
  sync:<SyncMatrix role={role} matrix={syncMatrix} onUpdateSortie={updateSortie} onResolveNeed={resolveNeed} onResolveGap={resolveGap} onApprove={approveMatrix} onAddLeadershipNote={addLeadershipNote}/>,
  requirements:<Requirements role={role} missionState={missionState} onUpdateRequirement={updateRequirement} onValidateRequirement={validateRequirement} onSendForward={sendRequirementForward} onAddRequirement={addRequirement}/>,platforms:<Platforms role={role} missionState={missionState}/>,upad:<Dissemination role={role} missionState={missionState} onUpdateDelivery={updateDelivery} onVerifyReceipt={verifyReceipt} onRecordFeedback={recordCustomerFeedback}/>,airspace:<Placeholder title="Airspace / TFR"/>,resources:<ResourceDesk role={role} missionState={missionState} onRecordUse={recordResourceUse}/>,oversight:<IntelligenceOversight role={role} missionState={missionState} onUpdateCase={updateOversightCase} onAddCase={addOversightCase}/>,transition:<OperationalTransition role={role} missionState={missionState} onTransition={transitionOperationalPeriod}/>,log:<DecisionLog role={role} missionState={missionState}/>
 }[active]
 return <div className="app-shell"><Sidebar active={active} setActive={setActive} role={role}/><div className="main-shell"><Header role={role} onExit={()=>setStarted(false)}/><main className="workspace"><div>{content}</div><AdvisorPanel role={role} onSubmitDecision={submitFreeTextDecision}/></main></div></div>
}
