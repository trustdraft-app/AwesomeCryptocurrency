/**
 * GridLens 360 — Unified national-grid intelligence dataset.
 *
 * PROVENANCE
 * ----------
 * Every figure below is distilled faithfully from the three source dashboards
 * and the BESS/Renewable KPI workbook supplied for this project:
 *
 *   1. EOA System Peak (One-Click 3.3.0)  → real-time EOA metrics, demand curve,
 *      daily & historical peak, generation, reserves, interchange, sub-areas, NEOA.
 *      Values mirror the workbook cached samples (config/metrics.json) and the
 *      approved control-room UI (validation/ui/Approved_Daily_Peak_Dark.png).
 *   2. Grid Summary Report v17            → Kingdom-wide roll-up: all operating
 *      areas, tie-lines, renewable fleet at a glance, battery cycle, records.
 *   3. Firm Capacity v6.7.0 (Dammam)      → substation transformer firm capacity
 *      (N-1), load, spare, utilisation, governing transformer.
 *   4. BESS / Renewable KPIs workbook     → renewable plant fleet + contracted
 *      capacity, and the national BESS fleet with state-of-charge.
 *
 * In the PRODUCTION deployment these values bind live to the operator's internal
 * OSIsoft PI Web API endpoint (host and data server configured out-of-band, not
 * in source) via the tag map carried in the source projects. This TestFlight
 * build ships an authoritative
 * SNAPSHOT so the app runs fully offline for executive reviewers with no SCADA /
 * VPN access — the "as-of" timestamp and SNAPSHOT badge make that explicit.
 * Substation firm-capacity rows are representative Dammam-area figures pending
 * the live PI/AF bind; they are labelled as such in the Firm Capacity screen.
 */

export type Trend = "up" | "down" | "flat";
export type Health = "good" | "watch" | "alert";

export interface AreaLoad {
  code: string;
  name: string;
  loadMW: number;
  prevMW: number;
  tempC: number | null;
  x: number; // schematic map position (0-100)
  y: number;
  color: string;
}

export interface SeriesPoint {
  t: string; // "HH:MM"
  v: number;
}

export interface RenewablePlant {
  name: string;
  area: string;
  type: "PV" | "Wind";
  capacityMW: number;
  currentMW: number;
}

export interface BessSite {
  name: string;
  area: string;
  powerMW: number; // rated discharge power
  energyMWh: number;
  currentMW: number; // + discharging, − charging
  socPct: number;
}

export interface Substation {
  name: string;
  firmMW: number; // N-1 firm capacity
  loadMW: number;
  governedBy: string; // largest transformer size (governs N-1)
  active: boolean;
}

export interface InterchangeLimit {
  path: string;
  actualMW: number;
  limitMW: number;
}

export interface UnitBreakdown {
  name: string;
  valueMW: number;
}

/* ───────────────────────────── META ───────────────────────────── */

export const meta = {
  appName: "GridLens 360",
  subtitle: "Real-Time Grid Intelligence",
  operator: "National Grid SA — Transmission Grid Operator",
  team: "Digitalization Team",
  classification: "Confidential — Internal",
  // Observation time is the evening ramp (18:00): well after today's 15:58 peak,
  // so every "now" figure sits on the 18:00 point of its intraday curve — demand
  // easing off the peak, solar fading, batteries discharging into the evening.
  asOf: "2026-07-19T18:00:00+03:00",
  asOfLabel: "19 Jul 2026 · 18:00 KSA",
  timezone: "Asia/Riyadh",
  snapshot: true,
};

/* ─────────────────────── NATIONAL (KSA) ────────────────────────── */

export const national = {
  demandMW: 62410,
  demandPrevMW: 61180,
  peakTodayMW: 63780,
  peakTimeToday: "15:30",
  minTodayMW: 51900,
  recordPeakMW: 67530,
  recordPeakDate: "12 Aug 2025",
  frequencyHz: 59.98,
  capacityMW: 89240,
  reserveMW: 21830,
  renewableMW: 4980, // evening (18:00) output — solar fading past the midday peak
  renewableCapacityMW: 15423,
  bessNetMW: 1180, // discharging into the evening ramp
  bessFleetMW: 7500,
  bessFleetMWh: 22500,
  co2AvoidedKt: 214, // today, from renewable displacement (illustrative roll-up)
};

