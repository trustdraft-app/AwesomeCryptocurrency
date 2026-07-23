import { motion } from "framer-motion";

interface Zone {
  from: number;
  to: number;
  color: string;
}
interface Props {
  value: number;
  min: number;
  max: number;
  label: string;
  display: string;
  unit?: string;
  zones?: Zone[];
  color?: string;
  size?: number;
}

const polar = (cx: number, cy: number, r: number, angleDeg: number) => {
  const a = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
};
// 210° sweep from 165° → 375° (i.e. bottom-left, over the top, to bottom-right)
const A0 = 165;
const A1 = 375;
const arc = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  const p0 = polar(cx, cy, r, a0);
  const p1 = polar(cx, cy, r, a1);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M${p0.x.toFixed(2)},${p0.y.toFixed(2)} A${r},${r} 0 ${large} 1 ${p1.x.toFixed(2)},${p1.y.toFixed(2)}`;
};

/** Semicircular gauge with coloured zones and an animated needle. */
export default function Gauge({ value, min, max, label, display, unit, zones, color = "var(--blue)", size = 150 }: Props) {
  const cx = size / 2;
  const cy = size / 2 + 6;
  const r = size / 2 - 14;
  const clamped = Math.max(min, Math.min(max, value));
  const frac = (clamped - min) / (max - min || 1);
  const angle = A0 + frac * (A1 - A0);
  const needle = polar(cx, cy, r - 6, angle);

  const angleFor = (v: number) => A0 + ((v - min) / (max - min || 1)) * (A1 - A0);

  return (
    <svg width={size} height={size * 0.82} viewBox={`0 0 ${size} ${size * 0.82}`} role="img" aria-label={label}>
      {/* track */}
      <path d={arc(cx, cy, r, A0, A1)} fill="none" stroke="var(--stroke)" strokeWidth="9" strokeLinecap="round" />
      {/* zones */}
      {zones?.map((z, i) => (
        <path key={i} d={arc(cx, cy, r, angleFor(z.from), angleFor(z.to))} fill="none" stroke={z.color} strokeWidth="9" strokeLinecap="round" opacity="0.85" />
      ))}
      {/* needle */}
      <motion.line
        x1={cx}
        y1={cy}
        x2={needle.x}
        y2={needle.y}
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ x2: polar(cx, cy, r - 6, A0).x, y2: polar(cx, cy, r - 6, A0).y }}
        animate={{ x2: needle.x, y2: needle.y }}
        transition={{ type: "spring", stiffness: 90, damping: 14 }}
      />
      <circle cx={cx} cy={cy} r="5" fill={color} />
      <text x={cx} y={cy - 14} textAnchor="middle" fontSize="24" fontWeight="800" fill="var(--ink)">
        {display}
      </text>
      {unit && (
        <text x={cx} y={cy + 4} textAnchor="middle" fontSize="10" fill="var(--ink-faint)">
          {unit}
        </text>
      )}
      <text x={cx} y={size * 0.82 - 4} textAnchor="middle" fontSize="10.5" fontWeight="600" fill="var(--ink-dim)" letterSpacing="0.04em">
        {label}
      </text>
    </svg>
  );
}
