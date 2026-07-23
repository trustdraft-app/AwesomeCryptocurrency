import { motion } from "framer-motion";
import type { AreaLoad } from "@/data/grid";
import { fmt } from "@/lib/format";

/**
 * Schematic map of the Kingdom's operating areas with live load nodes.
 * A stylised outline (not a survey-grade boundary) — node size scales with load,
 * so the executive reads regional stress at a glance.
 */
export default function KingdomMap({ areas, onSelect, selected }: { areas: AreaLoad[]; onSelect?: (c: string) => void; selected?: string }) {
  const maxLoad = Math.max(...areas.map((a) => a.loadMW));
  return (
    <svg viewBox="0 0 100 78" width="100%" role="img" aria-label="Kingdom operating areas" className="map-wrap">
      <defs>
        <radialGradient id="seaGlow" cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#0d3a63" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#04101c" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="100" height="78" fill="url(#seaGlow)" rx="4" />
      {/* Stylised Kingdom outline */}
      <path
        d="M14 22 L30 14 L46 12 L58 15 L64 12 L74 16 L82 26 L84 38 L80 50 L72 60 L60 66 L46 68 L34 64 L24 56 L16 44 L12 32 Z"
        fill="rgba(76,155,255,0.05)"
        stroke="var(--stroke-strong)"
        strokeWidth="0.6"
        strokeLinejoin="round"
      />
      {/* tie-line links between adjacent areas */}
      {[
        ["COA", "EOA"], ["COA", "WOA"], ["COA", "SOA"], ["COA", "NEOA"], ["COA", "NWOA"], ["WOA", "SOA"],
      ].map(([a, b], i) => {
        const A = areas.find((x) => x.code === a)!;
        const B = areas.find((x) => x.code === b)!;
        return <line key={i} x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="var(--stroke)" strokeWidth="0.5" strokeDasharray="1 1.2" />;
      })}
      {areas.map((a, i) => {
        const rr = 2.6 + (a.loadMW / maxLoad) * 4.4;
        const isSel = selected === a.code;
        const interactive = !!onSelect;
        return (
          <g
            key={a.code}
            className="map-node"
            onClick={() => onSelect?.(a.code)}
            onKeyDown={(e) => {
              if (interactive && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                onSelect?.(a.code);
              }
            }}
            role={interactive ? "button" : undefined}
            tabIndex={interactive ? 0 : undefined}
            aria-label={`${a.name} area, ${fmt(a.loadMW)} megawatts`}
            aria-pressed={interactive ? isSel : undefined}
            style={{ cursor: interactive ? "pointer" : "default" }}
          >
            {/* Transparent ≥44px-equivalent hit target for quick, reliable taps. */}
            {interactive && <circle cx={a.x} cy={a.y} r={7} fill="transparent" />}
            <motion.circle
              cx={a.x}
              cy={a.y}
              r={rr}
              fill={a.color}
              opacity={isSel ? 0.95 : 0.22}
              initial={{ r: 0 }}
              animate={{ r: rr }}
              transition={{ delay: 0.1 + i * 0.06, type: "spring", stiffness: 200 }}
            />
            <circle cx={a.x} cy={a.y} r={rr} fill="none" stroke={a.color} strokeWidth={isSel ? 1 : 0.7} />
            <circle cx={a.x} cy={a.y} r="1" fill={a.color} />
            <text x={a.x} y={a.y - rr - 1.4} textAnchor="middle" fontSize="3.1" fontWeight="800" fill={a.color}>
              {a.code}
            </text>
            <text x={a.x} y={a.y + rr + 3.4} textAnchor="middle" fontSize="2.7" fontWeight="700" fill="var(--ink-dim)">
              {fmt(a.loadMW)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