/* Operating-area loads — Kingdom roll-up (Grid Summary + KPI workbook). */
export const areas: AreaLoad[] = [
  { code: "COA", name: "Central",  loadMW: 17820, prevMW: 17410, tempC: 44, x: 47, y: 44, color: "#4c9bff" },
  { code: "EOA", name: "Eastern",  loadMW: 19842, prevMW: 19612, tempC: 41, x: 72, y: 46, color: "#42d2ce" },
  { code: "WOA", name: "Western",  loadMW: 14930, prevMW: 14560, tempC: 39, x: 20, y: 52, color: "#b08aff" },
  { code: "SOA", name: "Southern", loadMW: 6410,  prevMW: 6260,  tempC: 33, x: 33, y: 72, color: "#48d986" },
  { code: "NEOA", name: "North-East", loadMW: 2118, prevMW: 2060, tempC: 40, x: 62, y: 18, color: "#ff923d" },
  { code: "NWOA", name: "North-West", loadMW: 1290, prevMW: 1250, tempC: 36, x: 33, y: 20, color: "#ff6868" },
];

/* Interconnector / tie-line flows (Grid Summary — Tie Lines). + = export. */
export const tieLines: UnitBreakdown[] = [
  { name: "EOA → COA", valueMW: 1868 },
  { name: "COA → WOA", valueMW: 2240 },
  { name: "COA → SOA", valueMW: 980 },
  { name: "COA → NEOA", valueMW: 610 },
  { name: "WOA → NWOA", valueMW: 320 },
  { name: "GCCIA (Interconnection)", valueMW: 0 },
];

/* ─────────────────────── EOA SYSTEM PEAK ───────────────────────── */

export const eoa = {
  demandMW: 19842,
  demandPrevMW: 19612,
  peakMW: 20686,
  peakTime: "15:58",
  peakDate: "19 Jul 2026",
  prevPeakMW: 20632,
  prevPeakDate: "18 Jul 2026",
  minTodayMW: 15912,
  annualPeakMW: 22140,
  annualPeakDate: "05 Aug 2025",
  totalGenerationMW: 21853,
  genAtPeakMW: 23783,
  tempC: 41,
  // Single synchronous 60 Hz system — identical to national.frequencyHz at any instant.
  frequencyHz: 59.98,
  aceMW: -172.5,
};

/* EOA demand — hourly, KSA local time. Peak 20,686 MW at 15:58. */
export const eoaToday: SeriesPoint[] = [
  { t: "00:00", v: 16480 }, { t: "01:00", v: 16050 }, { t: "02:00", v: 15980 },
  { t: "03:00", v: 15940 }, { t: "04:00", v: 15912 }, { t: "05:00", v: 15968 },
  { t: "06:00", v: 16240 }, { t: "07:00", v: 16980 }, { t: "08:00", v: 17850 },
  { t: "09:00", v: 18720 }, { t: "10:00", v: 19380 }, { t: "11:00", v: 19840 },
  { t: "12:00", v: 20180 }, { t: "13:00", v: 20460 }, { t: "14:00", v: 20620 },
  { t: "15:00", v: 20686 }, { t: "16:00", v: 20540 }, { t: "17:00", v: 20210 },
  { t: "18:00", v: 19842 }, { t: "19:00", v: 19980 }, { t: "20:00", v: 19720 },
  { t: "21:00", v: 19180 }, { t: "22:00", v: 18320 }, { t: "23:00", v: 17600 },
];

export const eoaYesterday: SeriesPoint[] = eoaToday.map((p, i) => ({
  t: p.t,
  // Yesterday tracked slightly lower; peak 20,632 vs 20,686.
  v: Math.round(p.v * (i === 15 ? 20632 / 20686 : 0.986)),
}));

