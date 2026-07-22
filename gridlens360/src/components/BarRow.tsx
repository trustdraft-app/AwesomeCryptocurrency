import { motion } from "framer-motion";
import { fmt } from "@/lib/format";

interface Props {
  label: string;
  value: number;
  max: number;
  color?: string;
  unit?: string;
  sub?: string;
}

/** Labelled horizontal bar with animated fill — the workbook comparison row. */
export default function BarRow({ label, value, max, color = "var(--teal)", unit = "MW", sub }: Props) {
  const w = Math.max(0, Math.min(100, (value / (max || 1)) * 100));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div className="row" style={{ gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{label}</span>
        {sub && <span style={{ fontSize: 11, color: "var(--ink-faint)" }}>{sub}</span>}
        <span style={{ marginLeft: "auto", fontSize: 13, fontWeight: 700, color }}>
          {fmt(value)} <span style={{ fontSize: 10, color: "var(--ink-faint)" }}>{unit}</span>
        </span>
      </div>
      <div style={{ height: 7, borderRadius: 6, background: "var(--surface-2)", overflow: "hidden" }}>
        <motion.div
          style={{ height: "100%", borderRadius: 6, background: color, boxShadow: `0 0 10px ${color}55` }}
          initial={{ width: 0 }}
          animate={{ width: `${w}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
