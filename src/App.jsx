import React, { useState } from 'react'
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
import AfterActionReview from './components/AfterActionReview.jsx'
import MissionUpdates from './components/MissionUpdates.jsx'
import MissionPortal from './components/MissionPortal.jsx'
import ScenarioBrief from './components/ScenarioBrief.jsx'
import RoleSelection from './components/RoleSelection.jsx'
import ExerciseStatusBar from './components/ExerciseStatusBar.jsx'
import EndExModal from './components/EndExModal.jsx'
import { evaluateMissionDecision } from './engine/missionAdvisor.js'
import { buildAdvisorContext } from './engine/advisorPromptBuilder.js'
import { validateAdvisorResponse, deterministicFallback } from './engine/advisorResponseValidator.js'
import { requestAdvisorInterpretation } from './services/advisorApi.js'
import { applyIntegratedAction, deriveOperationalSummary, verifyCustomerReceipt, recordCustomerFeedback as integrateCustomerFeedback } from './engine/integrationEngine.js'
import { INITIAL_MISSION_STATE } from './data/missionState.js'
import { INITIAL_MATRIX } from './data/syncMatrix.js'
import { initializeScenario, selectRole as controllerSelectRole, startExercise, advanceTurn, beginTransition, approveTransition, endExercise, resetExercise, isWorkspaceReadOnly } from './engine/exerciseController.js'

function Placeholder({title}){return <section className="panel placeholder"><span className="eyebrow">NEXUS RS v0.1</span><h3>{title}</h3><p>This workspace shell is ready for state-driven data, role permissions, and AI integration in the next development pass.</p></section>}

