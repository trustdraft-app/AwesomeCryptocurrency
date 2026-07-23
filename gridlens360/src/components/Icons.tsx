// Minimal line-style icons (stroke = currentColor) for the tab bar & UI.
type P = { className?: string };
const base = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export const IcCommand = (p: P) => (
  <svg viewBox="0 0 24 24" {...p} {...base}><rect x="3" y="3" width="7" height="8" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="11" width="7" height="10" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /></svg>
);
export const IcPeak = (p: P) => (
  <svg viewBox="0 0 24 24" {...p} {...base}><path d="M3 17l5-6 4 3 4-8 5 6" /><circle cx="16" cy="6" r="1.4" fill="currentColor" stroke="none" /></svg>
);
export const IcPower = (p: P) => (
  <svg viewBox="0 0 24 24" {...p} {...base}><path d="M13 2L5 13h6l-1 9 8-12h-6z" /></svg>
);
export const IcClean = (p: P) => (
  <svg viewBox="0 0 24 24" {...p} {...base}><circle cx="12" cy="12" r="4" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1" /></svg>
);
export const IcAssets = (p: P) => (
  <svg viewBox="0 0 24 24" {...p} {...base}><path d="M12 3l8 3v5c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z" /><path d="M9 12l2 2 4-4" /></svg>
);
export const IcBolt = (p: P) => (
  <svg viewBox="0 0 24 24" {...p} {...base}><path d="M13 2L5 13h6l-1 9 8-12h-6z" /></svg>
);
export const IcInfo = (p: P) => (
  <svg viewBox="0 0 24 24" {...p} {...base}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>
);
