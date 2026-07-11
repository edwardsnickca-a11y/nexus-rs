import type { SVGProps } from "react";

export type NexusIconName =
  | "mission"
  | "current-ops"
  | "tomorrows-plan"
  | "sync-matrix"
  | "requirements"
  | "platforms"
  | "upad-status"
  | "airspace"
  | "intel-oversight"
  | "deadlines"
  | "decision-log"
  | "notes"
  | "menu"
  | "settings"
  | "notifications"
  | "help"
  | "history"
  | "advisor"
  | "products"
  | "mission-board"
  | "timeline"
  | "map-layers"
  | "zoom"
  | "reset-view"
  | "expand"
  | "collapse"
  | "filter"
  | "search"
  | "close"
  | "submit"
  | "send"
  | "download"
  | "upload"
  | "refresh";

export type NexusIconState =
  | "default"
  | "hover"
  | "selected"
  | "disabled";

export interface NexusIconProps
  extends Omit<SVGProps<SVGSVGElement>, "color"> {
  size?: number | string;
  color?: string;
  title?: string;
}
