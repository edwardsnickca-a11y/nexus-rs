import React, { useMemo, useState } from 'react'

const STATUS_LABELS = {
  needs_clarification: 'NEEDS CLARIFICATION',
  clarification_requested: 'CLARIFICATION REQUESTED',
  taskable: 'TASKABLE',
  sent_forward: 'SENT FORWARD',
  deferred: 'DEFERRED',
  not_taskable: 'NOT TASKABLE',
}

const isPositive = status => status === 'taskable' || status === 'sent_forward'

const roleAuthority = {
  collection_manager: 'EDIT / VALIDATE / SEND FORWARD',
  remote_sensing_manager: 'REVIEW / RECOMMEND',
  remote_sensing_coordinator: 'REGIONAL VISIBILITY / PRIORITY REVIEW',
  upad_lno: 'PRODUCTION IMPACT / READ ONLY',
}

function RequirementEditor({ requirement, role, readOnly, onUpdate, onValidate, onSendForward, onRequestClarification, missionState }) {
  const editable = role === 'collection_manager' && !readOnly
  const [draft, setDraft] = useState(requirement)
  const set = (key, value) => setDraft(prev => ({ ...prev, [key]: value }))
  const setEeis = value => set('eeis', value.split('\n').map(x => x.trim()).filter(Boolean))

  React.useEffect(() => setDraft(requirement), [requirement])

  const save = () => onUpdate(requirement.id, {
    title: draft.title, requestType: draft.requestType, priority: Number(draft.priority),
    customer: draft.customer, who: draft.who, decisionToSupport: draft.decisionToSupport,
    what: draft.what, where: draft.where, when: draft.when, why: draft.why,
    requiredEffect: draft.requiredEffect, requestedPlatform: draft.requestedPlatform,
    nai: draft.nai, pir: draft.pir, eeis: draft.eeis, disseminationMethod: draft.disseminationMethod,
    existingSourceCheck: draft.existingSourceCheck, organicSuitability: draft.organicSuitability,
    alternateSource: draft.alternateSource, oversightFlag: draft.oversightFlag,
  })

  const missing = requirement.missingFields || []
  const hasResponse = requirement.status === 'clarification_requested' && requirement.clarificationResponse

  return <section className="panel requirement-detail">
    <div className="requirement-header-meta">
      <div>
        <span className="eyebrow">Active Requirement</span>
        <h3>{requirement.id.toUpperCase()} · {requirement.fire}</h3>
      </div>
      <div className="requirement-header-tags">
        <span className={`chip ${isPositive(requirement.status) ? 'teal' : 'amber'}`}>{STATUS_LABELS[requirement.status] || requirement.status}</span>
        <span className="chip slate">P{requirement.priority}</span>
        <span className="requirement-customer">{requirement.customer || 'Customer TBD'}</span>
      </div>
    </div>

    {hasResponse && <div style={{background:'#0a1f2d',border:'1px solid #1b3c52',borderRadius:'9px',padding:'11px',marginBottom:'12px'}}>
      <span style={{display:'block',color:'#6f879a',fontSize:'9px',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:'8px'}}>Customer Response — {requirement.customerOrg || 'Customer'}</span>
      <p style={{margin:'0',color:'#d0dde7',fontSize:'11px',lineHeight:'1.5'}}>{requirement.clarificationResponse}</p>
    </div>}

    <div className="authority-note"><strong>{roleAuthority[role]}</strong><span>{editable ? 'Collection Manager owns requirement and EEI development.' : 'Fields are visible for coordination; changes belong to the Collection Manager.'}</span></div>

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
      <label>Organic asset suitability<textarea disabled={!editable} value={draft.organicSuitability || ''} onChange={e=>set('organicSuitability',e.target.value)} placeholder="Which available effects could satisfy this requirement?"/></label>
      <label className="wide">EEIs — one per line<textarea className="tall" disabled={!editable} value={(draft.eeis || []).join('\n')} onChange={e=>setEeis(e.target.value)} placeholder="Each EEI should be specific, observable, and tied to the decision."/></label>
      <label className="wide">Dissemination method and verification<textarea disabled={!editable} value={draft.disseminationMethod || ''} onChange={e=>set('disseminationMethod',e.target.value)} placeholder="How will the customer receive the information, and how will receipt be verified?"/></label>
      <label>Select asset<select disabled={!editable} value={draft.requestedPlatform || ''} onChange={e=>set('requestedPlatform',e.target.value)}><option value="">— Unassigned —</option>{missionState?.assetControl?.assets?.map(asset => {const label = asset.type === 'CAP' ? `${asset.identifier} · ${asset.assignment} (${asset.status})` : `${asset.callsign}-${asset.identifier.split('-')[1]} · ${asset.assignment} (${asset.status})`; return <option key={asset.id} value={asset.identifier}>{label}</option>})}</select></label>
      <label>Alternate source<textarea disabled={!editable} value={draft.alternateSource || ''} onChange={e=>set('alternateSource',e.target.value)} placeholder="Existing imagery, partner source, public data, etc."/></label>
    </div>

    <div className="requirement-checks">
      <label><input type="checkbox" disabled={!editable} checked={Boolean(draft.existingSourceCheck)} onChange={e=>set('existingSourceCheck',e.target.checked)}/> Existing-source check completed</label>
      <label><input type="checkbox" disabled={!editable} checked={Boolean(draft.oversightFlag)} onChange={e=>set('oversightFlag',e.target.checked)}/> Potential Intelligence Oversight concern flagged</label>
    </div>

    <div className="validation-grid">
      {Object.entries(requirement.validation || {}).map(([key,value])=><div key={key} className={value?'validation-pass':'validation-fail'}><span>{key.replaceAll('_',' ')}</span><strong>{value?'PASS':'OPEN'}</strong></div>)}
    </div>
    {missing.length>0 && <div className="missing-strip"><strong>Still needed:</strong> {missing.join(' · ')}</div>}

    {editable && <div className="requirement-actions">
      <button className="ghost-button" onClick={save}>Save Draft</button>
      <button className="ghost-button" onClick={()=>{save(); setTimeout(()=>onValidate(requirement.id),0)}}>Validate Requirement</button>
      <button className="primary-button small" disabled={requirement.status!=='taskable'} onClick={()=>onSendForward(requirement.id)}>Send Forward</button>
    </div>}

    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'12px',padding:'11px 13px',marginTop:'12px',borderRadius:'9px',border:'1px solid #7a591f',background:'rgba(161,105,28,.16)'}}>
      <div><strong style={{display:'block',color:'#f2c574',fontSize:'11px',letterSpacing:'.05em'}}>NEEDS CLARIFICATION</strong><span style={{color:'#e5c890',fontSize:'10px'}}>Missing: {missing.join(' · ')}</span></div>
      {editable && <button className="primary-button small" onClick={onRequestClarification} style={{whiteSpace:'nowrap'}}>REQUEST CLARIFICATION</button>}
    </div>
  </section>
}


