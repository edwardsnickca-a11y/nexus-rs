import { forwardRef } from "react";
import { Icon } from "../Icon";
import type { NexusIconProps } from "../icon-types";

export const SyncMatrixIcon = forwardRef<
  SVGSVGElement,
  NexusIconProps
>(({ title = "Sync Matrix", ...props }, ref) => (
  <Icon
    ref={ref}
    name="sync-matrix"
    title={title}
    {...props}
  />
));

SyncMatrixIcon.displayName = "SyncMatrixIcon";
