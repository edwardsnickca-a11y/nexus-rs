import React, { useEffect, useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import Header from './components/Header.jsx'
import AdvisorPanel from './components/AdvisorPanel.jsx'
import Situation from './components/Situation.jsx'
import CurrentOperationsRouter from './components/current-operations/CurrentOperationsRouter.jsx'
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
import { requestScenarioController } from './services/scenarioApi.js'
import { buildInitializationContext, buildAdvanceContext } from './engine/scenarioPromptBuilder.js'
import { normalizeInitialWorld, validateInitialWorld, validateAdvanceResult } from './engine/scenarioStateValidator.js'
import { applyInitialWorld, applyAdvanceResult, markScenarioStatus } from './engine/scenarioStateApplier.js'
import { generateFallbackWorld, generateFallbackAdvance } from './engine/scenarioFallbackGenerator.js'
import { applyIntegratedAction, deriveOperationalSummary, verifyCustomerReceipt, recordCustomerFeedback as integrateCustomerFeedback } from './engine/integrationEngine.js'
import { INITIAL_MISSION_STATE } from './data/missionState.js'
import { INITIAL_MATRIX } from './data/syncMatrix.js'
import { buildSyncMatrixFromState } from './engine/syncMatrixBuilder.js'
import { initializeScenario, selectRole as controllerSelectRole, startExercise, beginTransition, approveTransition, endExercise, resetExercise, isWorkspaceReadOnly } from './engine/exerciseController.js'
import { buildTomorrowPlanReviews } from './engine/tomorrowPlanReview.js'



const GACC_HISTORY_KEY='nexus-rs-gacc-history-v1'

function selectExerciseGacc(){
 try{
  const history=JSON.parse(localStorage.getItem(GACC_HISTORY_KEY)||'[]')
  const recent=Array.isArray(history)?history.slice(-2):[]
  let selected
  if(recent.length===2 && recent[0]===recent[1]) selected=recent[0]==='North Ops'?'South Ops':'North Ops'
  else selected=Math.random()<.5?'North Ops':'South Ops'
  localStorage.setItem(GACC_HISTORY_KEY,JSON.stringify([...recent,selected].slice(-6)))
  return selected
 }catch{
  return Math.random()<.5?'North Ops':'South Ops'
 }
}

function IncidentAssignment({incidents=[],selectedIncident,onSelect,onConfirm}){
 return <section className="panel" style={{maxWidth:1100,margin:'38px auto',padding:24}}>
  <span className="eyebrow">REMOTE SENSING MANAGER ASSIGNMENT</span>
  <h2 style={{margin:'8px 0 4px'}}>Select Your Incident</h2>
  <p style={{margin:'0 0 18px',color:'#8fa7b3'}}>The Scenario Controller generated these active incidents for this exercise. Your workspace and advisor context will be scoped to the incident you select.</p>
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:12}}>
   {incidents.map(incident=><button
    key={incident.id}
    type="button"
    onClick={()=>onSelect(incident.name)}
    style={{
     minHeight:145,
     padding:16,
     textAlign:'left',
     border:selectedIncident===incident.name?'2px solid #58d9e6':'1px solid #28556b',
     background:selectedIncident===incident.name?'#123f55':'#0a2130',
     color:'#e8f2f5',
     cursor:'pointer',
    }}
   >
    <strong style={{display:'block',fontSize:20,color:'#65e2ed'}}>{incident.code||incident.name?.slice(0,3).toUpperCase()}</strong>
    <b style={{display:'block',fontSize:15,marginTop:7}}>{incident.name}</b>
    <span style={{display:'block',marginTop:7,fontSize:11,color:'#9eb2bc'}}>{incident.location||`${incident.city||''}${incident.county?`, ${incident.county}`:''}`}</span>
    <span style={{display:'block',marginTop:8,fontSize:10,color:'#c3d4dc'}}>{incident.behavior||incident.lifeSafety||'Active wildfire incident'}</span>
   </button>)}
  </div>
  <div style={{display:'flex',justifyContent:'flex-end',marginTop:18}}>
   <button type="button" disabled={!selectedIncident} onClick={onConfirm} style={{padding:'10px 18px',border:'1px solid #42c9d8',background:'#0d5968',color:'#eaffff',cursor:selectedIncident?'pointer':'not-allowed',opacity:selectedIncident?1:.45}}>CONFIRM INCIDENT ASSIGNMENT</button>
  </div>
 </section>
}

