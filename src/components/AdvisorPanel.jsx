import { useEffect, useMemo, useRef, useState } from 'react'
import { getInitialAdvisorMessage } from '../engine/missionAdvisor.js'

const label = (value='') => value.replaceAll('_',' ')
const clamp = (value,min,max) => Math.min(max,Math.max(min,value))

function HorizontalDivider({ onPointerDown, labelText }) {
  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      aria-label={labelText}
      onPointerDown={onPointerDown}
      style={{
        height:12,
        margin:'2px 0',
        cursor:'row-resize',
        display:'flex',
        alignItems:'center',
        justifyContent:'center',
        touchAction:'none',
        userSelect:'none',
      }}
    >
      <div style={{
        width:48,
        height:5,
        borderRadius:4,
        background:'#17384a',
        border:'1px solid #28586d',
        boxShadow:'inset 0 0 0 1px rgba(255,255,255,.02)',
      }}>
        <div style={{
          width:22,
          height:1,
          margin:'1px auto 0',
          borderTop:'1px dotted #6e9bab',
          borderBottom:'1px dotted #6e9bab',
        }}/>
      </div>
    </div>
  )
}

export default function AdvisorPanel({
  role,
  missionState,
  operationalSummary,
  onSubmitDecision,
  pending,
  busy,
  mode,
  onConfirm,
  onCancel,
  onOpenAdvisor,
}) {
  const [text,setText]=useState('')
  const [lastSentAt,setLastSentAt]=useState(0)
  const scratchpadKey = `nexus-rs-advisor-scratchpad:${missionState.exercise?.scenarioId || 'exercise'}:${role || 'role'}`
  const layoutKey = `nexus-rs-advisor-layout:${missionState.exercise?.scenarioId || 'exercise'}:${role || 'role'}`
  const [scratchpad,setScratchpad]=useState(()=>localStorage.getItem(scratchpadKey) || '')
  const [heights,setHeights]=useState(()=>{
    try {
      const saved=JSON.parse(localStorage.getItem(layoutKey) || 'null')
      return Array.isArray(saved) && saved.length===3 ? saved : [235,220,210]
    } catch {
      return [235,220,210]
    }
  })
  const heightsRef=useRef(heights)
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
  }, [scratchpadKey])
  useEffect(() => {
    heightsRef.current=heights
    localStorage.setItem(layoutKey,JSON.stringify(heights))
  }, [heights,layoutKey])

  const beginResize=(dividerIndex)=>(event)=>{
    event.preventDefault()
    const startY=event.clientY
    const start=[...heightsRef.current]
    const min=[140,140,145]
    const max=[520,520,520]

    const move=(moveEvent)=>{
      const delta=moveEvent.clientY-startY
      const next=[...start]

      if(dividerIndex===0){
        const upper=clamp(start[0]+delta,min[0],max[0])
        const applied=upper-start[0]
        next[0]=upper
        next[1]=clamp(start[1]-applied,min[1],max[1])
      }else{
        const upper=clamp(start[1]+delta,min[1],max[1])
        const applied=upper-start[1]
        next[1]=upper
        next[2]=clamp(start[2]-applied,min[2],max[2])
      }

      setHeights(next)
    }

    const stop=()=>{
      window.removeEventListener('pointermove',move)
      window.removeEventListener('pointerup',stop)
      window.removeEventListener('pointercancel',stop)
      document.body.style.cursor=''
      document.body.style.userSelect=''
    }

    document.body.style.cursor='row-resize'
    document.body.style.userSelect='none'
    window.addEventListener('pointermove',move)
    window.addEventListener('pointerup',stop)
    window.addEventListener('pointercancel',stop)
  }

  const submit=async()=>{
    const value=text.trim()
    if(!value || busy || Date.now()-lastSentAt<800) return
    setLastSentAt(Date.now())
    await onSubmitDecision(value)
    setText('')
  }

  return (
    <section className="panel advisor advisor-connected" style={{display:'flex',flexDirection:'column',minHeight:0}}>
      <section className="advisor-identity" style={{padding:'14px 14px 12px'}}>
        <div style={{
          display:'grid',
          gridTemplateColumns:'118px minmax(0,1fr)',
          gap:16,
          alignItems:'center',
        }}>
          <img
            src="/images/lt-col-edwards.png"
            alt="Lt Col Edwards"
            style={{
              width:118,
              height:118,
              objectFit:'cover',
              border:'1px solid #2b6178',
              background:'#0a1d2a',
            }}
          />
          <div style={{minWidth:0}}>
            <span className="eyebrow" style={{fontSize:12,letterSpacing:'.12em',whiteSpace:'nowrap'}}>LT COL EDWARDS</span>
            <h3 style={{
              margin:'6px 0 0',
              fontSize:17,
              lineHeight:1.2,
              fontWeight:700,
              color:'#f1f6f8',
            }}>
              <span style={{whiteSpace:'nowrap'}}>Senior Remote</span><br/>
              <span style={{whiteSpace:'nowrap'}}>Sensing Advisor</span>
            </h3>
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
      </section>

      <section style={{
        height:heights[0],
        minHeight:140,
        overflow:'auto',
        padding:'12px 14px',
        borderTop:'1px solid #1d4052',
        borderBottom:'1px solid #1d4052',
      }}>
        <div style={{
          height:'100%',
          overflow:'auto',
          padding:'14px 16px',
          border:'1px solid #2b5368',
          background:'#102d47',
          lineHeight:1.58,
        }}>
          <p className="advisor-identity-message" style={{
            margin:0,
            fontWeight:400,
            color:'#c8d7df',
            fontSize:'0.98rem',
            letterSpacing:0,
          }}>
            {advisorText}
          </p>
        </div>
        <small style={{display:'block',marginTop:8}}>
          {missionState.asOf || missionState.exercise?.localIncidentTime || 'Local incident time'}
        </small>
      </section>

      <HorizontalDivider
        labelText="Resize advisor preview and notes"
        onPointerDown={beginResize(0)}
      />

      <section
        className="advisor-scratchpad"
        style={{
          height:heights[1],
          minHeight:140,
          overflow:'hidden',
          display:'flex',
          flexDirection:'column',
          margin:0,
        }}
      >
        <div className="advisor-scratchpad-head">
          <strong>MY NOTES</strong>
          <span>Saved automatically</span>
        </div>
        <textarea
          value={scratchpad}
          onChange={(event)=>setScratchpad(event.target.value)}
          placeholder="Capture notes, assumptions, and reminders. These notes are not sent to the advisor."
          aria-label="Persistent exercise scratchpad"
          style={{
            flex:1,
            minHeight:0,
            height:'auto',
            resize:'none',
            overflow:'auto',
          }}
        />
      </section>

      <HorizontalDivider
        labelText="Resize notes and response"
        onPointerDown={beginResize(1)}
      />

      <section style={{
        height:heights[2],
        minHeight:145,
        overflow:'auto',
        display:'flex',
        flexDirection:'column',
      }}>
        {pending && <div className="advisor-decision-card">
          <div className="panel-head">
            <h4>Interpreted Decision</h4>
            <span className={`chip ${pending.result.authorityAssessment.status==='within_authority'?'teal':'amber'}`}>
              {label(pending.result.authorityAssessment.status).toUpperCase()}
            </span>
          </div>
          <p><strong>{pending.result.interpretedIntent}</strong></p>
          <dl>
            <div><dt>Authority</dt><dd>{pending.result.authorityAssessment.explanation}</dd></div>
            <div><dt>Required coordination</dt><dd>{pending.result.authorityAssessment.requiredCoordination.join(', ') || 'None recorded'}</dd></div>
            <div><dt>Recommended next step</dt><dd>{pending.result.recommendedNextStep || 'Review the proposed action and affected records.'}</dd></div>
            <div><dt>Proposed action</dt><dd>{label(pending.result.proposedAction.type)}</dd></div>
          </dl>
          {pending.result.missingInformation.length>0 && <div>
            <strong>Missing information</strong>
            <ul>{pending.result.missingInformation.map((x)=><li key={x}>{x}</li>)}</ul>
          </div>}
          {pending.result.operationalConsiderations.length>0 && <div>
            <strong>Operational considerations</strong>
            <ul>{pending.result.operationalConsiderations.map((x)=><li key={x}>{x}</li>)}</ul>
          </div>}
          <div className="advisor-confirm-actions">
            <button className="primary small" onClick={onConfirm}>Confirm</button>
            <button className="secondary-button" onClick={()=>setText(pending.exactText)}>Revise</button>
            <button className="ghost-button" onClick={onCancel}>Cancel</button>
          </div>
        </div>}

        <textarea
          className="advisor-response-input"
          value={text}
          onChange={(event)=>setText(event.target.value)}
          placeholder="Enter your decision, rationale, coordination path, or question..."
          disabled={busy}
          style={{
            flex:1,
            minHeight:100,
            height:'auto',
            resize:'none',
            overflow:'auto',
          }}
        />
        <div className="advisor-actions">
          <span>Exact text preserved · role authority checked · state changes require validation</span>
          <button className="primary small" onClick={submit} disabled={!text.trim()||busy}>
            {busy?'Reviewing…':'Send'}
          </button>
        </div>
      </section>
    </section>
  )
}
