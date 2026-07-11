import { forwardRef } from "react";
import { Icon } from "../Icon";
import type { NexusIconProps } from "../icon-types";

export const SubmitIcon = forwardRef<
  SVGSVGElement,
  NexusIconProps
>(({ title = "Submit", ...props }, ref) => (
  <Icon
    ref={ref}
    name="submit"
    title={title}
    {...props}
  />
));

SubmitIcon.displayName = "SubmitIcon";
