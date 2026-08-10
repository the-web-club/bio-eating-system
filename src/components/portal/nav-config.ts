import type { ComponentType, SVGProps } from "react";
import {
  IconAccount,
  IconLearn,
  IconPlan,
  IconProgress,
  IconShop,
  IconToday,
} from "./icons";

export type NavItem = {
  href: string;
  label: string;
  shortLabel: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  mobilePrimary?: boolean;
};

type NavDef = {
  path: string;
  label: string;
  short: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  mobilePrimary?: boolean;
};

const NAV_DEFS: NavDef[] = [
  { path: "", label: "Today", short: "Today", icon: IconToday, mobilePrimary: true },
  { path: "/plan", label: "Plan", short: "Plan", icon: IconPlan, mobilePrimary: true },
  { path: "/weekly", label: "Shop", short: "Shop", icon: IconShop, mobilePrimary: true },
  {
    path: "/progress",
    label: "Progress",
    short: "Progress",
    icon: IconProgress,
    mobilePrimary: true,
  },
  { path: "/learn", label: "Learn", short: "Learn", icon: IconLearn },
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
    label: "Profile",
    shortLabel: "Profile",
    icon: IconAccount,
  };
}

export function isNavItemActive(pathname: string, href: string, basePath: string) {
  const root = rootOf(basePath);
  if (href === root) return pathname === root || pathname === `${root}/`;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Biomarkers and legacy routes — linked from Profile, not primary nav. */
export function getProfileExtras(basePath = "/portal") {
  const root = rootOf(basePath);
  return {
    biomarkers: `${root}/biomarkers`,
    recalibrate: `${root}/recalibrate`,
    checkIn: `${root}/check-in`,
  };
}
