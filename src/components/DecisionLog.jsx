import { useMemo, useState } from 'react'
import { ROLES } from '../data/roles.js'

const TYPE_LABELS = {
  free_text_decision: 'Trainee Decision',
  coordination: 'Coordination',
  asset_release: 'Asset Release',
  asset_request: 'Asset Request',
  delivery_update: 'Delivery Update',
  receipt_verified: 'Receipt Verified',
  customer_feedback: 'Customer Feedback',
  requirement_update: 'Requirement Update',
  requirement_validation: 'Requirement Validation',
  requirement_forward: 'Requirement Forwarded',
  resource_use: 'Resource Use',
  oversight_update: 'Oversight Update',
  op_transition: 'Operational Period Transition',
}

export default function DecisionLog({ missionState, role }) {
  const [filter, setFilter] = useState('all')
  const selectedRole = ROLES.find((item) => item.id === role)
  const records = useMemo(() => {
    const list = [...(missionState.decisions || [])].reverse()
    return filter === 'all' ? list : list.filter((item) => item.type === filter)
  }, [missionState.decisions, filter])
  const types = [...new Set((missionState.decisions || []).map((item) => item.type))]

  return <div className="decision-log-layout">
    <section className="panel decision-summary-card">
      <div className="panel-head">
        <div><span className="eyebrow">Structured Mission Record</span><h3>Decision Log</h3></div>
        <span className="chip teal">{missionState.decisions?.length || 0} RECORDS</span>
      </div>
      <p className="muted-copy">Exact trainee text, interpreted action, role authority, mission consequences, and follow-up requirements are preserved here for the AAR.</p>
      <div className="decision-metrics">
        <div><span>Active Role</span><strong>{selectedRole?.shortName}</strong></div>
        <div><span>Operational Period</span><strong>{missionState.operationalPeriod}</strong></div>
        <div><span>Local Time Standard</span><strong>{missionState.incidentTimeZoneAbbreviation}</strong></div>
        <div><span>Authority Concerns</span><strong>{(missionState.decisions || []).filter((item)=>item.withinRoleAuthority===false).length}</strong></div>
      </div>
      <label className="field-label">Filter records
        <select value={filter} onChange={(event)=>setFilter(event.target.value)}>
          <option value="all">All decision types</option>
          {types.map((type)=><option value={type} key={type}>{TYPE_LABELS[type] || type}</option>)}
        </select>
      </label>
    </section>

    <section className="panel decision-records-panel">
      <div className="panel-head"><h3>Mission Decisions</h3><span className="chip slate">LOCAL INCIDENT TIME</span></div>
      {records.length === 0 ? <div className="empty-state"><strong>No decisions recorded yet.</strong><p>Submit a free-text decision to create the first structured record.</p></div> :
        <div className="decision-record-list">{records.map((item)=><article className="decision-record" key={item.id}>
          <div className="decision-record-head">
            <div><span className="eyebrow">{TYPE_LABELS[item.type] || item.type}</span><strong>{item.interpretedDecision || item.detail}</strong></div>
            <div className="record-meta"><span>{item.asOf || 'CURRENT LOCAL'}</span><span>{ROLES.find((r)=>r.id===item.role)?.shortName || item.role}</span></div>
          </div>
          {item.exactText && <div className="exact-text"><span>Exact trainee text</span><p>{item.exactText}</p></div>}
          <div className="record-grid">
            <div><span>Authority</span><strong className={item.withinRoleAuthority===false?'danger-text':'success-text'}>{item.withinRoleAuthority===false?'OUT OF AUTHORITY':'WITHIN ROLE'}</strong></div>
            <div><span>Immediate consequence</span><strong>{item.immediateConsequence || 'Recorded in mission state'}</strong></div>
            <div><span>Planning impact</span><strong>{item.planningImpact || 'No additional impact recorded'}</strong></div>
            <div><span>Required follow-up</span><strong>{item.requiredFollowUp || 'Continue mission coordination'}</strong></div>
          </div>
          {item.authorityConcern && <div className="authority-warning"><strong>Authority concern:</strong> {item.authorityConcern}</div>}
        </article>)}</div>}
    </section>
  </div>
}
