import { forwardRef } from "react";
import { Icon } from "../Icon";
import type { NexusIconProps } from "../icon-types";

export const IntelOversightIcon = forwardRef<
  SVGSVGElement,
  NexusIconProps
>(({ title = "Intelligence Oversight", ...props }, ref) => (
  <Icon
    ref={ref}
    name="intel-oversight"
    title={title}
    {...props}
  />
));

IntelOversightIcon.displayName = "IntelOversightIcon";
