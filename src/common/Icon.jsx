import React from 'react'

// Navigation
import mission from '../icons/mission.svg'
import currentOps from '../icons/current-ops.svg'
import tomorrowsPlan from '../icons/tomorrows-plan.svg'
import syncMatrix from '../icons/sync-matrix.svg'
import requirements from '../icons/requirements.svg'
import platforms from '../icons/platforms.svg'
import upadStatus from '../icons/upad-status.svg'
import airspace from '../icons/airspace.svg'
import intelOversight from '../icons/intel-oversight.svg'
import deadlines from '../icons/deadlines.svg'
import decisionLog from '../icons/decision-log.svg'

// Utility
import advisor from '../icons/advisor.svg'
import collapse from '../icons/collapse.svg'
import download from '../icons/download.svg'
import expand from '../icons/expand.svg'
import filter from '../icons/filter.svg'
import help from '../icons/help.svg'
import history from '../icons/history.svg'
import mapLayers from '../icons/map-layers.svg'
import menu from '../icons/menu.svg'
import missionBoard from '../icons/mission-board.svg'
import notes from '../icons/notes.svg'
import notifications from '../icons/notifications.svg'
import products from '../icons/products.svg'
import refresh from '../icons/refresh.svg'
import search from '../icons/search.svg'
import send from '../icons/send.svg'
import settings from '../icons/settings.svg'
import submit from '../icons/submit.svg'
import timeline from '../icons/timeline.svg'
import upload from '../icons/upload.svg'
import zoom from '../icons/zoom.svg'

const ICONS = {
  mission,
  'current-ops': currentOps,
  'tomorrows-plan': tomorrowsPlan,
  'sync-matrix': syncMatrix,
  requirements,
  platforms,
  'upad-status': upadStatus,
  airspace,
  'intel-oversight': intelOversight,
  deadlines,
  'decision-log': decisionLog,
  advisor,
  collapse,
  download,
  expand,
  filter,
  help,
  history,
  'map-layers': mapLayers,
  menu,
  'mission-board': missionBoard,
  notes,
  notifications,
  products,
  refresh,
  search,
  send,
  settings,
  submit,
  timeline,
  upload,
  zoom,
}

/**
 * Shared NEXUS RS icon.
 *
 * SVG files are applied as CSS masks so every icon automatically inherits
 * the surrounding text color. This supports normal, hover, selected, and
 * disabled states without modifying each SVG file.
 */
export default function Icon({
  name,
  size = 24,
  className = '',
  title = '',
  style = {},
}) {
  const source = ICONS[name]

  if (!source) {
    console.warn(`[Icon] Unknown icon: ${name}`)
    return null
  }

  return (
    <span
      className={`nexus-icon ${className}`.trim()}
      role={title ? 'img' : undefined}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : true}
      title={title || undefined}
      style={{
        display: 'inline-block',
        flex: '0 0 auto',
        width: size,
        height: size,
        backgroundColor: 'currentColor',
        WebkitMaskImage: `url("${source}")`,
        maskImage: `url("${source}")`,
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        ...style,
      }}
    />
  )
}
