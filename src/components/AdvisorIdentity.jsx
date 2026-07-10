import React from 'react'

export const LT_COL_EDWARDS_AVATAR = '/images/advisor/lt-col-edwards.png'

export default function AdvisorIdentity({
  compact = false,
  mode = 'connected',
  timestamp = '',
  message = '',
  className = '',
}) {
  const online = mode === 'connected'
  return <div className={`advisor-identity ${compact ? 'compact' : ''} ${className}`.trim()}>
    <div className="advisor-identity-header">
      <div className="advisor-avatar-wrap">
        <img src={LT_COL_EDWARDS_AVATAR} alt="Lt Col Edwards" className="advisor-avatar" />
        <span className={`advisor-online-dot ${online ? 'online' : 'fallback'}`} aria-label={online ? 'Online' : 'Local fallback'} />
      </div>
      <div className="advisor-identity-copy">
        <strong>LT COL EDWARDS</strong>
        <span>Senior Remote Sensing Mission Advisor</span>
      </div>
      <span className={`advisor-presence ${online ? 'online' : 'fallback'}`}>{online ? 'ONLINE' : 'LOCAL FALLBACK'}</span>
    </div>
    {(message || timestamp) && <div className="advisor-identity-message">
      {message && <p>{message}</p>}
      {timestamp && <time>{timestamp}</time>}
    </div>}
  </div>
}
