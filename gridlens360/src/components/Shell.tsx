import { NavLink, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { meta } from "@/data/grid";
import { LivePill } from "./StatusPill";
import { IcCommand, IcPeak, IcPower, IcClean, IcAssets } from "./Icons";

const TABS = [
  { to: "/", label: "Command", Icon: IcCommand, end: true },
  { to: "/peak", label: "Peak", Icon: IcPeak },
  { to: "/power", label: "Power", Icon: IcPower },
  { to: "/clean", label: "Clean", Icon: IcClean },
  { to: "/assets", label: "Assets", Icon: IcAssets },
];

const TITLES: Record<string, string> = {
  "/": "National Command",
  "/peak": "EOA System Peak",
  "/power": "Generation & Reserves",
  "/clean": "Clean Energy",
  "/assets": "Firm Capacity",
};

export default function Shell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return (
    <div className="shell">
      <header className="topbar">
        <div className="mark" aria-hidden>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#04101c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 17l5-6 4 3 4-8 5 6" />
          </svg>
        </div>
        <div className="brand">
          <b>GridLens 360</b>
          <span>{TITLES[pathname] ?? meta.subtitle}</span>
        </div>
        <div className="spacer" />
        <LivePill snapshot={meta.snapshot} />
      </header>

      <main>{children}</main>

      <nav className="tabbar" aria-label="Primary">
        {TABS.map(({ to, label, Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => `tab ${isActive ? "active" : ""}`}>
            <Icon />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
