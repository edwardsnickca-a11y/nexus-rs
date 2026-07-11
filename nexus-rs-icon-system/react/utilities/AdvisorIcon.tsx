import { forwardRef } from "react";
import { Icon } from "../Icon";
import type { NexusIconProps } from "../icon-types";

export const AdvisorIcon = forwardRef<
  SVGSVGElement,
  NexusIconProps
>(({ title = "Advisor", ...props }, ref) => (
  <Icon
    ref={ref}
    name="advisor"
    title={title}
    {...props}
  />
));

AdvisorIcon.displayName = "AdvisorIcon";
