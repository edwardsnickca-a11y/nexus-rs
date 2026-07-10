import React, { useMemo, useState } from 'react'
import { ROLES } from '../../data/roles.js'
import AdvisorPanel from '../AdvisorPanel.jsx'

const NAV = [
  ['mission','MISSION'],['current','CURRENT OPS'],['tomorrow',"TOMORROW'S PLAN"],['requirements','REQUIREMENTS'],
  ['platforms','PLATFORMS'],['upad','UPAD STATUS'],['airspace','AIRSPACE'],['oversight','INTEL OVERSIGHT'],
  ['updates','DEADLINES'],['log','DECISION LOG'],
]

const roleCopy = {
  remote_sensing_coordinator:'Set regional priorities, allocate approved assets, protect missions, coordinate unmet needs, and approve tomorrow’s plan.',
  remote_sensing_manager:'Manage approved mission execution, sortie timing, operational retasking, and gain-loss assessment.',
  collection_manager:'Develop customer requirements, define EEIs, ensure taskability, and prepare approved requirements for tomorrow’s plan.',
  upad_lno:'Represent your UPAD, provide realistic status and production updates, coordinate needs and issues, and advise on capability and limitations.',
}

const fmt = (v,f='—') => v || f
const tone = (value='') => String(value).toLowerCase().replaceAll(' ','-').replaceAll('_','-')
const Panel = ({title,accent='cyan',children,className=''}) => <section className={`rx-panel ${accent} ${className}`}><div className="rx-panel-title">{title}</div>{children}</section>
const Button = ({children,onClick,disabled=false}) => <button className="rx-outline-button" onClick={onClick} disabled={disabled}>{children}</button>

function LiveHeader({role,missionState,onEnd}){
 const meta=ROLES.find(r=>r.id===role)
 const participant=missionState.exercise?.participantName?.trim()
 const identity=participant || meta?.name || 'Role not selected'
 return <header className="rx-header">
  <div className="rx-brand"><div className="rx-logo">◇</div><div><strong>NEXUS <em>RS</em></strong><small>REMOTE SENSING OPERATIONS SIMULATOR</small></div></div>
  <div className="rx-head-block"><span>ROLE</span><strong>{identity}</strong>{participant&&<small>{meta?.name}</small>}</div>
  <div className="rx-head-block"><span>SCENARIO</span><strong>{missionState.exercise?.scenarioName||missionState.scenario?.name||'Western Region Multi-Fire'}</strong></div>
  <div className="rx-head-block"><span>OPERATIONAL PERIOD</span><div className="rx-op-toggle"><b>OP {missionState.exercise?.activeOperationalPeriod||missionState.operationalPeriod||1}</b><span>OP 2</span></div></div>
  <div className="rx-head-block"><span>LOCAL INCIDENT TIME</span><strong>{missionState.exercise?.localIncidentTime||missionState.asOf||'1732L'}</strong><small>Period remains active</small></div>
  <div className="rx-header-actions"><button>▤<small>NOTES</small></button><button>☰<small>MENU</small></button>{onEnd&&<button className="rx-end" onClick={onEnd}>END EXERCISE</button>}</div>
 </header>
}

function Sidebar({role,active,onNavigate}){
 const meta=ROLES.find(r=>r.id===role)
 return <aside className="rx-sidebar">
  <nav>{NAV.map(([id,label])=><button key={id} className={active===id?'active':''} onClick={()=>onNavigate?.(id)}><span>{id==='mission'?'◎':'◌'}</span>{label}</button>)}</nav>
  <button className="rx-collapse">≪ &nbsp; COLLAPSE</button>
  <div className="rx-role-card"><div className="rx-role-icon">♙</div><span>YOUR ROLE</span><strong>{meta?.name}</strong><p>{roleCopy[role]}</p><button>ROLE GUIDE ↗</button></div>
 </aside>
}

