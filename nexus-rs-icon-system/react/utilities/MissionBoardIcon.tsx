import { forwardRef } from "react";
import { Icon } from "../Icon";
import type { NexusIconProps } from "../icon-types";

export const MissionBoardIcon = forwardRef<
  SVGSVGElement,
  NexusIconProps
>(({ title = "Mission Board", ...props }, ref) => (
  <Icon
    ref={ref}
    name="mission-board"
    title={title}
    {...props}
  />
));

MissionBoardIcon.displayName = "MissionBoardIcon";