export default function App(){
 const [role,setRole]=useState(null)
 const [active,setActive]=useState('portal')
 const [showEndEx,setShowEndEx]=useState(false)
 const [missionState,setMissionState]=useState(INITIAL_MISSION_STATE)
 const [syncMatrix,setSyncMatrix]=useState(INITIAL_MATRIX)
 const [advisorPending,setAdvisorPending]=useState(null)
 const [advisorBusy,setAdvisorBusy]=useState(false)
 const [advisorMode,setAdvisorMode]=useState('local')


 const currentRole=missionState.exercise?.selectedRole || role || 'remote_sensing_coordinator'
 const updateMission=(updater)=>setMissionState(prev=>typeof updater==='function'?updater(prev):updater)
 const applyPortalScenario=(state,scenario)=>{
  if(!scenario) return state
  const initialized=state.exercise?.scenarioId ? state : initializeScenario(state)
  return {
   ...initialized,
   scenario:{...(initialized.scenario||{}),id:scenario.id,name:scenario.title,location:scenario.location,description:scenario.summary,periods:Array.from({length:scenario.periods},(_,index)=>`Operational Period ${index+1}`)},
   exercise:{...(initialized.exercise||{}),scenarioId:scenario.id,scenarioName:scenario.title,currentPhase:'Mission Portal'},
  }
 }
 const selectPortalScenario=(scenario)=>setMissionState(prev=>applyPortalScenario(prev,scenario))
 const openScenarioBrief=(scenario)=>{setMissionState(prev=>applyPortalScenario(prev,scenario));setActive('brief')}
 const openRoleSelection=()=>{setMissionState(prev=>({...prev,exercise:{...(prev.exercise||{}),status:'role_selection',currentPhase:'Role Selection'}}));setActive('roles')}
 const confirmRoleSelection=(selectedRole)=>{setRole(selectedRole);setMissionState(prev=>controllerSelectRole(prev,selectedRole))}
 const confirmStartEx=(scenario, setup={})=>{setMissionState(prev=>{
  const initialized=applyPortalScenario(prev,scenario)
  const configured={...initialized,exercise:{...(initialized.exercise||{}),participantName:(setup.participantName||initialized.exercise?.participantName||'').trim(),operationalContext:setup.operationalContext||initialized.exercise?.operationalContext||'',exerciseFocus:setup.exerciseFocus||initialized.exercise?.exerciseFocus||'Full Mission Cycle'}}
  return startExercise(configured)
 });setActive('current')}
 const advanceExercise=()=>setMissionState(prev=>advanceTurn(prev))
 const reviewTransition=()=>{setMissionState(prev=>beginTransition(prev));setActive('transition')}
 const approveLifecycleTransition=()=>{setMissionState(prev=>approveTransition(prev));setActive('current')}
 const confirmEndEx=(reason)=>{setMissionState(prev=>endExercise(prev,reason));setShowEndEx(false);setActive('aar')}
 const resetActiveExercise=()=>{if(window.confirm('Reset Exercise? This clears the active mission state and returns to the Mission Portal.')){setMissionState(resetExercise(INITIAL_MISSION_STATE));setSyncMatrix(INITIAL_MATRIX);setRole(null);setActive('portal')}}
 const readOnly=isWorkspaceReadOnly(missionState,active)

 const recordDecision=(type,detail)=>setMissionState(prev=>({...prev,decisions:[...prev.decisions,{id:`decision-${prev.decisions.length+1}`,type,detail,asOf:prev.asOf,role:currentRole}]}))
 const toggleProtection=(missionId)=>setMissionState(prev=>({...prev,currentOps:{...prev.currentOps,missions:prev.currentOps.missions.map(m=>m.id===missionId?{...m,protected:!m.protected}:m)},crossPeriodImpacts:[...prev.crossPeriodImpacts,{id:`x-${Date.now()}`,source:'Current Ops',target:"Tomorrow's Plan",impact:`Mission protection changed for ${missionId}; OP 2 availability must be rechecked.`}]}))
 const notifyCoordinator=(missionId)=>{setMissionState(prev=>({...prev,currentOps:{...prev.currentOps,missions:prev.currentOps.missions.map(m=>m.id===missionId?{...m,coordinatorNotified:true}:m)}}));recordDecision('coordination',`Coordinator notified of ${missionId} impact`)}
 const markTaskable=(reqId)=>setMissionState(prev=>{const reqs=prev.tomorrowPlan.requirements.map(r=>r.id===reqId?{...r,taskable:true,status:r.upad==='Unassigned'?'draft':'ready'}:r);const blockers=prev.tomorrowPlan.blockers.filter(b=>!b.includes('Fire Bravo EEIs'));return {...prev,tomorrowPlan:{...prev.tomorrowPlan,requirements:reqs,blockers,readiness:Math.min(100,prev.tomorrowPlan.readiness+12)}}})
 const assignUpad=(reqId)=>setMissionState(prev=>{const reqs=prev.tomorrowPlan.requirements.map(r=>r.id===reqId?{...r,upad:'UPAD-NW',status:r.taskable?'ready':'draft'}:r);const blockers=prev.tomorrowPlan.blockers.filter(b=>!b.includes('UPAD support'));return {...prev,tomorrowPlan:{...prev.tomorrowPlan,requirements:reqs,blockers,readiness:Math.min(100,prev.tomorrowPlan.readiness+10)}}})
 const approvePlan=()=>setMissionState(prev=>({...prev,tomorrowPlan:{...prev.tomorrowPlan,approved:true,status:'approved',readiness:100}}))

 const releaseAsset=(assetId)=>setMissionState(prev=>{const asset=prev.assetControl.assets.find(a=>a.id===assetId);if(!asset||asset.status==='released') return prev;const affectedMission=asset.missionId;return {...prev,assetControl:{...prev.assetControl,assets:prev.assetControl.assets.map(a=>a.id===assetId?{...a,status:'released',assignment:'Returned to State',missionId:null}:a),history:[...prev.assetControl.history,{id:`asset-history-${Date.now()}`,time:'CURRENT LOCAL',actor:'Remote Sensing Coordinator',action:`Released ${asset.identifier} back to State J3 control.`}]},currentOps:{...prev.currentOps,missions:prev.currentOps.missions.map(m=>m.id===affectedMission?{...m,status:'asset_released',risk:'Assigned platform released to state control'}:m)},crossPeriodImpacts:[...prev.crossPeriodImpacts,{id:`x-${Date.now()}`,source:'Asset Allocation',target:"Tomorrow's Plan",impact:`${asset.identifier} was released to state control; current and next-period coverage must be revalidated.`}],decisions:[...prev.decisions,{id:`decision-${prev.decisions.length+1}`,type:'asset_release',detail:`Released ${asset.identifier} to State J3`,asOf:'CURRENT LOCAL',role:currentRole}]}})
 const submitAssetRequest=(request)=>setMissionState(prev=>({...prev,assetControl:{...prev.assetControl,requests:[...prev.assetControl.requests,{...request,id:`asset-request-${Date.now()}`,status:'PENDING STATE J3',submittedAt:'CURRENT LOCAL',submittedBy:'Remote Sensing Coordinator'}],history:[...prev.assetControl.history,{id:`asset-history-${Date.now()}`,time:'CURRENT LOCAL',actor:'Remote Sensing Coordinator',action:`Submitted ${request.quantity} × ${request.requestType} request to State J3.`}]},decisions:[...prev.decisions,{id:`decision-${prev.decisions.length+1}`,type:'asset_request',detail:`Requested ${request.quantity} × ${request.requestType} from State J3`,asOf:'CURRENT LOCAL',role:currentRole}]}))
 const cancelAssetRequest=(requestId)=>setMissionState(prev=>({...prev,assetControl:{...prev.assetControl,requests:prev.assetControl.requests.filter(r=>r.id!==requestId)}}))

 const updateDelivery=(deliveryId,changes)=>setMissionState(prev=>({...prev,dissemination:{...prev.dissemination,deliveries:prev.dissemination.deliveries.map(d=>d.id===deliveryId?{...d,...changes,lastUpdate:'CURRENT LOCAL'}:d),history:[...prev.dissemination.history,{id:`delivery-history-${Date.now()}`,time:'CURRENT LOCAL',actor:currentRole,action:`Updated delivery ${deliveryId}: ${Object.keys(changes).join(', ')}`} ]},decisions:[...prev.decisions,{id:`decision-${prev.decisions.length+1}`,type:'delivery_update',detail:`Updated ${deliveryId}`,asOf:'CURRENT LOCAL',role:currentRole}]}))
 const verifyReceipt=(deliveryId)=>setMissionState(prev=>verifyCustomerReceipt(prev,deliveryId))
 const recordCustomerFeedback=(deliveryId,text)=>setMissionState(prev=>integrateCustomerFeedback(prev,deliveryId,text))


 const updateRequirement=(reqId,changes)=>setMissionState(prev=>{
  const current=prev.requirements.items.find(r=>r.id===reqId);
  if(!current) return prev;
  const updated={...current,...changes,lastUpdatedBy:currentRole,lastUpdatedAt:'CURRENT LOCAL'};
  const items=prev.requirements.items.map(r=>r.id===reqId?updated:r);
  const taskableCount=items.filter(r=>r.status==='taskable').length;
  const total=items.length||1;
  const readiness=Math.round((taskableCount/total)*100);
  const linkedTomorrow=prev.tomorrowPlan.requirements.map(r=>r.id===reqId?{...r,taskable:updated.status==='taskable',status:updated.status==='taskable'?(r.upad==='Unassigned'?'draft':'ready'):'draft'}:r);
  return {...prev,requirements:{...prev.requirements,items,history:[...prev.requirements.history,{id:`req-history-${Date.now()}`,time:'CURRENT LOCAL',actor:currentRole,action:`Updated ${reqId}: ${Object.keys(changes).join(', ')}`} ]},tomorrowPlan:{...prev.tomorrowPlan,requirements:linkedTomorrow,readiness:Math.max(prev.tomorrowPlan.readiness,readiness)},decisions:[...prev.decisions,{id:`decision-${prev.decisions.length+1}`,type:'requirement_update',detail:`Updated ${reqId}`,asOf:'CURRENT LOCAL',role:currentRole}]};
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
  const items=prev.requirements.items.map(r=>r.id===reqId?{...r,validation:checks,missingFields:missing,status,lastUpdatedBy:currentRole,lastUpdatedAt:'CURRENT LOCAL'}:r);
  const blockers=status==='taskable'?prev.tomorrowPlan.blockers.filter(b=>!b.includes(req.fire)):prev.tomorrowPlan.blockers;
  return {...prev,requirements:{...prev.requirements,items,history:[...prev.requirements.history,{id:`req-history-${Date.now()}`,time:'CURRENT LOCAL',actor:currentRole,action:`Validated ${reqId}: ${status}.`} ]},tomorrowPlan:{...prev.tomorrowPlan,blockers,readiness:status==='taskable'?Math.min(100,prev.tomorrowPlan.readiness+10):prev.tomorrowPlan.readiness},decisions:[...prev.decisions,{id:`decision-${prev.decisions.length+1}`,type:'requirement_validation',detail:`${reqId} marked ${status}`,asOf:'CURRENT LOCAL',role:currentRole}]};
 })
 const sendRequirementForward=(reqId)=>setMissionState(prev=>{
  const req=prev.requirements.items.find(r=>r.id===reqId);
  if(!req||req.status!=='taskable') return prev;
  return {...prev,requirements:{...prev.requirements,items:prev.requirements.items.map(r=>r.id===reqId?{...r,status:'sent_forward',sentTo:'Remote Sensing Manager',sentAt:'CURRENT LOCAL'}:r),history:[...prev.requirements.history,{id:`req-history-${Date.now()}`,time:'CURRENT LOCAL',actor:currentRole,action:`Sent ${reqId} forward to Remote Sensing Manager.`}]},syncRequirementLinks:[...(prev.syncRequirementLinks||[]),{id:`link-${Date.now()}`,requirementId:reqId,fire:req.fire,decisionToSupport:req.decisionToSupport,eeis:req.eeis,status:'READY FOR MATRIX',linkedAt:'CURRENT LOCAL'}],decisions:[...prev.decisions,{id:`decision-${prev.decisions.length+1}`,type:'requirement_forward',detail:`Sent ${reqId} to RS Manager`,asOf:'CURRENT LOCAL',role:currentRole}]};
 })
 const addRequirement=(payload)=>setMissionState(prev=>({...prev,requirements:{...prev.requirements,items:[...prev.requirements.items,{...payload,id:`req-${Date.now()}`,status:'needs_clarification',validation:{acceptable:false,feasible:false,complete:false,existingSourceChecked:false,organicSuitabilityChecked:false},missingFields:['WHAT','WHERE','WHEN','WHY','WHO','decision to support','EEIs'],lastUpdatedBy:currentRole,lastUpdatedAt:'CURRENT LOCAL'}],history:[...prev.requirements.history,{id:`req-history-${Date.now()}`,time:'CURRENT LOCAL',actor:currentRole,action:`Added new requirement: ${payload.title||'Untitled requirement'}.`} ]}}))

 const recordResourceUse=(resource,requirement,note)=>setMissionState(prev=>({...prev,resources:{...prev.resources,useHistory:[...prev.resources.useHistory,{id:`resource-use-${Date.now()}`,time:'CURRENT LOCAL',role: currentRole,resourceId:resource.id,resourceName:resource.name,requirementId:requirement.id,note}]},decisions:[...prev.decisions,{id:`decision-${prev.decisions.length+1}`,type:'resource_use',detail:`Used ${resource.name} for ${requirement.id}`,asOf:'CURRENT LOCAL',role:currentRole}]}))
 const updateOversightCase=(caseId,changes)=>setMissionState(prev=>({...prev,oversight:{...prev.oversight,cases:prev.oversight.cases.map(c=>c.id===caseId?{...c,...changes,lastUpdated:'CURRENT LOCAL'}:c),history:[...prev.oversight.history,{id:`io-history-${Date.now()}`,time:'CURRENT LOCAL',actor:currentRole,action:`Updated oversight case ${caseId}: ${Object.keys(changes).join(', ')}`} ]},decisions:[...prev.decisions,{id:`decision-${prev.decisions.length+1}`,type:'oversight_update',detail:`Updated ${caseId}`,asOf:'CURRENT LOCAL',role:currentRole}]}))
 const addOversightCase=(payload)=>setMissionState(prev=>({...prev,oversight:{...prev.oversight,cases:[...prev.oversight.cases,{id:`IO-${String(prev.oversight.cases.length+1).padStart(3,'0')}`,requirementId:'UNLINKED',owner:'Collection Manager',severity:'medium',deadline:'TBD Local',status:'open',knownFacts:'',uncertainty:'Requires clarification.',selectedAction:'',resolutionNote:'',...payload}],history:[...prev.oversight.history,{id:`io-history-${Date.now()}`,time:'CURRENT LOCAL',actor:currentRole,action:`Added oversight concern: ${payload.title}.`} ]}}))


 const submitFreeTextDecision=async(exactText)=>{
  if(advisorBusy) return
  setAdvisorBusy(true)
  const snapshot=missionState
  const evaluated=evaluateMissionDecision({state:snapshot,role:currentRole,exactText})
  let result
  let mode='local'
  try{
   const context=buildAdvisorContext(snapshot,currentRole,exactText)
   const remote=await requestAdvisorInterpretation({exactText,role:currentRole,context})
   const validated=validateAdvisorResponse(remote.response,snapshot)
   if(!validated.ok) throw Object.assign(new Error('Advisor response validation failed'),{code:validated.error})
   result=validated.value
   mode='connected'
  }catch(error){
   result=deterministicFallback(exactText,snapshot,currentRole,evaluated)
  }
  const entry={id:`advisor-${Date.now()}`,time:snapshot.exercise?.localIncidentTime||snapshot.asOf||'CURRENT LOCAL',role:currentRole,traineeText:exactText,advisorMessage:result.advisorMessage,advisorMode:mode,interpretation:result}
  setAdvisorMode(mode)
  setMissionState(prev=>({...prev,simulation:{...(prev.simulation||{}),advisorHistory:[...(prev.simulation?.advisorHistory||[]).slice(-11),entry]},lastAdvisorUpdate:{time:entry.time,text:result.advisorMessage,mode}}))
  if(result.requiresUserConfirmation && result.proposedAction?.type!=='no_state_action') setAdvisorPending({exactText,result,entryId:entry.id})
  else {
   setMissionState(prev=>({...prev,decisions:[...(prev.decisions||[]),{id:`decision-${Date.now()}`,type:'advisor_interaction',exactText,detail:exactText,interpretedDecision:result.interpretedIntent,advisorInterpretation:result,advisorMode:mode,userConfirmed:false,asOf:prev.exercise?.localIncidentTime||prev.asOf||'CURRENT LOCAL',role:currentRole,authorityAssessment:result.authorityAssessment?.explanation,withinRoleAuthority:result.authorityAssessment?.status==='within_authority'}]}))
  }
  setAdvisorBusy(false)
 }

 const confirmAdvisorAction=()=>{
  if(!advisorPending) return
  const {exactText,result}=advisorPending
  setMissionState(prev=>{
   const next=applyIntegratedAction(prev,result.proposedAction)
   return {...next,decisions:[...(next.decisions||[]),{id:`decision-${Date.now()}`,type:result.decisionType||result.proposedAction.type,exactText,detail:exactText,interpretedDecision:result.interpretedIntent,advisorInterpretation:result,advisorMode,userConfirmed:true,proposedAction:result.proposedAction,asOf:next.exercise?.localIncidentTime||next.asOf||'CURRENT LOCAL',role:currentRole,authorityAssessment:result.authorityAssessment?.explanation,withinRoleAuthority:result.authorityAssessment?.status==='within_authority',affectedRecords:Object.values(result.referencedEntities||{}).flat(),immediateConsequence:'Validated application action applied; deterministic state was re-evaluated.'}]}
  })
  setAdvisorPending(null)
 }
 const cancelAdvisorAction=()=>setAdvisorPending(null)

 const transitionOperationalPeriod=()=>setMissionState(prev=>{
  if(!prev.tomorrowPlan.approved || role!=='remote_sensing_coordinator') return prev;
  const nextOp=prev.operationalPeriod+1;
  const nextMissions=prev.tomorrowPlan.requirements.filter(r=>r.status==='ready'||r.taskable).map((r,index)=>({id:`op${nextOp}-mission-${index+1}`,fire:r.fire,platform:r.platform||'Capability assignment pending',window:r.window||'TBD Local',objective:r.objective||r.title||'Approved collection requirement',status:'planned',risk:r.upad==='Unassigned'?'Production support unresolved':'Normal',protected:false,coordinatorNotified:false}));
  const transitionRecord={id:`decision-${prev.decisions.length+1}`,type:'op_transition',detail:`Transitioned from OP ${prev.operationalPeriod} to OP ${nextOp}`,interpretedDecision:`Approved operational-period transition to OP ${nextOp}`,asOf:'CURRENT LOCAL',role: currentRole,withinRoleAuthority:true,immediateConsequence:'Approved tomorrow-plan requirements became current operational commitments.',planningImpact:'Unresolved requirements, products, oversight cases, asset requests, and protected missions carried forward.',requiredFollowUp:'Revalidate mission windows, UPAD support, airspace, and partner commitments at the new OP start.'};
  return {...prev,operationalPeriod:nextOp,asOf:'OP START LOCAL',currentOps:{...prev.currentOps,status:'ACTIVE',missions:nextMissions.length?nextMissions:prev.currentOps.missions.map(m=>({...m,status:'carry_forward'}))},tomorrowPlan:{...prev.tomorrowPlan,status:'development',approved:false,readiness:0,blockers:['New operational-period requirements require development.'],requirements:[]},crossPeriodImpacts:prev.crossPeriodImpacts.map(x=>({...x,carriedIntoOperationalPeriod:nextOp})),decisions:[...prev.decisions,transitionRecord],operationalPeriodHistory:[...(prev.operationalPeriodHistory||[]),{from:prev.operationalPeriod,to:nextOp,time:'CURRENT LOCAL',approvedBy:'Remote Sensing Coordinator'}]};
 })

 const matrixChange=(updatedBy,note,mutate)=>setSyncMatrix(prev=>{const next=mutate(prev);const version=prev.version+1;return {...next,version,asOf:'CURRENT LOCAL',coordinatorApprovalStatus:'pending',status:'UPDATE REQUIRED',changeHistory:[...prev.changeHistory,{version,asOf:'CURRENT LOCAL',updatedBy,note}]}})
 const updateSortie=(sortieId,changes)=>matrixChange(currentRole,`Updated ${sortieId}: ${Object.keys(changes).join(', ')}.`,prev=>({...prev,sorties:prev.sorties.map(s=>s.id===sortieId?{...s,...changes}:s)}))
 const resolveNeed=(id)=>matrixChange(currentRole,`Unmet need ${id} moved to coordinating.`,prev=>({...prev,unmetNeeds:prev.unmetNeeds.map(x=>x.id===id?{...x,status:'COORDINATING'}:x)}))
 const resolveGap=(id)=>matrixChange(currentRole,`Coverage gap ${id} resolved.`,prev=>({...prev,coverageGaps:prev.coverageGaps.map(x=>x.id===id?{...x,status:'RESOLVED'}:x)}))
 const addLeadershipNote=(note)=>matrixChange(currentRole,'Leadership note added.',prev=>({...prev,leadershipNotes:[...prev.leadershipNotes,note]}))
 const approveMatrix=()=>setSyncMatrix(prev=>{const version=prev.version+1;return {...prev,version,status:'APPROVED',coordinatorApprovalStatus:'approved',asOf:'CURRENT LOCAL',changeHistory:[...prev.changeHistory,{version,asOf:'CURRENT LOCAL',updatedBy:'Remote Sensing Coordinator',note:'Regional Sync Matrix approved for leadership brief.'}]}})

 const content={
  'portal-help':<Placeholder title="Help & Support"/>,
  'portal-resources':<Placeholder title="Mission Portal Resources"/>,
  portal:<MissionPortal missionState={missionState} selectedRole={missionState.exercise?.selectedRole || role} onSelectRole={confirmRoleSelection} onSelectScenario={selectPortalScenario} onOpenBrief={openScenarioBrief} onStart={confirmStartEx} onResume={()=>setActive('current')} onReviewAar={()=>setActive('aar')}/>,
  brief:<ScenarioBrief missionState={missionState} onContinue={openRoleSelection}/>,
  roles:<RoleSelection selectedRole={role} onSelectRole={confirmRoleSelection} onStart={()=>setActive('portal')}/>,
  mission:<Overview role={currentRole}/>,
  current:<CurrentOps role={currentRole} missionState={missionState} readOnly={readOnly} onToggleProtection={toggleProtection} onNotifyCoordinator={notifyCoordinator} onOpenTomorrow={()=>setActive('tomorrow')} onNavigate={setActive}/>,
  tomorrow:<TomorrowPlan role={currentRole} missionState={missionState} readOnly={readOnly} onMarkTaskable={markTaskable} onAssignUpad={assignUpad} onApprovePlan={approvePlan} onOpenCurrent={()=>setActive('current')}/>,
  sync:<SyncMatrix role={currentRole} matrix={syncMatrix} readOnly={readOnly} onUpdateSortie={updateSortie} onResolveNeed={resolveNeed} onResolveGap={resolveGap} onApprove={approveMatrix} onAddLeadershipNote={addLeadershipNote}/>,
  requirements:<Requirements role={currentRole} missionState={missionState} readOnly={readOnly} onUpdateRequirement={updateRequirement} onValidateRequirement={validateRequirement} onSendForward={sendRequirementForward} onAddRequirement={addRequirement}/>,
  platforms:<Platforms role={currentRole} missionState={missionState}/>,
  upad:<Dissemination role={currentRole} missionState={missionState} readOnly={readOnly} onUpdateDelivery={updateDelivery} onVerifyReceipt={verifyReceipt} onRecordFeedback={recordCustomerFeedback}/>,
  airspace:<Placeholder title="Airspace / TFR"/>,
  resources:<ResourceDesk role={currentRole} missionState={missionState} readOnly={readOnly} onRecordUse={recordResourceUse}/>,
  oversight:<IntelligenceOversight role={currentRole} missionState={missionState} readOnly={readOnly} onUpdateCase={updateOversightCase} onAddCase={addOversightCase}/>,
  transition:<OperationalTransition role={currentRole} missionState={missionState} onTransition={approveLifecycleTransition}/>,
  aar:<AfterActionReview role={currentRole} missionState={missionState} syncMatrix={syncMatrix}/>,
  updates:<MissionUpdates missionState={missionState}/>,
  log:<DecisionLog role={currentRole} missionState={missionState}/>
 }[active] || <MissionPortal missionState={missionState} selectedRole={missionState.exercise?.selectedRole || role} onSelectRole={confirmRoleSelection} onSelectScenario={selectPortalScenario} onOpenBrief={openScenarioBrief} onStart={confirmStartEx} onResume={()=>setActive('current')} onReviewAar={()=>setActive('aar')}/>

 const portalMode=active==='portal' || active==='portal-resources' || active==='portal-help'

 if(active==='current'){
  return <>
   <CurrentOps
    role={currentRole}
    missionState={missionState}
    readOnly={readOnly}
    onToggleProtection={toggleProtection}
    onNotifyCoordinator={notifyCoordinator}
    onOpenTomorrow={()=>setActive('tomorrow')}
    onNavigate={setActive}
   />
   {showEndEx && <EndExModal missionState={missionState} onCancel={()=>setShowEndEx(false)} onConfirm={confirmEndEx}/>}
  </>
 }

 return <div className={`app-shell ${portalMode?'portal-app-shell portal-app-shell-full':''}`}>
   {!portalMode && <Sidebar active={active} setActive={setActive} role={currentRole} missionState={missionState} portalMode={portalMode}/>}
   <div className="main-shell">
     <Header role={currentRole} missionState={missionState} onReset={resetActiveExercise} portalMode={portalMode}/>
     {!portalMode && <ExerciseStatusBar missionState={missionState} onStart={confirmStartEx} onAdvance={advanceExercise} onTransition={reviewTransition} onEnd={()=>setShowEndEx(true)} onAar={()=>setActive('aar')}/>}
     <main className={portalMode?'portal-workspace':'workspace'}>
       <div>{content}</div>
       {!portalMode && <AdvisorPanel role={currentRole} missionState={missionState} operationalSummary={deriveOperationalSummary(missionState)} onSubmitDecision={submitFreeTextDecision} pending={advisorPending} busy={advisorBusy} mode={advisorMode} onConfirm={confirmAdvisorAction} onCancel={cancelAdvisorAction}/>}
     </main>
   </div>
   {showEndEx && <EndExModal missionState={missionState} onCancel={()=>setShowEndEx(false)} onConfirm={confirmEndEx}/>}
 </div>
}