function CurrentPeriodCard({role,missionState}){
 const focus={
  remote_sensing_coordinator:'Life safety, current fire behavior, critical infrastructure',
  remote_sensing_manager:'Execute approved missions and respond to new requests',
  collection_manager:'Execute approved collections and respond to new requests',
  upad_lno:'Execute assigned production and report status',
 }[role]
 return <Panel title="CURRENT OPERATIONAL PERIOD (OP 1)" className="rx-top-card">
  <dl className="rx-key-list"><div><dt>◷ &nbsp; Time</dt><dd>{missionState.exercise?.localIncidentTime||'1732L'}</dd></div><div><dt>▣ &nbsp; End Time</dt><dd>1800L</dd></div><div><dt>◎ &nbsp; Focus</dt><dd>{focus}</dd></div></dl>
  <Button>VIEW CURRENT OP DETAILS</Button>
 </Panel>
}

function TomorrowCard({role,missionState,onNavigate}){
 const gaps=(missionState.tomorrowPlan?.blockers||[]).slice(0,3)
 return <Panel title="TOMORROW'S PLAN (OP 2)" accent="amber" className="rx-top-card">
  <dl className="rx-key-list"><div><dt>◷ &nbsp; Planning Window Closes</dt><dd>2130L</dd></div><div><dt>▣ &nbsp; OP 2 Begins</dt><dd>2200L</dd></div></dl>
  <div className="rx-gap-list"><strong>{role==='upad_lno'?'UPAD Commitments':'Top Planning Gaps'}</strong>{role==='upad_lno'?<b>6 / 11</b>:<ul>{(gaps.length?gaps:['Fire 1 – IMINT coverage gap late OP 2','Fire 2 – Change detection not scheduled']).map(x=><li key={x}>{x}</li>)}</ul>}</div>
  <Button onClick={()=>onNavigate?.('tomorrow')}>VIEW / BUILD TOMORROW'S PLAN</Button>
 </Panel>
}

function DeadlinesCard({role}){
 const title=role==='collection_manager'?'REQUIREMENT DEADLINES & WINDOWS':'MISSION DEADLINES & WINDOWS'
 return <Panel title={title} accent="red" className="rx-top-card">
  <div className="rx-deadlines">{[
   ['△','Fire 1 IMINT Product','OP 1','01:12:32'],
   ['▣','Fire 2 Change Detection','OP 1','00:47:32'],
   ['▣','Fire 3 Damage Assessment','OP 1','01:32:32'],
   ['◷',role==='collection_manager'?'New Requests Cutoff (OP 2)':'Tomorrow Plan Submit','OP 1','01:57:32'],
  ].map(x=><div key={x[1]}><span>{x[0]}</span><strong>{x[1]}</strong><em>{x[2]}</em><b>{x[3]}</b></div>)}</div>
  <Button>VIEW ALL DEADLINES</Button>
 </Panel>
}

function RegionalMissionPicture({role,missionState}){
 const missions=missionState.currentOps?.missions||[]
 return <Panel title="REGIONAL MISSION PICTURE – THREE FIRES" className="rx-map-panel">
  <div className={`rx-map role-${role}`}>
   <div className="rx-map-grid"/>
   <div className="rx-legend"><strong>LEGEND</strong><span>🔴 Fire 1 – Pine Ridge</span><span>🟠 Fire 2 – Canyon Creek</span><span>🟡 Fire 3 – Eagle Peak</span><span>✈ Airborne Platform</span><span>▣ UPAD Location</span><span>▱ TFR / Airspace</span></div>
   <div className="rx-fire f1">🔥<b>F1</b><small>PINE RIDGE</small></div><div className="rx-fire f2">🔥<b>F2</b><small>CANYON CREEK</small></div><div className="rx-fire f3">🔥<b>F3</b><small>EAGLE PEAK</small></div>
   {missions.slice(0,3).map((m,i)=><div key={m.id} className={`rx-air a${i+1}`}>✈ <b>{m.platform||m.assetId||m.id}</b></div>)}
   <div className="rx-upad u1">U1</div><div className="rx-upad u2">U2</div><div className="rx-upad u3">U3</div>
   <div className="rx-map-controls"><button>▱</button><button>＋</button><button>−</button></div>
  </div>
 </Panel>
}

