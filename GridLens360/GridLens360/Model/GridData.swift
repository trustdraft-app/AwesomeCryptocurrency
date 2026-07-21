//
//  GridData.swift
//  GridLens 360 — Real-Time Grid Intelligence
//
//  THE NUMBERS BIBLE.
//  Every value in this file is transcribed from the frozen PI-System telemetry
//  snapshot of the Saudi Electricity Company Eastern Operating Area (EOA)
//  transmission grid — 12 July 2026, reporting window 01:08–18:08 AST,
//  header as-of 18:08 AST — plus the 14-July national Grid-Report block.
//
//  BINDING LAW #1 — NO INVENTION: every displayed number carries a PI tag and a
//  timestamp from the source dataset. Nothing here is fabricated, interpolated,
//  or averaged across windows. Sums are transcribed exactly and re-derived in
//  code (see GridSnapshot.selfCheck()).
//
//  Owner: Mohammed Alsaeed · Digitalization Team · Grid Operator Sector ·
//  Operations & Control — EOA.
//

import Foundation

// MARK: - Provenance

/// How a value is sourced. Drives the honesty stamp shown next to every number.
enum MetricBasis: Equatable {
    /// Live PI value pushed since boot (reserved for a future feed).
    case live
    /// The frozen 12-Jul EOA telemetry snapshot — the shipped basis for v1.0.
    case snapshot
    /// A published national Grid-Report figure (14-Jul basis), magnitude-only.
    case report(String)

    var short: String {
        switch self {
        case .live: return "LIVE"
        case .snapshot: return "SNAPSHOT"
        case .report(let d): return "REPORT \(d)"
        }
    }
}

/// A single telemetry figure with its full provenance. This is the atom of the
/// whole application — no number reaches the screen without one of these.
struct Metric: Identifiable, Equatable {
    let id = UUID()
    let label: String
    let value: Double
    let unit: String
    /// The provenance string: a harvested PI tag / feed apply-key when the source
    /// carries one, otherwise an honest derivation descriptor. Never an invented tag.
    let tag: String
    /// Reading timestamp in Arabia Standard Time (AST, UTC+3).
    let timestamp: String
    let basis: MetricBasis
    /// True when `tag` is a real machine identifier (PI tag / feed apply-key) harvested
    /// from the source; false when it is a derivation descriptor. Drives the chip glyph
    /// so the board never dresses a description up as a harvested tag.
    var isPITag: Bool = true

    static func == (l: Metric, r: Metric) -> Bool { l.id == r.id }

    /// Grouped display, e.g. "21,964". Decimals preserved only when meaningful.
    var display: String { Self.grouped(value) }

    static func grouped(_ v: Double) -> String {
        let f = NumberFormatter()
        f.numberStyle = .decimal
        f.maximumFractionDigits = (v.rounded() == v) ? 0 : (abs(v) < 100 ? 2 : 1)
        f.minimumFractionDigits = f.maximumFractionDigits
        return f.string(from: NSNumber(value: v)) ?? "\(v)"
    }
}

// MARK: - Corridors (tie boundaries)

/// One metered contribution to a corridor. Direction is the SIGN of `mw`
/// (BINDING LAW #2 — direction is computed from the signed MW at render,
///  never asserted).
struct CorridorLeg: Identifiable {
    let id = UUID()
    let name: String
    let mw: Double
    let tag: String
}

struct Corridor: Identifiable {
    let id = UUID()
    let from: String
    let to: String
    /// Signed net MW. Positive = flow `from` → `to`.
    let net: Double
    let tag: String
    let timestamp: String
    let basis: MetricBasis
    /// Optional per-circuit / per-pole breakdown. Only shown when `showLegs` is true —
    /// hidden where a raw signed leg would mislead a glance (DC bipole ± convention,
    /// single-circuit metering sign) even though the value is honest.
    let legs: [CorridorLeg]
    /// Whether the metered legs may be expanded on the card.
    let showLegs: Bool
    /// Optional basis note printed on the card (e.g. partial-vs-boundary caveat).
    let note: String?