function FieldReferenceGuide() {
  return <section className="panel field-reference-guide">
    <h4>Field Reference Guide</h4>
    <div className="field-reference-grid">
      <div><strong>WHAT</strong><p>Activity, condition, or indicator to report</p></div>
      <div><strong>WHERE</strong><p>NAI, coordinates, or defined collection area</p></div>
      <div><strong>WHEN</strong><p>Collection window and latest time of value</p></div>
      <div><strong>WHY</strong><p>Operational justification for requirement</p></div>
      <div><strong>Decision to Support</strong><p>What decision will this information support?</p></div>
      <div><strong>EEIs</strong><p>Specific, observable answers tied to decision</p></div>
    </div>
  </section>
}

function NewRequirementForm({ onAdd }) {
  const [title, setTitle] = useState('')
  const [fire, setFire] = useState('Fire Alpha')
  const [customer, setCustomer] = useState('')
  return <div className="new-requirement"><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Requirement title"/><select value={fire} onChange={e=>setFire(e.target.value)}><option>Fire Alpha</option><option>Fire Bravo</option><option>Fire Charlie</option></select><input value={customer} onChange={e=>setCustomer(e.target.value)} placeholder="Customer / requestor"/><button className="primary-button small" disabled={!title||!customer} onClick={()=>onAdd({title,fire,customer,who:customer,requestType:'ad_hoc',priority:3,decisionToSupport:'',what:'',where:'',when:'',why:'',requiredEffect:'',requestedPlatform:'',nai:'',pir:'',eeis:[],disseminationMethod:'',existingSourceCheck:false,organicSuitability:'',alternateSource:'',oversightFlag:false})}>Add</button></div>
}

