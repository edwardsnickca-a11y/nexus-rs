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

const CLARIFY_Q = {
  'decision to support': 'What decision will this information support?',
  where: 'What exact area, NAI, coordinates, or boundary should be collected?',
  when: 'What is the required collection window or latest time of value?',
  eeis: 'What specific observable information must the product answer?',
  what: 'What activity, condition, or indicator must be reported?',
  why: 'What is the operational justification for this requirement?',
  who: 'Who is the requesting customer or supported decision-maker?',
}
const questionFor = field => CLARIFY_Q[String(field).toLowerCase()] || `Please clarify: ${field}.`
const questionsFor = fields => (fields || []).map(field => ({ field, q: questionFor(field) }))

// ---------------------------------------------------------------- Center: editor

function RequirementEditor({ requirement, role, readOnly, onUpdate, onValidate, onSendForward, onRequestClarification }) {
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
    alternateSource: draft.alternateSource, duplicateStatus: draft.duplicateStatus, oversightFlag: draft.oversightFlag,
  })

  const missing = requirement.missingFields || []

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

    {requirement.status === 'needs_clarification' && <div className="clarification-banner">
      <div>
        <strong>NEEDS CLARIFICATION</strong>
        <p>Missing: {missing.length ? missing.join(' · ') : 'Requirement is incomplete for tasking.'}</p>
      </div>
      {editable && <button className="primary-button small" onClick={() => onRequestClarification()}>REQUEST CLARIFICATION</button>}
    </div>}

    {requirement.status === 'clarification_requested' && <div className="clarification-banner pending">
      <div><strong>CLARIFICATION REQUESTED</strong><p>Awaiting customer response. See the clarification panel for the drafted request.</p></div>
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
    {missing.length>0 && <div className="missing-strip"><strong>Still needed:</strong> {missing.join(' · ')}</div>}

    {editable && <div className="requirement-actions">
      <button className="ghost-button" onClick={save}>Save Draft</button>
      <button className="ghost-button" onClick={()=>{save(); setTimeout(()=>onValidate(requirement.id),0)}}>Validate Requirement</button>
      <button className="primary-button small" disabled={requirement.status!=='taskable'} onClick={()=>onSendForward(requirement.id)}>Send Forward</button>
    </div>}
  </section>
}

// ---------------------------------------------------------------- Right: context + clarification

