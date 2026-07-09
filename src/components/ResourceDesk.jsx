import { useMemo, useState } from 'react'
import { CONTROLLED_RESOURCES, RESOURCE_CATEGORIES } from '../data/resourceLibrary.js'

const ROLE_FOCUS = {
  remote_sensing_coordinator:'Use resources to identify partner opportunities, regional gaps, and leadership-relevant context.',
  remote_sensing_manager:'Use resources to confirm execution conditions, airspace, weather, and mission risk.',
  collection_manager:'Use existing sources first, verify whether they answer the information gap, and document why collection is still needed.',
  upad_lno:'Use repositories and dissemination tools to confirm data access, product transfer, and customer receipt.',
}

export default function ResourceDesk({ role, missionState, onRecordUse }) {
  const [category,setCategory]=useState('all')
  const [query,setQuery]=useState('')
  const [selected,setSelected]=useState(CONTROLLED_RESOURCES[0])
  const [note,setNote]=useState('')
  const filtered=useMemo(()=>CONTROLLED_RESOURCES.filter(r=>(category==='all'||r.category===category)&&(`${r.name} ${r.use} ${r.scenarioTags.join(' ')}`.toLowerCase().includes(query.toLowerCase()))),[category,query])
  const activeNeed=missionState.requirements.items.find(r=>r.status==='needs_clarification') || missionState.requirements.items[0]

  return <div className="resource-workspace">
    <section className="panel resource-hero"><div><span className="eyebrow">Step 4E · Contextual Resource Desk</span><h2>Controlled Operational Resources</h2><p>Use approved sources to improve situational awareness, answer requirements with existing information, and reduce unnecessary collection. Access does not equal validation.</p></div><div className="resource-role-focus"><span>ROLE EMPHASIS</span><strong>{ROLE_FOCUS[role]}</strong></div></section>

    <section className="panel resource-context"><div className="panel-heading"><h3>Active Requirement Context</h3><span className="chip amber">USE EXISTING SOURCES FIRST</span></div><div className="resource-context-grid"><div><span>Requirement</span><strong>{activeNeed.id} · {activeNeed.title}</strong></div><div><span>Decision to Support</span><strong>{activeNeed.decisionToSupport || 'Not yet defined'}</strong></div><div><span>Existing-Source Check</span><strong>{activeNeed.existingSourceCheck?'Completed':'Required'}</strong></div></div></section>

    <aside className="panel resource-filters"><div className="panel-heading"><h3>Resource Library</h3><span className="chip slate">CONTROLLED LIST</span></div><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search resources or mission need"/><div className="resource-category-list"><button className={category==='all'?'active':''} onClick={()=>setCategory('all')}>All Resources</button>{RESOURCE_CATEGORIES.map(c=><button key={c.id} className={category===c.id?'active':''} onClick={()=>setCategory(c.id)}>{c.label}</button>)}</div></aside>

    <section className="panel resource-list-panel"><div className="resource-card-grid">{filtered.map(r=><button key={r.id} className={`resource-card ${selected.id===r.id?'selected':''}`} onClick={()=>setSelected(r)}><div><strong>{r.name}</strong><span>{RESOURCE_CATEGORIES.find(c=>c.id===r.category)?.label}</span></div><p>{r.use}</p><small>{r.access}</small></button>)}</div></section>

    <section className="panel resource-detail"><div className="panel-heading"><h3>{selected.name}</h3><span className="chip teal">APPROVED RESOURCE</span></div><div className="resource-detail-grid"><div><span>Operational Use</span><strong>{selected.use}</strong></div><div><span>Access</span><strong>{selected.access}</strong></div><div><span>Limitations</span><strong>{selected.limitations}</strong></div><div><span>Verification Standard</span><strong>{selected.verification}</strong></div></div><label>How this resource affects the current requirement<textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Document what the resource confirms, what remains unknown, and whether collection is still required."/></label><button className="primary-button small" disabled={!note.trim()} onClick={()=>{onRecordUse(selected,activeNeed,note);setNote('')}}>Record Resource Use</button></section>

    <section className="panel resource-doctrine"><div className="panel-heading"><h3>Resource Use Guardrails</h3><span className="chip amber">TRUST BUT VERIFY</span></div><div className="doctrine-grid"><div><strong>Plan Before the Event</strong><p>Accounts, access, POCs, and bookmarks should be established during steady state.</p></div><div><strong>Check Existing Sources</strong><p>Do not consume scarce collection capacity when an approved source already answers the requirement.</p></div><div><strong>Verify Currency</strong><p>Confirm source, collection time, update time, and relevance before using information operationally.</p></div><div><strong>Preserve the Customer Need</strong><p>Resources support decisions; they do not replace a clearly written requirement or verified dissemination.</p></div></div></section>
  </div>
}