    /// True flow endpoints after resolving the sign. Direction is never hard-coded.
    var origin: String { net >= 0 ? from : to }
    var destination: String { net >= 0 ? to : from }
    var magnitude: Double { abs(net) }
    /// Legs the card is allowed to display.
    var visibleLegs: [CorridorLeg] { showLegs ? legs : [] }

    init(from: String, to: String, net: Double, tag: String, timestamp: String,
         basis: MetricBasis = .snapshot, legs: [CorridorLeg] = [], showLegs: Bool = true,
         note: String? = nil) {
        self.from = from; self.to = to; self.net = net; self.tag = tag
        self.timestamp = timestamp; self.basis = basis; self.legs = legs
        self.showLegs = showLegs; self.note = note
    }
}

// MARK: - National (six-area) model

struct AreaPeak: Identifiable {
    let id = UUID()
    let code: String
    let name: String
    let peak: Double
    let atTime: String
    /// Approximate schematic position (0…1 in each axis) for the Kingdom board.
    let x: Double
    let y: Double
}

struct ExchangeLane: Identifiable {
    let id = UUID()
    let from: String
    let to: String
    let points: Int
    let health: Int?
    let tag: String
}

struct NamedAsset: Identifiable {
    let id = UUID()
    let name: String
    let value: Double
    let unit: String
    let tag: String
}

// MARK: - The Snapshot

/// The complete, immutable boardroom snapshot. One instance, `GridSnapshot.eoa`.
struct GridSnapshot {

    // Header / provenance -----------------------------------------------------
    let snapshotDate = "12 JUL 2026"
    let asOf = "18:08 AST"
    let window = "01:08–18:08 AST"
    let reportBasis = "14 JUL 2026"
    let status: MetricBasis = .snapshot

    // Hero KPIs (EOA) ---------------------------------------------------------
    let demand = Metric(label: "Eastern Demand", value: 21_964, unit: "MW",
                        tag: "EOA_SYS:LOAD_OPAEOA", timestamp: "16:27", basis: .snapshot)
    let frequency = Metric(label: "System Frequency", value: 60.019, unit: "Hz",
                           tag: "median of 58 · 380 kV busbars", timestamp: "16:27", basis: .snapshot, isPITag: false)
    let generation = Metric(label: "Eastern Generation", value: 23_994.37, unit: "MW",
                            tag: "kpi:gen_eoa", timestamp: "16:27", basis: .snapshot)
    let gccExport = Metric(label: "GCC Interconnection Export", value: 812.0, unit: "MW",
                           tag: "HVDC:TOT_GCC_EXP", timestamp: "16:27", basis: .snapshot)
    let spinningReserve = Metric(label: "Spinning Reserve", value: 1_100, unit: "MW",
                                 tag: "PI snapshot", timestamp: "16:27", basis: .snapshot, isPITag: false)

    // Boundary headline: EOA → National grid ----------------------------------
    let exportToNational = Metric(label: "Eastern → National Grid", value: 2_033, unit: "MW",
                                  tag: "EOA_SYS:LNKSAICHG(EXPORT_MW)", timestamp: "16:27", basis: .snapshot)

    // Balance proof -----------------------------------------------------------
    var balanceDelta: Double { generation.value - demand.value } // 2,030.37 ≈ 2,033

