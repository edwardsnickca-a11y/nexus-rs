import { forwardRef } from "react";
import { Icon } from "../Icon";
import type { NexusIconProps } from "../icon-types";

export const SendIcon = forwardRef<
  SVGSVGElement,
  NexusIconProps
>(({ title = "Send", ...props }, ref) => (
  <Icon
    ref={ref}
    name="send"
    title={title}
    {...props}
  />
));

SendIcon.displayName = "SendIcon";
