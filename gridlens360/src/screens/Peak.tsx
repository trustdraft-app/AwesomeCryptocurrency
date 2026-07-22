import { useState } from "react";
import Panel from "@/components/Panel";
import LineChart from "@/components/LineChart";
import Gauge from "@/components/Gauge";
import BarRow from "@/components/BarRow";
import KpiTile from "@/components/KpiTile";
import AnimatedNumber from "@/components/AnimatedNumber";
import { eoa, eoaToday, eoaYesterday, subAreas, neoa, interchange, reserves, meta } from "@/data/grid";
import { fmt, fmtSigned, trendOf, deltaPct } from "@/lib/format";

const PEAK_INDEX = 15; // ~15:58

export default function Peak() {
  const [view, setView] = useState<"today" | "compare">("compare");
  const maxSub = Math.max(...subAreas.map((s) => s.valueMW));
  const maxNeoa = Math.max(...neoa.map((n) => Math.max(n.loadMW, n.genMW)));
  const diff = eoa.peakMW - eoa.prevPeakMW;

  return (
    <div className="stack">
      {/* Daily peak hero */}
      <div className="hero" style={{ background: "linear-gradient(150deg, rgba(255,146,61,0.16), rgba(255,194,75,0.05) 60%, transparent)" }}>
        <div className="glow" style={{ background: "radial-gradient(circle, rgba(255,146,61,0.28), transparent 70%)" }} />
        <span className="faint" style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.06em" }}>
          EOA DAILY PEAK · {eoa.peakDate.toUpperCase()}
        </span>
        <div className="hero-big" style={{ color: "var(--amber)" }}>
          <AnimatedNumber value={eoa.peakMW} />
          <span className="u">MW</span>
        </div>
        <div className="row" style={{ gap: 16, marginTop: 8 }}>
          <span style={{ fontWeight: 750, fontSize: 13, color: "var(--orange)" }}>⏱ {eoa.peakTime} KSA</span>
          <span className="faint" style={{ fontSize: 12.5 }}>🌡 {eoa.tempC}°C at peak</span>
        </div>
      </div>

      <div className="grid-3">
        <KpiTile label="Gen at Peak" value={eoa.genAtPeakMW} accent="var(--blue)" />
        <KpiTile label="Demand Now" value={eoa.demandMW} accent="var(--teal)" trend={trendOf(eoa.demandMW, eoa.demandPrevMW)} delta={eoa.demandMW - eoa.demandPrevMW} />
        <KpiTile label="Today Min" value={eoa.minTodayMW} accent="var(--purple)" />
      </div>

      {/* Demand curve */}
      <Panel title="EOA Demand (MW)" accent="var(--blue)" aux="today vs previous day" delay={0.05}>
        <div className="seg" style={{ marginBottom: 12, ["--accent" as string]: "var(--blue)" }}>
          <button className={view === "compare" ? "on" : ""} onClick={() => setView("compare")}>Today vs Yesterday</button>
          <button className={view === "today" ? "on" : ""} onClick={() => setView("today")}>Today only</button>
        </div>
        <LineChart
          series={eoaToday}
          compare={view === "compare" ? eoaYesterday : undefined}
          peakIndex={PEAK_INDEX}
          color="var(--blue)"
        />
        <div className="grid-3" style={{ marginTop: 8 }}>
          <MiniStat label="Now (18:00)" value={`${fmt(eoa.demandMW)} MW`} />
          <MiniStat label="Change" value={`${fmtSigned(eoa.demandMW - eoa.demandPrevMW)} · ${deltaPct(eoa.demandMW, eoa.demandPrevMW).toFixed(1)}%`} tone={eoa.demandMW >= eoa.demandPrevMW ? "up" : "down"} />
          <MiniStat label="Peak" value={`${fmt(eoa.peakMW)} MW`} tone="amber" />
        </div>
      </Panel>

      {/* Historical peak summary */}
      <Panel title="Historical Peak Summary" accent="var(--orange)" delay={0.08}>
        <div className="grid-2">
          <SummaryCard k={`Previous Peak (${eoa.prevPeakDate})`} v={`${fmt(eoa.prevPeakMW)} MW`} />
          <SummaryCard k="Difference" v={`${fmtSigned(diff)} MW`} tone={diff >= 0 ? "up" : "down"} sub={`${deltaPct(eoa.peakMW, eoa.prevPeakMW).toFixed(2)}%`} />
          <SummaryCard k="Selected Peak" v={`${fmt(eoa.peakMW)} MW`} tone="amber" />
          <SummaryCard k="Annual Peak" v={`${fmt(eoa.annualPeakMW)} MW`} sub={eoa.annualPeakDate} />
        </div>
      </Panel>

      {/* Frequency + ACE gauges */}
      <Panel title="System Health" accent="var(--green)" delay={0.1}>
        <div className="row" style={{ justifyContent: "space-around" }}>
          <Gauge
            value={eoa.frequencyHz}
            min={59.8}
            max={60.2}
            label="FREQUENCY"
            display={eoa.frequencyHz.toFixed(3)}
            unit="Hz"
            color="var(--green)"
            zones={[
              { from: 59.8, to: 59.9, color: "var(--red)" },
              { from: 59.9, to: 60.1, color: "var(--green)" },
              { from: 60.1, to: 60.2, color: "var(--red)" },
            ]}
          />
          <Gauge
            value={eoa.aceMW}
            min={-400}
            max={400}
            label="ACE"
            display={fmtSigned(eoa.aceMW, 0)}
            unit="MW"
            color="var(--blue)"
            zones={[
              { from: -400, to: -200, color: "var(--red)" },
              { from: -200, to: 200, color: "var(--green)" },
              { from: 200, to: 400, color: "var(--red)" },
            ]}
          />
        </div>
      </Panel>

      {/* Sub-area bulk loads */}
      <Panel title="EOA Sub-Area · Bulk Loads" accent="var(--teal)" delay={0.12}>
        <div className="stack" style={{ gap: 11 }}>
          {subAreas.map((s) => (
            <BarRow key={s.name} label={s.name} value={s.valueMW} max={maxSub} color="var(--teal)" />
          ))}
        </div>
      </Panel>

      {/* NEOA */}
      <Panel title="NEOA · Load & Generation" accent="var(--purple)" delay={0.14}>
        <div className="stack" style={{ gap: 12 }}>
          {neoa.map((n) => (
            <div key={n.node}>
              <div className="row" style={{ justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{n.node}</span>
                <span style={{ fontSize: 12 }}>
                  <span style={{ color: "var(--purple)", fontWeight: 700 }}>{fmt(n.loadMW)}</span>
                  <span className="faint"> load · </span>
                  <span style={{ color: "var(--green)", fontWeight: 700 }}>{fmt(n.genMW)}</span>
                  <span className="faint"> gen</span>
                </span>
              </div>
              <div style={{ display: "flex", gap: 4, height: 6 }}>
                <div style={{ flex: n.loadMW / maxNeoa, background: "var(--purple)", borderRadius: 4 }} />
                <div style={{ flex: n.genMW / maxNeoa, background: "var(--green)", borderRadius: 4 }} />
                <div style={{ flex: (maxNeoa - Math.max(n.loadMW, n.genMW)) / maxNeoa }} />
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* Interchange */}
      <Panel title="Interchange" accent="var(--blue)" delay={0.16}>
        <div className="grid-2">
          <KpiTile label="Scheduled" value={interchange.scheduledMW} accent="var(--blue)" />
          <KpiTile label="Net Interchange" value={interchange.netMW} accent="var(--teal)" />
          <KpiTile label="COA Export" value={interchange.coaExportMW} accent="var(--purple)" />
          <KpiTile label="Net Spin" value={reserves.netSpinMW} accent="var(--green)" />
        </div>
      </Panel>

      <p className="foot-note">EOA System Peak · one-minute PI samples · Snapshot {meta.asOfLabel}</p>
    </div>
  );
}

function MiniStat({ label, value, tone }: { label: string; value: string; tone?: "up" | "down" | "amber" }) {
  const color = tone === "up" ? "var(--green)" : tone === "down" ? "var(--red)" : tone === "amber" ? "var(--amber)" : "var(--ink)";
  return (
    <div style={{ background: "var(--surface-2)", borderRadius: 10, padding: "8px 10px", border: "1px solid var(--stroke)" }}>
      <div className="faint" style={{ fontSize: 10 }}>{label}</div>
      <div style={{ fontSize: 12.5, fontWeight: 750, color, marginTop: 2 }}>{value}</div>
    </div>
  );
}

function SummaryCard({ k, v, tone, sub }: { k: string; v: string; tone?: "up" | "down" | "amber"; sub?: string }) {
  const color = tone === "up" ? "var(--green)" : tone === "down" ? "var(--red)" : tone === "amber" ? "var(--amber)" : "var(--ink)";
  return (
    <div style={{ background: "var(--surface-2)", borderRadius: 12, padding: "11px 12px", border: "1px solid var(--stroke)" }}>
      <div className="faint" style={{ fontSize: 10.5 }}>{k}</div>
      <div style={{ fontSize: 19, fontWeight: 800, color, marginTop: 3 }}>{v}</div>
      {sub && <div className="faint" style={{ fontSize: 10.5, marginTop: 1 }}>{sub}</div>}
    </div>
  );
}
