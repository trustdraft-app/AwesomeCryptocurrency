import { useMemo, useState } from "react";
import Panel from "@/components/Panel";
import KpiTile from "@/components/KpiTile";
import AnimatedNumber from "@/components/AnimatedNumber";
import { HealthPill } from "@/components/StatusPill";
import { substations, meta } from "@/data/grid";
import { fmt, bandFromUtil, healthColor } from "@/lib/format";

type Sort = "risk" | "spare" | "load";

export default function Assets() {
  const [sort, setSort] = useState<Sort>("risk");
  const active = substations.filter((s) => s.active);
  const totalFirm = active.reduce((s, x) => s + x.firmMW, 0);
  const totalLoad = active.reduce((s, x) => s + x.loadMW, 0);
  const spare = totalFirm - totalLoad;
  const worst = active.reduce((m, x) => Math.max(m, (x.loadMW / x.firmMW) * 100), 0);
  const atRisk = active.filter((x) => (x.loadMW / x.firmMW) * 100 >= 85).length;

  const rows = useMemo(() => {
    const withUtil = substations.map((s) => ({ ...s, util: (s.loadMW / s.firmMW) * 100, spareMW: s.firmMW - s.loadMW }));
    return withUtil.sort((a, b) => {
      if (sort === "risk") return b.util - a.util;
      if (sort === "spare") return a.spareMW - b.spareMW;
      return b.loadMW - a.loadMW;
    });
  }, [sort]);

  return (
    <div className="stack">
      <div className="hero" style={{ background: "linear-gradient(150deg, rgba(76,155,255,0.15), rgba(255,146,61,0.05) 60%, transparent)" }}>
        <div className="glow" />
        <span className="faint" style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.06em" }}>FIRM CAPACITY · DAMMAM AREA (N-1)</span>
        <div className="hero-big">
          <AnimatedNumber value={worst} decimals={0} /><span className="u">%</span>
        </div>
        <div className="row" style={{ gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          {/* Band from the rounded value shown in the hero, so 95% never reads as "watch". */}
          <HealthPill health={bandFromUtil(Math.round(worst))}>Highest loading</HealthPill>
          <HealthPill health={atRisk > 0 ? "watch" : "good"}>{atRisk} approaching firm</HealthPill>
        </div>
      </div>

      <div className="grid-3">
        <KpiTile label="Firm Capacity" value={totalFirm} accent="var(--blue)" />
        <KpiTile label="Load Now" value={totalLoad} accent="var(--teal)" />
        <KpiTile label="Spare" value={spare} accent="var(--green)" />
      </div>

      <div className="insight">
        <span className="ic">🛡️</span>
        <span><b>Firm capacity</b> is the load a substation can still carry with its single largest transformer out of service (N-1). Bars below show live loading against that limit — anything <b style={{ color: "var(--orange)" }}>amber</b> or <b style={{ color: "var(--red)" }}>red</b> has little headroom for a contingency.</span>
      </div>

      <div className="seg" style={{ ["--accent" as string]: "var(--orange)" }}>
        <button className={sort === "risk" ? "on" : ""} onClick={() => setSort("risk")}>Highest loading</button>
        <button className={sort === "spare" ? "on" : ""} onClick={() => setSort("spare")}>Least spare</button>
        <button className={sort === "load" ? "on" : ""} onClick={() => setSort("load")}>Biggest load</button>
      </div>

      <Panel title="Substations" accent="var(--orange)" aux={`${active.length} active`} delay={0.05}>
        <div className="stack" style={{ gap: 14 }}>
          {rows.map((s) => {
            const band = bandFromUtil(s.util);
            return (
              <div key={s.name} style={{ opacity: s.active ? 1 : 0.5 }}>
                <div className="row" style={{ justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 650 }}>
                    {s.name}
                    {!s.active && <span className="faint" style={{ fontSize: 10, marginLeft: 6 }}>INACTIVE</span>}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: healthColor(band) }}>{s.util.toFixed(0)}%</span>
                </div>
                <div style={{ height: 8, borderRadius: 5, background: "var(--surface-2)", overflow: "hidden", position: "relative" }}>
                  <div style={{ height: "100%", width: `${Math.min(100, s.util)}%`, background: healthColor(band), borderRadius: 5, boxShadow: `0 0 10px ${healthColor(band)}66` }} />
                </div>
                <div className="row" style={{ justifyContent: "space-between", marginTop: 4 }}>
                  <span className="faint" style={{ fontSize: 10.5 }}>N-1 governed by {s.governedBy}</span>
                  <span className="faint" style={{ fontSize: 10.5 }}>
                    {fmt(s.loadMW)} / {fmt(s.firmMW)} MW · <b style={{ color: s.spareMW < 60 ? "var(--red)" : "var(--ink-dim)" }}>{fmt(s.spareMW)} spare</b>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      <p className="foot-note">
        Firm Capacity v6.7.0 · Dammam-area substations (representative pending live PI/AF bind)<br />
        {meta.classification} · Snapshot {meta.asOfLabel}
      </p>
    </div>
  );
}