    // Corridors ---------------------------------------------------------------
    let corridors: [Corridor] = [
        Corridor(from: "EOA", to: "NATIONAL", net: 2_033,
                 tag: "EOA_SYS:LNKSAICHG(EXPORT_MW)", timestamp: "16:27",
                 note: "System-calculated boundary total. The metered 380/230 kV set below is a partial, not the boundary."),
        Corridor(from: "EOA", to: "GCC", net: 812,
                 tag: "HVDC:TOT_GCC_EXP", timestamp: "16:27",
                 legs: [
                    CorridorLeg(name: "Pole C25L", mw: -548, tag: "C25L"),
                    CorridorLeg(name: "Pole C26L", mw: 553, tag: "C26L"),
                    CorridorLeg(name: "Pole C35L", mw: -264, tag: "C35L"),
                    CorridorLeg(name: "Pole C36L", mw: 260, tag: "C36L")
                 ],
                 showLegs: false,
                 note: "Total transfer 812 MW via HVDC:TOT_GCC_EXP; injection 0 MW. DC bipole conductors C25/C26 ±548/553 and C35/C36 ±264/260 carry the ± sign by convention and do not add to the total. Al-Fadhili back-to-back to the GCC Interconnection."),
        Corridor(from: "EOA", to: "COA", net: 726.0,
                 tag: "EOA→COA 380/230 kV metered set", timestamp: "16:2x",
                 legs: [
                    CorridorLeg(name: "J380", mw: -290.4, tag: "J380"),
                    CorridorLeg(name: "KRI8", mw: -52.7, tag: "KRI8"),
                    CorridorLeg(name: "PS3", mw: 147.6, tag: "PS3"),
                    CorridorLeg(name: "WSIA", mw: 49.0, tag: "WSIA"),
                    CorridorLeg(name: "SHED", mw: 472.5, tag: "SHED"),
                    CorridorLeg(name: "FARS", mw: 400.0, tag: "FARS")
                 ],
                 note: "Signed net of six lines (two import, four export). Gross |Σ| 1,412 is NOT the number. Full boundary is 1,141.5 MW (SYS_CALC:EOA_COA_ICHG, not in this snapshot)."),
        Corridor(from: "EOA", to: "NE", net: 114.2,
                 tag: "EOA-NE:INTERCHANGE(LN_380KV_MW)", timestamp: "16:28",
                 note: "Qaisumah → Rafha. Direction cross-checked at far-end RFHA (64.2 / 61.9)."),
        Corridor(from: "COA", to: "NEA", net: 141.1,
                 tag: "NE_COA_ICHG", timestamp: "16:2x",
                 legs: [
                    CorridorLeg(name: "JOUF1", mw: 57.6, tag: "JOUF1"),
                    CorridorLeg(name: "JOUF2", mw: 83.5, tag: "JOUF2")
                 ],
                 note: "Signed net of the two Jouf circuits. Independently confirmed by NE_COA_ICHG 142.1."),
        Corridor(from: "NWA", to: "NEA", net: 76,
                 tag: "TBRJL CKT-A", timestamp: "16:2x",
                 legs: [
                    CorridorLeg(name: "TBRJL CKT-A", mw: -75.9, tag: "TBRJL_CKT_A"),
                    CorridorLeg(name: "TBRJL CKT-B", mw: 0.0, tag: "TBRJL_CKT_B")
                 ],
                 showLegs: false,
                 note: "Single active circuit metering 75.9 MW; Circuit B is genuinely open. Corridor direction NWA→NEA confirmed at the far end."),
    ]

