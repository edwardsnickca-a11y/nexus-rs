import { forwardRef } from "react";
import { Icon } from "../Icon";
import type { NexusIconProps } from "../icon-types";

export const DecisionLogIcon = forwardRef<
  SVGSVGElement,
  NexusIconProps
>(({ title = "Decision Log", ...props }, ref) => (
  <Icon
    ref={ref}
    name="decision-log"
    title={title}
    {...props}
  />
));

DecisionLogIcon.displayName = "DecisionLogIcon";
