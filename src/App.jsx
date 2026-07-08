import React, { useState } from 'react'
import SetupScreen from './components/SetupScreen.jsx'
import Sidebar from './components/Sidebar.jsx'
import Header from './components/Header.jsx'
import AdvisorPanel from './components/AdvisorPanel.jsx'
import Overview from './components/Overview.jsx'
import SyncMatrix from './components/SyncMatrix.jsx'

function Placeholder({title}){return <section className="panel placeholder"><span className="eyebrow">NEXUS RS v0.1</span><h3>{title}</h3><p>This workspace shell is ready for state-driven data, role permissions, and AI integration in the next development pass.</p></section>}
export default function App(){
 const [started,setStarted]=useState(false)
 const [role,setRole]=useState('remote_sensing_coordinator')
 const [active,setActive]=useState('mission')
 if(!started) return <SetupScreen role={role} setRole={setRole} onStart={()=>setStarted(true)}/>
 const content={mission:<Overview/>,current:<Overview/>,tomorrow:<Overview/>,sync:<SyncMatrix/>,requirements:<Placeholder title="Requirements and EEIs"/>,platforms:<Placeholder title="Platforms and Availability"/>,upad:<Placeholder title="UPAD Status"/>,airspace:<Placeholder title="Airspace / TFR"/>,oversight:<Placeholder title="Intelligence Oversight"/>,deadlines:<Placeholder title="Mission Deadlines"/>,log:<Placeholder title="Decision Log"/>}[active]
 return <div className="app-shell"><Sidebar active={active} setActive={setActive}/><div className="main-shell"><Header role={role} onExit={()=>setStarted(false)}/><main className="workspace"><div>{content}</div><AdvisorPanel role={role}/></main></div></div>
}