function PlatformTable({missionState,onRelease,onUpdateMission,role}){
 const assets=missionState.assetControl?.assets||[]
 return <Panel title="PLATFORM ASSIGNMENTS & AVAILABILITY" className="rx-platform-panel">
  <table className="rx-table"><thead><tr><th>Platform</th><th>Status / Mission</th><th>Available</th><th>Next Available</th></tr></thead><tbody>
   {assets.slice(0,6).map(a=><tr key={a.id}><td>✈ &nbsp; {a.identifier}</td><td><i className={`rx-dot ${tone(a.status)}`}/>{a.status} – {a.assignment}</td><td>{a.status==='reserve'?'Now':'—'}</td><td>{a.status==='assigned'?'OP 2':'—'}</td>{role==='remote_sensing_manager'&&<td><select className="rx-inline-select" value={(missionState.currentOps?.missions||[]).find(m=>m.id===a.missionId)?.status||'planned'} onChange={e=>a.missionId&&onUpdateMission?.(a.missionId,{status:e.target.value})}><option value="planned">Planned</option><option value="launched">Launched</option><option value="on_station">On station</option><option value="collecting">Collecting</option><option value="returning">Returning</option><option value="landed">Landed</option><option value="delayed">Delayed</option><option value="unable">Unable</option></select></td>}</tr>)}
  </tbody></table>
  <Button onClick={role==='remote_sensing_coordinator'&&assets[0]?()=>onRelease?.(assets[0].id):undefined}>VIEW PLATFORM DETAILS</Button>
 </Panel>
}

function RequirementsSummary({missionState,onNavigate}){
 const reqs=missionState.requirements?.items||[]
 return <Panel title="CUSTOMER REQUIREMENTS & EEIs" accent="amber" className="rx-requirements-summary">
  <div className="rx-req-list">{reqs.slice(0,4).map(r=><article key={r.id}><strong>{r.fire||r.customer}</strong><em className={r.priority===1?'high':'med'}>{r.priority===1?'HIGH':'MED'}</em><p>{r.id.toUpperCase()} &nbsp; {r.title}</p><small>EEI: {(r.eeis||[]).slice(0,2).join(', ')||'Clarification required'}</small></article>)}</div>
  <Button onClick={()=>onNavigate?.('requirements')}>VIEW ALL REQUIREMENTS</Button>
 </Panel>
}

function UPADTable({missionState}){
 const deliveries=missionState.dissemination?.deliveries||[]
 return <Panel title="UPAD WORKLOAD & PRODUCTION" accent="purple" className="rx-upad-table">
  <table className="rx-table"><thead><tr><th>UPAD</th><th>Primary Task</th><th>Workload</th><th>Products Pending</th></tr></thead><tbody>
   {['UPAD 1 (North)','UPAD 2 (Central)','UPAD 3 (South)','UPAD 4 (Reserve)'].map((u,i)=><tr key={u}><td>{u}</td><td>{deliveries[i]?.productType||'Standby'}</td><td><span className="rx-load"><i style={{width:`${[78,92,61,0][i]}%`}}/></span>{[78,92,61,0][i]}%</td><td>{deliveries[i]?i+1:0}</td></tr>)}
  </tbody></table><Button>VIEW PRODUCTION DETAILS</Button>
 </Panel>
}

function AirspacePanel(){
 return <Panel title="AIRSPACE / TFR CONSTRAINTS" className="rx-small-list"><ul>{['TFR – Fire 1 (VIP Visit)','TFR – Fire 2 (Aerial Operations)','TFR – Fire 3 (Aviation Hazard)','MOA – R-2505','Severed Airspace – North'].map((x,i)=><li key={x}>{x}<span><i className={`rx-dot ${i===4?'amber':'red'}`}/>{i===4?'Advisory':'Active'}</span></li>)}</ul><Button>VIEW AIRSPACE DETAIL</Button></Panel>
}

