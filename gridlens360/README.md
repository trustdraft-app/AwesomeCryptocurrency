# GridLens 360 — Real-Time Grid Intelligence

> **New here? Start with the plain-English guides:**
> - 👔 **[FOR-EXECUTIVES.md](./FOR-EXECUTIVES.md)** — how to install and use the app (for leadership).
> - 🛠️ **[FOR-ADMINISTRATORS.md](./FOR-ADMINISTRATORS.md)** — the easiest step-by-step setup & TestFlight upload.
>
> The sections below (and TESTFLIGHT.md / HANDOVER.md) are the engineering reference.

Executive mobile app for National Grid SA transmission leadership. It consolidates
three separate control-room dashboards and a KPI workbook into a single, glance-first
iPhone / Android experience for C-level, VP Operations & Control, and ministerial review.

> **What it merges**
> 1. **EOA System Peak** (One-Click 3.3.0) — real-time Eastern-area demand, daily &
>    historical peak, generation, reserves, interchange, sub-areas, NEOA.
> 2. **Grid Summary Report v17** — Kingdom-wide roll-up: all operating areas,
>    tie-lines, renewable fleet, battery cycle, distance-to-record.
> 3. **Firm Capacity v6.7.0** — substation transformer firm capacity (N-1),
>    live loading, spare headroom, governing transformer.
> 4. **BESS / Renewable KPI workbook** — renewable plant fleet + contracted
>    capacity, and the national BESS fleet with state-of-charge.

## The five executive lenses (bottom tab bar)

| Tab | What the leader sees at a glance |
|-----|----------------------------------|
| **Command** | Kingdom demand now, distance to the all-time record, available capacity & reserve, the operating-area map, area-load contribution, live supply mix. |
| **Peak** | EOA daily peak with time & temperature, today-vs-yesterday demand curve with the peak marked, historical-peak summary, frequency & ACE gauges, sub-area bulk loads, NEOA load/generation, interchange. |
| **Power** | Generation mix, reserves & capacity, regulation range, non-SEC spin breakdown, interchange, N-2 interchange limits (actual vs limit). |
| **Clean** | Renewables (solar/wind split, intraday output, top plants, CO₂ avoided) and Storage (BESS net, fleet power/energy, daily cycle, per-site state of charge). |
| **Assets** | Firm-capacity (N-1) risk for Dammam-area substations — colour-coded loading, least-spare/highest-loading sorting, governing transformer. |

## Architecture

- **UI:** React 18 + TypeScript + Vite, hand-built SVG charts (line, gauge, donut,
  sparkline, bars, schematic Kingdom map) and Framer Motion for the motion graphics.
- **Native shells:** [Capacitor](https://capacitorjs.com) generates real Xcode and
  Android Studio projects that wrap the same bundled web build — so the app runs
  **fully offline** (essential for sensitive TestFlight distribution with no SCADA/VPN).
- **Data:** A single typed dataset (`src/data/grid.ts`) distilled faithfully from the
  source dashboards' cached PI samples and the KPI workbook. In production this binds
  live to the operator's internal **OSIsoft PI Web API** endpoint (host and data
  server configured out-of-band, not in source) using the tag maps carried in the
  source projects. The shipped build
  is an authoritative **SNAPSHOT** (badge + "as of" timestamp are shown in-app).

## Registered Apple identity (already wired in)

| Field | Value |
|-------|-------|
| App name | **GridLens 360** |
| Bundle ID | `com.mohamedalsaeed.gridlens360` |
| Apple Team | Mohamed Alsaeed — `Y94NRXX75N` |
| Version / Build | `1.0` / `1` |
| Signing | Automatic (team pre-set in the Xcode project) |

## Develop

```bash
npm install
npm run dev            # local preview in the browser
npm run build          # produce dist/ (bundled web build)
npx cap sync           # copy dist/ into ios/ and android/ + update native deps
```

See **[TESTFLIGHT.md](./TESTFLIGHT.md)** for the exact archive-and-upload runbook.
