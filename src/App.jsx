import React, { useState } from 'react'
import SetupScreen from './components/SetupScreen.jsx'
import Sidebar from './components/Sidebar.jsx'
import Header from './components/Header.jsx'
import AdvisorPanel from './components/AdvisorPanel.jsx'
import Overview from './components/Overview.jsx'
import CurrentOps from './components/CurrentOps.jsx'
import TomorrowPlan from './components/TomorrowPlan.jsx'
import SyncMatrix from './components/SyncMatrix.jsx'
import { INITIAL_MISSION_STATE } from './data/missionState.js'

function Placeholder({title}){return <section className="panel placeholder"><span className="eyebrow">NEXUS RS v0.1</span><h3>{title}</h3><p>This workspace shell is ready for state-driven data, role permissions, and AI integration in the next development pass.</p></section>}

export default function App(){
 const [started,setStarted]=useState(false)
 const [role,setRole]=useState('remote_sensing_coordinator')
 const [active,setActive]=useState('mission')
 const [missionState,setMissionState]=useState(INITIAL_MISSION_STATE)

 const recordDecision=(type,detail)=>setMissionState(prev=>({...prev,decisions:[...prev.decisions,{id:`decision-${prev.decisions.length+1}`,type,detail,asOf:prev.asOf,role}]}))
 const toggleProtection=(missionId)=>setMissionState(prev=>({...prev,currentOps:{...prev.currentOps,missions:prev.currentOps.missions.map(m=>m.id===missionId?{...m,protected:!m.protected}:m)},crossPeriodImpacts:[...prev.crossPeriodImpacts,{id:`x-${Date.now()}`,source:'Current Ops',target:"Tomorrow's Plan",impact:`Mission protection changed for ${missionId}; OP 2 availability must be rechecked.`}]}))
 const notifyCoordinator=(missionId)=>{setMissionState(prev=>({...prev,currentOps:{...prev.currentOps,missions:prev.currentOps.missions.map(m=>m.id===missionId?{...m,coordinatorNotified:true}:m)}}));recordDecision('coordination',`Coordinator notified of ${missionId} impact`)}
 const markTaskable=(reqId)=>setMissionState(prev=>{const reqs=prev.tomorrowPlan.requirements.map(r=>r.id===reqId?{...r,taskable:true,status:r.upad==='Unassigned'?'draft':'ready'}:r);const blockers=prev.tomorrowPlan.blockers.filter(b=>!b.includes('Fire Bravo EEIs'));return {...prev,tomorrowPlan:{...prev.tomorrowPlan,requirements:reqs,blockers,readiness:Math.min(100,prev.tomorrowPlan.readiness+12)}}})
 const assignUpad=(reqId)=>setMissionState(prev=>{const reqs=prev.tomorrowPlan.requirements.map(r=>r.id===reqId?{...r,upad:'UPAD-NW',status:r.taskable?'ready':'draft'}:r);const blockers=prev.tomorrowPlan.blockers.filter(b=>!b.includes('UPAD support'));return {...prev,tomorrowPlan:{...prev.tomorrowPlan,requirements:reqs,blockers,readiness:Math.min(100,prev.tomorrowPlan.readiness+10)}}})
 const approvePlan=()=>setMissionState(prev=>({...prev,tomorrowPlan:{...prev.tomorrowPlan,approved:true,status:'approved',readiness:100}}))

 if(!started) return <SetupScreen role={role} setRole={setRole} onStart={()=>setStarted(true)}/>
 const content={
  mission:<Overview role={role}/>,
  current:<CurrentOps role={role} missionState={missionState} onToggleProtection={toggleProtection} onNotifyCoordinator={notifyCoordinator} onOpenTomorrow={()=>setActive('tomorrow')}/>,
  tomorrow:<TomorrowPlan role={role} missionState={missionState} onMarkTaskable={markTaskable} onAssignUpad={assignUpad} onApprovePlan={approvePlan} onOpenCurrent={()=>setActive('current')}/>,
  sync:<SyncMatrix role={role}/>,
  requirements:<Placeholder title="Requirements and EEIs"/>,platforms:<Placeholder title="Platforms and Availability"/>,upad:<Placeholder title="UPAD Status"/>,airspace:<Placeholder title="Airspace / TFR"/>,oversight:<Placeholder title="Intelligence Oversight"/>,deadlines:<Placeholder title="Mission Deadlines"/>,log:<Placeholder title="Decision Log"/>
 }[active]
 return <div className="app-shell"><Sidebar active={active} setActive={setActive} role={role}/><div className="main-shell"><Header role={role} onExit={()=>setStarted(false)}/><main className="workspace"><div>{content}</div><AdvisorPanel role={role}/></main></div></div>
}
