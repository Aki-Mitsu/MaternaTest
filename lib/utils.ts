import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Stable reference anchor for SSR prerender consistency
const STATIC_STABLE_ANCHOR = new Date('2026-10-24T09:00:00Z');

export function formatDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return "";
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatTimeAgo(isoTimestamp: string | null | undefined, nowMs?: number): string {
  if (!isoTimestamp) return "No logs yet";
  const timeMs = new Date(isoTimestamp).getTime();
  if (Number.isNaN(timeMs)) return "Just now";

  const currentMs = nowMs ?? STATIC_STABLE_ANCHOR.getTime();
  const diffMins = Math.max(0, Math.floor((currentMs - timeMs) / 60000));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;

  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  if (hours < 24) {
    return mins > 0 ? `${hours}h ${mins}m ago` : `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);
  return days === 1 ? "Yesterday" : `${days}d ago`;
}

export function getMinutesSince(isoTimestamp: string | null | undefined, nowMs?: number): number {
  if (!isoTimestamp) return 45;
  const timeMs = new Date(isoTimestamp).getTime();
  if (Number.isNaN(timeMs)) return 45;
  const currentMs = nowMs ?? STATIC_STABLE_ANCHOR.getTime();
  return Math.max(0, Math.floor((currentMs - timeMs) / 60000));
}

export function calculatePostpartumAge(
  birthDateString: string | null | undefined,
  refDate?: Date | null
): {
  weeks: number;
  days: number;
  totalDays: number;
  recoveryStage: string;
  pelvicFloorStage: string;
  recommendedWakeWindowMins: number;
} {
  if (!birthDateString) {
    return {
      weeks: 6,
      days: 2,
      totalDays: 44,
      recoveryStage: "Mid-Recovery Checkpoint",
      pelvicFloorStage: "Pelvic Floor Stage 1",
      recommendedWakeWindowMins: 75,
    };
  }

  const birthDate = new Date(birthDateString);
  const anchor = refDate || STATIC_STABLE_ANCHOR;
  const diffTime = Math.max(0, anchor.getTime() - birthDate.getTime());
  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const weeks = Math.max(1, Math.floor(totalDays / 7));
  const days = totalDays % 7;

  let recoveryStage = "Early Fourth Trimester";
  let pelvicFloorStage = "Pelvic Floor Stage 1";

  if (weeks >= 6 && weeks < 12) {
    recoveryStage = "Mid-Recovery Checkpoint";
    pelvicFloorStage = "Pelvic Floor Stage 1";
  } else if (weeks >= 12 && weeks < 24) {
    recoveryStage = "Strength & Mobility Phase";
    pelvicFloorStage = "Pelvic Floor Stage 2";
  } else if (weeks >= 24) {
    recoveryStage = "Graduation & Ongoing Vitality";
    pelvicFloorStage = "Core & Functional Stamina";
  }

  // Age-appropriate wake window prediction in minutes
  let recommendedWakeWindowMins = 75;
  if (weeks < 4) {
    recommendedWakeWindowMins = 55;
  } else if (weeks < 8) {
    recommendedWakeWindowMins = 75;
  } else if (weeks < 12) {
    recommendedWakeWindowMins = 90;
  } else if (weeks < 16) {
    recommendedWakeWindowMins = 105;
  } else {
    recommendedWakeWindowMins = 120;
  }

  return {
    weeks,
    days,
    totalDays,
    recoveryStage,
    pelvicFloorStage,
    recommendedWakeWindowMins,
  };
}