function ContextPanel({ requirement, role, readOnly, composerOpen, setComposerOpen, onRequestClarification, onAskAdvisor }) {
  const canRequest = role === 'collection_manager' && !readOnly
  const missing = requirement.missingFields || []
  const questions = questionsFor(missing)
  const log = requirement.clarificationLog || []

  const defaultMessage = useMemo(() => {
    const lines = questions.map(({ q }) => `- ${q}`)
    return `Clarification requested for ${requirement.id.toUpperCase()} (${requirement.fire}).\n\n${lines.join('\n') || 'Please provide additional detail so this requirement can be developed to a taskable standard.'}`
  }, [requirement.id, requirement.fire, missing.join('|')])

  const [message, setMessage] = useState(defaultMessage)
  React.useEffect(() => { setMessage(defaultMessage) }, [defaultMessage])

  const submitClarification = () => {
    onRequestClarification(requirement.id, {
      missingFields: missing,
      message: message.trim(),
      requestedAt: 'CURRENT LOCAL',
      requestedBy: role,
      status: 'clarification_requested',
    })
    setComposerOpen(false)
  }

  const askAdvisor = () => {
    const text = `Advisor, I need your read on requirement ${requirement.id.toUpperCase()} (${requirement.fire}). ` +
      `Title: "${requirement.title || 'untitled'}". Current status: ${STATUS_LABELS[requirement.status] || requirement.status}. ` +
      `Decision to support: ${requirement.decisionToSupport || 'not yet defined'}. ` +
      `Missing: ${missing.join(', ') || 'none'}. ` +
      `As ${role.replaceAll('_', ' ')}, what clarification or sourcing should I pursue before this is taskable?`
    onAskAdvisor(text)
  }

  return <aside className="panel requirement-context-panel">
    <div className="panel-heading"><h3>Clarification &amp; Source</h3></div>

    <section className="request-origin">
      <span className="context-label">Request origin</span>
      <dl>
        <div><dt>Customer</dt><dd>{requirement.customer || 'Not recorded'}</dd></div>
        <div><dt>Requesting org</dt><dd>{requirement.requestingOrg || requirement.who || 'Not recorded'}</dd></div>
        <div><dt>Incident</dt><dd>{requirement.fire || 'Not recorded'}</dd></div>
        <div><dt>Received</dt><dd>{requirement.receivedAt || 'Not recorded'}</dd></div>
      </dl>
      {requirement.originalRequest && <p className="original-request">&ldquo;{requirement.originalRequest}&rdquo;</p>}
    </section>

    <section className="clarification-missing-list">
      <span className="context-label">Missing information</span>
      {missing.length
        ? <ul>{missing.map(f => <li key={f}>{f}</li>)}</ul>
        : <p className="context-empty">Nothing outstanding &mdash; requirement is complete.</p>}
    </section>

    {questions.length > 0 && <section className="clarification-question-list">
      <span className="context-label">Suggested clarification questions</span>
      <ul>{questions.map(({ field, q }) => <li key={field}><strong>{field}</strong><span>{q}</span></li>)}</ul>
    </section>}

    <section className="clarification-actions">
      <button className="primary-button small" disabled={!canRequest} onClick={() => setComposerOpen(v => !v)}>
        {composerOpen ? 'CLOSE' : 'REQUEST CLARIFICATION'}
      </button>
      <button className="secondary-button" onClick={askAdvisor}>ASK ADVISOR</button>
    </section>

    {composerOpen && canRequest && <section className="clarification-composer">
      <span className="context-label">Draft clarification request</span>
      <textarea value={message} onChange={e => setMessage(e.target.value)} aria-label="Clarification message" />
      <div className="clarification-composer-actions">
        <button className="ghost-button" onClick={() => setComposerOpen(false)}>Cancel</button>
        <button className="primary-button small" disabled={!message.trim()} onClick={submitClarification}>Record Request</button>
      </div>
    </section>}

    <section className="clarification-history">
      <span className="context-label">Clarification history</span>
      {log.length
        ? log.map(entry => <div key={entry.id} className="clarification-history-item">
            <strong>{entry.requestedBy ? entry.requestedBy.replaceAll('_', ' ') : 'Requested'} · {entry.requestedAt || 'earlier'}</strong>
            {entry.missingFields?.length ? <small>{entry.missingFields.join(' · ')}</small> : null}
            {entry.message ? <p>{entry.message}</p> : null}
            {entry.response ? <p className="clarification-response">Response: {entry.response}</p> : null}
          </div>)
        : <p className="context-empty">No clarification activity recorded.</p>}
    </section>
  </aside>
}

// ---------------------------------------------------------------- Left: queue + main