export default function Requirements({ role, missionState, readOnly, onUpdateRequirement, onValidateRequirement, onSendForward, onAddRequirement, onRequestClarification, onAskAdvisor }) {
  const requirements = missionState.requirements?.items || []
  const [selectedId, setSelectedId] = useState(requirements[0]?.id)
  const [filter, setFilter] = useState('all')
  const [showNew, setShowNew] = useState(false)
  const selected = requirements.find(r => r.id === selectedId) || requirements[0]
  const filtered = useMemo(() => requirements.filter(r => filter === 'all' || r.status === filter), [requirements, filter])
  const counts = {
    total: requirements.length,
    taskable: requirements.filter(r => isPositive(r.status)).length,
    clarification: requirements.filter(r => r.status === 'needs_clarification' || r.status === 'clarification_requested').length,
    oversight: requirements.filter(r => r.oversightFlag).length,
  }

  return <div className="requirements-workspace">
    <section className="panel requirements-header">
      <div><span className="eyebrow">Collection Management</span><h3>Requirements and EEIs</h3><p>Receive, validate, refine, source, and send decision-supporting requirements forward.</p></div>
      <div className="requirements-metrics"><div><span>Total</span><strong>{counts.total}</strong></div><div><span>Taskable</span><strong>{counts.taskable}</strong></div><div><span>Clarification</span><strong>{counts.clarification}</strong></div><div><span>Oversight Flags</span><strong>{counts.oversight}</strong></div></div>
    </section>

    <div className="requirements-main-grid">
      <section className="panel requirement-queue">
        <div className="panel-heading" style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'10px'}}><h3>Requirement Queue</h3>{role === 'collection_manager' && !readOnly && <button className="ghost-button" onClick={() => setShowNew(!showNew)}>+ New Requirement</button>}</div>
        <div className="filter-row">
          <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All</button>
          <button className={filter === 'needs_clarification' ? 'active' : ''} onClick={() => setFilter('needs_clarification')}>Needs Clarification</button>
          <button className={filter === 'taskable' ? 'active' : ''} onClick={() => setFilter('taskable')}>Taskable</button>
          <button className={filter === 'sent_forward' ? 'active' : ''} onClick={() => setFilter('sent_forward')}>Sent Forward</button>
        </div>
        {showNew && <NewRequirementForm onAdd={(payload) => { onAddRequirement(payload); setShowNew(false) }} />}
        <div className="queue-list">{filtered.map(req => <button key={req.id} className={`queue-card ${selected?.id === req.id ? 'selected' : ''}`} onClick={() => setSelectedId(req.id)}>
          <div><strong>{req.id.toUpperCase()}</strong><span className={`chip ${isPositive(req.status) ? 'teal' : 'amber'}`}>{STATUS_LABELS[req.status] || req.status}</span></div>
          <div><small className="queue-card-fire">{req.fire}</small></div>
          <p>{req.title}</p>
          <small>P{req.priority} · {req.requestType.replace('_', ' ')}</small>
        </button>)}
        {filtered.length === 0 && <p className="context-empty">No requirements in this view.</p>}
        </div>
      </section>

      {selected && <RequirementEditor requirement={selected} role={role} readOnly={readOnly} onUpdate={onUpdateRequirement} onValidate={onValidateRequirement} onSendForward={onSendForward} onRequestClarification={() => onRequestClarification(selected.id, {missingFields: selected.missingFields, status: 'clarification_requested'})} missionState={missionState} />}
    </div>

    <FieldReferenceGuide />
  </div>
}
