import React, { useMemo, useState } from 'react'
import { buildAfterActionReview } from '../engine/aarEngine.js'

function Chip({ children, tone = '' }) {
  return <span className={`status-chip ${tone}`}>{children}</span>
}

function Evidence({ item }) {
  if (!item) return null
  return <div className="evidence-block"><strong>{item.source}</strong><span>{item.detail}</span></div>
}

function DetailGrid({ items }) {
  return <div className="aar-detail-grid">{items.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
}

function ObservationList({ title, items }) {
  return <section className="panel aar-card">
    <div className="panel-head"><div><span className="eyebrow">{title}</span><h3>{title === 'Sustains' ? 'What should be sustained' : 'What should be improved'}</h3></div></div>
    <div className="aar-observation-list">
      {items.length ? items.map((item, index) => <article key={`${title}-${index}`} className="aar-observation">
        <h4>{item.observation}</h4>
        <p><strong>Evidence:</strong> {item.evidence}</p>
        <p><strong>Operational effect:</strong> {item.operationalEffect}</p>
        <p><strong>Recommended future action:</strong> {item.recommendedFutureAction}</p>
      </article>) : <p className="muted">No evidence-based items available yet.</p>}
    </div>
  </section>
}

export default function AfterActionReview({ role, missionState, syncMatrix }) {
  const [refreshKey, setRefreshKey] = useState(0)
  const aar = useMemo(() => buildAfterActionReview({ missionState, syncMatrix, role }), [missionState, syncMatrix, role, refreshKey])
  const summary = aar.executiveSummary

  return <div className="aar-shell">
    <section className="panel aar-hero">
      <div>
        <span className="eyebrow">After-Action Review</span>
        <h2>Role-Based Mission Review</h2>
        <p>{summary.narrative}</p>
      </div>
      <div className="aar-actions">
        <Chip tone={aar.status === 'FINAL AAR' ? 'good' : 'warn'}>{aar.status}</Chip>
        <button className="primary small" onClick={() => setRefreshKey((value) => value + 1)}>Refresh AAR</button>
      </div>
    </section>

    <section className="panel aar-card">
      <div className="panel-head"><div><span className="eyebrow">Section 1</span><h3>Executive Summary</h3></div></div>
      <DetailGrid items={[
        ['Scenario', summary.scenarioName],
        ['Played role', summary.playedRole],
        ['Operational periods completed', summary.operationalPeriodsCompleted],
        ['Duration / turns', summary.exerciseDuration],
        ['Major challenge', summary.majorOperationalChallenge],
        ['Mission outcome', summary.overallMissionOutcome],
        ['Most consequential decision', summary.mostConsequentialDecision],
        ['Largest remaining risk', summary.largestRemainingRisk],
      ]} />
    </section>

    <section className="panel aar-card">
      <div className="panel-head"><div><span className="eyebrow">Section 2</span><h3>Decision Timeline</h3></div></div>
      <div className="aar-timeline">
        {aar.decisionTimeline.length ? aar.decisionTimeline.map((decision) => <article key={decision.id} className="timeline-item">
          <div><Chip>{decision.time}</Chip><Chip>OP {decision.operationalPeriod}</Chip><Chip>{decision.role}</Chip></div>
          <h4>{decision.interpretedDecision}</h4>
          <p><strong>Original trainee input:</strong> {decision.originalInput}</p>
          <p><strong>Authority:</strong> {decision.authorityAssessment}</p>
          <p><strong>Immediate consequence:</strong> {decision.immediateConsequence}</p>
          <p><strong>Planning consequence:</strong> {decision.planningConsequence}</p>
          <p><strong>Related record:</strong> {decision.relatedRecord} · <strong>Status:</strong> {decision.finalStatus}</p>
        </article>) : <p className="muted">No trainee decision records are present yet.</p>}
      </div>
    </section>

    <section className="panel aar-card">
      <div className="panel-head"><div><span className="eyebrow">Section 3</span><h3>Role Performance — {summary.playedRole}</h3></div></div>
      <div className="aar-performance-grid">
        {aar.rolePerformance.map((item) => <article key={item.dimension} className="performance-card">
          <div className="split"><h4>{item.dimension}</h4><Chip tone={item.label === 'Effective' ? 'good' : item.label === 'Needs Improvement' ? 'bad' : item.label === 'Not Observed' ? 'quiet' : 'warn'}>{item.label}</Chip></div>
          <Evidence item={item.evidence} />
        </article>)}
      </div>
    </section>

    <section className="panel aar-card">
      <div className="panel-head"><div><span className="eyebrow">Section 4</span><h3>Authority and Coordination</h3></div></div>
      <div className="aar-stack">
        {aar.authorityFindings.map((finding, index) => <article key={`${finding.title}-${index}`} className="finding-card">
          <h4>{finding.title}</h4>
          <p><strong>What happened:</strong> {finding.whatHappened}</p>
          <p><strong>Correct authority relationship:</strong> {finding.correctRelationship}</p>
          <p><strong>Operational consequence:</strong> {finding.consequence}</p>
          <p><strong>Better approach:</strong> {finding.betterApproach}</p>
        </article>)}
      </div>
    </section>

    <section className="panel aar-card">
      <div className="panel-head"><div><span className="eyebrow">Section 5</span><h3>Requirement Performance</h3></div></div>
      <div className="aar-table-wrap">
        <table className="aar-table">
          <thead><tr><th>Requirement</th><th>Customer</th><th>PIR / EEI</th><th>NAI</th><th>Status chain</th><th>Final result</th></tr></thead>
          <tbody>{aar.requirementOutcomes.map((req) => <tr key={req.id}>
            <td><strong>{req.title}</strong><small>{req.decisionSupported}</small></td>
            <td>{req.customer}</td>
            <td>{req.pirEei}</td>
            <td>{req.nai}</td>
            <td><small>Validation: {req.validationStatus}</small><small>Collection: {req.collectionStatus}</small><small>Product: {req.productStatus}</small><small>Dissemination: {req.disseminationStatus}</small><small>Receipt: {req.receiptStatus}</small><small>Feedback: {req.feedback}</small></td>
            <td><Chip tone={req.finalResult === 'Satisfied' ? 'good' : req.finalResult === 'Still Open' ? 'warn' : 'quiet'}>{req.finalResult}</Chip><small>{req.explanation}</small></td>
          </tr>)}</tbody>
        </table>
      </div>
    </section>

    <section className="panel aar-card">
      <div className="panel-head"><div><span className="eyebrow">Section 6</span><h3>Asset and Sortie Performance</h3></div></div>
      <DetailGrid items={[
        ['STARTEX allocation', aar.assetFindings.startEx],
        ['Assigned assets', aar.assetFindings.assigned.map((a) => `${a.identifier} → ${a.assignment}`).join(', ') || 'None recorded'],
        ['Reserve assets', aar.assetFindings.reserve.map((a) => a.identifier).join(', ') || 'None recorded'],
        ['Released assets', aar.assetFindings.released.map((a) => a.identifier).join(', ') || 'None recorded'],
        ['Additional requests', aar.assetFindings.additionalRequests.map((r) => `${r.quantity} × ${r.requestType}: ${r.status}`).join(', ') || 'None recorded'],
        ['Missions flown or simulated', aar.assetFindings.missions.map((m) => `${m.id}: ${m.status}`).join(', ') || 'None recorded'],
        ['Protected missions', aar.assetFindings.protectedMissions.map((m) => m.id).join(', ') || 'None recorded'],
        ['Recall / availability impacts', aar.assetFindings.recallImpacts.join(', ') || 'None recorded'],
        ['Capability gaps', aar.assetFindings.capabilityGaps.join(', ') || 'None recorded'],
        ['Underused assets', aar.assetFindings.underusedAssets.map((a) => a.identifier).join(', ') || 'None recorded'],
        ['Poor suitability evidence', aar.assetFindings.poorSuitability.join(', ') || 'None recorded'],
        ['Sync Matrix status', aar.assetFindings.syncMatrixStatus],
      ]} />
    </section>

    <section className="panel aar-card">
      <div className="panel-head"><div><span className="eyebrow">Section 7</span><h3>PCPAD Performance</h3></div></div>
      <div className="pcpad-grid">
        {aar.pcpadFindings.map((finding) => <article key={finding.id} className="finding-card">
          <h4>{finding.mission}</h4>
          <p>{finding.requirement}</p>
          <div className="pcpad-steps">{finding.steps.map((step) => <Chip key={step.name} tone={step.status === 'complete' ? 'good' : 'warn'}>{step.name}: {step.status}</Chip>)}</div>
          <p><strong>Finding:</strong> {finding.finding}</p>
          <p><strong>Evidence:</strong> {finding.evidence}</p>
        </article>)}
      </div>
    </section>

    <section className="panel aar-card">
      <div className="panel-head"><div><span className="eyebrow">Section 8</span><h3>Operational Period Transition</h3></div></div>
      <div className="aar-stack">
        {aar.transitionFindings.map((finding) => <article key={finding.topic} className="finding-card">
          <h4>{finding.topic}</h4>
          <p>{finding.finding}</p>
          <p><strong>Evidence:</strong> {finding.evidence}</p>
        </article>)}
      </div>
    </section>

    <div className="aar-two-col">
      <ObservationList title="Sustains" items={aar.sustains} />
      <ObservationList title="Improvements" items={aar.improvements} />
    </div>

    <section className="panel aar-card advisor-assessment">
      <div className="panel-head"><div><span className="eyebrow">Section 10</span><h3>Senior Advisor Assessment</h3></div></div>
      <blockquote>
        <p>{aar.advisorAssessment.narrative}</p>
        <footer>{aar.advisorAssessment.advisor}<br/><span>{aar.advisorAssessment.title}</span></footer>
      </blockquote>
    </section>
  </div>
}