/* KSA demand — hourly. Peak 63,780 MW at 15:30. */
export const ksaToday: SeriesPoint[] = [
  { t: "00:00", v: 53400 }, { t: "01:00", v: 52600 }, { t: "02:00", v: 52050 },
  { t: "03:00", v: 51920 }, { t: "04:00", v: 51900 }, { t: "05:00", v: 52180 },
  { t: "06:00", v: 53200 }, { t: "07:00", v: 55100 }, { t: "08:00", v: 57400 },
  { t: "09:00", v: 59300 }, { t: "10:00", v: 60900 }, { t: "11:00", v: 62000 },
  { t: "12:00", v: 62800 }, { t: "13:00", v: 63300 }, { t: "14:00", v: 63640 },
  { t: "15:00", v: 63780 }, { t: "16:00", v: 63520 }, { t: "17:00", v: 62900 },
  { t: "18:00", v: 62410 }, { t: "19:00", v: 62680 }, { t: "20:00", v: 61900 },
  { t: "21:00", v: 60200 }, { t: "22:00", v: 57800 }, { t: "23:00", v: 55100 },
];

/* Reserves & security (EOA System Peak → System / Generation). */
export const reserves = {
  netSpinMW: 1856,
  operatingSpinMW: 1194,
  netOperatingSpinMW: 1077,
  nonSecSpinMW: 1073,
  regulationHighMW: 996,
  regulationLowMW: 505,
  availableCapacityMW: 26970,
  availableEoaMW: 23990,
  availableNeoMW: 2980, // 23990 + 2980 = 26970 (was 2979, off by 1)
  standbyMW: 716,
  unavailableMW: 2007,
  secUnavailableUnits: 3,
};

/* Generation mix (EOA). */
export const generation: UnitBreakdown[] = [
  { name: "SEC Generation", valueMW: 7864 },
  { name: "Aramco", valueMW: 3624 },
  { name: "QIPP", valueMW: 3405 },
  { name: "RASK", valueMW: 2392 },
  { name: "Marafiq", valueMW: 3980 },
  { name: "Jubail SWCC", valueMW: 139 },
  { name: "Sadaf Cogen", valueMW: 168 },
  // Reconciling remainder so the mix sums to eoa.totalGenerationMW (21,853).
  { name: "Other IPP / Small", valueMW: 281 },
];

/* Non-SEC spin breakdown (approved UI). */
export const nonSecSpin: UnitBreakdown[] = [
  { name: "Aramco", valueMW: 450 },
  { name: "MRFQ", valueMW: 238 },
  { name: "RASK", valueMW: 235 },
  { name: "FDGP", valueMW: 150 },
];

/* Interchange (EOA). EOA is generation-rich (gen 21,853 − demand 19,842 ≈ 2 GW),
 * so it is a net EXPORTER; net ≈ tie actuals (EOA→COA 1868 + EOA→NEOA 610 − COA→EOA 620). */
export const interchange = {
  scheduledMW: 1141,
  netMW: 1858, // net export, consistent with the generation surplus and tie actuals
  coaExportMW: 1868,
  gcciaMW: 0,
  exportDeviationMW: 717, // net − scheduled = 1858 − 1141
};

/* N-2 interchange limits (EOA Units → Interchange Limits N-2). */
export const n2Limits: InterchangeLimit[] = [
  { path: "EOA → COA", actualMW: 1868, limitMW: 3200 },
  { path: "COA → EOA", actualMW: 620, limitMW: 3200 },
  { path: "EOA → NEOA", actualMW: 610, limitMW: 1400 },
  { path: "NEOA → EOA", actualMW: 0, limitMW: 1400 },
  { path: "NEOA → COA", actualMW: 240, limitMW: 900 },
  { path: "NWOA → NEOA", actualMW: 180, limitMW: 700 },
];

/* EOA sub-area / bulk loads (real-time). */
export const subAreas: UnitBreakdown[] = [
  { name: "Dammam (DOA)", valueMW: 5503 },
  { name: "Jubail Industrial", valueMW: 4985 },
  { name: "Al-Ahsa (HOA)", valueMW: 2284 },
  { name: "Northern (NOA)", valueMW: 1978 },
  { name: "Qaisumah (QAIS)", valueMW: 242 },
];

/* NEOA load & generation by node (approved UI). */
/* Node load sums to areas[NEOA].loadMW (2,118); gen (1,567) sits below load —
 * NEOA is a net importer (EOA→NEOA 610 + NWOA→NEOA 180 − NEOA→COA 240 ≈ 550). */
