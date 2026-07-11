import { forwardRef } from "react";
import { Icon } from "../Icon";
import type { NexusIconProps } from "../icon-types";

export const DeadlinesIcon = forwardRef<
  SVGSVGElement,
  NexusIconProps
>(({ title = "Deadlines", ...props }, ref) => (
  <Icon
    ref={ref}
    name="deadlines"
    title={title}
    {...props}
  />
));

DeadlinesIcon.displayName = "DeadlinesIcon";
