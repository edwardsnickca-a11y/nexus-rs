import React, { useMemo, useState } from 'react'

const STATUS_LABELS = {
  needs_clarification: 'NEEDS CLARIFICATION',
  taskable: 'TASKABLE',
  sent_forward: 'SENT FORWARD',
  deferred: 'DEFERRED',
  not_taskable: 'NOT TASKABLE',
}

const roleAuthority = {
  collection_manager: 'EDIT / VALIDATE / SEND FORWARD',
  remote_sensing_manager: 'REVIEW / RECOMMEND',
  remote_sensing_coordinator: 'REGIONAL VISIBILITY / PRIORITY REVIEW',
  upad_lno: 'PRODUCTION IMPACT / READ ONLY',
}

function RequirementEditor({ requirement, role, onUpdate, onValidate, onSendForward }) {
  const editable = role === 'collection_manager'
  const [draft, setDraft] = useState(requirement)
  const set = (key, value) => setDraft(prev => ({ ...prev, [key]: value }))
  const setEeis = value => set('eeis', value.split('\n').map(x => x.trim()).filter(Boolean))

  React.useEffect(() => setDraft(requirement), [requirement])

  const save = () => onUpdate(requirement.id, {
    title: draft.title,
    requestType: draft.requestType,
    priority: Number(draft.priority),
    customer: draft.customer,
    who: draft.who,
    decisionToSupport: draft.decisionToSupport,
    what: draft.what,
    where: draft.where,
    when: draft.when,
    why: draft.why,
    requiredEffect: draft.requiredEffect,
    requestedPlatform: draft.requestedPlatform,
    nai: draft.nai,
    pir: draft.pir,
    eeis: draft.eeis,
    disseminationMethod: draft.disseminationMethod,
    existingSourceCheck: draft.existingSourceCheck,
    organicSuitability: draft.organicSuitability,
    alternateSource: draft.alternateSource,
    duplicateStatus: draft.duplicateStatus,
    oversightFlag: draft.oversightFlag,
  })

  return <section className="panel requirement-detail">
    <div className="panel-heading">
      <div><span className="eyebrow">Requirement Development</span><h3>{requirement.id.toUpperCase()} · {requirement.fire}</h3></div>
      <span className={`chip ${requirement.status === 'taskable' || requirement.status === 'sent_forward' ? 'teal' : 'amber'}`}>{STATUS_LABELS[requirement.status] || requirement.status}</span>
    </div>

    <div className="authority-banner"><strong>{roleAuthority[role]}</strong><span>{editable ? 'Collection Manager owns requirement and EEI development.' : 'Fields are visible for coordination; changes belong to the Collection Manager.'}</span></div>

    <div className="requirement-form-grid">
      <label>Requirement title<input disabled={!editable} value={draft.title || ''} onChange={e=>set('title',e.target.value)}/></label>
      <label>Type<select disabled={!editable} value={draft.requestType || 'ad_hoc'} onChange={e=>set('requestType',e.target.value)}><option value="standing">Standing</option><option value="ad_hoc">Ad-Hoc</option><option value="dynamic_retask">Dynamic Retask</option></select></label>
      <label>Priority<select disabled={!editable} value={draft.priority || 3} onChange={e=>set('priority',e.target.value)}><option value="1">1 — Life safety / time critical</option><option value="2">2 — High operational value</option><option value="3">3 — Routine</option></select></label>
      <label>Customer<input disabled={!editable} value={draft.customer || ''} onChange={e=>set('customer',e.target.value)}/></label>
      <label className="wide">Decision to support<textarea disabled={!editable} value={draft.decisionToSupport || ''} onChange={e=>set('decisionToSupport',e.target.value)} placeholder="What decision will this information support?"/></label>
      <label>WHAT<textarea disabled={!editable} value={draft.what || ''} onChange={e=>set('what',e.target.value)} placeholder="Activity, condition, or indicator to report"/></label>
      <label>WHERE<textarea disabled={!editable} value={draft.where || ''} onChange={e=>set('where',e.target.value)} placeholder="NAI, coordinates, or defined collection area"/></label>
      <label>WHEN<textarea disabled={!editable} value={draft.when || ''} onChange={e=>set('when',e.target.value)} placeholder="Collection window and latest time of value"/></label>
      <label>WHY<textarea disabled={!editable} value={draft.why || ''} onChange={e=>set('why',e.target.value)} placeholder="Operational justification"/></label>
      <label>WHO<input disabled={!editable} value={draft.who || ''} onChange={e=>set('who',e.target.value)}/></label>
      <label>NAI / Collection Area<input disabled={!editable} value={draft.nai || ''} onChange={e=>set('nai',e.target.value)}/></label>
      <label>PIR / Decision Link<input disabled={!editable} value={draft.pir || ''} onChange={e=>set('pir',e.target.value)}/></label>
      <label className="wide">Required effect / capability<textarea disabled={!editable} value={draft.requiredEffect || ''} onChange={e=>set('requiredEffect',e.target.value)} placeholder="Request the effect or capability, not a platform"/></label>
      <label>Platform named by customer<input disabled={!editable} value={draft.requestedPlatform || ''} onChange={e=>set('requestedPlatform',e.target.value)} placeholder="Leave blank unless customer explicitly named one"/></label>
      <label>Organic asset suitability<textarea disabled={!editable} value={draft.organicSuitability || ''} onChange={e=>set('organicSuitability',e.target.value)} placeholder="Which available effects could satisfy this requirement?"/></label>
      <label className="wide">EEIs — one per line<textarea className="tall" disabled={!editable} value={(draft.eeis || []).join('\n')} onChange={e=>setEeis(e.target.value)} placeholder="Each EEI should be specific, observable, and tied to the decision."/></label>
      <label className="wide">Dissemination method and verification<textarea disabled={!editable} value={draft.disseminationMethod || ''} onChange={e=>set('disseminationMethod',e.target.value)} placeholder="How will the customer receive the information, and how will receipt be verified?"/></label>
      <label>Alternate source<textarea disabled={!editable} value={draft.alternateSource || ''} onChange={e=>set('alternateSource',e.target.value)} placeholder="Existing imagery, partner source, public data, etc."/></label>
      <label>Duplicate status<select disabled={!editable} value={draft.duplicateStatus || 'unknown'} onChange={e=>set('duplicateStatus',e.target.value)}><option value="unknown">Unknown</option><option value="unique">Unique</option><option value="possible_overlap">Possible overlap</option><option value="duplicate">Duplicate</option></select></label>
    </div>

    <div className="requirement-checks">
      <label><input type="checkbox" disabled={!editable} checked={Boolean(draft.existingSourceCheck)} onChange={e=>set('existingSourceCheck',e.target.checked)}/> Existing-source check completed</label>
      <label><input type="checkbox" disabled={!editable} checked={Boolean(draft.oversightFlag)} onChange={e=>set('oversightFlag',e.target.checked)}/> Potential Intelligence Oversight concern flagged</label>
    </div>

    <div className="validation-grid">
      {Object.entries(requirement.validation || {}).map(([key,value])=><div key={key} className={value?'validation-pass':'validation-fail'}><span>{key.replaceAll('_',' ')}</span><strong>{value?'PASS':'OPEN'}</strong></div>)}
    </div>
    {requirement.missingFields?.length>0 && <div className="missing-strip"><strong>Still needed:</strong> {requirement.missingFields.join(' · ')}</div>}

    {editable && <div className="requirement-actions">
      <button className="ghost-button" onClick={save}>Save Draft</button>
      <button className="ghost-button" onClick={()=>{save(); setTimeout(()=>onValidate(requirement.id),0)}}>Validate Requirement</button>
      <button className="primary-button small" disabled={requirement.status!=='taskable'} onClick={()=>onSendForward(requirement.id)}>Send Forward</button>
    </div>}
  </section>
}

