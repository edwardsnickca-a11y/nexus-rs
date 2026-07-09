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
  requirements:<Placeholder title="Requirements and EEIs"/>,platforms:<AssetAllocation role={role} missionState={missionState} onReleaseAsset={releaseAsset} onSubmitRequest={submitAssetRequest} onCancelRequest={cancelAssetRequest}/>,upad:<Placeholder title="UPAD Status"/>,airspace:<Placeholder title="Airspace / TFR"/>,oversight:<Placeholder title="Intelligence Oversight"/>,deadlines:<Placeholder title="Mission Deadlines"/>,log:<Placeholder title="Decision Log"/>
 }[active]
 return <div className="app-shell"><Sidebar active={active} setActive={setActive} role={role}/><div className="main-shell"><Header role={role} onExit={()=>setStarted(false)}/><main className="workspace"><div>{content}</div><AdvisorPanel role={role}/></main></div></div>
}
