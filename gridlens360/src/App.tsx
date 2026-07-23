import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import Shell from "./components/Shell";
import Command from "./screens/Command";
import Peak from "./screens/Peak";
import Power from "./screens/Power";
import Clean from "./screens/Clean";
import Assets from "./screens/Assets";

const page = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.28, ease: "easeOut" as const },
};

function Animated({ children }: { children: React.ReactNode }) {
  return (
    <motion.div {...page} className="scroll">
      {children}
    </motion.div>
  );
}

export default function App() {
  const location = useLocation();
  return (
    // reducedMotion="user" makes every Framer animation honor the OS
    // "Reduce Motion" setting (transforms/springs disabled, opacity kept).
    <MotionConfig reducedMotion="user">
      <Shell>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Animated><Command /></Animated>} />
            <Route path="/peak" element={<Animated><Peak /></Animated>} />
            <Route path="/power" element={<Animated><Power /></Animated>} />
            <Route path="/clean" element={<Animated><Clean /></Animated>} />
            <Route path="/assets" element={<Animated><Assets /></Animated>} />
          </Routes>
        </AnimatePresence>
      </Shell>
    </MotionConfig>
  );
}
