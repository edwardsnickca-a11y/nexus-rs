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

const INCIDENT_FILTERS = ['All', 'Wildfire', 'Hurricane', 'Flood', 'Earthquake', 'Planned Event', 'Custom']

function incidentCategory(scenario) {
  const type = `${scenario.type} ${scenario.title}`.toLowerCase()
  if (type.includes('wildfire')) return 'Wildfire'
  if (type.includes('hurricane') || type.includes('storm')) return 'Hurricane'
  if (type.includes('flood')) return 'Flood'
  if (type.includes('earthquake')) return 'Earthquake'
  if (type.includes('event')) return 'Planned Event'
  return 'Custom'
}

function ScenarioCard({ scenario, selected, onSelect }) {
  return <button
    type="button"
    className={`eoc-rs-scenario-card ${selected ? 'selected' : ''}`}
    onClick={() => onSelect(scenario.id)}
  >
    <div className={`eoc-rs-scenario-image portal-image-${scenario.imageClass}`}>
      <span className="scenario-type-chip">{incidentCategory(scenario)}</span>
      {selected && <span className="selected-scenario-badge">Selected</span>}
    </div>
    <div className="eoc-rs-scenario-body">
      <div>
        <h3>{scenario.title}</h3>
        <p>{scenario.summary}</p>
      </div>
      <div className="scenario-card-metadata">
        <span>{scenario.location}</span>
        <span>{scenario.complexity} complexity</span>
        <span>{scenario.periods} operational periods</span>
        <span>{scenario.status}</span>
      </div>
    </div>
  </button>
}

function RoleCard({ role, selected, disabled, onSelect }) {
  return <button
    type="button"
    className={`eoc-rs-role-card ${selected ? 'selected' : ''}`}
    disabled={disabled}
    onClick={() => onSelect(role.id)}
  >
    <span>{selected ? 'Selected' : disabled ? 'Select scenario first' : 'Select role'}</span>
    <strong>{role.name}</strong>
    <p>{ROLE_COPY[role.id]}</p>
  </button>
}

