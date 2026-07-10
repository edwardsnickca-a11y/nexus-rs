import React, { useMemo, useState } from 'react'
import AdvisorIdentity from './AdvisorIdentity.jsx'
import { getParticipantIdentity } from '../utils/participantIdentity.js'

const NAV_ITEMS = [
  ['current', '◉', 'Current Operations'],
  ['tomorrow', '▣', "Tomorrow's Plan"],
  ['sync', '▦', 'Sync Matrix'],
  ['requirements', '▤', 'Requirements'],
  ['assets', '⌘', 'Asset Allocation'],
  ['platforms', '✈', 'Platforms'],
  ['upad', '◈', 'UPAD / Dissemination'],
  ['resources', '▥', 'Resource Desk'],
  ['oversight', '⬡', 'Intelligence Oversight'],
  ['updates', '▧', 'Mission Updates'],
  ['log', '▤', 'Decision Log'],
  ['transition', '◌', 'OP Transition'],
  ['aar', '✹', 'AAR'],
]

const QUICK_ACTIONS = [
  ['＋', 'New Mission'],
  ['▧', 'New Requirement'],
  ['⚒', 'Log Decision'],
  ['✈', 'Send Update'],
]

const MISSIONS = [
  { id:'RS-101', asset:'MQ-9 #1', area:'Fire Alpha', area2:'Div A', req:'REQ-12', req2:'Fire Progression', objective:'Map fire spread', nai:'NAI-01', start:'0945L', end:'1145L', status:'COLLECTING', owner:'ISR Flight Lead', pir:'PIR-12A', product:'FMV / IR', dissem:'PENDING', protected:true, risk:'—' },
  { id:'RS-102', asset:'LUH-72 #1', area:'Fire Alpha', area2:'Div C', req:'REQ-07', req2:'Structure Threat', objective:'Assess structure damage', nai:'NAI-03', start:'1015L', end:'1145L', status:'ON STATION', owner:'Jimenez', pir:'PIR-07A', product:'Still Imagery', dissem:'PENDING', protected:true, risk:'LOW' },
  { id:'RS-103', asset:'CAP #1', area:'Fire Bravo', area2:'', req:'REQ-09', req2:'Spot Fire Risk', objective:'Detect spot fires', nai:'NAI-05', start:'1130L', end:'1300L', status:'DELAYED', owner:'Air Ops', pir:'PIR-09A', product:'—', dissem:'', protected:false, risk:'HIGH' },
  { id:'RS-104', asset:'LUH-72 #2', area:'Fire Charlie', area2:'', req:'REQ-15', req2:'Damage Assessment', objective:'Collect damage baseline', nai:'NAI-07', start:'1230L', end:'1400L', status:'PLANNED', owner:'Ramos', pir:'PIR-15A', product:'Still Imagery', dissem:'PLANNED', protected:false, risk:'MED' },
  { id:'RS-105', asset:'CAP #2', area:'State Patrol', area2:'', req:'REQ-03', req2:'Situational Awareness', objective:'Wide area overview', nai:'NAI-02', start:'—', end:'—', status:'RETURNING', owner:'Air Ops', pir:'—', product:'—', dissem:'', protected:false, risk:'LOW' },
  { id:'RS-106', asset:'MQ-9 #2', area:'Fire Alpha', area2:'Div B', req:'REQ-11', req2:'Perimeter Mapping', objective:'Map perimeter gaps', nai:'NAI-04', start:'—', end:'—', status:'UNABLE', owner:'ISR Flight Lead', pir:'PIR-11A', product:'—', dissem:'', protected:false, risk:'HIGH' },
]

const ASSETS = [
  ['✈', 'MQ-9 #1', 'ASSIGNED', 'RS-101', 'Collecting over Fire Alpha'],
  ['✈', 'LUH-72 #1', 'AVAILABLE', '', 'Ready for tasking'],
  ['✈', 'LUH-72 #2', 'RETURNING', '', 'Est. available 1130L'],
  ['✈', 'CAP #1', 'DELAYED', '', 'Weather constraint'],
  ['✈', 'CAP #2', 'RELEASED', '', 'Released to state'],
]

