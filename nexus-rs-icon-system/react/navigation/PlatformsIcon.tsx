import { forwardRef } from "react";
import { Icon } from "../Icon";
import type { NexusIconProps } from "../icon-types";

export const PlatformsIcon = forwardRef<
  SVGSVGElement,
  NexusIconProps
>(({ title = "Platforms", ...props }, ref) => (
  <Icon
    ref={ref}
    name="platforms"
    title={title}
    {...props}
  />
));

PlatformsIcon.displayName = "PlatformsIcon";