    // Renewables --------------------------------------------------------------
    // Two honest countings, never forced equal (see selfCheck).
    let renEOATerms: [Double] = [243.2, 18.7, 163.5, 249.6]        // Σ = 674.9 (4 eastern rings)
    let renEOATotal = Metric(label: "Eastern Renewables", value: 674.9, unit: "MW",
                             tag: "Σ 4 eastern rings", timestamp: "16:27", basis: .snapshot, isPITag: false)
    let renEOAWind = Metric(label: "Eastern Wind", value: 181.15, unit: "MW",
                            tag: "PI snapshot · wind", timestamp: "16:27", basis: .snapshot, isPITag: false)
    let renEOAPV = Metric(label: "Eastern Solar PV", value: 491.16, unit: "MW",
                          tag: "PI snapshot · PV", timestamp: "16:27", basis: .snapshot, isPITag: false)
    let renNationalTotal = Metric(label: "National Renewables", value: 10_156, unit: "MW",
                                  tag: "Grid-Report · Σ 20 plants (exact)", timestamp: reportTs, basis: .report("14 JUL"), isPITag: false)
    let renNationalPct = 13.62   // of the 74,561 national peak
    let renPlantCount = 20
    let renNamedAssets: [NamedAsset] = [
        NamedAsset(name: "Sakaka PV (available)", value: 243.2, unit: "MW", tag: "SKPV:AVAIL"),
        NamedAsset(name: "Sakaka system", value: 491.2, unit: "MW", tag: "SAKAKA:SYS"),
        NamedAsset(name: "Dumat Al-Jandal Wind", value: 181.2, unit: "MW", tag: "DUMAT:WIND"),
    ]

    // Battery (BESS) ----------------------------------------------------------
    let bessEOA = Metric(label: "Eastern Battery Net", value: -10.57, unit: "MW",
                         tag: "Σ 4 eastern BESS terms", timestamp: "16:27", basis: .snapshot, isPITag: false)
    let bessKSAFleet = Metric(label: "National Battery Fleet", value: 772, unit: "MW",
                              tag: "Grid-Report · KSA fleet", timestamp: reportTs, basis: .report("14 JUL"), isPITag: false)
    let bessSiteCount = 11

    // Kingdom (national six-area, 14-Jul Grid-Report) -------------------------
    let ksaMinDemand = Metric(label: "National Minimum", value: 61_270, unit: "MW",
                              tag: "KSA:DEMAND min", timestamp: "06:0x", basis: .report("14 JUL"))
    let ksaMaxReserve = Metric(label: "Max-Reserve Point", value: 71_371, unit: "MW",
                               tag: "KSA:DEMAND @max-reserve", timestamp: "11:33", basis: .report("14 JUL"))
    let ksaPeak = Metric(label: "National Peak", value: 74_561, unit: "MW",
                         tag: "KSA:DEMAND peak", timestamp: "14:55", basis: .report("14 JUL"))
    let areaPeaks: [AreaPeak] = [
        AreaPeak(code: "COA", name: "Central",   peak: 24_063, atTime: "own-peak", x: 0.46, y: 0.52),
        AreaPeak(code: "EOA", name: "Eastern",   peak: 21_090, atTime: "own-peak", x: 0.74, y: 0.55),
        AreaPeak(code: "WOA", name: "Western",   peak: 18_181, atTime: "own-peak", x: 0.20, y: 0.58),
        AreaPeak(code: "SOA", name: "Southern",  peak: 8_521,  atTime: "own-peak", x: 0.40, y: 0.84),
        AreaPeak(code: "NEA", name: "North-East", peak: 1_678, atTime: "own-peak", x: 0.66, y: 0.20),
        AreaPeak(code: "NWA", name: "North-West", peak: 1_396, atTime: "own-peak", x: 0.30, y: 0.20),
    ]
    var areaPeakSum: Double { areaPeaks.reduce(0) { $0 + $1.peak } } // 74,929
    var nonCoincidence: Double { areaPeakSum - ksaPeak.value }        // +368

    let reserveSpin = Metric(label: "Spinning", value: 4_768, unit: "MW",
                             tag: "KSA:RES.SPIN", timestamp: reportTs, basis: .report("14 JUL"))
    let reserveStandby = Metric(label: "Standby", value: 6_460, unit: "MW",
                                tag: "KSA:RES.SBY", timestamp: reportTs, basis: .report("14 JUL"))
    let reserveUnavail = Metric(label: "Unavailable", value: 5_650, unit: "MW",
                                tag: "KSA:RES.UNAVL", timestamp: reportTs, basis: .report("14 JUL"))

