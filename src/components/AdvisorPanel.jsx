import { useEffect, useMemo, useState } from 'react'
import { getInitialAdvisorMessage } from '../engine/missionAdvisor.js'

const label = (value='') => value.replaceAll('_',' ')

export default function AdvisorPanel({ role, missionState, operationalSummary, onSubmitDecision, pending, busy, mode, onConfirm, onCancel }) {
  const [text,setText]=useState('')
  const [lastSentAt,setLastSentAt]=useState(0)
  const initial = useMemo(() => getInitialAdvisorMessage(role), [role])
  const history = missionState.simulation?.advisorHistory || []
  const latest = history[history.length-1]
  const advisorText = latest?.advisorMessage || missionState.lastAdvisorUpdate?.text || initial

  useEffect(() => setText(''), [role])

  const submit=async()=>{
    const value=text.trim()
    if(!value || busy || Date.now()-lastSentAt<800) return
    setLastSentAt(Date.now())
    await onSubmitDecision(value)
    setText('')
  }

  return (
    <section className="panel advisor advisor-connected">
      <div className="panel-head">
        <div><span className="eyebrow">Senior Remote Sensing Mission Advisor</span><h3>Lt Col Edwards</h3></div>
        <span className={`advisor-mode ${mode==='connected'?'connected':'fallback'}`}>Advisor mode: {mode==='connected'?'Connected':'Local fallback'}</span>
      </div>

      <div className="advisor-brief">
        <p>{advisorText}</p>
        {operationalSummary && <div className="advisor-summary-line">
          <span>{operationalSummary.openRequirements} open requirements</span>
          <span>{operationalSummary.activeMissions} active missions</span>
          <span>{operationalSummary.unverifiedDeliveries} unverified deliveries</span>
        </div>}
      </div>

      {history.length>1 && <details className="advisor-history">
        <summary>Recent advisor history ({Math.min(history.length,12)})</summary>
        <div>{history.slice(-6).map((item)=><article key={item.id}>
          <small>{item.time} · {item.advisorMode==='connected'?'Connected':'Local fallback'}</small>
          <strong>Trainee</strong><p>{item.traineeText}</p>
          <strong>Lt Col Edwards</strong><p>{item.advisorMessage}</p>
        </article>)}</div>
      </details>}

      {pending && <div className="advisor-decision-card">
        <div className="panel-head"><h4>Interpreted Decision</h4><span className={`chip ${pending.result.authorityAssessment.status==='within_authority'?'teal':'amber'}`}>{label(pending.result.authorityAssessment.status).toUpperCase()}</span></div>
        <p><strong>{pending.result.interpretedIntent}</strong></p>
        <dl>
          <div><dt>Authority</dt><dd>{pending.result.authorityAssessment.explanation}</dd></div>
          <div><dt>Required coordination</dt><dd>{pending.result.authorityAssessment.requiredCoordination.join(', ') || 'None recorded'}</dd></div>
          <div><dt>Recommended next step</dt><dd>{pending.result.recommendedNextStep || 'Review the proposed action and affected records.'}</dd></div>
          <div><dt>Proposed action</dt><dd>{label(pending.result.proposedAction.type)}</dd></div>
        </dl>
        {pending.result.missingInformation.length>0 && <div><strong>Missing information</strong><ul>{pending.result.missingInformation.map((x)=><li key={x}>{x}</li>)}</ul></div>}
        {pending.result.operationalConsiderations.length>0 && <div><strong>Operational considerations</strong><ul>{pending.result.operationalConsiderations.map((x)=><li key={x}>{x}</li>)}</ul></div>}
        <div className="advisor-confirm-actions">
          <button className="primary small" onClick={onConfirm}>Confirm</button>
          <button className="secondary-button" onClick={()=>setText(pending.exactText)}>Revise</button>
          <button className="ghost-button" onClick={onCancel}>Cancel</button>
        </div>
      </div>}

      <textarea value={text} onChange={(e)=>setText(e.target.value)} placeholder="Enter your decision, rationale, coordination path, or question..." disabled={busy}/>
      <div className="advisor-actions">
        <span>Exact text preserved · role authority checked · state changes require validation</span>
        <button className="primary small" onClick={submit} disabled={!text.trim()||busy}>{busy?'Reviewing…':'Send'}</button>
      </div>
    </section>
  )
}
