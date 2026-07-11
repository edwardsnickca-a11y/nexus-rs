import React from "react";

// Navigation
import mission from "../icons/mission.svg";
import currentOps from "../icons/current-ops.svg";
import tomorrowsPlan from "../icons/tomorrows-plan.svg";
import syncMatrix from "../icons/sync-matrix.svg";
import requirements from "../icons/requirements.svg";
import platforms from "../icons/platforms.svg";
import upadStatus from "../icons/upad-status.svg";
import airspace from "../icons/airspace.svg";
import intelOversight from "../icons/intel-oversight.svg";
import deadlines from "../icons/deadlines.svg";
import decisionLog from "../icons/decision-log.svg";

// Utility
import notes from "../icons/notes.svg";
import menu from "../icons/menu.svg";

const icons = {
  mission,
  "current-ops": currentOps,
  "tomorrows-plan": tomorrowsPlan,
  "sync-matrix": syncMatrix,
  requirements,
  platforms,
  "upad-status": upadStatus,
  airspace,
  "intel-oversight": intelOversight,
  deadlines,
  "decision-log": decisionLog,
  notes,
  menu,
};

export default function Icon({
  name,
  size = 24,
  className = "",
  alt = "",
}) {
  const src = icons[name];

  if (!src) return null;

  return (
    <img
      src={src}
      alt={alt || name}
      width={size}
      height={size}
      className={className}
      draggable={false}
    />
  );
}