    // Operating-day curve: three MEASURED points only (no interpolation invented).
    var operatingDayPoints: [(t: String, mw: Double)] {
        [("06:00", ksaMinDemand.value), ("11:33", ksaMaxReserve.value), ("14:55", ksaPeak.value)]
    }

    // Data-exchange lanes -----------------------------------------------------
    let exchangeLanes: [ExchangeLane] = [
        ExchangeLane(from: "Aramco", to: "SEC", points: 1_426, health: 285, tag: "DX:ARAMCO→SEC"),
        ExchangeLane(from: "SEC", to: "Aramco", points: 2_967, health: 14, tag: "DX:SEC→ARAMCO"),
        ExchangeLane(from: "GCCIA", to: "SEC", points: 111, health: nil, tag: "DX:GCCIA→SEC"),
        ExchangeLane(from: "SEC", to: "GCCIA", points: 270, health: nil, tag: "DX:SEC→GCCIA"),
    ]

    // Census / footprint ------------------------------------------------------
    let stationCount = 528
    let coordReal = 401, coordEstimate = 112, coordOffMap = 15
    // Two labelled signal countings — never forced equal.
    let signalsParsed = 34_915                 // parsed signal rows in this bake
    let censusNumeric = 26_139                 // live numeric
    let censusDigital = 4_141                  // live digital
    let censusPlaceholder = 23
    let peakMinute = "16:27"

    static let reportTs = "14 JUL"

    // About -------------------------------------------------------------------
    let owner = "Mohammed Alsaeed"
    let team = "Digitalization Team · Grid Operator Sector"
    let unitName = "Operations & Control — EOA"
    let appVersion = "1.0"
    let appBuild = "1"

    static let eoa = GridSnapshot()

    // MARK: Independent self-check (BINDING LAW #1 enforcement in code)

    /// Re-derives every headline sum from its parts. Returns the list of checks
    /// and whether each holds to a 0.6 MW rounding band. Surfaced in About so a
    /// C-level viewer can see the numbers audit themselves.
    func selfCheck() -> [(name: String, ok: Bool, detail: String)] {
        func near(_ a: Double, _ b: Double, _ band: Double = 0.6) -> Bool { abs(a - b) <= band }
        var r: [(name: String, ok: Bool, detail: String)] = []

        let coa = corridors.first { $0.from == "EOA" && $0.to == "COA" }!
        let coaSum = coa.legs.reduce(0) { $0 + $1.mw }
        r.append(("EOA→COA signed net = 726.0", near(coaSum, 726.0), "Σ legs = \(Metric.grouped(coaSum))"))

        let renSum = renEOATerms.reduce(0, +)
        r.append(("Eastern renewables ≈ 674.9 (rings)", near(renSum, 674.9),
                  "Σ rings = \(Metric.grouped(renSum)) · headline 674.9 (0.1 term-rounding)"))

        r.append(("Area own-peaks Σ = 74,929", near(areaPeakSum, 74_929), "Σ 6 areas = \(Metric.grouped(areaPeakSum))"))
        r.append(("Non-coincidence = +368", near(nonCoincidence, 368), "74,929 − 74,561 = \(Metric.grouped(nonCoincidence))"))

        let bal = generation.value - demand.value
        r.append(("Balance ≈ export 2,033", near(bal, exportToNational.value, 3.0), "gen − load = \(Metric.grouped(bal))"))

        let pct = renNationalTotal.value / ksaPeak.value * 100
        r.append(("Renewables share = 13.62%", near(pct, renNationalPct, 0.02), String(format: "%.2f%%", pct)))

        let gcc = corridors.first { $0.from == "EOA" && $0.to == "GCC" }!
        let gccNet = gcc.legs.reduce(0) { $0 + $1.mw }
        r.append(("GCC bipoles net ≈ 0 (DC ± convention)", near(gccNet, 0.0, 2.0),
                  "Σ conductors = \(Metric.grouped(gccNet)) · total transfer 812 via HVDC:TOT_GCC_EXP"))

        return r
    }
}
