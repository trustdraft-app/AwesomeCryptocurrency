import { motion } from "framer-motion";
import AnimatedNumber from "./AnimatedNumber";
import Sparkline from "./Sparkline";
import type { SeriesPoint, Trend } from "@/data/grid";
import { fmtSigned } from "@/lib/format";

interface Props {
  label: string;
  value: number;
  unit?: string;
  decimals?: number;
  accent?: string;
  trend?: Trend;
  delta?: number;
  deltaUnit?: string;
  spark?: SeriesPoint[];
  big?: boolean;
  delay?: number;
}

const arrow = (t?: Trend) => (t === "up" ? "▲" : t === "down" ? "▼" : "▬");

/** Executive metric tile: big animated number, trend chip, optional sparkline. */
export default function KpiTile({
  label,
  value,
  unit = "MW",
  decimals = 0,
  accent = "var(--blue)",
  trend,
  delta,
  deltaUnit = "MW",
  spark,
  big,
  delay = 0,
}: Props) {
  const trendClass = trend === "up" ? "up" : trend === "down" ? "down" : "flat";
  return (
    <motion.div
      className="kpi"
      style={{ ["--accent" as string]: accent }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
    >
      <div className="kpi-label">{label}</div>
      <div className="kpi-value" style={{ fontSize: big ? 38 : 27 }}>
        <AnimatedNumber value={value} decimals={decimals} />
        <span className="kpi-unit">{unit}</span>
      </div>
      <div className="kpi-foot">
        {trend && delta != null && (
          <span className={`kpi-trend ${trendClass}`}>
            {arrow(trend)} {fmtSigned(delta)} {deltaUnit}
          </span>
        )}
        {spark && <Sparkline data={spark} color={accent} width={72} height={26} />}
      </div>
    </motion.div>
  );
}
