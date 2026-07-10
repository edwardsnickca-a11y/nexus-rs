import React, { useState } from 'react'
import { ROLES } from '../data/roles.js'

const ROLE_DETAILS = {
  remote_sensing_coordinator: {
    owns: ['Regional prioritization', 'Asset allocation within approved resources', 'Collection plan approval', 'State J3 coordination', 'Partner coordination'],
    inputs: ['Validated requirements', 'Current mission risk', 'State J3 allocation decisions', 'UPAD constraints'],
    outputs: ['Approved collection plan', 'Regional allocation decisions', 'Unmet need coordination', 'State J3 requests'],
    limitation: 'Does not own State-level allocation, direct sortie execution, requirement development, or UPAD production management.',
  },
  remote_sensing_manager: {
    owns: ['Mission execution', 'Sortie timing', 'Operational retasking discipline', 'Gain-loss assessment'],
    inputs: ['Approved collection plan', 'Taskable requirements', 'Asset availability', 'Airspace and timing constraints'],
    outputs: ['Execution updates', 'Retasking recommendations', 'Mission risk notifications'],
    limitation: 'Does not allocate state assets or approve regional collection plans.',
  },
  collection_manager: {
    owns: ['Requirement development', 'WHAT/WHERE/WHEN/WHY/WHO validation', 'PIR/EEI linkage', 'Effects-based capability matching'],
    inputs: ['Customer needs', 'Existing-source checks', 'Organic asset suitability', 'Oversight uncertainty'],
    outputs: ['Taskable requirements', 'Clarification requests', 'Requirement priorities', 'Collection result evaluation'],
    limitation: 'Does not command aircraft, approve missions, or manage UPAD production.',
  },
  upad_lno: {
    owns: ['Processing and assessment coordination', 'Production prioritization', 'Dissemination method', 'Customer receipt verification'],
    inputs: ['Collected data', 'Product deadlines', 'Dissemination constraints', 'Customer feedback'],
    outputs: ['Assessed products', 'Delivery status', 'Receipt verification', 'Remaining information gaps'],
    limitation: 'Does not approve collection missions, retask aircraft, or allocate assets.',
  },
}

export default function RoleSelection({ selectedRole, onSelectRole, onStart }) {
  const [draftRole, setDraftRole] = useState(selectedRole || '')
  const details = ROLE_DETAILS[draftRole]
  return <div className="lifecycle-shell">
    <section className="panel aar-hero">
      <div>
        <span className="eyebrow">Role Selection</span>
        <h2>Select one playable role before STARTEX</h2>
        <p>The selected role controls workspace emphasis, advisor context, authority assessment, editable behavior, and AAR criteria.</p>
      </div>
      <button className="primary small" disabled={!draftRole} onClick={() => { onSelectRole(draftRole); onStart?.() }}>Confirm Role</button>
    </section>

    <section className="role-grid role-grid-wide">
      {ROLES.map((role) => <button key={role.id} className={`role-card ${draftRole === role.id ? 'selected' : ''}`} onClick={() => setDraftRole(role.id)}>
        <strong>{role.name}</strong>
        <span>{role.emphasis}</span>
        <small>{role.authorityLabel}</small>
      </button>)}
    </section>

    {details && <section className="panel">
      <div className="panel-head"><div><span className="eyebrow">{ROLES.find((r)=>r.id===draftRole)?.name}</span><h3>Role authority and outputs</h3></div></div>
      <div className="role-detail-grid">
        <div><h4>Owns</h4><ul>{details.owns.map((x)=><li key={x}>{x}</li>)}</ul></div>
        <div><h4>Inputs received</h4><ul>{details.inputs.map((x)=><li key={x}>{x}</li>)}</ul></div>
        <div><h4>Outputs produced</h4><ul>{details.outputs.map((x)=><li key={x}>{x}</li>)}</ul></div>
        <div><h4>Key authority limitation</h4><p>{details.limitation}</p></div>
      </div>
    </section>}
  </div>
}
