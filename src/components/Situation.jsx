import React, { useMemo, useState } from 'react'

const text = (value, fallback = 'Not reported') => {
  if (Array.isArray(value)) return value.filter(Boolean).join(' · ') || fallback
  return value || fallback
}

const number = (value, fallback = '—') => {
  if (value === 0) return '0'
  return value || fallback
}

function buildIncident209(incident, missionState) {
  const relatedMissions = (missionState.currentOps?.missions || []).filter((item) =>
    [item.fire, item.incident, item.incidentId].includes(incident.name) || item.incidentId === incident.id
  )
  const relatedRequirements = (missionState.requirements?.items || []).filter((item) =>
    [item.fire, item.incident, item.incidentId].includes(incident.name) || item.incidentId === incident.id
  )

  return {
    name: incident.name,
    incidentNumber: incident.incidentNumber || incident.code || incident.id,
    reportVersion: incident.reportVersion || 'Current exercise update',
    commander: incident.commander || incident.ic || 'Incident command not reported',
    organization: incident.managementOrganization || incident.organization || 'Incident management organization not reported',
    start: incident.startDateTime || incident.startedAt || incident.start || 'Not reported',
    size: incident.acres ? `${incident.acres.toLocaleString?.() || incident.acres} acres` : text(incident.size),
    containment: incident.containment !== undefined ? `${incident.containment}%` : text(incident.percentContained),
    complexity: text(incident.complexity || incident.complexityLevel),
    period: text(incident.reportingPeriod || missionState.exercise?.localIncidentTime),
    location: text(incident.location || [incident.city, incident.county, incident.state].filter(Boolean).join(', ')),
    significantEvents: text(incident.significantEvents || incident.summary || incident.behavior),
    lifeSafety: text(incident.lifeSafety || incident.evacuationStatus || incident.evacuations),
    weather: text(incident.weatherConcerns || incident.weather || incident.smoke),
    projectedActivity: text(incident.projectedActivity || incident.outlook || incident.expectedBehavior),
    strategicObjectives: text(incident.strategicObjectives || incident.objectives),
    threats: text(incident.threatSummary || incident.infrastructureAtRisk || incident.valuesAtRisk),
    criticalNeeds: text(incident.criticalResourceNeeds || incident.resourceNeeds),
    plannedActions: text(incident.plannedActions || incident.nextActions),
    missions: relatedMissions,
    requirements: relatedRequirements,
  }
}

function IncidentCard({ incident, missionState, onOpen }) {
  const report = buildIncident209(incident, missionState)
  const acreage = incident.acres ? `${incident.acres.toLocaleString?.() || incident.acres} acres` : text(incident.size)
  const containment = incident.containment !== undefined ? `${incident.containment}% contained` : text(incident.percentContained)

  return <article className="situation-card">
    <header className="situation-card-head">
      <div>
        <span className="eyebrow">ACTIVE INCIDENT</span>
        <h3>{incident.name || 'Unnamed incident'}</h3>
        <p>{report.location}</p>
      </div>
      <span className={`situation-status ${String(incident.status || incident.behavior || '').toLowerCase().includes('critical') ? 'critical' : ''}`}>
        {incident.status || 'ACTIVE'}
      </span>
    </header>

    <div className="situation-metrics">
      <div><span>SIZE</span><strong>{acreage}</strong></div>
      <div><span>CONTAINMENT</span><strong>{containment}</strong></div>
      <div><span>START</span><strong>{report.start}</strong></div>
      <div><span>REPORTING PERIOD</span><strong>{report.period}</strong></div>
    </div>

    <div className="situation-summary-grid">
      <section><span>SIGNIFICANT EVENTS</span><p>{report.significantEvents}</p></section>
      <section><span>LIFE SAFETY / EVACUATIONS</span><p>{report.lifeSafety}</p></section>
      <section><span>WEATHER / SMOKE</span><p>{report.weather}</p></section>
      <section><span>PROJECTED ACTIVITY</span><p>{report.projectedActivity}</p></section>
    </div>

    <footer className="situation-card-foot">
      <div>
        <span>{report.missions.length} active/planned missions</span>
        <span>{report.requirements.length} related requirements</span>
      </div>
      <button type="button" className="primary small" onClick={() => onOpen(report)}>VIEW ICS 209</button>
    </footer>
  </article>
}

