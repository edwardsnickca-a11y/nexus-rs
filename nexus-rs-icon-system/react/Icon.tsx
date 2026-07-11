import { forwardRef, useId } from "react";
import { iconPaths } from "./icon-paths";
import type {
  NexusIconName,
  NexusIconProps,
  NexusIconState,
} from "./icon-types";
import "./nexus-icons.css";

export interface IconProps extends NexusIconProps {
  name: NexusIconName;
  state?: NexusIconState;
  selectedBackground?: boolean;
}

export const Icon = forwardRef<SVGSVGElement, IconProps>(
  (
    {
      name,
      size = 24,
      color = "currentColor",
      title,
      state = "default",
      selectedBackground = true,
      className,
      ...svgProps
    },
    ref,
  ) => {
    const titleId = useId();
    const classes = [
      "nexus-icon",
      `nexus-icon--${state}`,
      selectedBackground ? "nexus-icon--with-selected-background" : "",
      className ?? "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <span className={classes} data-icon-state={state}>
        <svg
          ref={ref}
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="square"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          role={title ? "img" : undefined}
          aria-labelledby={title ? titleId : undefined}
          aria-hidden={title ? undefined : true}
          focusable="false"
          {...svgProps}
        >
          {title ? <title id={titleId}>{title}</title> : null}
          {iconPaths[name]}
        </svg>
      </span>
    );
  },
);

Icon.displayName = "Icon";