function OversightPanel({missionState}){
 const cases=missionState.oversight?.cases||[]
 return <Panel title="INTELLIGENCE OVERSIGHT" accent="purple" className="rx-small-list"><ul>{(cases.length?cases:[
  {title:'Collection over populated area',severity:'medium'},{title:'Need-to-know validation',severity:'medium'},{title:'Potential privacy concern',severity:'low'}
 ]).slice(0,4).map((x,i)=><li key={x.id||x.title}>{x.title||x.concern}<em className={tone(x.severity||'medium')}>{(x.severity||'MED').toUpperCase()}</em></li>)}</ul><Button>VIEW IO GUIDANCE</Button></Panel>
}

function DecisionWindows(){
 return <Panel title="KEY DECISION WINDOWS"><ul className="rx-window-list">{[['Retask vs Stay (Vulcan 01)','00:32:32'],['Accept CAL OES Request','00:27:32'],['UPAD 2 Reallocation','00:42:32'],['Tomorrow Plan Priorities','01:57:32']].map(x=><li key={x[0]}><span>{x[0]}</span><b>{x[1]}</b></li>)}</ul><Button>VIEW DECISION LOG</Button></Panel>
}

function AdvisorColumn(props){
 return <aside className="rx-advisor-column">
  <AdvisorPanel {...props}/>
 </aside>
}

function RequirementDevelopment({missionState,onUpdateRequirement,onValidateRequirement,onSendRequirementForward}){
 const reqs=missionState.requirements?.items||[]
 const selected=reqs.find(r=>r.status==='needs_clarification')||reqs[0]||{}
 const [draft,setDraft]=useState(selected)
 const update=(field,value)=>setDraft(d=>({...d,[field]:value}))
 return <Panel title="REQUIREMENTS DEVELOPMENT WORKSPACE" className="rx-requirement-workspace">
  <div className="rx-req-dev-grid">
   <section><h4>CUSTOMER REQUEST (RAW)</h4><dl><div><dt>Request ID</dt><dd>{selected.id}</dd></div><div><dt>Customer</dt><dd>{selected.customer}</dd></div><div><dt>Priority</dt><dd><em className="high">HIGH</em></dd></div></dl><p className="rx-raw-request">{selected.what||selected.title||'Customer request requires clarification.'}</p><dl><div><dt>Associated Fire</dt><dd>{selected.fire}</dd></div><div><dt>Desired By</dt><dd>{selected.when||'1800L'}</dd></div></dl></section>
   <section><h4>REFINED REQUIREMENT (DRAFT)</h4><div className="rx-form-grid"><label>Decision to Support<input value={draft.decisionToSupport||''} onChange={e=>update('decisionToSupport',e.target.value)}/></label><label>Location / NAI<input value={draft.nai||''} onChange={e=>update('nai',e.target.value)}/></label><label className="wide">Information Need / Description<textarea value={draft.what||''} onChange={e=>update('what',e.target.value)}/></label><label>Time Sensitive<input value={draft.when||''} onChange={e=>update('when',e.target.value)}/></label><label>Desired Product / Effect<input value={draft.requiredEffect||''} onChange={e=>update('requiredEffect',e.target.value)}/></label><label className="wide">Essential Elements of Information (EEIs)<textarea value={(draft.eeis||[]).join('\n')} onChange={e=>update('eeis',e.target.value.split('\n').filter(Boolean))}/></label><label>Collection Window<select><option>OP 2</option></select></label><label>Alternate Sources<input value={draft.alternateSource||''} onChange={e=>update('alternateSource',e.target.value)}/></label></div><div className="rx-form-actions"><span>Feasibility Status <b>PENDING REVIEW</b></span><button onClick={()=>{onUpdateRequirement?.(selected.id,draft);onValidateRequirement?.(selected.id)}}>MARK READY FOR PLAN</button></div></section>
   <section><h4>TOMORROW PLAN – REQUIREMENT QUEUE</h4>{reqs.slice(0,4).map(r=><button className={`rx-queue-item ${r.id===selected.id?'selected':''}`} key={r.id}><strong>{r.id.toUpperCase()} &nbsp; {r.fire}</strong><span>{r.title}</span><em>{r.status}</em></button>)}<Button onClick={()=>onSendRequirementForward?.(selected.id)}>VIEW ALL REQUIREMENTS</Button></section>
  </div>
 </Panel>
}

