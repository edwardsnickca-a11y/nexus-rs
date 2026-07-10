import React, { useMemo, useState } from 'react'
import { ROLES } from '../data/roles.js'
import { PORTAL_SCENARIOS } from '../data/portalScenarios.js'
import { buildExerciseStatus } from '../engine/exerciseController.js'

const ROLE_FOCUS = {
  remote_sensing_coordinator: 'Sets regional priorities, allocates approved assets, approves the collection plan, and coordinates unmet needs through State J3 and partner organizations.',
  remote_sensing_manager: 'Manages approved mission execution, sortie timing, operational retasking, and gain-loss assessment.',
  collection_manager: 'Develops, validates, prioritizes, and matches collection requirements to available effects and capabilities.',
  upad_lno: 'Manages processing, assessment, product prioritization, dissemination, customer verification, and remaining information gaps.',
}

const INCIDENT_FILTERS = ['All', 'Wildfire', 'Hurricane', 'Flood', 'Earthquake', 'Planned Event', 'Custom']
const OPERATIONAL_CONTEXTS = [
  'State-Led Multi-Incident Response',
  'Regional Coordination Mission',
  'Single-Incident Support',
  'Planned Event Support',
]
const EXERCISE_FOCUSES = [
  'Full Mission Cycle',
  'Requirements and Collection Management',
  'Asset Allocation and Mission Execution',
  'Processing, Assessment, and Dissemination',
  'Operational Period Transition',
]

function incidentCategory(scenario) {
  const type = `${scenario.type} ${scenario.title}`.toLowerCase()
  if (type.includes('wildfire')) return 'Wildfire'
  if (type.includes('hurricane') || type.includes('storm')) return 'Hurricane'
  if (type.includes('flood')) return 'Flood'
  if (type.includes('earthquake')) return 'Earthquake'
  if (type.includes('event')) return 'Planned Event'
  return 'Custom'
}

function defaultOperationalContext(scenario) {
  const category = scenario ? incidentCategory(scenario) : ''
  if (category === 'Planned Event') return 'Planned Event Support'
  if (category === 'Custom') return 'Regional Coordination Mission'
  return 'State-Led Multi-Incident Response'
}

function ScenarioCard({ scenario, selected, onSelect }) {
  return <button
    type="button"
    className={`eoc-rs-scenario-card ${selected ? 'selected' : ''}`}
    onClick={() => onSelect(scenario.id)}
  >
    <div className="eoc-rs-scenario-image">
      <img src={scenario.image} alt={`${scenario.title} scenario`} />
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
  const [filter, setFilter] = useState('All')
  const [participantName, setParticipantName] = useState(missionState.exercise?.participantName || '')
  const [operationalContext, setOperationalContext] = useState('State-Led Multi-Incident Response')
  const [exerciseFocus, setExerciseFocus] = useState('Full Mission Cycle')

  const selectedScenario = useMemo(
    () => PORTAL_SCENARIOS.find((scenario) => scenario.id === selectedScenarioId) || null,
    [selectedScenarioId],
  )

  const filteredScenarios = useMemo(
    () => PORTAL_SCENARIOS.filter(
      (scenario) => filter === 'All' || incidentCategory(scenario) === filter,
    ),
    [filter],
  )

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
    const scenario = PORTAL_SCENARIOS.find((item) => item.id === scenarioId)
    setSelectedScenarioId(scenarioId)
    setOperationalContext(defaultOperationalContext(scenario))
    onSelectScenario?.(scenario)
  }

  function startSelectedExercise() {
    if (!readyForStart) return
    onStart?.(selectedScenario, {
      participantName: participantName.trim(),
      operationalContext,
      exerciseFocus,
    })
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

  return <div className="eoc-rs-start-page eoc-rs-start-page-simplified">
    <div className="eoc-rs-start-layout">
      <div className="eoc-rs-start-main">
        <section className="eoc-rs-config-panel">
          <div className="eoc-rs-section-title scenario-section-title">
            <h2>Select Scenario</h2>
          </div>

          <div className="scenario-tools scenario-tools-filter-only">
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
          {!filteredScenarios.length && <div className="scenario-empty-state">No scenarios match the current incident type filter.</div>}
        </section>

        <section className="eoc-rs-config-panel setup-input-panel">
          <div className="eoc-rs-section-title">
            <div><span>Exercise Configuration</span><h2>Configure participant and exercise inputs</h2></div>
            <p>Role selection continues to control workspace authority, advisor context, exercise initialization, and AAR criteria.</p>
          </div>

          <div className="eoc-rs-setup-form">
            <label>
              <span>Enter participant name — optional</span>
              <input
                type="text"
                value={participantName}
                onChange={(event) => setParticipantName(event.target.value)}
                placeholder="N. Edwards"
                disabled={active || ended}
              />
            </label>

            <label>
              <span>Select exercise role</span>
              <select
                value={selectedRole || ''}
                onChange={(event) => onSelectRole?.(event.target.value)}
                disabled={!scenarioReady || active || ended}
              >
                <option value="">{scenarioReady ? 'Select role...' : 'Select scenario first'}</option>
                {ROLES.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
              </select>
            </label>

            <label>
              <span>Select operational context</span>
              <select
                value={operationalContext}
                onChange={(event) => setOperationalContext(event.target.value)}
                disabled={active || ended}
              >
                {OPERATIONAL_CONTEXTS.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>

            <label>
              <span>Select exercise focus</span>
              <select
                value={exerciseFocus}
                onChange={(event) => setExerciseFocus(event.target.value)}
                disabled={active || ended}
              >
                {EXERCISE_FOCUSES.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
          </div>
        </section>
      </div>

      <aside className="eoc-rs-readiness-panel">
        <div className="readiness-panel-header">
          <div><span>Confirmation</span><h2>Mission Readiness</h2></div>
          <span className="portal-status-pill">{status.label}</span>
        </div>

        {selectedScenario ? <div className="readiness-scenario-visual">
          <img src={selectedScenario.image} alt={`${selectedScenario.title} scenario`} />
          <div>
            <span>Selected scenario</span>
            <strong>{selectedScenario.title}</strong>
            <small>{selectedScenario.location}</small>
          </div>
        </div> : <div className="readiness-scenario-placeholder">
          <span>No scenario selected</span>
          <p>Choose a scenario card to populate mission readiness.</p>
        </div>}

        {selectedScenario && <p className="readiness-scenario-description">{selectedScenario.summary}</p>}

        <dl className="eoc-rs-readiness-summary">
          <div><dt>Participant</dt><dd>{participantName.trim() || 'Not provided'}</dd></div>
          <div><dt>Scenario</dt><dd>{selectedScenario?.title || 'Not selected'}</dd></div>
          <div><dt>Location</dt><dd>{selectedScenario?.location || '—'}</dd></div>
          <div><dt>Role</dt><dd>{selectedRoleRecord?.name || 'Not selected'}</dd></div>
          {selectedRoleRecord && <div className="readiness-role-focus"><dt>Role Functional Focus</dt><dd>{ROLE_FOCUS[selectedRoleRecord.id]}</dd></div>}
          <div><dt>Operational Context</dt><dd>{operationalContext}</dd></div>
          <div><dt>Exercise Focus</dt><dd>{exerciseFocus}</dd></div>
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