function scopeMissionStateForRole(state,role){
 if(role!=='remote_sensing_manager') return state
 const incident=state.exercise?.assignedIncident
 if(!incident) return state

 const missions=(state.currentOps?.missions||[]).filter(item=>(item.fire||item.incident)===incident)
 const missionIds=new Set(missions.map(item=>item.id))
 const requirementIds=new Set(missions.map(item=>item.requirementId).filter(Boolean))
 ;(state.requirements?.items||[]).forEach(item=>{
  if((item.fire||item.incident)===incident) requirementIds.add(item.id)
 })

 const requirements=(state.requirements?.items||[]).filter(item=>requirementIds.has(item.id)||(item.fire||item.incident)===incident)
 const deliveries=(state.dissemination?.deliveries||[]).filter(item=>
  requirementIds.has(item.requirementId) || missionIds.has(item.missionId) || (item.fire||item.incident)===incident
 )
 const assets=(state.assetControl?.assets||[]).filter(item=>
  missionIds.has(item.missionId) || item.assignment===incident || item.status==='reserve' || item.status==='available'
 )
 const deadlines=(state.currentOps?.deadlines||[]).filter(item=>String(item.label||'').includes(incident))
 const tomorrowRequirements=(state.tomorrowPlan?.requirements||[]).filter(item=>(item.fire||item.incident)===incident||requirementIds.has(item.id))

 return {
  ...state,
  currentOps:{...(state.currentOps||{}),missions,deadlines},
  requirements:{...(state.requirements||{}),items:requirements},
  dissemination:{...(state.dissemination||{}),deliveries},
  assetControl:{...(state.assetControl||{}),assets},
  tomorrowPlan:{...(state.tomorrowPlan||{}),requirements:tomorrowRequirements},
 }
}