function Taskability({missionState}){
 return <Panel title="TASKABILITY & COLLECTION OPTIONS" className="rx-taskability"><div className="rx-three">
  <section><h4>PLATFORM SUITABILITY (OP 2)</h4>{(missionState.assetControl?.assets||[]).slice(0,3).map((a,i)=><div key={a.id}><span>✈ &nbsp; {a.type}</span><b>{['Good Fit','Moderate Fit','Limited Fit'][i]}</b><i className={`rx-dot ${['green','amber','red'][i]}`}/></div>)}</section>
  <section><h4>CONSTRAINTS & CONSIDERATIONS</h4>{[['Airspace','TFR near collection area'],['Intel Oversight','Wide area collection – Privacy concern'],['Weather','Hazy, smoke layers in area'],['Other','Civil air traffic in corridor']].map(x=><div key={x[0]}><span>{x[0]}</span><b>{x[1]}</b></div>)}</section>
  <section><h4>RECOMMENDATION</h4><p>Use effects-based matching for the OP 2 collection window. Coordinate airspace timing and preserve alternate-source options.</p><Button>MARK READY FOR PLAN</Button></section>
 </div></Panel>
}

function UPADOverview({missionState,onUpdateDelivery}){
 const deliveries=missionState.dissemination?.deliveries||[]
 return <Panel title="UPAD STATUS & PRODUCTION OVERVIEW" className="rx-upad-overview">
  <table className="rx-table"><thead><tr><th>UPAD</th><th>Location</th><th>Primary Tasking (Current)</th><th>Workload</th><th>On-Time</th><th>At Risk</th><th>Overdue</th><th>Products Pending</th><th>Issues / Notes</th><th>Comm Status</th></tr></thead><tbody>
  {['UPAD 1 (North)','UPAD 2 (Central)','UPAD 3 (South)','UPAD 4 (Reserve)'].map((u,i)=><tr key={u}><td><strong>{u}</strong></td><td>{['Reno, NV','Salt Lake City, UT','Phoenix, AZ','Albuquerque, NM'][i]}</td><td>{deliveries[i]?.productType||'Standby / Fill-in'}</td><td><span className="rx-load"><i style={{width:`${[86,92,78,22][i]}%`}}/></span>{[86,92,78,22][i]}%</td><td>{[2,1,2,0][i]}</td><td>{[1,2,0,0][i]}</td><td>{[1,2,1,0][i]}</td><td>{[4,5,3,0][i]}</td><td>{['Bandwidth limited','Pilot rest window','High queue','Available if tasked'][i]}</td><td><em className={i===2?'med':'good'}>{i===2?'DEGRADED':'GOOD'}</em></td></tr>)}
  </tbody></table><Button onClick={deliveries[0]?()=>onUpdateDelivery?.(deliveries[0].id,{processingStatus:'processing'}):undefined}>VIEW DETAILED PRODUCTION BOARD</Button>
 </Panel>
}