export default function Requirements({ role, missionState, readOnly, onUpdateRequirement, onValidateRequirement, onSendForward, onAddRequirement, onRequestClarification, onAskAdvisor }) {
  const requirements = missionState.requirements?.items || []
  const [selectedId, setSelectedId] = useState(requirements[0]?.id)
  const [filter, setFilter] = useState('all')
  const [showNew, setShowNew] = useState(false)
  const [composerOpen, setComposerOpen] = useState(false)
  const selected = requirements.find(r => r.id === selectedId) || requirements[0]
  const filtered = useMemo(() => requirements.filter(r => filter === 'all' || r.status === filter), [requirements, filter])
  const counts = {
    total: requirements.length,
    taskable: requirements.filter(r => isPositive(r.status)).length,
    clarification: requirements.filter(r => r.status === 'needs_clarification' || r.status === 'clarification_requested').length,
    oversight: requirements.filter(r => r.oversightFlag).length,
  }

  React.useEffect(() => { setComposerOpen(false) }, [selectedId])

  return <div className="requirements-workspace">
    <section className="panel requirements-header">
      <div><span className="eyebrow">Collection Management</span><h3>Requirements and EEIs</h3><p>Receive, validate, refine, source, and send decision-supporting requirements forward.</p></div>
      <div className="requirements-metrics"><div><span>Total</span><strong>{counts.total}</strong></div><div><span>Taskable</span><strong>{counts.taskable}</strong></div><div><span>Clarification</span><strong>{counts.clarification}</strong></div><div><span>Oversight Flags</span><strong>{counts.oversight}</strong></div></div>
    </section>

    <div className="requirements-main-grid">
      <section className="panel requirement-queue">
        <div className="panel-heading"><h3>Requirement Queue</h3>{role === 'collection_manager' && !readOnly && <button className="ghost-button" onClick={() => setShowNew(!showNew)}>+ New Requirement</button>}</div>
        <div className="filter-row">
          <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All</button>
          <button className={filter === 'needs_clarification' ? 'active' : ''} onClick={() => setFilter('needs_clarification')}>Needs Clarification</button>
          <button className={filter === 'taskable' ? 'active' : ''} onClick={() => setFilter('taskable')}>Taskable</button>
          <button className={filter === 'sent_forward' ? 'active' : ''} onClick={() => setFilter('sent_forward')}>Sent Forward</button>
        </div>
        {showNew && <NewRequirementForm onAdd={(payload) => { onAddRequirement(payload); setShowNew(false) }} />}
        <div className="queue-list">{filtered.map(req => <button key={req.id} className={`queue-card ${selected?.id === req.id ? 'selected' : ''}`} onClick={() => setSelectedId(req.id)}>
          <div><strong>{req.id.toUpperCase()} · {req.fire}</strong><span className={`chip ${isPositive(req.status) ? 'teal' : 'amber'}`}>{STATUS_LABELS[req.status] || req.status}</span></div>
          <p>{req.title}</p>
          <small>P{req.priority} · {req.requestType.replace('_', ' ')} · {req.customer}</small>
        </button>)}
        {filtered.length === 0 && <p className="context-empty">No requirements in this view.</p>}
        </div>
      </section>

      {selected && <RequirementEditor requirement={selected} role={role} readOnly={readOnly} onUpdate={onUpdateRequirement} onValidate={onValidateRequirement} onSendForward={onSendForward} onRequestClarification={() => setComposerOpen(true)} />}

      {selected && <ContextPanel requirement={selected} role={role} readOnly={readOnly} composerOpen={composerOpen} setComposerOpen={setComposerOpen} onRequestClarification={onRequestClarification} onAskAdvisor={onAskAdvisor} />}
    </div>

    <section className="panel collection-doctrine">
      <div className="panel-heading"><h3>Taskability Standard</h3><span className="chip slate">CONTROLLED WORKFLOW</span></div>
      <div className="doctrine-grid"><div><strong>Acceptable</strong><p>Necessary and reasonable given cost, risk, authority, and expected value.</p></div><div><strong>Feasible</strong><p>Can be accomplished with available effects, time, airspace, PAD, and dissemination architecture.</p></div><div><strong>Complete</strong><p>Includes what, where, when, why, who, decision to support, EEIs, and customer delivery path.</p></div><div><strong>Source Before Task</strong><p>Check existing information, organic assets, and alternate sources before requesting additional collection.</p></div></div>
    </section>
  </div>
}

function NewRequirementForm({ onAdd }) {
  const [title, setTitle] = useState('')
  const [fire, setFire] = useState('Fire Alpha')
  const [customer, setCustomer] = useState('')
  return <div className="new-requirement"><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Requirement title"/><select value={fire} onChange={e=>setFire(e.target.value)}><option>Fire Alpha</option><option>Fire Bravo</option><option>Fire Charlie</option></select><input value={customer} onChange={e=>setCustomer(e.target.value)} placeholder="Customer / requestor"/><button className="primary-button small" disabled={!title||!customer} onClick={()=>onAdd({title,fire,customer,who:customer,requestType:'ad_hoc',priority:3,decisionToSupport:'',what:'',where:'',when:'',why:'',requiredEffect:'',requestedPlatform:'',nai:'',pir:'',eeis:[],disseminationMethod:'',existingSourceCheck:false,organicSuitability:'',alternateSource:'',duplicateStatus:'unknown',oversightFlag:false})}>Add</button></div>
}
