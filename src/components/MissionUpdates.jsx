export default function MissionUpdates({ missionState }) {
  const injects = [...(missionState.simulation?.injects || [])].reverse()
  return (
    <section className="panel mission-updates">
      <div className="panel-head">
        <div><span className="eyebrow">Consequence-Based Progression</span><h3>Mission Updates</h3></div>
        <span className="chip teal">TURN {missionState.simulation?.turn || 0}</span>
      </div>
      {!injects.length && <p className="muted">Submit a decision to advance the mission state and receive the next role-specific update.</p>}
      <div className="update-stack">
        {injects.map((inject) => (
          <article className="update-card" key={inject.id || inject.code}>
            <div className="update-card-head"><strong>{inject.title}</strong><span className={`chip ${inject.priority === 'HIGH' ? 'red' : 'amber'}`}>{inject.priority}</span></div>
            <p>{inject.text}</p>
            <small>Decision window: {inject.deadline}</small>
          </article>
        ))}
      </div>
    </section>
  )
}