const RISKS = [
  ['REQ-07', 'Structure Threat', 'Plans Section', '1115L', 'No current imagery', 'Clouds over Div C'],
  ['REQ-09', 'Spot Fire Risk', 'Operations Section', '1300L', 'No collection tasked', 'CAP delayed'],
  ['REQ-12', 'Fire Progression', 'Incident Commander', '1500L', 'Next update not scheduled', 'Asset constraints'],
]

const PRODUCTS = [
  ['RS-101', 'FMV / IR', '1036L', 'AWAITING VERIFICATION'],
  ['RS-102', 'Still Imagery', '—', 'IN PROGRESS'],
  ['RS-104', 'Still Imagery', '—', 'PLANNED'],
  ['RS-105', 'FMV', '—', 'PLANNED'],
]

const CHANGES = [
  ['☁', 'RS-103 delayed due to weather', '(1020L)'],
  ['▧', 'New REQ-15 added by IC', '(1005L)'],
  ['✈', 'CAP #2 released to State', '(0945L)'],
  ['▤', 'Delivery from RS-101 pending verification', '(1035L)'],
]

const NEAR_TERM = [
  ['1100L', 'Decision window closes for RS-103'],
  ['1130L', 'LUH-72 #2 available'],
  ['1145L', 'RS-101 on station complete'],
  ['1145L', 'RS-102 on station complete'],
  ['1230L', 'RS-104 planned start'],
]

function StatusChip({status}) {
  const key = status.toLowerCase().replace(/\s/g, '-')
  return <span className={`co-status-chip ${key}`}>{status}{status==='COLLECTING' || status==='ON STATION' ? <i /> : null}</span>
}

function Risk({value}) {
  return <span className={`co-risk ${value.toLowerCase()}`}>{value}</span>
}

function MiniIcon({children, tone=''}) {
  return <span className={`co-mini-icon ${tone}`}>{children}</span>
}