export default function MissionPortal({
  missionState,
  selectedRole,
  onSelectRole,
  onSelectScenario,
  onOpenBrief,
  onStart,
  onResume,
  onReviewAar,
}) {
  const status = buildExerciseStatus(missionState)
  const activeScenarioId = missionState.exercise?.scenarioId
  const initialScenarioId = PORTAL_SCENARIOS.some((scenario) => scenario.id === activeScenarioId)
    ? activeScenarioId
    : null

  const [selectedScenarioId, setSelectedScenarioId] = useState(initialScenarioId)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All')

  const selectedScenario = useMemo(
    () => PORTAL_SCENARIOS.find((scenario) => scenario.id === selectedScenarioId) || null,
    [selectedScenarioId],
  )

  const filteredScenarios = useMemo(() => PORTAL_SCENARIOS.filter((scenario) => {
    const search = query.trim().toLowerCase()
    const matchesSearch = !search || [
      scenario.title,
      scenario.summary,
      scenario.location,
      scenario.type,
    ].some((value) => value.toLowerCase().includes(search))
    const matchesFilter = filter === 'All' || incidentCategory(scenario) === filter
    return matchesSearch && matchesFilter
  }), [query, filter])

  const active = ['active_op1', 'transition_to_op2', 'active_op2'].includes(status.status)
  const ended = status.status === 'ended'
  const roleReady = Boolean(selectedRole)
  const scenarioReady = Boolean(selectedScenario)
  const briefReviewed = Boolean(
    selectedScenario && missionState.exercise?.scenarioId === selectedScenario.id,
  )
  const readyForStart = scenarioReady && roleReady
  const selectedRoleRecord = ROLES.find((role) => role.id === selectedRole)

  function selectScenario(scenarioId) {
    setSelectedScenarioId(scenarioId)
    onSelectScenario?.(PORTAL_SCENARIOS.find((scenario) => scenario.id === scenarioId))
  }

  function startSelectedExercise() {
    if (!readyForStart) return
    onStart?.(selectedScenario)
  }

  function openSelectedBrief() {
    if (!selectedScenario) return
    onOpenBrief?.(selectedScenario)
  }

  const primaryAction = active
    ? { label: 'Resume Exercise', action: onResume }
    : ended
      ? { label: 'Review AAR', action: onReviewAar }
      : { label: 'Start Exercise', action: startSelectedExercise, disabled: !readyForStart }

  return <div className="eoc-rs-start-page">
    <header className="eoc-rs-start-heading">
      <div>
        <span>Mission Portal</span>
        <h1>Start Exercise</h1>
        <p>Select a remote-sensing scenario, choose the role you will play, review mission readiness, and begin STARTEX.</p>
      </div>
      <div className="exercise-sequence" aria-label="Exercise setup sequence">
        <span className={scenarioReady ? 'complete' : 'current'}>1 Scenario</span>
        <span className={roleReady ? 'complete' : scenarioReady ? 'current' : ''}>2 Role</span>
        <span className={readyForStart ? 'complete' : roleReady ? 'current' : ''}>3 Readiness</span>
        <span className={readyForStart ? 'current' : ''}>4 STARTEX</span>
      </div>
    </header>

    <div className="eoc-rs-start-layout">
      <div className="eoc-rs-start-main">
        <section className="eoc-rs-config-panel">
          <div className="eoc-rs-section-title">
            <div><span>Step 1</span><h2>Select scenario</h2></div>
            <p>Choose the incident environment that will drive requirements, asset demand, PCPAD workload, and coordination pressure.</p>
          </div>

          <div className="scenario-tools">
            <label>
              <span>Scenario search</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search scenarios, locations, or incident types..."
              />
            </label>
            <label>
              <span>Incident type</span>
              <select value={filter} onChange={(event) => setFilter(event.target.value)}>
                {INCIDENT_FILTERS.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
          </div>

          <div className="eoc-rs-scenario-grid">
            {filteredScenarios.map((scenario) => <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              selected={selectedScenarioId === scenario.id}
              onSelect={selectScenario}
            />)}
          </div>
          {!filteredScenarios.length && <div className="scenario-empty-state">No scenarios match the current search and filter.</div>}
        </section>

        <section className="eoc-rs-config-panel role-step-panel">
          <div className="eoc-rs-section-title">
            <div><span>Step 2</span><h2>Select role</h2></div>
            <p>The role controls authority checks, workspace emphasis, advisor context, editable actions, and AAR criteria.</p>
          </div>
          <div className="eoc-rs-role-grid">
            {ROLES.map((role) => <RoleCard
              key={role.id}
              role={role}
              selected={selectedRole === role.id}
              disabled={!scenarioReady || active || ended}
              onSelect={onSelectRole}
            />)}
          </div>
        </section>
      </div>

      <aside className="eoc-rs-readiness-panel">
        <div className="readiness-panel-header">
          <div><span>Step 3</span><h2>Mission Readiness</h2></div>
          <span className="portal-status-pill">{status.label}</span>
        </div>

        {selectedScenario ? <div className={`readiness-scenario-visual portal-image-${selectedScenario.imageClass}`}>
          <div>
            <span>Selected scenario</span>
            <strong>{selectedScenario.title}</strong>
            <small>{selectedScenario.location}</small>
          </div>
        </div> : <div className="readiness-scenario-placeholder">
          <span>No scenario selected</span>
          <p>Choose a scenario card to populate mission readiness.</p>
        </div>}

        <dl className="eoc-rs-readiness-summary">
          <div><dt>Scenario</dt><dd>{selectedScenario?.title || 'Not selected'}</dd></div>
          <div><dt>Role</dt><dd>{selectedRoleRecord?.name || 'Not selected'}</dd></div>
          <div><dt>Operational Periods</dt><dd>{selectedScenario?.periods || '—'}</dd></div>
          <div><dt>Asset Package</dt><dd>{selectedScenario?.assetPackage || '—'}</dd></div>
          <div><dt>Partner Agencies</dt><dd>{selectedScenario?.partners || '—'}</dd></div>
          <div><dt>Exercise Status</dt><dd>{status.label}</dd></div>
        </dl>

        <div className="eoc-rs-readiness-checklist">
          <div className={scenarioReady ? 'ready' : ''}><span>{scenarioReady ? '✓' : '—'}</span>Scenario selected</div>
          <div className={roleReady ? 'ready' : ''}><span>{roleReady ? '✓' : '—'}</span>Role selected</div>
          <div className={briefReviewed ? 'ready' : ''}><span>{briefReviewed ? '✓' : '—'}</span>Scenario brief reviewed</div>
          <div className={readyForStart ? 'ready' : ''}><span>{readyForStart ? '✓' : '—'}</span>Ready for STARTEX</div>
        </div>

        <div className="eoc-rs-readiness-actions">
          <button className="primary portal-primary" disabled={primaryAction.disabled} onClick={primaryAction.action}>
            {primaryAction.label}
          </button>
          {!ended && <button className="ghost" disabled={!scenarioReady} onClick={openSelectedBrief}>View Scenario Brief</button>}
        </div>

        <div className="resume-block">
          <span>Existing Exercise</span>
          <strong>{active ? `${status.label} · Turn ${status.turnNumber}` : ended ? 'Exercise ended · AAR available' : 'No active exercise'}</strong>
        </div>
      </aside>
    </div>
  </div>
}
