import { useEffect, useRef, useState } from "react";
import { fmt } from "@/lib/format";

interface Props {
  value: number;
  decimals?: number;
  duration?: number;
  className?: string;
}

/** Count-up number that eases to its target once, on mount / value change. */
export default function AnimatedNumber({ value, decimals = 0, duration = 900, className }: Props) {
  const [display, setDisplay] = useState(0);
  const raf = useRef<number>();
  const from = useRef(0);

  useEffect(() => {
    const start = performance.now();
    const startVal = from.current;
    const delta = value - startVal;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      // easeOutCubic
      const e = 1 - Math.pow(1 - p, 3);
      setDisplay(startVal + delta * e);
      if (p < 1) raf.current = requestAnimationFrame(tick);
      else from.current = value;
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      from.current = value;
    };
  }, [value, duration]);

  return <span className={className}>{fmt(display, decimals)}</span>;
}
