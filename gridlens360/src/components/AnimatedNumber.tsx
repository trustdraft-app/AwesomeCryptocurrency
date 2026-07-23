import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { fmt } from "@/lib/format";

interface Props {
  value: number;
  decimals?: number;
  duration?: number;
  className?: string;
}

/** Count-up number that eases to its target. Honors prefers-reduced-motion by
 *  showing the final value immediately (no misleading animation from 0). */
export default function AnimatedNumber({ value, decimals = 0, duration = 900, className }: Props) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(reduce ? value : 0);
  const raf = useRef<number>();
  const shown = useRef(reduce ? value : 0); // last value actually rendered

  useEffect(() => {
    if (reduce) {
      shown.current = value;
      setDisplay(value);
      return;
    }
    const start = performance.now();
    const startVal = shown.current; // animate from what is currently on screen
    const delta = value - startVal;
    if (delta === 0) return;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const e = 1 - Math.pow(1 - p, 3); // easeOutCubic
      shown.current = startVal + delta * e;
      setDisplay(shown.current);
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [value, duration, reduce]);

  return <span className={className}>{fmt(display, decimals)}</span>;
}