function CoordinatorView(props){
 const {missionState,role,onNavigate,onReleaseAsset}=props
 return <div className="rx-role-layout coordinator">
  <div className="rx-top-grid"><CurrentPeriodCard role={role} missionState={missionState}/><TomorrowCard role={role} missionState={missionState} onNavigate={onNavigate}/><DeadlinesCard role={role}/></div>
  <div className="rx-coordinator-middle"><RegionalMissionPicture role={role} missionState={missionState}/><div className="rx-stack"><PlatformTable missionState={missionState} role={role} onRelease={onReleaseAsset}/><UPADTable missionState={missionState}/></div></div>
  <div className="rx-four-grid"><RequirementsSummary missionState={missionState} onNavigate={onNavigate}/><AirspacePanel/><OversightPanel missionState={missionState}/><DecisionWindows/></div>
 </div>
}
function ManagerView(props){
 const {missionState,role,onNavigate,onUpdateMission}=props
 return <div className="rx-role-layout manager">
  <div className="rx-top-grid two"><CurrentPeriodCard role={role} missionState={missionState}/><TomorrowCard role={role} missionState={missionState} onNavigate={onNavigate}/></div>
  <div className="rx-manager-main"><RegionalMissionPicture role={role} missionState={missionState}/><RequirementsSummary missionState={missionState} onNavigate={onNavigate}/></div>
  <div className="rx-three-grid"><PlatformTable missionState={missionState} role={role} onUpdateMission={onUpdateMission}/><UPADTable missionState={missionState}/><AirspacePanel/></div>
  <div className="rx-two-grid"><OversightPanel missionState={missionState}/><DeadlinesCard role={role}/></div>
 </div>
}
function CollectionView(props){
 const {missionState,role,onNavigate,onUpdateRequirement,onValidateRequirement,onSendRequirementForward}=props
 return <div className="rx-role-layout collection">
  <div className="rx-top-grid"><CurrentPeriodCard role={role} missionState={missionState}/><TomorrowCard role={role} missionState={missionState} onNavigate={onNavigate}/><DeadlinesCard role={role}/></div>
  <RequirementDevelopment missionState={missionState} onUpdateRequirement={onUpdateRequirement} onValidateRequirement={onValidateRequirement} onSendRequirementForward={onSendRequirementForward}/>
  <Taskability missionState={missionState}/>
  <div className="rx-three-grid bottom"><RegionalMissionPicture role={role} missionState={missionState}/><AirspacePanel/><UPADTable missionState={missionState}/></div>
 </div>
}
function UPADView(props){
 const {missionState,role,onNavigate,onUpdateDelivery}=props
 return <div className="rx-role-layout upad">
  <div className="rx-top-grid"><CurrentPeriodCard role={role} missionState={missionState}/><TomorrowCard role={role} missionState={missionState} onNavigate={onNavigate}/><DeadlinesCard role={role}/></div>
  <UPADOverview missionState={missionState} onUpdateDelivery={onUpdateDelivery}/>
  <div className="rx-three-grid"><Panel title="UPAD CAPACITY & CONSTRAINTS" accent="purple" className="rx-small-list"><ul>{[['Total Processing Capacity','High'],['Network Bandwidth','Limited'],['Exploitation Specialists','Tight'],['Pilot / Crew Availability','Limited'],['System Availability','Good'],['Launch Turn Time','Moderate']].map(x=><li key={x[0]}>{x[0]}<em>{x[1]}</em></li>)}</ul><Button>VIEW UPAD DETAILS</Button></Panel><UPADTable missionState={missionState}/><Panel title="UPAD SUPPORT REQUESTS" accent="purple" className="rx-small-list"><ul>{['Additional Bandwidth','Extra Exploitation Support','Accelerated Processing','Alternate Landing Site'].map((x,i)=><li key={x}>{x}<span>U{i+1} &nbsp; OPEN</span></li>)}</ul><Button>VIEW ALL REQUESTS</Button></Panel></div>
  <div className="rx-three-grid bottom"><RegionalMissionPicture role={role} missionState={missionState}/><AirspacePanel/><OversightPanel missionState={missionState}/></div>
 </div>
}

export default function CurrentOperationsRouter({
 role,missionState,onNavigate,onToggleProtection,onReleaseAsset,onUpdateMission,onUpdateRequirement,onValidateRequirement,onSendRequirementForward,onUpdateDelivery,
 advisorProps,onEndExercise
}){
 const common={role,missionState,onNavigate,onToggleProtection,onReleaseAsset,onUpdateMission,onUpdateRequirement,onValidateRequirement,onSendRequirementForward,onUpdateDelivery}
 const View=role==='remote_sensing_manager'?ManagerView:role==='collection_manager'?CollectionView:role==='upad_lno'?UPADView:CoordinatorView
 return <div className="rx-shell">
  <LiveHeader role={role} missionState={missionState} onEnd={onEndExercise}/>
  <Sidebar role={role} active={role==='collection_manager'?'requirements':role==='upad_lno'?'upad':'mission'} onNavigate={onNavigate}/>
  <main className="rx-main"><View {...common}/></main>
  <AdvisorColumn {...advisorProps}/>
 </div>
}
