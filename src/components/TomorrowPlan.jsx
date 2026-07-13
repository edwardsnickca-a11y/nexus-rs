import React, { useMemo, useState } from 'react'

const ROLE_NAMES = {
  remote_sensing_coordinator: 'Remote Sensing Coordinator',
  remote_sensing_manager: 'Remote Sensing Manager',
  collection_manager: 'Collection Manager',
  upad_lno: 'UPAD LNO',
}

const statusLabel = (value = 'draft') => String(value).replaceAll('_', ' ').toUpperCase()

function derivePlanRows(missionState) {
  const requirements = missionState.tomorrowPlan?.requirements || []
  const fullRequirements = missionState.requirements?.items || []
  const missions = missionState.currentOps?.missions || []
  const deliveries = missionState.dissemination?.deliveries || []
  const assets = missionState.assetControl?.assets || []

  return requirements.map((planItem) => {
    const requirement = fullRequirements.find((item) => item.id === planItem.id) || {}
    const mission = missions.find((item) => item.requirementId === planItem.id) || {}
    const delivery = deliveries.find((item) => item.requirementId === planItem.id) || {}
    const asset = assets.find((item) => item.id === mission.assetId) || {}
    return {
      ...planItem,
      requirement,
      mission,
      delivery,
      asset,
      incident: planItem.incident || planItem.fire || requirement.incident || requirement.fire || 'Regional',
      title: planItem.title || requirement.title || requirement.what || 'Collection requirement',
      priority: requirement.priority || 3,
      ltiov: requirement.when || requirement.ltiov || 'Pending',
      platform: planItem.platform || mission.callsign || mission.platform || 'Unassigned',
      sortie: mission.id || 'Not proposed',
      upad: planItem.upad || delivery.assignedUpad || 'Unassigned',
      product: delivery.productType || requirement.requiredEffect || 'Pending',
      taskable: Boolean(planItem.taskable || requirement.taskable || requirement.status === 'taskable'),
      airspace: mission.risk && /airspace|tfr/i.test(mission.risk) ? 'Needs coordination' : 'No blocking issue reported',
      risk: mission.risk || asset.notes || 'No immediate execution risk reported',
    }
  })
}

function deriveGaps(rows, missionState) {
  const gaps = []
  rows.forEach((row) => {
    if (!row.taskable) gaps.push(`${row.incident}: requirement needs development`)
    if (!row.platform || row.platform === 'Unassigned') gaps.push(`${row.incident}: platform is unassigned`)
    if (!row.upad || row.upad === 'Unassigned') gaps.push(`${row.incident}: UPAD support is unassigned`)
    if (/airspace|tfr/i.test(row.risk || '')) gaps.push(`${row.incident}: airspace coordination remains open`)
  })
  ;(missionState.tomorrowPlan?.blockers || []).forEach((item) => gaps.push(item))
  return [...new Set(gaps)].slice(0, 12)
}

function PlanMetric({ label, value, tone = '' }) {
  return <div className={`tp-metric ${tone}`}><span>{label}</span><strong>{value}</strong></div>
}

function ReviewCard({ review }) {
  return <article className={`tp-review-card ${review.outcome.toLowerCase().replaceAll(' ', '-')}`}>
    <header><div><span>{review.role}</span><strong>{review.outcome}</strong></div><small>{review.time}</small></header>
    <p>{review.summary}</p>
    {review.conditions?.length > 0 && <ul>{review.conditions.map((item) => <li key={item}>{item}</li>)}</ul>}
  </article>
}

