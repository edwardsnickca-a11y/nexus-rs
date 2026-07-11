import { forwardRef } from "react";
import { Icon } from "../Icon";
import type { NexusIconProps } from "../icon-types";

export const SearchIcon = forwardRef<
  SVGSVGElement,
  NexusIconProps
>(({ title = "Search", ...props }, ref) => (
  <Icon
    ref={ref}
    name="search"
    title={title}
    {...props}
  />
));

SearchIcon.displayName = "SearchIcon";