function Ics209Modal({ report, onClose }) {
  if (!report) return null
  return <div className="ics209-backdrop" role="presentation" onMouseDown={onClose}>
    <section className="ics209-modal" role="dialog" aria-modal="true" aria-labelledby="ics209-title" onMouseDown={(event) => event.stopPropagation()}>
      <header>
        <div>
          <span className="eyebrow">INCIDENT STATUS SUMMARY</span>
          <h2 id="ics209-title">ICS 209 — {report.name}</h2>
          <p>{report.location}</p>
        </div>
        <button type="button" className="ghost" onClick={onClose}>CLOSE</button>
      </header>

      <div className="ics209-scroll">
        <div className="ics209-identification">
          <div><span>Incident Number</span><strong>{report.incidentNumber}</strong></div>
          <div><span>Report Version</span><strong>{report.reportVersion}</strong></div>
          <div><span>Incident Commander</span><strong>{report.commander}</strong></div>
          <div><span>Management Organization</span><strong>{report.organization}</strong></div>
          <div><span>Incident Start</span><strong>{report.start}</strong></div>
          <div><span>Current Size</span><strong>{report.size}</strong></div>
          <div><span>Percent Contained</span><strong>{report.containment}</strong></div>
          <div><span>Complexity</span><strong>{report.complexity}</strong></div>
        </div>

        <div className="ics209-sections">
          <section><span>28. Significant Events</span><p>{report.significantEvents}</p></section>
          <section><span>33–34. Life Safety and Threat Management</span><p>{report.lifeSafety}</p></section>
          <section><span>35. Weather Concerns</span><p>{report.weather}</p></section>
          <section><span>36. Projected Incident Activity</span><p>{report.projectedActivity}</p></section>
          <section><span>37. Strategic Objectives</span><p>{report.strategicObjectives}</p></section>
          <section><span>38. Current Threat Summary</span><p>{report.threats}</p></section>
          <section><span>39. Critical Resource Needs</span><p>{report.criticalNeeds}</p></section>
          <section><span>41. Planned Actions for Next Operational Period</span><p>{report.plannedActions}</p></section>
        </div>

        <div className="ics209-related">
          <section>
            <span>REMOTE-SENSING MISSIONS SUPPORTING THIS INCIDENT</span>
            {report.missions.length ? report.missions.map((mission) => <div key={mission.id}>
              <strong>{mission.callsign || mission.platform || mission.id}</strong>
              <p>{mission.objective || mission.status || 'Mission details not reported'}</p>
            </div>) : <p>No current mission is associated with this incident.</p>}
          </section>
          <section>
            <span>RELATED COLLECTION REQUIREMENTS</span>
            {report.requirements.length ? report.requirements.map((requirement) => <div key={requirement.id}>
              <strong>{requirement.title || requirement.id}</strong>
              <p>{requirement.decisionToSupport || requirement.what || requirement.status || 'Requirement details not reported'}</p>
            </div>) : <p>No collection requirement is currently associated with this incident.</p>}
          </section>
        </div>
      </div>
    </section>
  </div>
}

export default function Situation({ missionState }) {
  const [openReport, setOpenReport] = useState(null)
  const incidents = useMemo(() => missionState.incidents || [], [missionState.incidents])

  return <section className="situation-page">
    <header className="situation-hero panel">
      <div>
        <span className="eyebrow">SHARED INCIDENT PICTURE</span>
        <h2>Situation</h2>
        <p>Read-only incident context for the current exercise. Use this page to understand the fires, life-safety conditions, projected activity, and operational environment before making role-specific decisions in Current Ops.</p>
      </div>
      <div className="situation-asof">
        <span>AS OF</span>
        <strong>{missionState.exercise?.localIncidentTime || missionState.asOf || 'Current local time'}</strong>
        <small>{incidents.length} active incident{incidents.length === 1 ? '' : 's'}</small>
      </div>
    </header>

    {incidents.length ? <div className="situation-list">
      {incidents.map((incident, index) => <IncidentCard key={incident.id || `${incident.name}-${index}`} incident={incident} missionState={missionState} onOpen={setOpenReport}/>) }
    </div> : <section className="panel placeholder">
      <span className="eyebrow">NO INCIDENT DATA</span>
      <h2>Situation is not available yet</h2>
      <p>Incident summaries will appear after the Scenario Controller generates the exercise environment.</p>
    </section>}

    <Ics209Modal report={openReport} onClose={() => setOpenReport(null)}/>
  </section>
}
