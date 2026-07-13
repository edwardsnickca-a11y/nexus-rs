import React from 'react'
import { buildExerciseStatus } from '../engine/exerciseController.js'

export default function ExerciseStatusBar({ missionState, onStart, onAdvance, onTransition, onEnd, onAar }) {
  const status = buildExerciseStatus(missionState)
  const canStart = status.status === 'ready'
  const canAdvance = ['active_op1', 'transition_to_op2', 'active_op2'].includes(status.status)
  const canTransition = status.status === 'active_op1'
  const canEnd = ['active_op1', 'transition_to_op2', 'active_op2'].includes(status.status)
  const canAar = Boolean(status.isFinalAarAvailable) || status.status === 'ended'

  return <section className="exercise-status-bar">
    <div><span>Scenario</span><strong>{status.scenarioName}</strong></div>
    <div><span>Role</span><strong>{status.roleName}</strong></div>
    <div><span>Status</span><strong>{status.label}</strong></div>
    <div><span>OP</span><strong>{status.activeOperationalPeriod || '—'}</strong></div>
    <div><span>Turn</span><strong>{status.turnNumber || 0}</strong></div>
    <div><span>Local time</span><strong>{status.localIncidentTime}</strong></div>
    <div className="status-actions">
      {canStart && <button className="primary small" onClick={onStart}>STARTEX</button>}
      {canAdvance && <button className="primary small" onClick={onAdvance}>NEXT TURN →</button>}
      {canTransition && <button className="ghost" onClick={onTransition}>Review Transition</button>}
      {canEnd && <button className="ghost danger" onClick={onEnd}>End Exercise</button>}
      {canAar && <button className="primary small" onClick={onAar}>Review AAR</button>}
    </div>
  </section>
}
