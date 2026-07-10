import React from 'react'
import { ROLES } from '../data/roles.js'
import { buildExerciseStatus, scenarioBrief } from '../engine/exerciseController.js'

function StatusChip({ children }) {
  return <span className="status-chip teal">{children}</span>
}

export default function MissionPortal({ missionState, onOpenBrief, onOpenRoles, onStart, onResume, onReviewAar }) {
  const status = buildExerciseStatus(missionState)
  const scenario = scenarioBrief()
  const assets = missionState.assetControl?.assets || []
  const active = ['active_op1', 'transition_to_op2', 'active_op2'].includes(status.status)
  const ended = status.status === 'ended'
  const ready = status.status === 'ready'
  const notStarted = ['not_started', 'briefing', 'role_selection'].includes(status.status)

  return <div className="lifecycle-shell">
    <section className="panel mission-portal-hero">
      <div>
        <span className="eyebrow">Mission Portal</span>
        <h1>{scenario.name}</h1>
        <p className="lead">{scenario.description}</p>
      </div>
      <div className="portal-status">
        <StatusChip>{status.label}</StatusChip>
        <strong>{status.roleName}</strong>
        <span>{status.localIncidentTime} · Local incident time</span>
      </div>
    </section>

    <section className="portal-grid">
      <article className="panel">
        <div className="panel-head"><div><span className="eyebrow">Scenario</span><h3>Mission Overview</h3></div></div>
        <div className="detail-row"><span>Incident location</span><strong>{scenario.location}</strong></div>
        <div className="detail-row"><span>Exercise scope</span><strong>{scenario.scope}</strong></div>
        <div className="detail-row"><span>Operational periods</span><strong>{scenario.periods.join(' → ')}</strong></div>
        <div className="detail-row"><span>Objective</span><strong>{scenario.objective}</strong></div>
      </article>

      <article className="panel">
        <div className="panel-head"><div><span className="eyebrow">Available Roles</span><h3>Playable authorities</h3></div></div>
        <div className="compact-list">
          {ROLES.map((role) => <div key={role.id}><strong>{role.name}</strong><span>{role.authorityLabel}</span></div>)}
        </div>
      </article>

      <article className="panel">
        <div className="panel-head"><div><span className="eyebrow">Allocated Package</span><h3>STARTEX assets</h3></div></div>
        <div className="compact-list">
          {assets.map((asset) => <div key={asset.id}><strong>{asset.identifier}</strong><span>{asset.type} · {asset.status} · {asset.assignment}</span></div>)}
        </div>
      </article>

      <article className="panel">
        <div className="panel-head"><div><span className="eyebrow">Exercise Control</span><h3>Primary action</h3></div></div>
        <div className="portal-actions">
          {notStarted && <>
            <button className="primary" onClick={onOpenBrief}>Open Scenario Brief</button>
            <button className="ghost" onClick={onOpenRoles}>Select Role</button>
          </>}
          {ready && <button className="primary" onClick={onStart}>STARTEX</button>}
          {active && <button className="primary" onClick={onResume}>Resume Exercise</button>}
          {ended && <button className="primary" onClick={onReviewAar}>Review AAR</button>}
        </div>
        <p className="muted">Operational modules remain tied to lifecycle state. History remains accessible after ENDEX.</p>
      </article>
    </section>
  </div>
}
