import { useState } from "react";
import Panel from "@/components/Panel";
import LineChart from "@/components/LineChart";
import Donut from "@/components/Donut";
import BarRow from "@/components/BarRow";
import KpiTile from "@/components/KpiTile";
import AnimatedNumber from "@/components/AnimatedNumber";
import { HealthPill } from "@/components/StatusPill";
import { national, renewables, renewableToday, bess, bessToday, meta } from "@/data/grid";
import { fmt, fmtSigned } from "@/lib/format";

export default function Clean() {
  const [tab, setTab] = useState<"re" | "bess">("re");
  return (
    <div className="stack">
      <div className="seg" style={{ ["--accent" as string]: tab === "re" ? "var(--teal)" : "var(--purple)" }}>
        <button className={tab === "re" ? "on" : ""} onClick={() => setTab("re")}>☀ Renewables</button>
        <button className={tab === "bess" ? "on" : ""} onClick={() => setTab("bess")}>🔋 Storage</button>
      </div>
      {tab === "re" ? <Renewables /> : <Storage />}
      <p className="foot-note">Renewable & BESS fleet · KPI workbook + Grid Summary · Snapshot {meta.asOfLabel}</p>
    </div>
  );
}

function Renewables() {
  const total = renewables.reduce((s, p) => s + p.currentMW, 0);
  const pv = renewables.filter((p) => p.type === "PV").reduce((s, p) => s + p.currentMW, 0);
  const wind = renewables.filter((p) => p.type === "Wind").reduce((s, p) => s + p.currentMW, 0);
  const capacity = renewables.reduce((s, p) => s + p.capacityMW, 0);
  const sharePct = (total / national.demandMW) * 100;
  const cf = (total / capacity) * 100;
  const top = renewables.slice().sort((a, b) => b.currentMW - a.currentMW).slice(0, 8);
  const maxTop = Math.max(...top.map((t) => t.currentMW));

  return (
    <>
      <div className="hero" style={{ background: "linear-gradient(150deg, rgba(66,210,206,0.16), rgba(72,217,134,0.05) 60%, transparent)" }}>
        <div className="glow" style={{ background: "radial-gradient(circle, rgba(66,210,206,0.28), transparent 70%)" }} />
        <span className="faint" style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.06em" }}>RENEWABLE GENERATION · NOW</span>
        <div className="hero-big" style={{ color: "var(--teal)" }}>
          <AnimatedNumber value={total} /><span className="u">MW</span>
        </div>
        <div className="row" style={{ gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          <HealthPill health="good">{sharePct.toFixed(1)}% of Kingdom load</HealthPill>
          <HealthPill health="good">CF {cf.toFixed(0)}%</HealthPill>
        </div>
      </div>

      <div className="grid-3">
        <KpiTile label="Solar PV" value={pv} accent="var(--amber)" />
        <KpiTile label="Wind" value={wind} accent="var(--teal)" />
        <KpiTile label="Fleet Capacity" value={capacity} accent="var(--blue)" />
      </div>

      <Panel title="Renewable Output · Today" accent="var(--teal)" aux="solar bell + wind base" delay={0.05}>
        <LineChart series={renewableToday} peakIndex={13} color="var(--teal)" unit="MW" />
      </Panel>

      <Panel title="Fleet Split" accent="var(--amber)" delay={0.08}>
        <Donut
          size={150}
          slices={[
            { label: "Solar PV", value: pv, color: "var(--amber)" },
            { label: "Wind", value: wind, color: "var(--teal)" },
          ]}
          centerTop={fmt(total)}
          centerBottom="MW now"
        />
      </Panel>

      <Panel title="Top Plants · Output Now" accent="var(--green)" delay={0.1}>
        <div className="stack" style={{ gap: 11 }}>
          {top.map((p) => (
            <BarRow key={p.name} label={p.name} value={p.currentMW} max={maxTop} color={p.type === "Wind" ? "var(--teal)" : "var(--amber)"} sub={`${p.area} · ${((p.currentMW / p.capacityMW) * 100).toFixed(0)}% of ${fmt(p.capacityMW)}`} />
          ))}
        </div>
      </Panel>

      <div className="insight">
        <span className="ic">🌱</span>
        <span>The renewable fleet is delivering <b>{fmt(total)} MW</b> ({sharePct.toFixed(1)}% of live Kingdom demand) at a <b>{cf.toFixed(0)}%</b> capacity factor, avoiding an estimated <b>{fmt(national.co2AvoidedKt)} kt</b> of CO₂ today.</span>
      </div>
    </>
  );
}

function Storage() {
  const net = bess.reduce((s, b) => s + b.currentMW, 0);
  const charging = bess.filter((b) => b.currentMW < 0).reduce((s, b) => s + Math.abs(b.currentMW), 0);
  const discharging = bess.filter((b) => b.currentMW > 0).reduce((s, b) => s + b.currentMW, 0);
  const avgSoc = bess.reduce((s, b) => s + b.socPct, 0) / bess.length;
  const totalPower = bess.reduce((s, b) => s + b.powerMW, 0);
  const totalEnergy = bess.reduce((s, b) => s + b.energyMWh, 0);

  return (
    <>
      <div className="hero" style={{ background: "linear-gradient(150deg, rgba(176,138,255,0.16), rgba(76,155,255,0.05) 60%, transparent)" }}>
        <div className="glow" style={{ background: "radial-gradient(circle, rgba(176,138,255,0.28), transparent 70%)" }} />
        <span className="faint" style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.06em" }}>BESS NET · NOW</span>
        <div className="hero-big" style={{ color: net >= 0 ? "var(--green)" : "var(--purple)" }}>
          <AnimatedNumber value={net} /><span className="u">MW</span>
        </div>
        <div className="row" style={{ gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          <HealthPill health="good">{net < 0 ? "Charging" : "Discharging"}</HealthPill>
          <HealthPill health="good">Avg SoC {avgSoc.toFixed(0)}%</HealthPill>
        </div>
      </div>

      <div className="grid-2">
        <KpiTile label="Fleet Power" value={totalPower} accent="var(--purple)" />
        <KpiTile label="Fleet Energy" value={totalEnergy} unit="MWh" accent="var(--blue)" />
        <KpiTile label="Charging" value={charging} accent="var(--teal)" />
        <KpiTile label="Discharging" value={discharging} accent="var(--green)" />
      </div>

      <Panel title="Battery Cycle · Today" accent="var(--purple)" aux="− charge · + discharge" delay={0.05}>
        <LineChart series={bessToday} color="var(--purple)" unit="MW" yTicks={4} />
      </Panel>

      <Panel title="Fleet · State of Charge" accent="var(--purple)" delay={0.08}>
        <div className="stack" style={{ gap: 12 }}>
          {bess.map((b) => (
            <div key={b.name}>
              <div className="row" style={{ justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{b.name} <span className="faint" style={{ fontSize: 10.5 }}>{b.area}</span></span>
                <span style={{ fontSize: 12 }}>
                  <b style={{ color: b.currentMW < 0 ? "var(--teal)" : b.currentMW > 0 ? "var(--green)" : "var(--ink-faint)" }}>{fmtSigned(b.currentMW)} MW</b>
                  <span className="faint"> · SoC </span><b>{b.socPct}%</b>
                </span>
              </div>
              <div style={{ height: 7, borderRadius: 5, background: "var(--surface-2)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${b.socPct}%`, background: b.socPct > 70 ? "var(--green)" : b.socPct > 40 ? "var(--teal)" : "var(--orange)", borderRadius: 5 }} />
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <div className="insight">
        <span className="ic">⚡</span>
        <span>The national storage fleet (<b>{fmt(totalPower)} MW</b> / <b>{fmt(totalEnergy)} MWh</b>) is net <b>{net < 0 ? "charging" : "discharging"} {fmt(Math.abs(net))} MW</b>, banking midday solar for the evening ramp at an average <b>{avgSoc.toFixed(0)}%</b> state of charge.</span>
      </div>
    </>
  );
}
