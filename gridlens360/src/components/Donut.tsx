import { motion } from "framer-motion";
import { fmt } from "@/lib/format";

export interface DonutSlice {
  label: string;
  value: number;
  color: string;
}
interface Props {
  slices: DonutSlice[];
  size?: number;
  thickness?: number;
  centerTop?: string;
  centerBottom?: string;
}

/** Ring chart with animated arcs and a value at the centre. */
// Largest-remainder (Hamilton) apportionment so integer percentages sum to 100.
function pctShares(values: number[]): number[] {
  const total = values.reduce((s, v) => s + v, 0) || 1;
  const raw = values.map((v) => (v / total) * 100);
  const floors = raw.map(Math.floor);
  let remainder = 100 - floors.reduce((s, v) => s + v, 0);
  const order = raw
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac);
  const out = [...floors];
  for (let k = 0; k < order.length && remainder > 0; k++, remainder--) out[order[k].i]++;
  return out;
}

export default function Donut({ slices, size = 168, thickness = 20, centerTop, centerBottom }: Props) {
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  const shares = pctShares(slices.map((s) => s.value));
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const cx = size / 2;
  let offset = 0;

  return (
    <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
        <g transform={`rotate(-90 ${cx} ${cx})`}>
          <circle cx={cx} cy={cx} r={r} fill="none" stroke="var(--stroke)" strokeWidth={thickness} />
          {slices.map((s, i) => {
            const len = (s.value / total) * c;
            const el = (
              <motion.circle
                key={i}
                cx={cx}
                cy={cx}
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth={thickness}
                strokeLinecap="butt"
                strokeDasharray={`${len} ${c - len}`}
                strokeDashoffset={-offset}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.08 }}
              />
            );
            offset += len;
            return el;
          })}
        </g>
        {centerTop && (
          <text x={cx} y={cx - 4} textAnchor="middle" fontSize="26" fontWeight="800" fill="var(--ink)">
            {centerTop}
          </text>
        )}
        {centerBottom && (
          <text x={cx} y={cx + 16} textAnchor="middle" fontSize="10.5" fill="var(--ink-faint)">
            {centerBottom}
          </text>
        )}
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0, flex: 1 }}>
        {slices.map((s, i) => (
          <div key={i} className="row" style={{ gap: 8, alignItems: "flex-start" }}>
            <span style={{ width: 9, height: 9, borderRadius: 3, background: s.color, flexShrink: 0, marginTop: 4 }} />
            <span style={{ fontSize: 12.5, color: "var(--ink-dim)", lineHeight: 1.25, wordBreak: "break-word" }}>
              {s.label}
            </span>
            <span style={{ marginLeft: "auto", fontSize: 12.5, fontWeight: 700, flexShrink: 0 }}>{fmt(s.value)}</span>
            <span style={{ fontSize: 11, color: "var(--ink-faint)", width: 34, textAlign: "right", flexShrink: 0 }}>
              {shares[i]}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
