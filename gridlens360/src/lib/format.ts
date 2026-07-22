import type { Health, Trend } from "@/data/grid";

export const fmt = (n: number, decimals = 0): string =>
  n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

/** Signed value, e.g. +330 / −172. Uses a true minus sign for typographic quality. */
export const fmtSigned = (n: number, decimals = 0): string => {
  const s = fmt(Math.abs(n), decimals);
  if (n > 0) return `+${s}`;
  if (n < 0) return `−${s}`;
  return s;
};

export const pct = (n: number, decimals = 1): string => `${fmt(n, decimals)}%`;

export const trendOf = (curr: number, prev: number, deadband = 0.0005): Trend => {
  if (prev === 0) return "flat";
  const d = (curr - prev) / Math.abs(prev);
  if (d > deadband) return "up";
  if (d < -deadband) return "down";
  return "flat";
};

export const deltaPct = (curr: number, prev: number): number =>
  prev === 0 ? 0 : ((curr - prev) / Math.abs(prev)) * 100;

/** Utilisation → health band (firm-capacity / reserve headroom). */
export const bandFromUtil = (utilPct: number): Health => {
  if (utilPct >= 95) return "alert";
  if (utilPct >= 85) return "watch";
  return "good";
};

export const healthColor = (h: Health): string =>
  h === "alert" ? "var(--red)" : h === "watch" ? "var(--orange)" : "var(--green)";