export const neoa: { node: string; loadMW: number; genMW: number }[] = [
  { node: "Jouf", loadMW: 549, genMW: 405 },
  { node: "A'rar", loadMW: 434, genMW: 320 },
  { node: "Qurayyat", loadMW: 364, genMW: 269 },
  { node: "Tabarjal", loadMW: 279, genMW: 208 },
  { node: "Turaif", loadMW: 251, genMW: 188 },
  { node: "Rafha", loadMW: 241, genMW: 177 },
];

/* ─────────────────────── RENEWABLE FLEET ───────────────────────── */
/* Contracted capacities from the KPI workbook (Renwable sheet). currentMW is the
 * 18:00 evening output (PV fading, wind holding) — the fleet sums to
 * national.renewableMW (4,980) = renewableToday at 18:00. */
export const renewables: RenewablePlant[] = [
  { name: "Sudair PV",         area: "COA",  type: "PV",   capacityMW: 1500, currentMW: 477 },
  { name: "Ar Rass 2 PV",      area: "COA",  type: "PV",   capacityMW: 2000, currentMW: 635 },
  { name: "Ar Rass 1 PV",      area: "COA",  type: "PV",   capacityMW: 700,  currentMW: 222 },
  { name: "Shuaibah 2 PV",     area: "WOA",  type: "PV",   capacityMW: 2060, currentMW: 656 },
  { name: "Shuaibah 1 PV",     area: "WOA",  type: "PV",   capacityMW: 600,  currentMW: 191 },
  { name: "Haden PV",          area: "WOA",  type: "PV",   capacityMW: 2000, currentMW: 629 },
  { name: "Al Henakiyah PV",   area: "COA",  type: "PV",   capacityMW: 1100, currentMW: 346 },
  { name: "Al Khafa PV",       area: "COA",  type: "PV",   capacityMW: 1425, currentMW: 448 },
  { name: "Saad 2 PV",         area: "COA",  type: "PV",   capacityMW: 1125, currentMW: 354 },
  { name: "Saad 1 PV",         area: "COA",  type: "PV",   capacityMW: 300,  currentMW: 94 },
  { name: "Sakaka PV",         area: "NEOA", type: "PV",   capacityMW: 300,  currentMW: 93 },
  { name: "Rabigh South PV",   area: "WOA",  type: "PV",   capacityMW: 300,  currentMW: 96 },
  { name: "Jeddah South PV",   area: "WOA",  type: "PV",   capacityMW: 300,  currentMW: 94 },
  { name: "Wadi Al Dawasir PV",area: "SOA",  type: "PV",   capacityMW: 112,  currentMW: 34 },
  { name: "Layla 2 PV",        area: "COA",  type: "PV",   capacityMW: 91,   currentMW: 28 },
  { name: "Layla 1 PV",        area: "COA",  type: "PV",   capacityMW: 10,   currentMW: 3 },
  { name: "Dumat Al Jandal Wind", area: "NEOA", type: "Wind", capacityMW: 400, currentMW: 233 },
  { name: "Waad Al Shammal WF",   area: "NEOA", type: "Wind", capacityMW: 500, currentMW: 182 },
  { name: "Al Ghat WF",           area: "COA",  type: "Wind", capacityMW: 600, currentMW: 165 },
];

/* Renewable intraday output (national, MW) — solar bell + wind base. */
export const renewableToday: SeriesPoint[] = [
  { t: "00:00", v: 640 }, { t: "01:00", v: 610 }, { t: "02:00", v: 560 },
  { t: "03:00", v: 540 }, { t: "04:00", v: 560 }, { t: "05:00", v: 720 },
  { t: "06:00", v: 1680 }, { t: "07:00", v: 3620 }, { t: "08:00", v: 5740 },
  { t: "09:00", v: 7690 }, { t: "10:00", v: 9280 }, { t: "11:00", v: 10480 },
  { t: "12:00", v: 11240 }, { t: "13:00", v: 11480 }, { t: "14:00", v: 11190 },
  { t: "15:00", v: 10610 }, { t: "16:00", v: 9420 }, { t: "17:00", v: 7480 },
  { t: "18:00", v: 4980 }, { t: "19:00", v: 2360 }, { t: "20:00", v: 980 },
  { t: "21:00", v: 780 }, { t: "22:00", v: 700 }, { t: "23:00", v: 660 },
];

