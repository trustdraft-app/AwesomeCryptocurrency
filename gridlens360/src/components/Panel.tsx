import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface Props {
  title?: string;
  accent?: string;
  aux?: ReactNode;
  children: ReactNode;
  delay?: number;
  style?: React.CSSProperties;
}

/** Accented, glassy panel with a fade/rise entrance. */
export default function Panel({ title, accent = "var(--blue)", aux, children, delay = 0, style }: Props) {
  return (
    <motion.section
      className="panel"
      style={{ ["--accent" as string]: accent, ...style }}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: "easeOut" }}
    >
      {title && (
        <h3 className="panel-title">
          <span className="dot" />
          {title}
          {aux && <span className="aux">{aux}</span>}
        </h3>
      )}
      {children}
    </motion.section>
  );
}
