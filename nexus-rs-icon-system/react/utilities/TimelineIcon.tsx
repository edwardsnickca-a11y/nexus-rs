import { forwardRef } from "react";
import { Icon } from "../Icon";
import type { NexusIconProps } from "../icon-types";

export const TimelineIcon = forwardRef<
  SVGSVGElement,
  NexusIconProps
>(({ title = "Timeline", ...props }, ref) => (
  <Icon
    ref={ref}
    name="timeline"
    title={title}
    {...props}
  />
));

TimelineIcon.displayName = "TimelineIcon";
