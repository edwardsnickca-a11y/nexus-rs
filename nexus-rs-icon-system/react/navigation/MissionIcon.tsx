import { forwardRef } from "react";
import { Icon } from "../Icon";
import type { NexusIconProps } from "../icon-types";

export const MissionIcon = forwardRef<
  SVGSVGElement,
  NexusIconProps
>(({ title = "Mission", ...props }, ref) => (
  <Icon
    ref={ref}
    name="mission"
    title={title}
    {...props}
  />
));

MissionIcon.displayName = "MissionIcon";
