import { useEffect, useMemo, useState } from 'react'
import { getInitialAdvisorMessage } from '../engine/missionAdvisor.js'

export default function AdvisorPanel({ role, missionState, onSubmitDecision }) {
  const [text,setText]=useState('')
  const initial = useMemo(() => getInitialAdvisorMessage(role), [role])
  const advisorText = missionState.lastAdvisorUpdate?.text || initial
  useEffect(() => setText(''), [role])
  const submit=()=>{ if(!text.trim()) return; onSubmitDecision(text.trim()); setText('') }
  return (
    <section className="panel advisor">
      <div className="panel-head">
        <div><span className="eyebrow">Senior Remote Sensing Mission Advisor</span><h3>Lt Col Edwards</h3></div>
        <span className="live">LIVE</span>
      </div>
      <div className="advisor-brief"><p>{advisorText}</p></div>
      <textarea value={text} onChange={(e)=>setText(e.target.value)} placeholder="Enter your decision, rationale, coordination path, and accepted trade-off..."/>
      <div className="advisor-actions">
        <span>Exact text preserved · role authority evaluated · mission advances</span>
        <button className="primary small" onClick={submit} disabled={!text.trim()}>Submit Decision</button>
      </div>
    </section>
  )
}
