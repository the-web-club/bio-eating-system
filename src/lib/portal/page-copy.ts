import type { ReactNode } from "react";

export type PortalPageSkeleton =
  | "today"
  | "plan"
  | "list"
  | "programs"
  | "reading"
  | "progress"
  | "check-in";

export type PortalPageCopy = {
  title: string;
  description?: string;
  width?: "wide" | "reading";
  skeleton: PortalPageSkeleton;
  loadingLabel: string;
  meta?: ReactNode;
};

/** Static page openings for portal routes. Shared by pages and loading.tsx. */
export const PORTAL_PAGE_COPY = {
  today: {
    title: "Today",
    skeleton: "today",
    loadingLabel: "Loading your program",
  },
  plan: {
    title: "Plan",
    skeleton: "plan",
    loadingLabel: "Loading your daily plan",
  },
  weekly: {
    title: "Shop",
    description: "What do I buy?",
    skeleton: "list",
    loadingLabel: "Loading your shopping list",
  },
  progress: {
    title: "Progress",
    description: "Is this working? Trends matter more than a single number.",
    skeleton: "progress",
    loadingLabel: "Loading your progress",
  },
  learn: {
    title: "Learn",
    description: "Short lessons on eating practices, to read alongside your plan.",
    width: "reading",
    skeleton: "reading",
    loadingLabel: "Loading lessons",
  },
  programs: {
    title: "Programs",
    description: "What you are working through now, and what you could add.",
    skeleton: "programs",
    loadingLabel: "Loading your programs",
  },
  account: {
    title: "Profile",
    description: "My preferences and settings.",
    width: "reading",
    skeleton: "reading",
    loadingLabel: "Loading your profile",
  },
  biomarkers: {
    title: "Biomarkers",
    description: "What each marker describes, and the reference context around it.",
    width: "reading",
    skeleton: "list",
    loadingLabel: "Loading the biomarker reference",
  },
  checkIn: {
    title: "How did this week feel?",
    description: "About two minutes. This shapes your next week.",
    width: "reading",
    skeleton: "check-in",
    loadingLabel: "Loading check-in",
  },
} as const satisfies Record<string, PortalPageCopy>;

export type PortalPageCopyKey = keyof typeof PORTAL_PAGE_COPY;
