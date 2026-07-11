import { forwardRef } from "react";
import { Icon } from "../Icon";
import type { NexusIconProps } from "../icon-types";

export const ResetViewIcon = forwardRef<
  SVGSVGElement,
  NexusIconProps
>(({ title = "Reset View", ...props }, ref) => (
  <Icon
    ref={ref}
    name="reset-view"
    title={title}
    {...props}
  />
));

ResetViewIcon.displayName = "ResetViewIcon";
