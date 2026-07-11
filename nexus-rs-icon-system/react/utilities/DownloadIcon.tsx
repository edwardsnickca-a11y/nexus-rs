import { forwardRef } from "react";
import { Icon } from "../Icon";
import type { NexusIconProps } from "../icon-types";

export const DownloadIcon = forwardRef<
  SVGSVGElement,
  NexusIconProps
>(({ title = "Download", ...props }, ref) => (
  <Icon
    ref={ref}
    name="download"
    title={title}
    {...props}
  />
));

DownloadIcon.displayName = "DownloadIcon";
