import { forwardRef } from "react";
import { Icon } from "../Icon";
import type { NexusIconProps } from "../icon-types";

export const CurrentOpsIcon = forwardRef<
  SVGSVGElement,
  NexusIconProps
>(({ title = "Current Ops", ...props }, ref) => (
  <Icon
    ref={ref}
    name="current-ops"
    title={title}
    {...props}
  />
));

CurrentOpsIcon.displayName = "CurrentOpsIcon";