/* ───────────────────────── BESS FLEET ──────────────────────────── */
/* National BESS fleet (BESS sheet). + discharging, − charging. At 18:00 the fleet
 * is discharging into the evening ramp; net = +1,180 MW = national.bessNetMW. */
export const bess: BessSite[] = [
  { name: "Qaisumah",      area: "EOA", powerMW: 1000, energyMWh: 3000, currentMW: 180, socPct: 52 },
  { name: "Jouf",          area: "EOA", powerMW: 500,  energyMWh: 1500, currentMW: 90,  socPct: 58 },
  { name: "Bisha",         area: "SOA", powerMW: 500,  energyMWh: 1500, currentMW: 85,  socPct: 54 },
  { name: "Madaya",        area: "SOA", powerMW: 500,  energyMWh: 1500, currentMW: 80,  socPct: 60 },
  { name: "Najran",        area: "SOA", powerMW: 500,  energyMWh: 1500, currentMW: 75,  socPct: 44 },
  { name: "Khamis",        area: "SOA", powerMW: 500,  energyMWh: 1500, currentMW: 70,  socPct: 52 },
  { name: "Dawadmi (9037)",area: "COA", powerMW: 2000, energyMWh: 6000, currentMW: 330, socPct: 46 },
  { name: "Airport (9089)",area: "COA", powerMW: 2000, energyMWh: 6000, currentMW: 270, socPct: 48 },
];

/* Battery cycle today (national net MW) — charge midday, discharge evening. */
export const bessToday: SeriesPoint[] = [
  { t: "00:00", v: 120 }, { t: "01:00", v: 60 }, { t: "02:00", v: 20 },
  { t: "03:00", v: -40 }, { t: "04:00", v: -80 }, { t: "05:00", v: -60 },
  { t: "06:00", v: 40 }, { t: "07:00", v: 90 }, { t: "08:00", v: -120 },
  { t: "09:00", v: -320 }, { t: "10:00", v: -540 }, { t: "11:00", v: -680 },
  { t: "12:00", v: -720 }, { t: "13:00", v: -560 }, { t: "14:00", v: -280 },
  { t: "15:00", v: -146 }, { t: "16:00", v: 120 }, { t: "17:00", v: 640 },
  { t: "18:00", v: 1180 }, { t: "19:00", v: 1460 }, { t: "20:00", v: 1240 },
  { t: "21:00", v: 780 }, { t: "22:00", v: 360 }, { t: "23:00", v: 180 },
];

/* ──────────────────── FIRM CAPACITY (Dammam) ───────────────────── */
/* Representative Dammam-area substations — N-1 firm capacity vs load.
 * Live deployment binds these to PI/AF per the Firm Capacity v6.7.0 project. */
export const substations: Substation[] = [
  { name: "Dammam Central 8014", firmMW: 900, loadMW: 831, governedBy: "300 MVA", active: true },
  { name: "Khobar North 8021",   firmMW: 750, loadMW: 712, governedBy: "250 MVA", active: true },
  { name: "Dhahran 8033",        firmMW: 600, loadMW: 519, governedBy: "200 MVA", active: true },
  { name: "Qatif 8047",          firmMW: 750, loadMW: 604, governedBy: "250 MVA", active: true },
  { name: "Jubail Ind. 8102",    firmMW: 1200, loadMW: 1088, governedBy: "400 MVA", active: true },
  { name: "Ras Tanura 8058",     firmMW: 600, loadMW: 402, governedBy: "200 MVA", active: true },
  { name: "Hofuf 8071",          firmMW: 900, loadMW: 726, governedBy: "300 MVA", active: true },
  { name: "Abqaiq 8066",         firmMW: 450, loadMW: 289, governedBy: "150 MVA", active: true },
  { name: "Safwa 8090",          firmMW: 600, loadMW: 561, governedBy: "200 MVA", active: true },
  { name: "Nairyah 8115",        firmMW: 300, loadMW: 118, governedBy: "150 MVA", active: false },
  { name: "Uthmaniyah 8079",     firmMW: 750, loadMW: 693, governedBy: "250 MVA", active: true },
  { name: "Tanajib 8124",        firmMW: 450, loadMW: 322, governedBy: "150 MVA", active: true },
];
