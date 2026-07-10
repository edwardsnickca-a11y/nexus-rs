import React, { useMemo, useState } from 'react'
import { ROLES } from '../data/roles.js'
import { PORTAL_SCENARIOS } from '../data/portalScenarios.js'
import { buildExerciseStatus } from '../engine/exerciseController.js'

const ROLE_COPY = {
  remote_sensing_coordinator: 'Sets regional priorities, allocates approved assets, and coordinates unmet needs.',
  remote_sensing_manager: 'Manages mission execution, sortie timing, retasking, and operational risk.',
  collection_manager: 'Develops, validates, prioritizes, and matches requirements to capabilities.',
  upad_lno: 'Manages processing, assessment, production, dissemination, and customer verification.',
}

const LIFECYCLE = [
  ['Not Started', 'Choose the scenario and role, then review readiness.'],
  ['Active Operational Period 1', 'Execute current operations and begin tomorrow planning.'],
  ['Transition Planning', 'Carry unresolved requirements, products, and risks forward.'],
  ['Active Operational Period 2', 'Execute the approved plan with preserved mission history.'],
  ['Ended', 'Freeze the final state and review the After-Action Review.'],
]

export default function MissionPortal({
  missionState,
  selectedRole,
  onSelectRole,
  onOpenBrief,
  onStart,
  onResume,
  onReviewAar,
}) {
  const status = buildExerciseStatus(missionState)
  const [selectedScenarioId, setSelectedScenarioId] = useState(PORTAL_SCENARIOS[0].id)
  const selectedScenario = useMemo(
    () => PORTAL_SCENARIOS.find((scenario) => scenario.id === selectedScenarioId) || PORTAL_SCENARIOS[0],
    [selectedScenarioId],
  )

  const active = ['active_op1', 'transition_to_op2', 'active_op2'].includes(status.status)
  const ended = status.status === 'ended'
  const roleReady = Boolean(selectedRole)
  const briefReviewed = Boolean(missionState.exercise?.scenarioId)
  const readyForStart = roleReady && Boolean(selectedScenario)
  const selectedRoleRecord = ROLES.find((role) => role.id === selectedRole)

  const primaryAction = active
    ? { label: 'Resume Exercise', action: onResume }
    : ended
      ? { label: 'Review AAR', action: onReviewAar }
      : { label: 'Start Exercise', action: onStart, disabled: !readyForStart }

  return <div className="portal-page">
    <section className="portal-hero-grid">
      <article className={`portal-hero portal-image-${selectedScenario.imageClass}`}>
        <div className="portal-hero-overlay" />
        <div className="portal-hero-content">
          <span className="portal-kicker">Selected Scenario</span>
          <h1>{selectedScenario.title}</h1>
          <div className="portal-location">{selectedScenario.location}</div>
          <p>{selectedScenario.summary}</p>
          <div className="portal-meta-grid">
            <div><span>Operational Periods</span><strong>{selectedScenario.periods}</strong></div>
            <div><span>Complexity</span><strong>{selectedScenario.complexity}</strong></div>
            <div><span>Duration</span><strong>{selectedScenario.duration}</strong></div>
            <div><span>Last Updated</span><strong>{selectedScenario.lastUpdated}</strong></div>
          </div>
        </div>
      </article>

      <aside className="portal-readiness">
        <div className="portal-section-heading">
          <div><span>Mission Readiness</span><h2>Exercise setup</h2></div>
          <span className="portal-status-pill">{status.label}</span>
        </div>
        <dl className="readiness-summary">
          <div><dt>Scenario</dt><dd>{selectedScenario.title}</dd></div>
          <div><dt>Role</dt><dd>{selectedRoleRecord?.name || 'Not selected'}</dd></div>
          <div><dt>Operational Periods</dt><dd>{selectedScenario.periods}</dd></div>
          <div><dt>Asset Package</dt><dd>{selectedScenario.assetPackage}</dd></div>
          <div><dt>Partner Agencies</dt><dd>{selectedScenario.partners}</dd></div>
          <div><dt>Exercise Status</dt><dd>{status.label}</dd></div>
        </dl>
        <div className="readiness-checklist">
          <div className="ready"><span>✓</span> Scenario selected</div>
          <div className={roleReady ? 'ready' : ''}><span>{roleReady ? '✓' : '—'}</span> Role selected</div>
          <div className={briefReviewed ? 'ready' : ''}><span>{briefReviewed ? '✓' : '—'}</span> Scenario brief reviewed</div>
          <div className={readyForStart ? 'ready' : ''}><span>{readyForStart ? '✓' : '—'}</span> Ready for STARTEX</div>
        </div>
        <div className="portal-cta-stack">
          <button className="primary portal-primary" disabled={primaryAction.disabled} onClick={primaryAction.action}>{primaryAction.label}</button>
          {!ended && <button className="ghost" onClick={onOpenBrief}>View Scenario Brief</button>}
        </div>
        <div className="resume-block">
          <span>Existing Exercise</span>
          <strong>{active ? `${status.label} · Turn ${status.turnNumber}` : 'No active exercise'}</strong>
        </div>
      </aside>
    </section>

    <section className="portal-section">
      <div className="portal-section-heading">
        <div><span>Step 2</span><h2>Choose your role</h2></div>
        <p>The selected role controls workspace emphasis, authority checks, advisor context, and AAR criteria.</p>
      </div>
      <div className="portal-role-grid">
        {ROLES.map((role) => <button
          type="button"
          key={role.id}
          className={`portal-role-card ${selectedRole === role.id ? 'selected' : ''}`}
          onClick={() => onSelectRole(role.id)}
        >
          <span className="role-select-indicator">{selectedRole === role.id ? 'Selected' : 'Select role'}</span>
          <strong>{role.name}</strong>
          <p>{ROLE_COPY[role.id]}</p>
          <small>{role.authorityLabel}</small>
        </button>)}
      </div>
    </section>

    <section className="portal-section">
      <div className="portal-section-heading">
        <div><span>Step 1</span><h2>Choose a scenario</h2></div>
        <p>Selecting a card updates the mission overview and readiness summary.</p>
      </div>
      <div className="scenario-card-grid">
        {PORTAL_SCENARIOS.map((scenario) => <button
          type="button"
          key={scenario.id}
          className={`scenario-card ${selectedScenarioId === scenario.id ? 'selected' : ''}`}
          onClick={() => setSelectedScenarioId(scenario.id)}
        >
          <div className={`scenario-thumb portal-image-${scenario.imageClass}`}><span>{scenario.status}</span></div>
          <div className="scenario-card-body">
            <strong>{scenario.title}</strong>
            <p>{scenario.type} · {scenario.location}</p>
            <small>{scenario.complexity} complexity · {scenario.periods} operational periods</small>
          </div>
        </button>)}
      </div>
    </section>

    <section className="portal-section lifecycle-section">
      <div className="portal-section-heading">
        <div><span>Exercise Lifecycle</span><h2>From setup to review</h2></div>
      </div>
      <div className="portal-lifecycle-strip">
        {LIFECYCLE.map(([label, detail], index) => <div key={label} className={index === 0 ? 'current' : ''}>
          <span>{index + 1}</span><strong>{label}</strong><p>{detail}</p>
        </div>)}
      </div>
    </section>

    <section className="portal-quick-links">
      {['Scenario Brief', 'Role Reference', 'System Status', 'User Guide', 'Help & Support', 'Provide Feedback'].map((item) =>
        <button type="button" key={item} onClick={item === 'Scenario Brief' ? onOpenBrief : undefined}>{item}<span>→</span></button>)}
    </section>
  </div>
}
