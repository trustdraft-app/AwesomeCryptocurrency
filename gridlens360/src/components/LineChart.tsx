import { useId } from "react";
import { motion } from "framer-motion";
import type { SeriesPoint } from "@/data/grid";
import { fmt } from "@/lib/format";

interface Props {
  series: SeriesPoint[];
  compare?: SeriesPoint[];
  color?: string;
  compareColor?: string;
  height?: number;
  peakIndex?: number;
  unit?: string;
  yTicks?: number;
}

/**
 * Executive demand curve — smooth area + line, optional dashed comparison,
 * animated draw-in, and a highlighted peak marker (matches the approved
 * EOA System Peak "Today vs previous day" chart).
 */
export default function LineChart({
  series,
  compare,
  color = "var(--blue)",
  compareColor = "var(--ink-faint)",
  height = 190,
  peakIndex,
  unit = "MW",
  yTicks = 4,
}: Props) {
  const gid = useId();
  const W = 340;
  const H = height;
  const padL = 34;
  const padR = 8;
  const padT = 18;
  const padB = 22;
  const iw = W - padL - padR;
  const ih = H - padT - padB;

  const all = [...series, ...(compare ?? [])].map((d) => d.v);
  const rawMin = Math.min(...all);
  const rawMax = Math.max(...all);
  const pad = (rawMax - rawMin) * 0.12 || 1;
  const min = rawMin - pad;
  const max = rawMax + pad;
  const span = max - min || 1;
  const n = series.length;

  const px = (i: number) => padL + (i / (n - 1)) * iw;
  const py = (v: number) => padT + ih - ((v - min) / span) * ih;

  const path = (arr: SeriesPoint[]) =>
    arr.map((d, i) => `${i === 0 ? "M" : "L"}${px(i).toFixed(1)},${py(d.v).toFixed(1)}`).join(" ");

  const line = path(series);
  const area = `${line} L${px(n - 1).toFixed(1)},${padT + ih} L${padL},${padT + ih} Z`;

  const ticks = Array.from({ length: yTicks + 1 }, (_, i) => min + (span * i) / yTicks);
  const peak = peakIndex != null ? series[peakIndex] : undefined;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="demand curve">
      <defs>
        <linearGradient id={`area-${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.32" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* gridlines + y labels */}
      {ticks.map((t, i) => {
        const yy = py(t);
        return (
          <g key={i}>
            <line x1={padL} y1={yy} x2={W - padR} y2={yy} stroke="var(--stroke)" strokeWidth="1" />
            <text x={padL - 6} y={yy + 3} textAnchor="end" fontSize="8.5" fill="var(--ink-faint)">
              {fmt(Math.round(t / 100) * 100)}
            </text>
          </g>
        );
      })}

      {/* comparison (yesterday) */}
      {compare && (
        <path
          d={path(compare)}
          fill="none"
          stroke={compareColor}
          strokeWidth="1.6"
          strokeDasharray="4 4"
          opacity="0.75"
        />
      )}

      {/* today area + line */}
      <path d={area} fill={`url(#area-${gid})`} />
      <motion.path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.1, ease: "easeInOut" }}
      />

      {/* peak marker */}
      {peak && (
        <g>
          <line x1={px(peakIndex!)} y1={padT} x2={px(peakIndex!)} y2={padT + ih} stroke={color} strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
          <motion.circle
            cx={px(peakIndex!)}
            cy={py(peak.v)}
            r="4.5"
            fill="var(--navy)"
            stroke={color}
            strokeWidth="2.5"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1, type: "spring", stiffness: 300 }}
          />
          <g transform={`translate(${Math.min(px(peakIndex!), W - 66)}, ${Math.max(py(peak.v) - 26, padT)})`}>
            <rect x="-4" y="-12" width="66" height="18" rx="5" fill={color} opacity="0.16" stroke={color} strokeWidth="1" />
            <text x="29" y="1" textAnchor="middle" fontSize="9.5" fontWeight="700" fill={color}>
              {fmt(peak.v)} {unit}
            </text>
          </g>
        </g>
      )}

      {/* x labels (every 4h) */}
      {series.map((d, i) =>
        i % 4 === 0 ? (
          <text key={i} x={px(i)} y={H - 6} textAnchor="middle" fontSize="8.5" fill="var(--ink-faint)">
            {d.t.slice(0, 2)}
          </text>
        ) : null
      )}
    </svg>
  );
}