export default function CurrentOps({ role, missionState, onToggleProtection, onNavigate }) {
  const [filter, setFilter] = useState('All')
  const participant = getParticipantIdentity(missionState, role)
  const [selectedMission, setSelectedMission] = useState('RS-101')

  const visibleMissions = useMemo(() => MISSIONS.filter((mission) => {
    if (filter === 'All') return true
    if (filter === 'Active') return ['COLLECTING','ON STATION','RETURNING'].includes(mission.status)
    if (filter === 'Near-Term') return ['PLANNED','DELAYED'].includes(mission.status)
    return ['DELAYED','UNABLE'].includes(mission.status)
  }), [filter])

  const nav = (id) => {
    const route = id === 'assets' ? 'mission' : id
    onNavigate?.(route)
  }

  return <div className="co-shell">
    <header className="co-header">
      <div className="co-brand">
        <div className="co-brand-mark"><span>◉</span></div>
        <div><strong>NEXUS <em>RS</em></strong><small>Remote Sensing Coordination<br/>and Mission Management Simulator</small></div>
      </div>

      <div className="co-header-field co-header-scenario"><span>SCENARIO</span><strong>Cascade Complex Wildfire <b>⌄</b></strong></div>
      <div className="co-header-field co-header-role"><span>USER / ROLE</span><strong>{participant.primary} <b>⌄</b></strong>{participant.secondary && <small>{participant.secondary}</small>}</div>
      <div className="co-header-field"><span>OPERATIONAL PERIOD</span><strong>DAY 2</strong></div>
      <div className="co-header-field co-turn"><span>TURN</span><strong>12</strong></div>
      <div className="co-header-field"><span>LOCAL TIME</span><strong>1038L</strong><small>AUG 25, 2025</small></div>
      <div className="co-header-field co-status"><span>EXERCISE STATUS</span><strong>ACTIVE</strong></div>
      <div className="co-header-tools"><button aria-label="Activity">⌁</button><button aria-label="Messages">▣</button></div>
    </header>

    <aside className="co-sidebar">
      <nav>
        {NAV_ITEMS.map(([id, icon, label]) => <button key={id} className={id==='current'?'active':''} onClick={()=>nav(id)}>
          <span>{icon}</span>{label}
        </button>)}
      </nav>
      <div className="co-quick">
        <h4>QUICK ACTIONS</h4>
        {QUICK_ACTIONS.map(([icon,label]) => <button key={label}><span>{icon}</span>{label}</button>)}
      </div>
    </aside>

    <main className="co-main">
      <section className="co-summary">
        <div><MiniIcon>✈</MiniIcon><span>ACTIVE MISSIONS</span><strong>3</strong></div>
        <div><MiniIcon>✈</MiniIcon><span>ASSETS AVAILABLE</span><strong>2</strong></div>
        <div><MiniIcon tone="amber">△</MiniIcon><span>REQUIREMENTS<br/>AT RISK</span><strong>1</strong></div>
        <div><MiniIcon>▤</MiniIcon><span>PRODUCTS<br/>PENDING</span><strong>4</strong></div>
        <div><MiniIcon>◉</MiniIcon><span>UNVERIFIED<br/>DELIVERY</span><strong>2</strong></div>
        <div><MiniIcon>◷</MiniIcon><span>OPEN DECISION<br/>WINDOWS</span><strong>1</strong></div>
      </section>

      <section className="co-panel co-mission-board">
        <div className="co-panel-head">
          <h2>MISSION BOARD <span>(Current &amp; Near-Term)</span></h2>
          <div className="co-filters"><label>View:</label>{['All','Active','Near-Term','Changes'].map(item=><button key={item} className={filter===item?'active':''} onClick={()=>setFilter(item)}>{item}</button>)}</div>
        </div>
        <div className="co-table-wrap">
          <table className="co-mission-table">
            <thead><tr>
              <th>ID / SORTIE</th><th>ASSET</th><th>INCIDENT / AREA</th><th>REQUIREMENT</th><th>OBJECTIVE / NAI</th><th>PLN'D START</th><th>PLN'D END</th><th>STATUS</th><th>OWNER</th><th>PIR / EEI</th><th>PRODUCT / DISSEM</th><th>PROT</th><th>RISK</th>
            </tr></thead>
            <tbody>{visibleMissions.map(m=><tr key={m.id} className={selectedMission===m.id?'selected':''} onClick={()=>setSelectedMission(m.id)}>
              <td><strong>{m.id}</strong></td><td>{m.asset}</td><td>{m.area}<small>{m.area2}</small></td><td>{m.req}<small>{m.req2}</small></td><td>{m.objective}<small>{m.nai}</small></td><td>{m.start}</td><td>{m.end}</td>
              <td><StatusChip status={m.status}/></td><td>{m.owner}</td><td>{m.pir}</td><td>{m.product}{m.dissem && <small className={m.dissem==='PENDING'?'amber-text':'blue-text'}>{m.dissem}</small>}</td>
              <td>{m.protected?<button className="co-shield" title="Protected mission" onClick={(e)=>{e.stopPropagation();onToggleProtection?.(m.id)}}>♢</button>:'—'}</td><td><Risk value={m.risk}/></td>
            </tr>)}</tbody>
          </table>
        </div>
      </section>

      <section className="co-panel co-timeline">
        <div className="co-panel-head"><h2>EXECUTION TIMELINE <span>(Local Time)</span></h2></div>
        <div className="co-timeline-body">
          <div className="co-time-axis"><span style={{left:'8%'}}>0800L</span><span style={{left:'22%'}}>0900L</span><span style={{left:'36%'}}>1000L</span><span style={{left:'50%'}}>1100L</span><span style={{left:'64%'}}>1200L</span><span style={{left:'78%'}}>1300L</span><span style={{left:'92%'}}>1400L</span></div>
          <div className="co-now-line"><span>1038L</span></div>
          <div className="co-decision-line" />
          {[
            ['MQ-9 #1','RS-101  0945–1145','collecting','19%','34%'],
            ['LUH-72 #1','RS-102  1015–1145','collecting','27%','30%'],
            ['CAP #1','RS-103  1130–1300 (DELAYED)','delayed','46%','33%'],
            ['LUH-72 #2','RS-104  1230–1400','planned','61%','28%'],
          ].map(([label,text,tone,left,width])=><div className="co-time-row" key={label}><b>{label}</b><div><span className={`co-time-bar ${tone} ${selectedMission===text.slice(0,6)?'selected':''}`} style={{left,width}}>{text}</span></div></div>)}
          <div className="co-decision-note">Decision Window<br/>Closes 1115L</div>
          <div className="co-timeline-legend"><span><i className="collecting"/>Collecting / On Station</span><span><i className="planned"/>Planned</span><span><i className="delayed"/>Delayed</span><span>♢ Protected Mission</span><span>◷ Decision Deadline</span></div>
        </div>
      </section>

      <div className="co-lower-grid">
        <section className="co-panel co-asset-status">
          <div className="co-panel-head"><h2>ASSET STATUS</h2></div>
          <div className="co-list-table">{ASSETS.map(([icon,name,status,mission,note])=><div key={name}><span>{icon}</span><strong>{name}</strong><em className={status.toLowerCase()}>{status}</em><b>{mission}</b><small>{note}</small></div>)}</div>
        </section>

        <section className="co-panel co-risk-panel">
          <div className="co-panel-head"><h2>› REQUIREMENTS AT RISK</h2></div>
          <table><thead><tr><th>REQUIREMENT</th><th>CUSTOMER</th><th>DEADLINE</th><th>GAP</th><th>REASON</th></tr></thead>
            <tbody>{RISKS.map(r=><tr key={r[0]}><td>{r[0]}<small>{r[1]}</small></td><td>{r[2]}</td><td>{r[3]}</td><td>{r[4]}</td><td>{r[5]}</td></tr>)}</tbody>
          </table><button className="co-view-all" onClick={()=>nav('requirements')}>View All Requirements ›</button>
        </section>

        <section className="co-panel co-products-panel">
          <div className="co-panel-head"><h2>› PRODUCTS PENDING</h2></div>
          <table><thead><tr><th>SOURCE</th><th>PRODUCT</th><th>RECEIVED</th><th>STATUS</th></tr></thead>
            <tbody>{PRODUCTS.map(r=><tr key={r[0]}><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td><span className={`co-product-status ${r[3].toLowerCase().replace(/\s/g,'-')}`}>{r[3]}</span></td></tr>)}</tbody>
          </table><button className="co-view-all" onClick={()=>nav('upad')}>View All Products ›</button>
        </section>
      </div>
    </main>

    <aside className="co-right">
      <section className="co-panel co-attention">
        <AdvisorIdentity compact mode="connected" timestamp={missionState.asOf || '1038L'} message="These items need your attention before the next decision window closes." />
        <article><MiniIcon tone="red">△</MiniIcon><div><strong>REQ-07 Structure Threat</strong><p>Decision deadline 1115L</p><p>Insufficient current imagery</p><b className="red-text">HIGH RISK</b></div></article>
        <article><MiniIcon tone="amber">◷</MiniIcon><div><strong>Decision Window Closing</strong><p>Retask window for RS-103</p><p>Closes in 37 min (1115L)</p><b className="amber-text">ACTION REQUIRED</b></div></article>
        <article><MiniIcon tone="amber">!</MiniIcon><div><strong>Weather Impact</strong><p>Cloud deck reducing CAP coverage over Fire Bravo</p><b className="amber-text">MONITOR</b></div></article>
      </section>

      <section className="co-panel co-changes">
        <div className="co-panel-head"><h2>› WHAT CHANGED THIS TURN</h2></div>
        {CHANGES.map(([icon,text,time])=><div key={text}><span>{icon}</span><p>{text}<small>{time}</small></p></div>)}
        <button className="co-view-all" onClick={()=>nav('updates')}>View All Updates ›</button>
      </section>

      <section className="co-panel co-decision">
        <div className="co-panel-head"><h2>DECISION WINDOWS</h2><span>◷</span></div>
        <strong>Retask RS-103</strong><p>Closes 1115L (37 min)</p><div className="co-progress"><i/></div>
      </section>

      <section className="co-panel co-near-term">
        <div className="co-panel-head"><h2>NEAR-TERM <span>(NEXT 2 HOURS)</span></h2></div>
        {NEAR_TERM.map(([time,text])=><div key={time+text}><strong>{time}</strong><span>{text}</span></div>)}
        <button className="co-view-all" onClick={()=>nav('tomorrow')}>View Tomorrow's Plan ›</button>
      </section>
    </aside>

    <footer className="co-footer">
      <div><span>◷</span><strong>LOCAL INCIDENT TIME ONLY</strong></div>
      <p>All times displayed in local incident time (L)</p>
      <div><span>Exercise ID: <b>CASCADE-25-08-25-01</b></span><button>⚙ Settings</button><button>ⓘ Help</button></div>
    </footer>
  </div>
}