function AdvisorConversation({
 role,
 missionState,
 operationalSummary,
 onSubmitDecision,
 pending,
 busy,
 mode,
 onConfirm,
 onCancel,
 onClose,
}){
 const [text,setText]=useState('')
 const history=missionState.simulation?.advisorHistory||[]
 const submit=()=>{
  const value=text.trim()
  if(!value||busy) return
  onSubmitDecision?.(value)
  setText('')
 }
 return <section style={{minHeight:'calc(100vh - 120px)',padding:18,background:'#071827'}}>
  <div style={{maxWidth:1180,margin:'0 auto',border:'1px solid #28556b',background:'#0a2130'}}>
   <header style={{display:'flex',justifyContent:'space-between',gap:16,padding:'16px 18px',borderBottom:'1px solid #28556b'}}>
    <div>
     <span style={{color:'#67e1ed',fontSize:10,letterSpacing:'.1em'}}>ADVISOR CONVERSATION</span>
     <h2 style={{margin:'4px 0 0'}}>Lt Col Edwards</h2>
     <small style={{color:'#8ea6b2'}}>{role?.replaceAll('_',' ')} · {missionState.exercise?.assignedIncident||'Regional'} · {mode==='connected'?'OpenAI connected':'Local fallback'}</small>
    </div>
    <button onClick={onClose} style={{height:36,padding:'0 14px',border:'1px solid #3fc4d2',background:'#0c3342',color:'#eaffff',cursor:'pointer'}}>RETURN TO WORKSPACE</button>
   </header>

   <div style={{minHeight:420,maxHeight:'58vh',overflow:'auto',padding:18}}>
    {history.length===0&&<div style={{padding:28,color:'#8fa7b3',textAlign:'center'}}>Ask Edwards about the mission, your authority, a trade-off, or the consequence of a decision.</div>}
    {history.map(item=><div key={item.id} style={{marginBottom:18}}>
     <div style={{display:'flex',justifyContent:'flex-end'}}>
      <div style={{maxWidth:'72%',padding:'10px 13px',background:'#17445a',border:'1px solid #2d7188',borderRadius:6}}>
       <strong style={{display:'block',fontSize:10,color:'#8fe8f0',marginBottom:4}}>YOU</strong>
       <span>{item.traineeText}</span>
      </div>
     </div>
     <div style={{display:'flex',justifyContent:'flex-start',marginTop:9}}>
      <div style={{maxWidth:'78%',padding:'12px 14px',background:'#0b2a39',border:'1px solid #2b5668',borderRadius:6,lineHeight:1.55}}>
       <strong style={{display:'block',fontSize:10,color:'#c7a8ff',marginBottom:5}}>LT COL EDWARDS</strong>
       <span>{item.advisorMessage}</span>
      </div>
     </div>
    </div>)}
   </div>

   {pending&&<div style={{padding:'10px 18px',borderTop:'1px solid #6d5727',background:'#2c2718'}}>
    <strong style={{color:'#ffd278'}}>CONFIRM STATE CHANGE</strong>
    <p style={{margin:'5px 0 9px'}}>{pending.result?.recommendedNextStep||pending.result?.advisorMessage}</p>
    <div style={{display:'flex',gap:8}}><button onClick={onConfirm}>CONFIRM</button><button onClick={onCancel}>CANCEL</button></div>
   </div>}

   <div style={{display:'grid',gridTemplateColumns:'1fr 110px',gap:8,padding:14,borderTop:'1px solid #28556b'}}>
    <textarea value={text} onChange={event=>setText(event.target.value)} onKeyDown={event=>{if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();submit()}}} placeholder="Talk to Edwards..." style={{minHeight:76,resize:'vertical',padding:10,background:'#061722',border:'1px solid #31596b',color:'#eef7fa',font:'inherit'}}/>
    <button disabled={!text.trim()||busy} onClick={submit} style={{border:'1px solid #3fc4d2',background:'#0d5968',color:'#eaffff',cursor:'pointer',opacity:!text.trim()||busy?.5:1}}>{busy?'THINKING…':'SEND'}</button>
   </div>
  </div>
 </section>
}

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
 const [pendingIncident,setPendingIncident]=useState('')
 const [pendingStart,setPendingStart]=useState(null)
 const [showAdvanceTurn,setShowAdvanceTurn]=useState(false)
 const [scenarioBusy,setScenarioBusy]=useState(false)

 const navigate=(next,{replace=false}={})=>{
  if(next===active) return
  const method=replace?'replaceState':'pushState'
  window.history[method]({nexusRsPage:next},'',`#${next}`)
  setActive(next)
 }

 useEffect(()=>{
  const initial=window.history.state?.nexusRsPage
  if(initial&&initial!==active) setActive(initial)
  else window.history.replaceState({nexusRsPage:active},'',`#${active}`)
  const handlePop=(event)=>{
   const next=event.state?.nexusRsPage
   if(next) setActive(next)
  }
  window.addEventListener('popstate',handlePop)
  return ()=>window.removeEventListener('popstate',handlePop)
 },[])


 const currentRole=missionState.exercise?.selectedRole || role || 'remote_sensing_coordinator'
 const workspaceMissionState=scopeMissionStateForRole(missionState,currentRole)
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
 const confirmRoleSelection=(selectedRole)=>{
  setRole(selectedRole)
  setMissionState(prev=>controllerSelectRole(prev,selectedRole))
  if(selectedRole!=='remote_sensing_manager') setPendingIncident('')
 }
 const runScenarioController=async(baseState,mode='advance')=>{
  setScenarioBusy(true)
  setMissionState(markScenarioStatus(baseState,mode==='initialize'?'initializing':'advancing'))
  try{
   const context=mode==='initialize'?buildInitializationContext(baseState):buildAdvanceContext(baseState)
   let result
   try{
    result=await requestScenarioController({mode,context})
   }catch(error){
    result=mode==='initialize'
      ? generateFallbackWorld({role:baseState.exercise?.selectedRole,difficulty:context.difficulty,gaccRegion:context.gaccRegion})
      : generateFallbackAdvance(baseState)
   }

   if(mode==='initialize'){
    result=normalizeInitialWorld(result)
    let validation=validateInitialWorld(result)
    if(!validation.ok){
     result=normalizeInitialWorld(generateFallbackWorld({role:baseState.exercise?.selectedRole,difficulty:context.difficulty,gaccRegion:context.gaccRegion}))
     validation=validateInitialWorld(result)
    }
    if(!validation.ok) throw new Error(validation.errors.join(' '))
    const generated=applyInitialWorld(baseState,validation.value)
    setMissionState(generated)
    setSyncMatrix(buildSyncMatrixFromState(generated))
    return generated
   }

   let validation=validateAdvanceResult(result,baseState)
   if(!validation.ok){
    result=generateFallbackAdvance(baseState)
    validation=validateAdvanceResult(result,baseState)
   }
   if(!validation.ok) throw new Error(validation.errors.join(' '))
   const advanced=applyAdvanceResult(baseState,validation.value)
   setMissionState(advanced)
   setSyncMatrix(buildSyncMatrixFromState(advanced))
   return advanced
  }catch(error){
   const failed=markScenarioStatus(baseState,'error',error?.message||'Scenario Controller failed')
   setMissionState(failed)
   return failed
  }finally{
   setScenarioBusy(false)
  }
 }

 const confirmIncidentAssignment=()=>{
  const generated=pendingStart?.generatedState
  if(!pendingIncident||!generated) return
  const assigned={
   ...generated,
   exercise:{...(generated.exercise||{}),assignedIncident:pendingIncident,currentPhase:'Current Operations'},
   activeIncident:pendingIncident,
  }
  setMissionState(assigned)
  setPendingStart(null)
  setActive('current')
 }
 const confirmStartEx=async(scenario, setup={})=>{
  const initialized=applyPortalScenario(missionState,scenario)
  const gaccRegion=selectExerciseGacc()
  const configured={
   ...initialized,
   scenario:{...(initialized.scenario||{}),gaccRegion},
   exercise:{
    ...(initialized.exercise||{}),
    gaccRegion,
    participantName:(setup.participantName||initialized.exercise?.participantName||'').trim(),
    operationalContext:setup.operationalContext||initialized.exercise?.operationalContext||'',
    exerciseFocus:setup.exerciseFocus||initialized.exercise?.exerciseFocus||'Full Mission Cycle',
    difficulty:setup.difficulty||scenario?.difficulty||initialized.exercise?.difficulty||'Standard',
    assignedIncident:null,
   },
  }
  const started=startExercise(configured)
  setActive('scenario-loading')
  const generated=await runScenarioController(started,'initialize')
  if((generated.exercise?.selectedRole||role)==='remote_sensing_manager'){
   setPendingIncident('')
   setPendingStart({generatedState:generated})
   setActive('incident')
  }else{
   setActive('current')
  }
 }
 const unresolvedTurnItems=()=>{
  const items=[]
  const requirements=(missionState.requirements?.items||[]).filter(item=>!['satisfied','cancelled','canceled','superseded'].includes(item.status))
  const incomplete=requirements.filter(item=>item.status==='needs_clarification'||!item.taskable)
  const riskyMissions=(missionState.currentOps?.missions||[]).filter(item=>/risk|delayed|pending/i.test(`${item.status||''} ${item.risk||''}`))
  const riskyDeliveries=(missionState.dissemination?.deliveries||[]).filter(item=>item.receiptStatus!=='verified'||['at_risk','delayed'].includes(item.deliveryStatus))
  const openWindows=(missionState.exercise?.decisionWindows||[]).filter(item=>!item.status||item.status==='open')

  if(incomplete.length) items.push(`${incomplete.length} requirement${incomplete.length===1?'':'s'} still need development`)
  if(riskyMissions.length) items.push(`${riskyMissions.length} mission${riskyMissions.length===1?'':'s'} have execution risk`)
  if(riskyDeliveries.length) items.push(`${riskyDeliveries.length} product${riskyDeliveries.length===1?'':'s'} lack complete delivery or receipt`)
  if(openWindows.length) items.push(`${openWindows.length} decision window${openWindows.length===1?' remains':'s remain'} open`)
  return items.slice(0,5)
 }
 const requestAdvanceExercise=()=>setShowAdvanceTurn(true)
 const confirmAdvanceExercise=()=>{
  if(scenarioBusy) return
  setShowAdvanceTurn(false)
  runScenarioController(missionState,'advance')
 }
 const advanceExercise=requestAdvanceExercise
 const reviewTransition=()=>{setMissionState(prev=>beginTransition(prev));setActive('transition')}
 const approveLifecycleTransition=()=>{setMissionState(prev=>approveTransition(prev));setActive('current')}
 const confirmEndEx=(reason)=>{setMissionState(prev=>endExercise(prev,reason));setShowEndEx(false);setActive('aar')}
 const resetActiveExercise=()=>{if(window.confirm('Reset Exercise? This clears the active mission state and returns to the Mission Portal.')){setMissionState(resetExercise(INITIAL_MISSION_STATE));setSyncMatrix(INITIAL_MATRIX);setRole(null);setPendingIncident('');setPendingStart(null);setActive('portal')}}
 const readOnly=isWorkspaceReadOnly(missionState,active)

 const recordDecision=(type,detail)=>setMissionState(prev=>({...prev,decisions:[...prev.decisions,{id:`decision-${prev.decisions.length+1}`,type,detail,asOf:prev.asOf,role:currentRole}]}))
 const toggleProtection=(missionId)=>setMissionState(prev=>({...prev,currentOps:{...prev.currentOps,missions:prev.currentOps.missions.map(m=>m.id===missionId?{...m,protected:!m.protected}:m)},crossPeriodImpacts:[...prev.crossPeriodImpacts,{id:`x-${Date.now()}`,source:'Current Ops',target:"Tomorrow's Plan",impact:`Mission protection changed for ${missionId}; OP ${Number(prev.exercise?.activeOperationalPeriod || prev.operationalPeriod || 1) + 1} availability must be rechecked.`}]}))
 const notifyCoordinator=(missionId)=>{setMissionState(prev=>({...prev,currentOps:{...prev.currentOps,missions:prev.currentOps.missions.map(m=>m.id===missionId?{...m,coordinatorNotified:true}:m)}}));recordDecision('coordination',`Coordinator notified of ${missionId} impact`)}
 const updateCurrentMission=(missionId,changes)=>setMissionState(prev=>({...prev,currentOps:{...prev.currentOps,missions:(prev.currentOps?.missions||[]).map(m=>m.id===missionId?{...m,...changes}:m)},decisions:[...(prev.decisions||[]),{id:`decision-${Date.now()}`,type:'mission_execution_update',detail:`Updated ${missionId}: ${Object.keys(changes).join(', ')}`,asOf:prev.exercise?.localIncidentTime||prev.asOf||'CURRENT LOCAL',role:currentRole}]}))
 const markTaskable=(reqId)=>setMissionState(prev=>{const reqs=prev.tomorrowPlan.requirements.map(r=>r.id===reqId?{...r,taskable:true,status:r.upad==='Unassigned'?'draft':'ready'}:r);const blockers=prev.tomorrowPlan.blockers.filter(b=>!b.includes('Fire Bravo EEIs'));return {...prev,tomorrowPlan:{...prev.tomorrowPlan,requirements:reqs,blockers,readiness:Math.min(100,prev.tomorrowPlan.readiness+12)}}})
 const assignUpad=(reqId)=>setMissionState(prev=>{const reqs=prev.tomorrowPlan.requirements.map(r=>r.id===reqId?{...r,upad:'UPAD-NW',status:r.taskable?'ready':'draft'}:r);const blockers=prev.tomorrowPlan.blockers.filter(b=>!b.includes('UPAD support'));return {...prev,tomorrowPlan:{...prev.tomorrowPlan,requirements:reqs,blockers,readiness:Math.min(100,prev.tomorrowPlan.readiness+10)}}})
 const approvePlan=()=>setMissionState(prev=>({...prev,tomorrowPlan:{...prev.tomorrowPlan,approved:true,status:'approved',readiness:100}}))
 const submitTomorrowPlanForReview=()=>setMissionState(prev=>{
  const reviews=buildTomorrowPlanReviews(prev,currentRole)
  const hasRevision=reviews.some(item=>['REVISION REQUIRED','RETURNED FOR REVISION','APPROVED WITH CONDITIONS'].includes(item.outcome))
  return {
   ...prev,
   tomorrowPlan:{
    ...(prev.tomorrowPlan||{}),
    status:hasRevision?'revision_required':'coordinated',
    reviews,
    lastSubmittedAt:prev.exercise?.localIncidentTime||prev.asOf||'CURRENT LOCAL',
    submittedBy:currentRole,
   },
   decisions:[...(prev.decisions||[]),{
    id:`decision-${Date.now()}`,
    type:'tomorrow_plan_coordination',
    detail:`Submitted OP ${(prev.exercise?.activeOperationalPeriod||prev.operationalPeriod||1)+1} plan for simulated staff coordination.`,
    asOf:prev.exercise?.localIncidentTime||prev.asOf||'CURRENT LOCAL',
    role:currentRole,
   }],
  }
 })

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
 const requestClarification=(reqId,payload={})=>setMissionState(prev=>{
  const entry={id:`clar-${Date.now()}`,requestedBy:payload.requestedBy||currentRole,requestedAt:payload.requestedAt||'CURRENT LOCAL',missingFields:payload.missingFields||[],message:payload.message||''}
  const items=prev.requirements.items.map(r=>r.id===reqId?{...r,status:'clarification_requested',clarification:{...(r.clarification||{}),...payload},clarificationLog:[...(r.clarificationLog||[]),entry]}:r)
  return {...prev,requirements:{...prev.requirements,items,history:[...prev.requirements.history,{id:`req-history-${Date.now()}`,time:'CURRENT LOCAL',actor:currentRole,action:`Requested clarification on ${reqId}: ${(payload.missingFields||[]).join(', ')||'general'}.`}]},decisions:[...prev.decisions,{id:`decision-${prev.decisions.length+1}`,type:'requirement_clarification',detail:`Clarification requested on ${reqId}`,asOf:'CURRENT LOCAL',role:currentRole}]}
 })

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
 const updateSortie=(sortieId,changes)=>matrixChange(currentRole,`Updated ${sortieId}: ${Object.keys(changes).join(', ')}.`,prev=>{
  const todaySorties=prev.sorties||[]
  if(todaySorties.some(s=>s.id===sortieId))return {...prev,sorties:todaySorties.map(s=>s.id===sortieId?{...s,...changes}:s)}
  const tomorrowKey=Array.isArray(prev.tomorrowSorties)?'tomorrowSorties':Array.isArray(prev.plannedSorties)?'plannedSorties':null
  if(tomorrowKey&&prev[tomorrowKey].some(s=>s.id===sortieId))return {...prev,[tomorrowKey]:prev[tomorrowKey].map(s=>s.id===sortieId?{...s,...changes}:s)}
  const overrides=prev.partnerOverrides||{}
  return {...prev,partnerOverrides:{...overrides,[sortieId]:{...(overrides[sortieId]||{}),...changes}}}
 })
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
  incident:<IncidentAssignment incidents={pendingStart?.generatedState?.incidents||missionState.incidents||[]} selectedIncident={pendingIncident} onSelect={setPendingIncident} onConfirm={confirmIncidentAssignment}/>,
  'scenario-loading':<section className="panel" style={{maxWidth:760,margin:'70px auto',padding:28,textAlign:'center'}}><span className="eyebrow">SCENARIO CONTROLLER</span><h2>Generating a fresh {missionState.exercise?.gaccRegion==='South Ops'?'Southern':'Northern'} California exercise…</h2><p style={{color:'#8fa7b3'}}>Building incidents, customers, requirements, missions, resources, UPAD conditions, airspace, and hidden scenario truth.</p></section>,
  advisor:<AdvisorConversation role={currentRole} missionState={missionState} operationalSummary={deriveOperationalSummary(missionState)} onSubmitDecision={submitFreeTextDecision} pending={advisorPending} busy={advisorBusy} mode={advisorMode} onConfirm={confirmAdvisorAction} onCancel={cancelAdvisorAction} onClose={()=>setActive('current')}/>,
  situation:<Situation missionState={workspaceMissionState}/>,
  current:<CurrentOperationsRouter role={currentRole} missionState={workspaceMissionState} readOnly={readOnly} onNavigate={navigate} onToggleProtection={toggleProtection} onReleaseAsset={releaseAsset} onUpdateMission={updateCurrentMission} onUpdateRequirement={updateRequirement} onValidateRequirement={validateRequirement} onSendRequirementForward={sendRequirementForward} onUpdateDelivery={updateDelivery} advisorProps={{role:currentRole,missionState,operationalSummary:deriveOperationalSummary(missionState),onSubmitDecision:submitFreeTextDecision,pending:advisorPending,busy:advisorBusy,mode:advisorMode,onConfirm:confirmAdvisorAction,onCancel:cancelAdvisorAction,onOpenAdvisor:()=>setActive('advisor')}} onEndExercise={()=>setShowEndEx(true)}/>,
  tomorrow:<TomorrowPlan role={currentRole} missionState={workspaceMissionState} readOnly={readOnly} onMarkTaskable={markTaskable} onAssignUpad={assignUpad} onApprovePlan={approvePlan} onSubmitForReview={submitTomorrowPlanForReview} onOpenCurrent={()=>navigate('current')}/>,
  sync:<SyncMatrix role={currentRole} matrix={syncMatrix} missionState={workspaceMissionState} readOnly={readOnly} onUpdateSortie={updateSortie} onResolveNeed={resolveNeed} onResolveGap={resolveGap} onApprove={approveMatrix} onAddLeadershipNote={addLeadershipNote}/>,
  requirements:<Requirements role={currentRole} missionState={workspaceMissionState} readOnly={readOnly} onUpdateRequirement={updateRequirement} onValidateRequirement={validateRequirement} onSendForward={sendRequirementForward} onAddRequirement={addRequirement} onRequestClarification={requestClarification} onAskAdvisor={(text)=>{submitFreeTextDecision(text);setActive('advisor')}}/>,
  platforms:<Platforms role={currentRole} missionState={missionState}/>,
  upad:<Dissemination role={currentRole} missionState={workspaceMissionState} readOnly={readOnly} onUpdateDelivery={updateDelivery} onVerifyReceipt={verifyReceipt} onRecordFeedback={recordCustomerFeedback}/>,
  airspace:<Placeholder title="Airspace / TFR"/>,
  resources:<ResourceDesk role={currentRole} missionState={workspaceMissionState} readOnly={readOnly} onRecordUse={recordResourceUse}/>,
  oversight:<IntelligenceOversight role={currentRole} missionState={workspaceMissionState} readOnly={readOnly} onUpdateCase={updateOversightCase} onAddCase={addOversightCase}/>,
  transition:<OperationalTransition role={currentRole} missionState={missionState} onTransition={approveLifecycleTransition}/>,
  aar:<AfterActionReview role={currentRole} missionState={missionState} syncMatrix={syncMatrix}/>,
  updates:<MissionUpdates missionState={missionState}/>,
  log:<DecisionLog role={currentRole} missionState={missionState}/>
 }[active] || <MissionPortal missionState={missionState} selectedRole={missionState.exercise?.selectedRole || role} onSelectRole={confirmRoleSelection} onSelectScenario={selectPortalScenario} onOpenBrief={openScenarioBrief} onStart={confirmStartEx} onResume={()=>setActive('current')} onReviewAar={()=>setActive('aar')}/>

 const portalMode=active==='portal' || active==='portal-resources' || active==='portal-help'

 if(active==='current'){
  return <div className="app-shell live-app-shell">
   <Sidebar active={active} setActive={navigate} role={currentRole} missionState={missionState}/>
   <div className="main-shell live-main-shell">
    <CurrentOperationsRouter
     embedded
     role={currentRole}
     missionState={workspaceMissionState}
     readOnly={readOnly}
     onNavigate={navigate}
     onToggleProtection={toggleProtection}
     onReleaseAsset={releaseAsset}
     onUpdateMission={updateCurrentMission}
     onUpdateRequirement={updateRequirement}
     onValidateRequirement={validateRequirement}
     onSendRequirementForward={sendRequirementForward}
     onUpdateDelivery={updateDelivery}
     advisorProps={{role:currentRole,missionState,operationalSummary:deriveOperationalSummary(missionState),onSubmitDecision:submitFreeTextDecision,pending:advisorPending,busy:advisorBusy,mode:advisorMode,onConfirm:confirmAdvisorAction,onCancel:cancelAdvisorAction,onOpenAdvisor:()=>setActive('advisor')}}
     onAdvanceExercise={requestAdvanceExercise}
     onEndExercise={()=>setShowEndEx(true)}
    />

    {showAdvanceTurn&&<div style={{position:'fixed',inset:0,zIndex:10020,display:'flex',alignItems:'center',justifyContent:'center',padding:24,background:'rgba(0,8,15,.86)'}}>
     <section style={{width:'min(92vw,560px)',border:'1px solid #34758a',background:'#081d2b',boxShadow:'0 24px 70px rgba(0,0,0,.65)'}}>
      <header style={{padding:'16px 18px',borderBottom:'1px solid #285467'}}>
       <span style={{fontSize:10,letterSpacing:'.12em',color:'#68e2ed'}}>ADVANCE EXERCISE</span>
       <h2 style={{margin:'5px 0 0'}}>Advance to the next decision point?</h2>
      </header>
      <div style={{padding:'16px 18px'}}>
       <p style={{marginTop:0,color:'#b9ccd5'}}>The AI Scenario Controller will evaluate the work completed during this decision period, advance simulated time to a plausible next decision point, and apply any resulting developments or consequences.</p>
       <strong style={{display:'block',marginBottom:8,color:'#e9f3f6'}}>Open items</strong>
       {unresolvedTurnItems().length
        ? <ul style={{margin:'0 0 4px',paddingLeft:20,color:'#cbdbe2'}}>{unresolvedTurnItems().map(item=><li key={item} style={{margin:'6px 0'}}>{item}</li>)}</ul>
        : <p style={{color:'#8fa7b3'}}>No unresolved items were detected.</p>}
      </div>
      <footer style={{display:'flex',justifyContent:'flex-end',gap:8,padding:'13px 18px',borderTop:'1px solid #285467'}}>
       <button type="button" onClick={()=>setShowAdvanceTurn(false)} style={{minHeight:36,padding:'0 14px',border:'1px solid #365b6c',background:'#102a38',color:'#d6e4ea',cursor:'pointer'}}>CANCEL</button>
       <button type="button" disabled={scenarioBusy} onClick={confirmAdvanceExercise} style={{minHeight:36,padding:'0 14px',border:'1px solid #69dce7',background:'#0d6979',color:'#efffff',fontWeight:800,cursor:scenarioBusy?'wait':'pointer',opacity:scenarioBusy?.65:1}}>{scenarioBusy?'EVOLVING…':'ADVANCE TURN'}</button>
      </footer>
     </section>
    </div>}

    {showEndEx && <EndExModal missionState={missionState} onCancel={()=>setShowEndEx(false)} onConfirm={confirmEndEx}/>} 
   </div>
  </div>
 }

 return <div className={`app-shell ${portalMode?'portal-app-shell portal-app-shell-full':''}`}>
   {!portalMode && <Sidebar active={active} setActive={navigate} role={currentRole} missionState={missionState} portalMode={portalMode}/>}
   <div className="main-shell">
     <Header role={currentRole} missionState={missionState} onReset={resetActiveExercise} portalMode={portalMode}/>
     {!portalMode && <ExerciseStatusBar missionState={missionState} onStart={confirmStartEx} onAdvance={advanceExercise} onTransition={reviewTransition} onEnd={()=>setShowEndEx(true)} onAar={()=>setActive('aar')}/>}
     <main className={portalMode?'portal-workspace':'workspace'} style={!portalMode&&(active==='sync'||active==='requirements')?{gridTemplateColumns:'minmax(0,1fr)',maxWidth:'none'}:undefined}>
       <div>{content}</div>
       {!portalMode && active!=='sync' && active!=='requirements' && <AdvisorPanel role={currentRole} missionState={missionState} operationalSummary={deriveOperationalSummary(missionState)} onSubmitDecision={submitFreeTextDecision} pending={advisorPending} busy={advisorBusy} mode={advisorMode} onConfirm={confirmAdvisorAction} onCancel={cancelAdvisorAction}/>}
     </main>
   </div>
   {showEndEx && <EndExModal missionState={missionState} onCancel={()=>setShowEndEx(false)} onConfirm={confirmEndEx}/>}
 </div>
}
