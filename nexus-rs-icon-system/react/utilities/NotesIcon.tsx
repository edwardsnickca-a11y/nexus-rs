import { forwardRef } from "react";
import { Icon } from "../Icon";
import type { NexusIconProps } from "../icon-types";

export const NotesIcon = forwardRef<
  SVGSVGElement,
  NexusIconProps
>(({ title = "Notes", ...props }, ref) => (
  <Icon
    ref={ref}
    name="notes"
    title={title}
    {...props}
  />
));

NotesIcon.displayName = "NotesIcon";