export default function Requirements({ role, missionState, onUpdateRequirement, onValidateRequirement, onSendForward, onAddRequirement }) {
  const requirements = missionState.requirements?.items || []
  const [selectedId, setSelectedId] = useState(requirements[0]?.id)
  const [filter, setFilter] = useState('all')
  const [showNew, setShowNew] = useState(false)
  const selected = requirements.find(r=>r.id===selectedId) || requirements[0]
  const filtered = useMemo(()=>requirements.filter(r=>filter==='all'||r.status===filter),[requirements,filter])
  const counts = {
    total: requirements.length,
    taskable: requirements.filter(r=>r.status==='taskable'||r.status==='sent_forward').length,
    clarification: requirements.filter(r=>r.status==='needs_clarification').length,
    oversight: requirements.filter(r=>r.oversightFlag).length,
  }

  return <div className="requirements-workspace">
    <section className="panel requirements-header">
      <div><span className="eyebrow">Collection Management</span><h3>Requirements and EEIs</h3><p>Receive, validate, refine, source, and send decision-supporting requirements forward.</p></div>
      <div className="requirements-metrics"><div><span>Total</span><strong>{counts.total}</strong></div><div><span>Taskable</span><strong>{counts.taskable}</strong></div><div><span>Clarification</span><strong>{counts.clarification}</strong></div><div><span>Oversight Flags</span><strong>{counts.oversight}</strong></div></div>
    </section>

    <div className="requirements-main-grid">
      <section className="panel requirement-queue">
        <div className="panel-heading"><h3>Requirement Queue</h3>{role==='collection_manager'&&<button className="ghost-button" onClick={()=>setShowNew(!showNew)}>+ New Requirement</button>}</div>
        <div className="filter-row"><button className={filter==='all'?'active':''} onClick={()=>setFilter('all')}>All</button><button className={filter==='needs_clarification'?'active':''} onClick={()=>setFilter('needs_clarification')}>Needs Clarification</button><button className={filter==='taskable'?'active':''} onClick={()=>setFilter('taskable')}>Taskable</button></div>
        {showNew&&<NewRequirementForm onAdd={(payload)=>{onAddRequirement(payload);setShowNew(false)}}/>}
        <div className="queue-list">{filtered.map(req=><button key={req.id} className={`queue-card ${selected?.id===req.id?'selected':''}`} onClick={()=>setSelectedId(req.id)}><div><strong>{req.id.toUpperCase()} · {req.fire}</strong><span className={`chip ${req.status==='taskable'||req.status==='sent_forward'?'teal':'amber'}`}>{STATUS_LABELS[req.status]}</span></div><p>{req.title}</p><small>P{req.priority} · {req.requestType.replace('_',' ')} · {req.customer}</small></button>)}</div>
      </section>
      {selected&&<RequirementEditor requirement={selected} role={role} onUpdate={onUpdateRequirement} onValidate={onValidateRequirement} onSendForward={onSendForward}/>} 
    </div>

    <section className="panel collection-doctrine">
      <div className="panel-heading"><h3>Taskability Standard</h3><span className="chip slate">CONTROLLED WORKFLOW</span></div>
      <div className="doctrine-grid"><div><strong>Acceptable</strong><p>Necessary and reasonable given cost, risk, authority, and expected value.</p></div><div><strong>Feasible</strong><p>Can be accomplished with available effects, time, airspace, PAD, and dissemination architecture.</p></div><div><strong>Complete</strong><p>Includes what, where, when, why, who, decision to support, EEIs, and customer delivery path.</p></div><div><strong>Source Before Task</strong><p>Check existing information, organic assets, and alternate sources before requesting additional collection.</p></div></div>
    </section>
  </div>
}

function NewRequirementForm({onAdd}) {
  const [title,setTitle]=useState('')
  const [fire,setFire]=useState('Fire Alpha')
  const [customer,setCustomer]=useState('')
  return <div className="new-requirement"><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Requirement title"/><select value={fire} onChange={e=>setFire(e.target.value)}><option>Fire Alpha</option><option>Fire Bravo</option><option>Fire Charlie</option></select><input value={customer} onChange={e=>setCustomer(e.target.value)} placeholder="Customer / requestor"/><button className="primary-button small" disabled={!title||!customer} onClick={()=>onAdd({title,fire,customer,who:customer,requestType:'ad_hoc',priority:3,decisionToSupport:'',what:'',where:'',when:'',why:'',requiredEffect:'',requestedPlatform:'',nai:'',pir:'',eeis:[],disseminationMethod:'',existingSourceCheck:false,organicSuitability:'',alternateSource:'',duplicateStatus:'unknown',oversightFlag:false})}>Add</button></div>
}