export default function TomorrowPlan({
  role,
  missionState,
  readOnly = false,
  onMarkTaskable,
  onAssignUpad,
  onApprovePlan,
  onSubmitForReview,
  onOpenCurrent,
}) {
  const [filter, setFilter] = useState('all')
  const currentOp = Number(missionState.exercise?.activeOperationalPeriod || missionState.operationalPeriod || 1)
  const nextOp = currentOp + 1
  const rows = useMemo(() => derivePlanRows(missionState), [missionState])
  const gaps = useMemo(() => deriveGaps(rows, missionState), [rows, missionState])
  const reviews = missionState.tomorrowPlan?.reviews || []
  const status = missionState.tomorrowPlan?.status || 'developing'
  const approved = Boolean(missionState.tomorrowPlan?.approved)
  const readyCount = rows.filter((row) => row.taskable && row.platform !== 'Unassigned' && row.upad !== 'Unassigned').length
  const visibleRows = rows.filter((row) => filter === 'all' || (filter === 'gaps' ? !(row.taskable && row.platform !== 'Unassigned' && row.upad !== 'Unassigned') : row.incident === filter))
  const incidents = [...new Set(rows.map((row) => row.incident))]
  const canSubmit = !readOnly && rows.length > 0
  const canApprove = role === 'remote_sensing_coordinator' && gaps.length === 0 && reviews.some((item) => item.outcome === 'COORDINATED') && !approved

  return <section className="tomorrow-plan-workspace">
    <header className="panel tp-hero">
      <div>
        <span className="eyebrow">NEXT OPERATIONAL PERIOD PLANNING</span>
        <h2>Tomorrow&apos;s Plan</h2>
        <p>Build, coordinate, and approve the collection, sortie, production, and partner-support plan for the next operational period.</p>
      </div>
      <div className="tp-hero-actions">
        <button className="ghost" onClick={onOpenCurrent}>RETURN TO CURRENT OPS</button>
        {role !== 'remote_sensing_coordinator' && <button className="primary" disabled={!canSubmit} onClick={onSubmitForReview}>SUBMIT FOR COORDINATION</button>}
        {role === 'remote_sensing_coordinator' && <button className="primary" disabled={!canApprove} onClick={onApprovePlan}>{approved ? 'PLAN APPROVED' : `APPROVE OP ${nextOp} PLAN`}</button>}
      </div>
    </header>

    <section className="tp-metrics">
      <PlanMetric label="NEXT OP" value={`OP ${nextOp}`} />
      <PlanMetric label="PLAN STATUS" value={approved ? 'APPROVED' : statusLabel(status)} tone={approved ? 'good' : ''} />
      <PlanMetric label="READY REQUIREMENTS" value={`${readyCount} / ${rows.length}`} tone={readyCount === rows.length && rows.length ? 'good' : 'warn'} />
      <PlanMetric label="OPEN GAPS" value={gaps.length} tone={gaps.length ? 'bad' : 'good'} />
      <PlanMetric label="PLANNING DEADLINE" value={missionState.tomorrowPlan?.planningDeadline || 'Pending'} />
      <PlanMetric label="OP START" value={missionState.tomorrowPlan?.publicationDeadline || 'Pending'} />
    </section>

    <section className="panel tp-gaps">
      <div className="panel-head"><div><span className="eyebrow">APPROVAL GATES</span><h3>Planning Gaps</h3></div><span className={`status-chip ${gaps.length ? 'warn' : 'good'}`}>{gaps.length ? `${gaps.length} OPEN` : 'READY'}</span></div>
      {gaps.length ? <div className="tp-gap-grid">{gaps.map((gap) => <div key={gap}><span>!</span><p>{gap}</p></div>)}</div> : <p className="success-text">No blocking planning gaps are currently identified.</p>}
    </section>

    <section className="panel tp-board">
      <div className="panel-head tp-board-head">
        <div><span className="eyebrow">{`REGIONAL OP ${nextOp} PLAN`}</span><h3>Requirements, Sorties, and Production</h3></div>
        <div className="tp-filters">
          <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>ALL</button>
          <button className={filter === 'gaps' ? 'active' : ''} onClick={() => setFilter('gaps')}>GAPS</button>
          {incidents.map((incident) => <button key={incident} className={filter === incident ? 'active' : ''} onClick={() => setFilter(incident)}>{incident}</button>)}
        </div>
      </div>
      <div className="tp-table-wrap">
        <table className="tp-table">
          <thead><tr><th>Incident / Requirement</th><th>Pri</th><th>LTIOV</th><th>Taskable</th><th>Platform / Sortie</th><th>UPAD / Product</th><th>Execution Risk</th><th>Action</th></tr></thead>
          <tbody>{visibleRows.map((row) => <tr key={row.id}>
            <td><strong>{row.incident}</strong><span>{row.title}</span></td>
            <td>{row.priority}</td>
            <td>{row.ltiov}</td>
            <td><span className={`status-chip ${row.taskable ? 'good' : 'warn'}`}>{row.taskable ? 'TASKABLE' : 'DEVELOP'}</span></td>
            <td><strong>{row.platform}</strong><span>{row.sortie}</span></td>
            <td><strong>{row.upad}</strong><span>{row.product}</span></td>
            <td><span>{row.risk}</span></td>
            <td><div className="tp-row-actions">
              {role === 'collection_manager' && !row.taskable && <button onClick={() => onMarkTaskable?.(row.id)} disabled={readOnly}>MARK TASKABLE</button>}
              {role === 'upad_lno' && row.upad === 'Unassigned' && <button onClick={() => onAssignUpad?.(row.id)} disabled={readOnly}>ASSIGN UPAD</button>}
              {(role === 'remote_sensing_manager' || role === 'remote_sensing_coordinator') && <span className="permission-note">REVIEW</span>}
            </div></td>
          </tr>)}</tbody>
        </table>
      </div>
    </section>

    <section className="tp-lower-grid">
      <div className="panel">
        <div className="panel-head"><div><span className="eyebrow">STAFF COORDINATION</span><h3>AI Role Reviews</h3></div><span className="status-chip quiet">{reviews.length} REVIEWS</span></div>
        {reviews.length ? <div className="tp-review-list">{reviews.map((review) => <ReviewCard key={review.id} review={review}/>)}</div> : <p className="muted-copy">Submit the plan for coordination. The simulated RS Manager, UPAD LNO, and RS Coordinator will review only the portions that fall within their authority.</p>}
      </div>
      <div className="panel">
        <div className="panel-head"><div><span className="eyebrow">ROLE AUTHORITY</span><h3>{ROLE_NAMES[role] || 'Trainee'} Responsibilities</h3></div></div>
        <div className="tp-authority-copy">
          {role === 'collection_manager' && <><p>Develop taskable requirements, recommend collection options, and submit the proposed collection plan for coordination.</p><strong>You do not approve regional asset allocation or final plan approval.</strong></>}
          {role === 'remote_sensing_manager' && <><p>Review execution feasibility, crew and platform conflicts, timing, routing, and downstream mission cost.</p><strong>You recommend changes; the Coordinator resolves regional allocation.</strong></>}
          {role === 'upad_lno' && <><p>Confirm production capacity, specialty support, shift coverage, and realistic delivery timing.</p><strong>You escalate unmet UPAD needs to the Coordinator.</strong></>}
          {role === 'remote_sensing_coordinator' && <><p>Resolve regional conflicts, coordinate partner support, protect priority missions, and approve the final plan.</p><strong>Approval remains unavailable while blocking gaps or unresolved reviews remain.</strong></>}
        </div>
      </div>
    </section>
  </section>
}
