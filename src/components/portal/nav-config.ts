import type { ComponentType, SVGProps } from "react";
import {
  IconAccount,
  IconLab,
  IconLearn,
  IconPlan,
  IconPrograms,
  IconToday,
  IconWeek,
} from "./icons";

export type NavItem = {
  href: string;
  label: string;
  /** Used where horizontal room is tight, such as the mobile tab bar. */
  shortLabel: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  mobilePrimary?: boolean;
};

type NavDef = {
  path: string;
  label: string;
  short: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** Shown in the mobile tab bar; the rest stay in the menu. */
  mobilePrimary?: boolean;
};

/** Labels describe the customer's intent, in sentence case. */
const NAV_DEFS: NavDef[] = [
  { path: "", label: "Today", short: "Today", icon: IconToday, mobilePrimary: true },
  {
    path: "/plan",
    label: "Daily plan",
    short: "Plan",
    icon: IconPlan,
    mobilePrimary: true,
  },
  {
    path: "/weekly",
    label: "Weekly plan",
    short: "Week",
    icon: IconWeek,
    mobilePrimary: true,
  },
  {
    path: "/biomarkers",
    label: "Biomarkers",
    short: "Markers",
    icon: IconLab,
    mobilePrimary: true,
  },
  { path: "/learn", label: "Learn", short: "Learn", icon: IconLearn },
  {
    path: "/programs",
    label: "Programs",
    short: "Programs",
    icon: IconPrograms,
    mobilePrimary: true,
  },
];

function rootOf(basePath: string) {
  return basePath.replace(/\/$/, "") || "/portal";
}

export function getPrimaryNav(basePath = "/portal"): NavItem[] {
  const root = rootOf(basePath);
  return NAV_DEFS.map((item) => ({
    href: item.path ? `${root}${item.path}` : root,
    label: item.label,
    shortLabel: item.short,
    icon: item.icon,
    mobilePrimary: item.mobilePrimary,
  }));
}

export function getAccountNav(basePath = "/portal"): NavItem {
  const root = rootOf(basePath);
  return {
    href: `${root}/account`,
    label: "Account",
    shortLabel: "Account",
    icon: IconAccount,
  };
}

/** True when the item represents the current location. */
export function isNavItemActive(pathname: string, href: string, basePath: string) {
  const root = rootOf(basePath);
  if (href === root) return pathname === root || pathname === `${root}/`;
  return pathname === href || pathname.startsWith(`${href}/`);
}
