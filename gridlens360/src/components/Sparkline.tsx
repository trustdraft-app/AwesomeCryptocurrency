import { useId } from "react";
import type { SeriesPoint } from "@/data/grid";

interface Props {
  data: SeriesPoint[];
  color?: string;
  height?: number;
  width?: number;
  fill?: boolean;
}

/** Compact trend sparkline with soft gradient fill. */
export default function Sparkline({ data, color = "var(--blue)", height = 34, width = 96, fill = true }: Props) {
  const gid = useId();
  const vs = data.map((d) => d.v);
  const n = data.length;
  if (n < 2) return <svg width={width} height={height} aria-hidden />; // need 2+ points
  const min = Math.min(...vs);
  const max = Math.max(...vs);
  const span = max - min || 1;
  const x = (i: number) => (i / (n - 1)) * width;
  const y = (v: number) => height - 3 - ((v - min) / span) * (height - 6);
  const line = vs.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id={`sp-${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={area} fill={`url(#sp-${gid})`} />}
      <path d={line} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
