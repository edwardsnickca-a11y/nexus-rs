import { forwardRef } from "react";
import { Icon } from "../Icon";
import type { NexusIconProps } from "../icon-types";

export const FilterIcon = forwardRef<
  SVGSVGElement,
  NexusIconProps
>(({ title = "Filter", ...props }, ref) => (
  <Icon
    ref={ref}
    name="filter"
    title={title}
    {...props}
  />
));

FilterIcon.displayName = "FilterIcon";
