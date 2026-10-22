/**
 * Small stroke-icon set used across chrome (tabs, search, favorites).
 * Kept in `lib` so features do not depend on each other's internals.
 */
import type { ReactNode, SVGProps } from "react";

export type IconName =
  | "bookmark"
  | "check"
  | "chevronLeft"
  | "close"
  | "external"
  | "filter"
  | "locate"
  | "map"
  | "message"
  | "moon"
  | "mountain"
  | "search"
  | "send"
  | "settings"
  | "star"
  | "sun";

interface IconProps {
  name: IconName;
  size?: number;
  filled?: boolean;
  className?: string;
  title?: string;
}

const svgProps: SVGProps<SVGSVGElement> = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: "false",
};

const PATHS: Record<IconName, ReactNode> = {
  bookmark: (
    <path d="M7 4.8h10A1.2 1.2 0 0 1 18.2 6v14.1L12 16.4l-6.2 3.7V6A1.2 1.2 0 0 1 7 4.8z" />
  ),
  check: <path d="M5 12.5 9.2 17 19 7" />,
  chevronLeft: <path d="M14.5 5 8 12l6.5 7" />,
  close: (
    <>
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </>
  ),
  external: (
    <>
      <path d="M14 5h5v5" />
      <path d="M13 11 19 5" />
      <path d="M17 13.5V18a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 4 18V8A1.5 1.5 0 0 1 5.5 6.5H10" />
    </>
  ),
  filter: (
    <path d="M4 6h16M7 12h10M10 18h4" />
  ),
  locate: (
    <>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 3.5v2.4M12 18.1v2.4M3.5 12h2.4M18.1 12h2.4" />
    </>
  ),
  map: (
    <>
      <path d="M3.6 6.8 9 4.8l6 2.4 5.4-2.4v12.8L15 19.6l-6-2.4-5.4 2.4V6.8z" />
      <path d="M9 5v12.2M15 7.2V19.6" />
    </>
  ),
  message: (
    <path d="M5.2 18.8 4 21.5l3.1-.8A8.7 8.7 0 1 0 5.2 18.8z" />
  ),
  moon: (
    <path d="M20 14.2A7.6 7.6 0 0 1 9.8 4 7.8 7.8 0 1 0 20 14.2z" />
  ),
  mountain: (
    <path d="M3 19h18L14.7 7.8a1.6 1.6 0 0 0-2.8 0L9.3 13 8 11.2 3 19z" />
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.2" />
      <path d="m20 20-4.2-4.2" />
    </>
  ),
  send: <path d="M4 12 20 4l-5.5 16-2.7-6.3L4 12z" />,
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12.2 2h-.4a2 2 0 0 0-2 2v.2a2 2 0 0 1-1 1.7l-.4.3a2 2 0 0 1-2 0l-.2-.1a2 2 0 0 0-2.7.7l-.2.4a2 2 0 0 0 .7 2.7l.2.1a2 2 0 0 1 1 1.7v.5a2 2 0 0 1-1 1.8l-.2.1a2 2 0 0 0-.7 2.7l.2.4a2 2 0 0 0 2.7.7l.2-.1a2 2 0 0 1 2 0l.4.3a2 2 0 0 1 1 1.7V20a2 2 0 0 0 2 2h.4a2 2 0 0 0 2-2v-.2a2 2 0 0 1 1-1.7l.4-.3a2 2 0 0 1 2 0l.2.1a2 2 0 0 0 2.7-.7l.2-.4a2 2 0 0 0-.7-2.7l-.2-.1a2 2 0 0 1-1-1.8v-.5a2 2 0 0 1 1-1.7l.2-.1a2 2 0 0 0 .7-2.7l-.2-.4a2 2 0 0 0-2.7-.7l-.2.1a2 2 0 0 1-2 0l-.4-.3a2 2 0 0 1-1-1.7V4a2 2 0 0 0-2-2z" />
    </>
  ),
  star: (
    <path d="M12 3.6 14.4 9l5.8.7-4.3 3.9 1.2 5.7L12 16.6 6.9 19.3l1.2-5.7L3.8 9.7 9.6 9 12 3.6z" />
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="3.6" />
      <path d="M12 3.4v1.8M12 18.8v1.8M4.9 4.9l1.3 1.3M17.8 17.8l1.3 1.3M3.4 12h1.8M18.8 12h1.8M4.9 19.1l1.3-1.3M17.8 6.2l1.3-1.3" />
    </>
  ),
};

export function Icon({
  name,
  size = 22,
  filled = false,
  className,
  title,
}: IconProps) {
  return (
    <svg
      {...svgProps}
      width={size}
      height={size}
      className={className}
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? "none" : "currentColor"}
    >
      {title ? <title>{title}</title> : null}
      {PATHS[name]}
    </svg>
  );
}
