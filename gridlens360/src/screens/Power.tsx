import Panel from "@/components/Panel";
import Donut from "@/components/Donut";
import BarRow from "@/components/BarRow";
import KpiTile from "@/components/KpiTile";
import AnimatedNumber from "@/components/AnimatedNumber";
import { HealthPill } from "@/components/StatusPill";
import { generation, reserves, nonSecSpin, n2Limits, eoa, interchange, meta } from "@/data/grid";
import { fmt, bandFromUtil, healthColor } from "@/lib/format";

const GEN_COLORS = ["#4c9bff", "#42d2ce", "#48d986", "#b08aff", "#ff923d", "#ffc24b", "#ff7ea8", "#8aa0b8"];

export default function Power() {
  const totalGen = generation.reduce((s, g) => s + g.valueMW, 0);
  const maxSpin = Math.max(...nonSecSpin.map((s) => s.valueMW));
  const reserveMarginPct = (reserves.availableCapacityMW - eoa.demandMW) / eoa.demandMW * 100;

  return (
    <div className="stack">
      {/* Generation total hero */}
      <div className="hero" style={{ background: "linear-gradient(150deg, rgba(72,217,134,0.15), rgba(66,210,206,0.05) 60%, transparent)" }}>
        <div className="glow" style={{ background: "radial-gradient(circle, rgba(72,217,134,0.26), transparent 70%)" }} />
        <span className="faint" style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.06em" }}>EOA TOTAL GENERATION · NOW</span>
        <div className="hero-big" style={{ color: "var(--green)" }}>
          <AnimatedNumber value={eoa.totalGenerationMW} />
          <span className="u">MW</span>
        </div>
        <div className="row" style={{ gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          <HealthPill health={bandFromUtil(100 - reserveMarginPct)}>Reserve margin {reserveMarginPct.toFixed(1)}%</HealthPill>
          <HealthPill health={reserves.secUnavailableUnits > 4 ? "watch" : "good"}>{reserves.secUnavailableUnits} SEC units offline</HealthPill>
        </div>
      </div>

      {/* Generation mix */}
      <Panel title="Generation Mix" accent="var(--green)" aux={`${fmt(totalGen)} MW`} delay={0.04}>
        <Donut
          size={168}
          slices={generation.map((g, i) => ({ label: g.name, value: g.valueMW, color: GEN_COLORS[i % GEN_COLORS.length] }))}
          centerTop={(totalGen / 1000).toFixed(1) + "k"}
          centerBottom="MW total"
        />
      </Panel>

      {/* Reserves grid */}
      <div className="section-head"><h2>Reserves & Capacity</h2><span className="sub">spinning + standby</span></div>
      <div className="grid-2">
        <KpiTile label="Available Capacity" value={reserves.availableCapacityMW} accent="var(--blue)" />
        <KpiTile label="Net Spinning" value={reserves.netSpinMW} accent="var(--green)" />
        <KpiTile label="Operating Spin" value={reserves.operatingSpinMW} accent="var(--teal)" />
        <KpiTile label="Non-SEC Spin" value={reserves.nonSecSpinMW} accent="var(--purple)" />
        <KpiTile label="Standby Gen" value={reserves.standbyMW} accent="var(--amber)" />
        <KpiTile label="Unavailable" value={reserves.unavailableMW} accent="var(--red)" />
      </div>

      {/* Regulation */}
      <Panel title="Regulation Range" accent="var(--teal)" delay={0.06}>
        <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div className="faint" style={{ fontSize: 11 }}>Low → High regulating reserve</div>
            <div style={{ fontSize: 15, fontWeight: 700, marginTop: 3 }}>
              <span style={{ color: "var(--blue)" }}>{fmt(reserves.regulationLowMW)}</span>
              <span className="faint"> — </span>
              <span style={{ color: "var(--orange)" }}>{fmt(reserves.regulationHighMW)}</span> MW
            </div>
          </div>
        </div>
        <div style={{ height: 8, borderRadius: 6, background: "var(--surface-2)", marginTop: 10, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", left: `${(reserves.regulationLowMW / (reserves.regulationHighMW * 1.15)) * 100}%`, right: `${100 - (reserves.regulationHighMW / (reserves.regulationHighMW * 1.15)) * 100}%`, top: 0, bottom: 0, background: "linear-gradient(90deg, var(--blue), var(--orange))", borderRadius: 6 }} />
        </div>
      </Panel>

      {/* Non-SEC spin breakdown */}
      <Panel title="Non-SEC Spin · Breakdown" accent="var(--purple)" delay={0.08}>
        <div className="stack" style={{ gap: 11 }}>
          {nonSecSpin.map((s) => (
            <BarRow key={s.name} label={s.name} value={s.valueMW} max={maxSpin} color="var(--purple)" />
          ))}
        </div>
      </Panel>

      {/* Interchange KPIs */}
      <Panel title="Interchange" accent="var(--blue)" delay={0.1}>
        <div className="grid-2">
          <KpiTile label="Scheduled" value={interchange.scheduledMW} accent="var(--blue)" />
          <KpiTile label="Net" value={interchange.netMW} accent="var(--teal)" />
          <KpiTile label="COA Export" value={interchange.coaExportMW} accent="var(--purple)" />
          <KpiTile label="Export Deviation" value={interchange.exportDeviationMW} accent="var(--orange)" />
        </div>
      </Panel>

      {/* N-2 limits */}
      <Panel title="Interchange Limits · N-2" accent="var(--orange)" aux="actual vs limit" delay={0.12}>
        <div className="stack" style={{ gap: 12 }}>
          {n2Limits.map((l) => {
            const util = (l.actualMW / l.limitMW) * 100;
            const band = bandFromUtil(util);
            return (
              <div key={l.path}>
                <div className="row" style={{ justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{l.path}</span>
                  <span style={{ fontSize: 12 }}>
                    <b>{fmt(l.actualMW)}</b><span className="faint"> / {fmt(l.limitMW)} MW · </span>
                    <b style={{ color: healthColor(band) }}>{util.toFixed(0)}%</b>
                  </span>
                </div>
                <div style={{ height: 6, borderRadius: 4, background: "var(--surface-2)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min(100, util)}%`, background: healthColor(band), borderRadius: 4 }} />
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      <p className="foot-note">Generation, reserves & interchange · EOA System Peak · Snapshot {meta.asOfLabel}</p>
    </div>
  );
}
