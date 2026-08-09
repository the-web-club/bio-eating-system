import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

/**
 * Line icons at a single 1.4 stroke weight. Sized by the caller so navigation
 * can hold them back and interactive rows can bring them forward.
 */
const base = {
  width: 20,
  height: 20,
  viewBox: "0 0 20 20",
  fill: "none",
  "aria-hidden": true as const,
};

const stroke = {
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconToday(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="10" cy="10" r="6.5" {...stroke} />
      <path d="M10 6.75V10l2.25 1.5" {...stroke} />
    </svg>
  );
}

export function IconPlan(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5.5 4.5h9v11h-9v-11ZM8 8.25h4.25M8 11.25h4.25" {...stroke} />
    </svg>
  );
}

export function IconWeek(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 5.75h12v9.75H4V5.75ZM4 9h12M7.25 4v2.5M12.75 4v2.5" {...stroke} />
    </svg>
  );
}

export function IconLab(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M8.25 3.75h3.5M9 3.75v4.9L5.6 14.6a1.4 1.4 0 0 0 1.2 2.1h6.4a1.4 1.4 0 0 0 1.2-2.1L11 8.65V3.75" {...stroke} />
    </svg>
  );
}

export function IconLearn(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 5.5 10 3.25l6 2.25v7.5L10 15.25 4 13V5.5ZM10 3.25v12" {...stroke} />
    </svg>
  );
}

export function IconPrograms(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 5.25h12M4 10h12M4 14.75h12" {...stroke} />
      <circle cx="7" cy="5.25" r="1.15" fill="currentColor" />
      <circle cx="12" cy="10" r="1.15" fill="currentColor" />
      <circle cx="9" cy="14.75" r="1.15" fill="currentColor" />
    </svg>
  );
}

export function IconAccount(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="10" cy="7.25" r="2.75" {...stroke} />
      <path d="M4.5 16.25c1.15-2.4 3.05-3.4 5.5-3.4s4.35 1 5.5 3.4" {...stroke} />
    </svg>
  );
}

export function IconLock(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6.75 9V7.25a3.25 3.25 0 0 1 6.5 0V9M5.75 9h8.5v6.75h-8.5V9Z" {...stroke} />
    </svg>
  );
}

export function IconMenu(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 6.25h12M4 10h12M4 13.75h12" {...stroke} />
    </svg>
  );
}

export function IconClose(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5.75 5.75l8.5 8.5M14.25 5.75l-8.5 8.5" {...stroke} />
    </svg>
  );
}

/** Points right. Rotate with a class for disclosure controls. */
export function IconChevron(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M7.75 5.5l4.5 4.5-4.5 4.5" {...stroke} />
    </svg>
  );
}

export function IconChevronDown(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5.5 8.25 10 12.75l4.5-4.5" {...stroke} />
    </svg>
  );
}

export function IconArrowRight(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4.5 10h11M11 5.5l4.5 4.5-4.5 4.5" {...stroke} />
    </svg>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4.75 10.5 8 13.75l7-7.5" {...stroke} />
    </svg>
  );
}

export function IconSun(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="10" cy="10" r="3.25" {...stroke} />
      <path
        d="M10 3v1.5M10 15.5V17M3 10h1.5M15.5 10H17M5.4 5.4l1.05 1.05M13.55 13.55l1.05 1.05M14.6 5.4l-1.05 1.05M6.45 13.55 5.4 14.6"
        {...stroke}
      />
    </svg>
  );
}

export function IconMoon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path
        d="M15.25 12.4A5.75 5.75 0 0 1 7.6 4.75a6.25 6.25 0 1 0 7.65 7.65Z"
        {...stroke}
      />
    </svg>
  );
}

/** Retained for compatibility with the previous nav icon name. */
export const IconHome = IconToday;
