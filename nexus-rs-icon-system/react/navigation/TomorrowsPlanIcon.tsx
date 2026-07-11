import { forwardRef } from "react";
import { Icon } from "../Icon";
import type { NexusIconProps } from "../icon-types";

export const TomorrowsPlanIcon = forwardRef<
  SVGSVGElement,
  NexusIconProps
>(({ title = "Tomorrow's Plan", ...props }, ref) => (
  <Icon
    ref={ref}
    name="tomorrows-plan"
    title={title}
    {...props}
  />
));

TomorrowsPlanIcon.displayName = "TomorrowsPlanIcon";
