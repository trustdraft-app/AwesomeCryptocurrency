import type { Health } from "@/data/grid";

export function LivePill({ snapshot }: { snapshot?: boolean }) {
  return (
    <span className={`live-pill ${snapshot ? "snap" : ""}`}>
      <span className="live-dot" />
      {snapshot ? "SNAPSHOT" : "LIVE"}
    </span>
  );
}

export function HealthPill({ health, children }: { health: Health; children: React.ReactNode }) {
  const map: Record<Health, string> = { good: "var(--green)", watch: "var(--orange)", alert: "var(--red)" };
  // Glyph backs up the colour so severity survives grayscale / colour-blindness.
  const glyph: Record<Health, string> = { good: "✓", watch: "!", alert: "▲" };
  return (
    <span className="health-pill" style={{ color: map[health], borderColor: `${map[health]}55`, background: `${map[health]}18` }}>
      <span aria-hidden style={{ fontWeight: 800, marginRight: 5 }}>{glyph[health]}</span>
      {children}
    </span>
  );
}
