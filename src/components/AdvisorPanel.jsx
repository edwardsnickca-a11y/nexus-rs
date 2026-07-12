import { useEffect, useMemo, useState } from 'react'
import { getInitialAdvisorMessage } from '../engine/missionAdvisor.js'

const label = (value='') => value.replaceAll('_',' ')

export default function AdvisorPanel({ role, missionState, operationalSummary, onSubmitDecision, pending, busy, mode, onConfirm, onCancel, onOpenAdvisor }) {
  const [text,setText]=useState('')
  const [lastSentAt,setLastSentAt]=useState(0)
  const scratchpadKey = `nexus-rs-advisor-scratchpad:${missionState.exercise?.scenarioId || 'exercise'}:${role || 'role'}`
  const [scratchpad,setScratchpad]=useState(()=>localStorage.getItem(scratchpadKey) || '')
  const initial = useMemo(() => getInitialAdvisorMessage(role), [role])
  const history = missionState.simulation?.advisorHistory || []
  const latest = history[history.length-1]
  const advisorText = latest?.advisorMessage || missionState.lastAdvisorUpdate?.text || initial

  useEffect(() => setText(''), [role])
  useEffect(() => {
    setScratchpad(localStorage.getItem(scratchpadKey) || '')
  }, [scratchpadKey])
  useEffect(() => {
    localStorage.setItem(scratchpadKey, scratchpad)
  }, [scratchpadKey, scratchpad])

  const submit=async()=>{
    const value=text.trim()
    if(!value || busy || Date.now()-lastSentAt<800) return
    setLastSentAt(Date.now())
    await onSubmitDecision(value)
    setText('')
  }

  return (
    <section className="panel advisor advisor-connected">
      <section className="advisor-identity" style={{padding:'14px'}}>
        <div style={{display:'grid',gridTemplateColumns:'92px minmax(0,1fr)',gap:16,alignItems:'center'}}>
          <img
            src="/images/lt-col-edwards.png"
            alt="Lt Col Edwards"
            style={{width:92,height:92,objectFit:'cover',border:'1px solid #2b6178',background:'#0a1d2a'}}
          />
          <div style={{minWidth:0}}>
            <span className="eyebrow" style={{fontSize:12,letterSpacing:'.12em'}}>LT COL EDWARDS</span>
            <h3 style={{margin:'5px 0 0',fontSize:19,lineHeight:1.18,fontWeight:700}}>Senior Remote Sensing Advisor</h3>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenAdvisor}
          style={{
            display:'flex',
            alignItems:'center',
            justifyContent:'center',
            width:'100%',
            minHeight:42,
            marginTop:14,
            padding:'0 16px',
            border:'1px solid #67e3ef',
            borderRadius:5,
            background:'linear-gradient(180deg,#11869a,#0b6476)',
            color:'#efffff',
            fontWeight:750,
            letterSpacing:'.03em',
            cursor:'pointer',
            boxShadow:'0 3px 10px rgba(0,196,220,.15)',
          }}
        >
          OPEN ADVISOR →
        </button>

        <div style={{marginTop:14,minHeight:120,maxHeight:360,resize:'vertical',overflow:'auto',padding:'14px 16px',border:'1px solid #2b5368',background:'#102d47',lineHeight:1.58}}>
          <p className="advisor-identity-message" style={{margin:0,fontWeight:400,color:'#c8d7df',fontSize:'0.98rem',letterSpacing:0}}>{advisorText}</p>
        </div>
        <small style={{display:'block',marginTop:8}}>{missionState.asOf || missionState.exercise?.localIncidentTime || 'Local incident time'}</small>
      </section>

      <section className="advisor-scratchpad" style={{height:220,minHeight:150,maxHeight:520,resize:'vertical',overflow:'hidden',display:'flex',flexDirection:'column'}}>
        <div className="advisor-scratchpad-head">
          <strong>MY NOTES</strong>
          <span>Saved automatically</span>
        </div>
        <textarea
          value={scratchpad}
          onChange={(event)=>setScratchpad(event.target.value)}
          placeholder="Capture notes, assumptions, and reminders. These notes are not sent to the advisor."
          aria-label="Persistent exercise scratchpad"
          style={{flex:1,minHeight:0,height:'auto',resize:'none'}}
        />
      </section>

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

      <textarea
        className="advisor-response-input"
        value={text}
        onChange={(e)=>setText(e.target.value)}
        placeholder="Enter your decision, rationale, coordination path, or question..."
        disabled={busy}
        style={{height:180,minHeight:120,maxHeight:520,resize:'vertical',overflow:'auto'}}
      />
      <div className="advisor-actions">
        <span>Exact text preserved · role authority checked · state changes require validation</span>
        <button className="primary small" onClick={submit} disabled={!text.trim()||busy}>{busy?'Reviewing…':'Send'}</button>
      </div>
    </section>
  )
}
