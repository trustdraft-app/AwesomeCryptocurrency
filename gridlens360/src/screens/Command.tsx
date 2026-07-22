import { useState } from "react";
import Panel from "@/components/Panel";
import KpiTile from "@/components/KpiTile";
import AnimatedNumber from "@/components/AnimatedNumber";
import Sparkline from "@/components/Sparkline";
import KingdomMap from "@/components/KingdomMap";
import BarRow from "@/components/BarRow";
import Donut from "@/components/Donut";
import { HealthPill } from "@/components/StatusPill";
import { national, areas, ksaToday, meta } from "@/data/grid";
import { fmt, fmtSigned, trendOf, deltaPct, bandFromUtil } from "@/lib/format";

export default function Command() {
  const [sel, setSel] = useState<string>("EOA");
  const maxArea = Math.max(...areas.map((a) => a.loadMW));
  const toRecord = national.recordPeakMW - national.peakTodayMW;
  const reserveMarginPct = (national.reserveMW / national.demandMW) * 100;
  const renewSharePct = (national.renewableMW / national.demandMW) * 100;
  const selArea = areas.find((a) => a.code === sel)!;

  return (
    <div className="stack">
      {/* HERO — national demand */}
      <div className="hero">
        <div className="glow" />
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 2 }}>
          <span className="faint" style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.06em" }}>
            KINGDOM DEMAND · NOW
          </span>
          <span className="faint" style={{ fontSize: 11 }}>{meta.asOfLabel}</span>
        </div>
        <div className="hero-big">
          <AnimatedNumber value={national.demandMW} />
          <span className="u">MW</span>
        </div>
        <div className="row" style={{ gap: 14, marginTop: 8 }}>
          <span className="up" style={{ fontWeight: 700, fontSize: 13 }}>
            ▲ {fmtSigned(national.demandMW - national.demandPrevMW)} MW · {deltaPct(national.demandMW, national.demandPrevMW).toFixed(1)}%
          </span>
          <span style={{ marginLeft: "auto" }}>
            <Sparkline data={ksaToday} color="var(--teal)" width={120} height={34} />
          </span>
        </div>
        <div className="row" style={{ gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          <HealthPill health={bandFromUtil(100 - reserveMarginPct > 80 ? 90 : 60)}>
            Reserve margin {reserveMarginPct.toFixed(1)}%
          </HealthPill>
          <HealthPill health="good">Frequency {national.frequencyHz.toFixed(2)} Hz</HealthPill>
        </div>
      </div>

      {/* Record distance */}
      <Panel title="Peak · Distance to Record" accent="var(--orange)" delay={0.05}>
        <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div className="faint" style={{ fontSize: 11 }}>Today's peak · {national.peakTimeToday}</div>
            <div style={{ fontSize: 30, fontWeight: 850, letterSpacing: "-0.02em" }}>
              {fmt(national.peakTodayMW)} <span className="faint" style={{ fontSize: 14 }}>MW</span>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="faint" style={{ fontSize: 11 }}>All-time record</div>
            <div style={{ fontSize: 18, fontWeight: 750 }}>{fmt(national.recordPeakMW)} MW</div>
            <div className="faint" style={{ fontSize: 10.5 }}>{national.recordPeakDate}</div>
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <div style={{ height: 9, borderRadius: 6, background: "var(--surface-2)", overflow: "hidden", position: "relative" }}>
            <div
              style={{
                height: "100%",
                width: `${(national.peakTodayMW / national.recordPeakMW) * 100}%`,
                background: "linear-gradient(90deg, var(--orange), var(--amber))",
                borderRadius: 6,
              }}
            />
          </div>
          <div className="faint" style={{ fontSize: 11.5, marginTop: 7 }}>
            <b style={{ color: "var(--amber)" }}>{fmt(toRecord)} MW</b> ({((toRecord / national.recordPeakMW) * 100).toFixed(1)}%) headroom to the all-time record.
          </div>
        </div>
      </Panel>

      {/* KPI grid */}
      <div className="grid-2">
        <KpiTile label="Available Capacity" value={national.capacityMW} accent="var(--blue)" delay={0.05} />
        <KpiTile label="Operating Reserve" value={national.reserveMW} accent="var(--green)" delay={0.1} />
        <KpiTile label="Renewables Now" value={national.renewableMW} accent="var(--teal)" delay={0.15} />
        <KpiTile label="Battery Net" value={national.bessNetMW} accent="var(--purple)" decimals={0} delay={0.2} />
      </div>

      {/* Kingdom map */}
      <Panel title="Kingdom · Operating Areas" accent="var(--teal)" aux="tap an area" delay={0.1}>
        <KingdomMap areas={areas} selected={sel} onSelect={setSel} />
        <div
          className="row"
          style={{ justifyContent: "space-between", marginTop: 8, padding: "10px 12px", borderRadius: 12, background: "var(--surface-2)", border: "1px solid var(--stroke)" }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: selArea.color }}>
              {selArea.code} · {selArea.name}
            </div>
            <div className="faint" style={{ fontSize: 11 }}>{selArea.tempC != null ? `${selArea.tempC}°C ambient` : "—"}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 22, fontWeight: 850 }}>{fmt(selArea.loadMW)} <span className="faint" style={{ fontSize: 12 }}>MW</span></div>
            <div className={trendOf(selArea.loadMW, selArea.prevMW)} style={{ fontSize: 11.5, fontWeight: 700 }}>
              {fmtSigned(selArea.loadMW - selArea.prevMW)} MW vs prev
            </div>
          </div>
        </div>
      </Panel>

      {/* Area load table */}
      <Panel title="Area Load · Contribution" accent="var(--blue)" delay={0.12}>
        <div className="stack" style={{ gap: 11 }}>
          {areas
            .slice()
            .sort((a, b) => b.loadMW - a.loadMW)
            .map((a) => (
              <BarRow
                key={a.code}
                label={`${a.code} · ${a.name}`}
                value={a.loadMW}
                max={maxArea}
                color={a.color}
                sub={`${((a.loadMW / national.demandMW) * 100).toFixed(0)}%`}
              />
            ))}
        </div>
      </Panel>

      {/* Energy mix */}
      <Panel title="Supply Mix · Right Now" accent="var(--green)" delay={0.14}>
        <Donut
          size={150}
          slices={[
            { label: "Conventional", value: national.demandMW - national.renewableMW + national.bessNetMW, color: "var(--blue)" },
            { label: "Renewables", value: national.renewableMW, color: "var(--teal)" },
          ]}
          centerTop={`${renewSharePct.toFixed(0)}%`}
          centerBottom="renewable"
        />
      </Panel>

      <div className="insight">
        <span className="ic">🛰️</span>
        <span>
          Kingdom demand is holding at <b>{fmt(national.demandMW)} MW</b> with <b>{fmt(national.reserveMW)} MW</b> of operating reserve
          ({reserveMarginPct.toFixed(1)}% margin). Renewables are supplying <b>{renewSharePct.toFixed(1)}%</b> of live load, and the fleet
          sits <b>{fmt(toRecord)} MW</b> below the all-time record.
        </span>
      </div>

      <p className="foot-note">
        {meta.operator} · {meta.team}<br />
        {meta.classification} · Snapshot {meta.asOfLabel}
      </p>
    </div>
  );
}
